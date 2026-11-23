import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { eventCategories } from '../shared/sources.js';

const browser = await chromium.launch(
  process.env.CPS_CHROME_CHANNEL ? { channel: process.env.CPS_CHROME_CHANNEL } : {},
);
const desktop = { viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' };
const phone = {
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
  isMobile: true,
  hasTouch: true,
};
const root = 'http://127.0.0.1:';
const base = (id) => root + (5280 + id);
const target = 'submission';
for (const dir of [
  'evidence',
  'screenshots/after',
  'screenshots/mobile',
  'screenshots/outages',
])
  await mkdir(target + '/' + dir, { recursive: true });
const results = [];
const save = () =>
  writeFile(
    target + '/evidence/observations.json',
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        tests: results,
      },
      null,
      2,
    ) + '\n',
  );
const report = (page) => page.locator('.investigation-result').innerText();
const select = (page, title, value) =>
  page.getByLabel(title, { exact: true }).selectOption(value);
const size = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const run = async (locator, value) =>
  locator.evaluate((node, v) => {
    node.value = v;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
const cleanForecast = ({ time, value, wind, direction, city }) => ({
  time: new Date(time).toISOString(),
  value,
  wind,
  direction,
  city,
});

async function investigate(page, id, rows, raw) {
  if (id === 1) {
    let best;
    for (const a of rows)
      for (const b of rows) {
        if (Math.abs(a.x - b.x) <= 0.1 && (!best || b.y - a.y > best[1].y - best[0].y))
          best = [a, b];
      }
    assert(best && best[1].y > best[0].y);
    await select(page, 'Center on earthquake', best[0].id);
    assert.match(await report(page), /Visible/);
    await select(page, 'Center on earthquake', best[1].id);
    assert((await report(page)).includes(best[1].id));
    return { comparison: best };
  }
  if (id === 2) {
    const countries = ['IND', 'CHN'];
    const years = [...new Set(rows.map((row) => row.time))]
      .sort((a, b) => a - b)
      .filter((year) =>
        countries.every((id) =>
          rows.some((row) => row.time === year && row.country === id),
        ),
      );
    await select(page, 'Compare country A', countries[0]);
    await select(page, 'Compare country B', countries[1]);
    const end = years.at(-1);
    const full = [...new Set(rows.map((row) => row.time))].sort((a, b) => a - b);
    await run(page.getByLabel('Reporting year', { exact: true }), full.indexOf(end));
    assert((await report(page)).includes(String(end)));
    return {
      comparison: rows.filter(
        (row) => countries.includes(row.country) && [years[0], end].includes(row.time),
      ),
    };
  }
  if (id === 3) {
    const t = (start, end) => rows.filter((r) => r.time >= start && r.time <= end);
    const overlay = await page.locator('.weather-brush .overlay').boundingBox();
    const point = (fraction) => overlay.x + overlay.width * fraction;
    const y = overlay.y + overlay.height / 2;
    await page.mouse.move(point(0.04), y);
    await page.mouse.down();
    await page.mouse.move(point(0.95), y, { steps: 12 });
    await page.mouse.up();
    const hits = await page.evaluate(() => window.__vizProbe.interval);
    const chosen = t(hits[0], hits.at(-1));
    assert(chosen.length > 2 && chosen.length < rows.length);
    const sorted = [...chosen].sort((a, b) => a.value - b.value);
    assert((await report(page)).includes('Warmest ' + sorted.at(-1).value));
    return {
      hours: chosen.length,
      start: cleanForecast(chosen[0]).time,
      end: cleanForecast(chosen.at(-1)).time,
      comparison: [sorted[0], sorted.at(-1)].map(cleanForecast),
    };
  }
  if (id === 4) {
    const book = rows.find((row) => row.authors.length && row.id?.startsWith('/works/'));
    assert(book);
    await select(page, 'Pin catalog work', book.id);
    assert((await report(page)).includes(book.authors[0].name));
    assert.equal(await page.evaluate(() => window.__vizProbe.pinned), book.id);
    return { book };
  }
  if (id === 5) {
    const count = (mode) =>
      raw.events.reduce((n, row) => n + eventCategories(row, mode).length, 0);
    const distinct = new Set(raw.events.map((row) => row.id)).size;
    const displayedAll = await page.evaluate(() => window.__vizProbe.eventNodes);
    await select(page, 'Counting rule', 'first');
    await page.getByText('Sectors count first categories.').waitFor();
    const displayedFirst = await page.evaluate(() => window.__vizProbe.eventNodes);
    const firstLinks = await page.evaluate(() => window.__vizProbe.links);
    assert.equal(firstLinks, displayedFirst);
    assert((await report(page)).includes(count('all') + ' all-category'));
    const examples = raw.events
      .filter((event) => eventCategories(event).length > 1)
      .slice(0, 3)
      .map((event) => ({
        id: event.id,
        title: event.title,
        categories: eventCategories(event),
      }));
    return {
      distinct,
      all: count('all'),
      first: count('first'),
      displayedAll,
      displayedFirst,
      examples,
    };
  }
  if (id === 6) {
    const event = rows.find((row) => row.x > 3.15 && row.x < 3.7) || rows[0];
    await select(page, 'Track USGS event', event.id);
    const overlay = await page.locator('.magnitude-brush .overlay').boundingBox();
    const y = overlay.y + overlay.height / 2;
    await page.mouse.move(overlay.x + 6, y);
    await page.mouse.down();
    await page.mouse.move(overlay.x + overlay.width * 0.54, y, { steps: 10 });
    await page.mouse.up();
    const selected = await page.evaluate(() => window.__vizProbe.selectedEventIds);
    assert(selected.length);
    await page.getByRole('button', { name: 'Bin sculpture', exact: true }).click();
    const switched = await page.evaluate(() => ({
      ids: window.__vizProbe.selectedEventIds,
      pin: window.__vizProbe.pinned,
      layout: window.__vizProbe.layout,
    }));
    assert.deepEqual(switched.ids, selected);
    assert.equal(switched.pin, event.id);
    assert.equal(switched.layout, 'bins');
    return {
      event,
      exampleBrushedIds: selected.slice(0, 5),
      brushedCount: selected.length,
      layouts: ['swarm', switched.layout],
    };
  }
  if (id === 7) {
    const usa = rows.filter((row) => row.country === 'USA');
    const end =
      usa.find((row) => row.time === 2020 && row.value < 0) ||
      usa.find(
        (row, i) =>
          i && row.time - usa[i - 1].time === 1 && row.value * usa[i - 1].value < 0,
      );
    const previous = usa.find((row) => row.time === end.time - 1);
    assert(previous.value * end.value < 0);
    await select(page, 'GDP growth sign change', 'USA:' + end.time);
    assert((await report(page)).includes(String(end.value)));
    return { comparison: [previous, end] };
  }
  const byCity = new Map();
  for (const row of rows) {
    if (!byCity.has(row.city)) byCity.set(row.city, []);
    byCity.get(row.city).push(row);
  }
  let best;
  for (const series of byCity.values()) {
    const dry = series.find((row) => row.value === 0);
    const wet = [...series].sort((a, b) => b.value - a.value)[0];
    if (dry && wet.value > (best?.[1].value ?? 0)) best = [dry, wet];
  }
  assert(best);
  const [dry, wet] = best;
  await page.getByRole('button', { name: wet.city, exact: true }).click();
  await page.getByRole('button', { name: 'Hold hour', exact: true }).click();
  const series = byCity.get(wet.city);
  for (const row of [dry, wet]) {
    await run(
      page.getByLabel('Rain forecast interval', { exact: true }),
      series.indexOf(row),
    );
    assert((await report(page)).includes(row.city + ' ' + row.value + ' mm'));
    assert.equal(await page.evaluate(() => window.__vizProbe.hour), row.time);
  }
  return { comparison: [dry, wet].map(cleanForecast) };
}

async function open(page, id) {
  const api = page.waitForResponse((response) => response.url().includes('/api/data/'), {
    timeout: 36000,
  });
  await page.goto(base(id), { timeout: 15000 });
  let response = await api;
  if (!response.ok()) {
    await page.getByText('LIVE SOURCE UNAVAILABLE', { exact: true }).waitFor();
    const retry = page.waitForResponse((r) => r.url().includes('/api/data/'), {
      timeout: 36000,
    });
    await page.getByRole('button', { name: 'Fetch fresh data' }).click();
    response = await retry;
  }
  return { response, packet: await response.json() };
}

try {
  const desk = await browser.newContext(desktop);
  const mobile = await browser.newContext(phone);
  const gallery = await desk.newPage();
  await gallery.goto(base(0));
  assert.equal(await gallery.locator('.card').count(), 8);
  assert.equal(await gallery.locator('#author').innerText(), 'David Vasquez');
  const links = await gallery
    .locator('.card')
    .evaluateAll((nodes) => nodes.map((node) => node.href));
  assert.deepEqual(
    links,
    Array.from({ length: 8 }, (_, i) => base(i + 1) + '/'),
  );
  await gallery.screenshot({
    path: target + '/screenshots/after/overview.png',
    fullPage: true,
  });
  await gallery.close();
  const mobileGallery = await mobile.newPage();
  await mobileGallery.goto(base(0));
  assert(await size(mobileGallery));
  await mobileGallery.screenshot({
    path: target + '/screenshots/mobile/overview.png',
    fullPage: true,
  });
  await mobileGallery.close();

  for (let id = 1; id <= 8; id++) {
    const item = {
      id,
      desktop: 'NOT VERIFIED',
      mobile: 'NOT VERIFIED',
      controlledOutage: 'NOT VERIFIED',
    };
    results.push(item);
    for (const [kind, context] of [
      ['desktop', desk],
      ['mobile', mobile],
    ]) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const dir = kind === 'desktop' ? 'after' : 'mobile';
      try {
        const { response, packet } = await open(page, id);
        assert.equal(await page.locator('#student-label').innerText(), 'David Vasquez');
        if (!response.ok()) {
          await page.getByText('LIVE SOURCE UNAVAILABLE', { exact: true }).waitFor();
          await page.screenshot({
            path: target + '/screenshots/' + dir + '/lab-' + id + '.png',
            fullPage: true,
          });
          throw Error('HTTP ' + response.status() + ' ' + packet.error);
        }
        await page.locator('.custom-scene').waitFor();
        assert(await size(page), 'Document fits viewport');
        if (kind === 'desktop') {
          const state = await page.evaluate(() => window.__labState);
          const count = state.rows.length;
          assert(count > 0 && state.meta.mode === 'live');
          assert(
            response.headers()['cache-control'].includes('no-store'),
            'API disables caching',
          );
          assert.equal(
            createHash('sha256').update(packet.rawText).digest('hex'),
            packet.meta.sha256,
          );
          assert.deepEqual(JSON.parse(packet.rawText), packet.raw);
          item.source = {
            ...state.meta,
            selectedCount: count,
            selectedFilters: state.context.filters,
          };
          try {
            item.observation = await investigate(page, id, state.rows, packet.raw);
          } catch (error) {
            item.investigationError = error.message;
          }
          item.readout = await report(page);
          const drawer = page.locator('.live-evidence');
          await drawer.locator('summary').click();
          const checksum = drawer.locator('.checksum');
          await checksum.waitFor({ state: 'visible' });
          assert.equal(await checksum.textContent(), 'SHA-256: ' + packet.meta.sha256);
          await drawer.locator('summary').click();
        } else {
          assert(await page.locator('.mobile-pan').isVisible());
          await run(page.getByLabel('Canvas viewport', { exact: true }), 100);
          assert(
            (await page.locator('.scene-surface').evaluate((el) => el.scrollLeft)) > 0,
          );
          await run(page.getByLabel('Canvas viewport', { exact: true }), 25);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: target + '/screenshots/' + dir + '/lab-' + id + '.png',
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        item[kind] = 'PASS';
      } catch (error) {
        item[kind] = 'NOT VERIFIED — ' + error.message;
      } finally {
        await page.close();
        await save();
      }
    }
    const page = await desk.newPage();
    try {
      await page.route('**/api/data/**', (route) =>
        route.fulfill({
          status: 502,
          json: {
            error:
              'Controlled provider outage for verification. No saved response is substituted.',
          },
        }),
      );
      await page.goto(base(id));
      await page.getByText('LIVE SOURCE UNAVAILABLE', { exact: true }).waitFor();
      assert.equal(await page.locator('.custom-scene').count(), 0);
      assert.equal(await page.evaluate(() => window.__labState), null);
      assert(
        (await page.getByRole('alert').innerText()).includes(
          'Controlled provider outage',
        ),
      );
      await page.screenshot({
        path: target + '/screenshots/outages/lab-' + id + '.png',
        fullPage: true,
      });
      item.controlledOutage = 'PASS';
    } catch (error) {
      item.controlledOutage = 'FAIL — ' + error.message;
    }
    await page.close();
    await save();
    console.log(
      id,
      item.desktop,
      item.mobile,
      item.controlledOutage,
      item.investigationError || '',
    );
  }
} finally {
  await browser.close();
}
if (
  results.some(
    (item) =>
      [item.desktop, item.mobile, item.controlledOutage].some(
        (state) => state !== 'PASS',
      ) || !item.observation,
  )
)
  process.exitCode = 1;
