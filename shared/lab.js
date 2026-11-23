import { COURSE, STARTER_CREDIT, STARTER_URL, STUDENT_NAME } from './identity.js';
import { renderExperience, stopExperience } from './experiences/index.js';
import { element as e, download, statistics, aiPanel } from './evidence.js';
export const titles = [
  'Seismic globe',
  'Population choreography',
  'Forecast wind atelier',
  'Author–work constellation',
  'Natural-event radial atlas',
  'Seismic particle sculpture',
  'Economic phase space',
  'Rainfall observatory',
];
const frameworks = [
  'Vanilla JavaScript',
  'Vue',
  'React',
  'Preact',
  'Lit',
  'Svelte',
  'Solid',
  'Qwik',
];
const descriptions = [
  'Orbit a data-driven globe. Track real earthquakes through space and time.',
  'Six countries become a collision-aware, time-traversable composition.',
  'Wind-driven particles, temperature ribbons and a linked temporal lens.',
  'Drag, pin and rearrange actual author–work relationships.',
  'Explore actual category memberships as a bundled radial event garden.',
  'Morph individual earthquakes between a swarm, stacked bins and depth space.',
  'Follow consecutive annual GDP rates through an interactive phase portrait.',
  'Orbit a five-city rain scene driven by actual hourly forecast amounts.',
];
export function installShell(id) {
  document.body.dataset.lab = id;
  if (new URLSearchParams(location.search).has('embed'))
    document.body.classList.add('embedded');
  document.title = `Lab ${id} · ${titles[id - 1]}`;
  const home = import.meta.env.BASE_URL.startsWith('/labs/')
    ? ''
    : 'http://127.0.0.1:5280';
  document.querySelector('#shell').innerHTML =
    `<header><div class="wrap"><div class="topline"><a href="${home}/">← LIVE MOTION LABS</a><span class="eyebrow">${COURSE} · ${frameworks[id - 1]}</span></div><h1>${titles[id - 1]}</h1><p class="sub">${descriptions[id - 1]}</p><p class="student" id="student-label"></p></div></header><main class="wrap"><div class="mode-row"><span class="pill" id="data-badge">FETCHING LIVE SOURCE</span><span id="request-status" role="status">A fresh network request is required.</span><button id="reload-data">Fetch fresh data</button><a href="${home}/assignment">How this works / source code</a></div><div id="app"></div><section id="evidence"></section></main><footer><div class="wrap"><a href="${STARTER_URL}">${STARTER_CREDIT}</a>.</div></footer>`;
  document.querySelector('#student-label').textContent = STUDENT_NAME;
  document.querySelector('#reload-data').onclick = () =>
    window.dispatchEvent(new Event('lab:refresh'));
  document.addEventListener('lab:request', (event) => {
    const d = event.detail,
      badge = document.querySelector('#data-badge'),
      status = document.querySelector('#request-status');
    badge.textContent =
      d.state === 'error'
        ? 'LIVE SOURCE UNAVAILABLE'
        : d.state === 'fetching'
          ? 'REQUESTING PROVIDER'
          : 'LIVE RESPONSE VERIFIED';
    badge.className = 'pill ' + (d.state === 'error' ? 'failed' : '');
    status.textContent =
      d.state === 'error'
        ? d.message
        : d.state === 'ready'
          ? 'Retrieved ' + new Date(d.at).toLocaleTimeString() + ' · auto refresh enabled'
          : 'Connecting to the free public API…';
    if (d.state === 'error') {
      const node = document.querySelector('.chart');
      if (node) {
        stopExperience(node);
        node.textContent = d.message;
      }
      document.querySelector('#evidence')?.replaceChildren();
      window.__labState = null;
    }
  });
  window.addEventListener(
    'pagehide',
    () => {
      const node = document.querySelector('.chart');
      if (node) stopExperience(node);
    },
    { once: true },
  );
}
export { stopExperience };

export function setStatus(node, message, error = false) {
  node.textContent = message;
  node.className = error ? 'error' : 'status';
  node.setAttribute('role', error ? 'alert' : 'status');
}
export function draw(node, packet, shown, options) {
  if (packet.invalid) return;
  const scene = renderExperience(node, packet, shown, options);
  const summary = statistics(shown),
    meta = packet.meta,
    context = {
      lab: document.title,
      source: meta.name,
      sourceUrl: meta.url,
      dataMode: 'live',
      retrievedAt: meta.fetchedAt,
      unit: options.unit || meta.unit,
      filters: options.filters || {},
      summary,
      limitation: options.limitation,
    };
  window.__labState = { rows: shown, summary, meta, context };
  const panel = document.querySelector('#evidence');
  panel.replaceChildren();
  const details = e('details', '', panel);
  details.className = 'live-evidence panel';
  e('summary', 'Inspect the real data / provenance / accessible table', details);
  e(
    'p',
    `${meta.name} · ${shown.length} selected records · request completed ${meta.fetchedAt}.`,
    details,
  );
  e(
    'p',
    `Units: ${context.unit} · ${meta.rawCount} source records · ${meta.validCount} valid records or categories.`,
    details,
  );
  const checksum = e('p', `SHA-256: ${meta.sha256}`, details);
  checksum.className = 'checksum';
  const a = e('a', meta.url, details);
  a.href = meta.url;
  a.target = '_blank';
  a.rel = 'noreferrer';
  e('p', meta.license, details);
  e('p', options.limitation, details);
  if (Array.isArray(packet.raw) && packet.raw[0]?.lastupdated)
    e(
      'p',
      'Provider reports series last updated: ' +
        packet.raw[0].lastupdated +
        '. Historical series are retrieved live; annual figures do not update every second.',
      details,
    );
  const actions = e('div', '', details);
  actions.className = 'actions';
  const b = e('button', 'Download this live response', actions);
  b.onclick = () => download('live-provider-response.json', packet.rawText || packet.raw);
  const scroll = e('div', '', details);
  scroll.className = 'table-wrap';
  const table = e('table', '', scroll);
  const cols =
    shown[0] && 'x' in shown[0]
      ? ['label', 'x', 'y', 'time']
      : ['label', 'value', 'time'];
  const head = e('tr', '', table);
  cols.forEach((c) => e('th', c, head));
  for (const row of shown.slice(0, 100)) {
    const tr = e('tr', '', table);
    cols.forEach((c) => e('td', row[c] ?? '', tr));
  }
  e(
    'p',
    'First 100 selected rows shown; no source response is automatically saved.',
    details,
  );
  aiPanel(panel, context);
  return scene;
}
