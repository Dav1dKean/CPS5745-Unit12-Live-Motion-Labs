import { d3, createScene, label, hover, palette, number } from './core.js';
import { eventCategories } from '../sources.js';

export function events(node, packet, rows, { filters }) {
  const scene = createScene(
    node,
    'Natural-event radial atlas',
    'NASA EONET · BUNDLED MEMBERSHIPS · EXPLODE A CATEGORY',
  );
  const { svg } = scene,
    cx = 455,
    cy = 300;
  const categories = rows.map((d, i) => ({ ...d, color: palette[i % 6] })),
    allowed = new Set(categories.map((d) => d.label));
  const sourceEvents = packet.raw.events;
  const countMode = filters.countMode;
  const all = sourceEvents
    .map((event) => ({ ...event, memberships: eventCategories(event, countMode) }))
    .filter((event) => event.memberships.some((title) => allowed.has(title)))
    .map((e) => ({ ...e, time: Date.parse(e.geometry?.at(-1)?.date || '') }))
    .filter((e) => Number.isFinite(e.time))
    .sort((a, b) => b.time - a.time);
  const visible = all.slice(0, 150);
  const arcs = d3
      .pie()
      .sort(null)
      .value((d) => d.value)(categories),
    byCat = new Map(arcs.map((a) => [a.data.label, a]));
  let mode = 0,
    pin = null;
  const arc = d3.arc().innerRadius(235).outerRadius(249);
  const wedges = svg
    .append('g')
    .attr('transform', `translate(${cx},${cy})`)
    .selectAll('path')
    .data(arcs)
    .join('path')
    .attr('d', arc)
    .attr('fill', (d) => d.data.color)
    .attr('stroke', 'white')
    .attr('stroke-width', 4)
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', (d) => `${d.data.label}, ${d.data.value} memberships`)
    .on('click keydown', (event, d) => {
      if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      pin = pin === d.data.label ? null : d.data.label;
      scene.inspect(
        d.data.label,
        `${d.data.value} category memberships in returned events; click again to release.`,
      );
      scene.probe.category = pin;
      render(1, scene.probe.time);
    });
  wedges.append('title').text((d) => `${d.data.label}: ${d.data.value}`);
  svg
    .append('g')
    .selectAll('text')
    .data(arcs)
    .join('text')
    .attr('x', (d) => cx + Math.sin((d.startAngle + d.endAngle) / 2) * 280)
    .attr('y', (d) => cy - Math.cos((d.startAngle + d.endAngle) / 2) * 280)
    .attr('text-anchor', 'middle')
    .attr('fill', (d) => d.data.color)
    .attr('font-size', 12)
    .attr('font-weight', 700)
    .text((d) => d.data.label);
  const extent = d3.extent(visible, (d) => d.time),
    radial = d3.scaleLinear().domain(extent).range([80, 218]);
  const nodes = visible.map((e, i) => {
    const first = e.memberships.find((title) => allowed.has(title)),
      a = byCat.get(first),
      angle = a.startAngle + (a.endAngle - a.startAngle) * ((i * 0.618) % 1);
    return {
      ...e,
      id: e.id,
      category: first,
      color: a.data.color,
      angle,
      r: radial(e.time),
      px: cx,
      py: cy,
    };
  });
  const links = nodes.flatMap((n) =>
    n.memberships
      .filter((title) => allowed.has(title))
      .map((title) => ({
        node: n,
        arc: byCat.get(title),
        color: byCat.get(title).data.color,
      })),
  );
  const curves = svg
    .append('g')
    .selectAll('path')
    .data(links)
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', (d) => d.color)
    .attr('stroke-width', 0.75)
    .attr('opacity', 0.2);
  const dots = svg
    .append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('class', 'event-seed')
    .attr('r', 3.5)
    .attr('fill', (d) => d.color)
    .attr('stroke', 'white')
    .attr('stroke-width', 0.6);
  hover(
    dots,
    scene,
    (d) => d.title,
    (d) =>
      `${new Date(d.time).toLocaleDateString()} · ${eventCategories(d).join(', ')} · ${d.closed ? 'closed' : 'open'} event`,
  );
  const center = svg.append('g');
  center
    .append('circle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', 59)
    .attr('fill', '#fff')
    .attr('stroke', '#e7eaf3')
    .attr('filter', 'url(#soft-shadow)');
  label(center, cx, cy + 2, String(all.length), 36, '#374b70').attr(
    'text-anchor',
    'middle',
  );
  label(center, cx, cy + 22, 'dated matches', 11).attr('text-anchor', 'middle');
  label(svg, 835, 100, 'THE EVENT GARDEN', 12, '#9c77b9');
  label(svg, 835, 140, String(visible.length), 50, '#3f5278');
  label(svg, 835, 171, 'latest events drawn');
  label(
    svg,
    835,
    218,
    countMode === 'first'
      ? 'Sectors count first categories.'
      : 'Sectors count all memberships.',
  );
  label(svg, 835, 241, 'Dots show dated matches.');
  label(svg, 835, 264, 'Up to 150 recent matches.');
  label(svg, 835, 316, 'Click a category to explode it.');
  label(svg, 835, 339, 'Hover a seed for its real title.');
  label(svg, 835, 402, 'The 500-event API cap is not');
  label(svg, 835, 425, 'a global disaster census.');
  scene.controls('Event layout', ['Category petals', 'Time orbit'], (_, i) => (mode = i));
  scene.controls('Event selection', ['Release category'], () => (pin = null));
  scene.inspect(
    'Category memberships become a living radial structure',
    'Outer sectors encode returned membership counts. Distance from the center encodes event recency; connectors show actual category membership.',
  );
  const distinct = new Set(sourceEvents.map((event) => event.id)).size;
  const memberships = d3.sum(sourceEvents, (event) => eventCategories(event).length);
  const firstCount = d3.sum(
    sourceEvents,
    (event) => eventCategories(event, 'first').length,
  );
  scene.report(
    `${distinct} distinct source event IDs · ${memberships} all-category memberships · ${firstCount} first-category assignments · ${nodes.length} dated events drawn. Request cap 500. Display cap 150.`,
  );
  const line = d3.line().curve(d3.curveBundle.beta(0.86));
  function render(dt, t) {
    for (const n of nodes) {
      const a = mode
        ? ((n.time - extent[0]) / Math.max(1, extent[1] - extent[0])) * Math.PI * 2
        : n.angle;
      const offset = pin && n.memberships.includes(pin) ? 36 : 0;
      const r = n.r + offset;
      n.px +=
        (cx + Math.sin(a) * (r + Math.sin(t + n.angle) * 2) - n.px) * Math.min(1, dt * 5);
      n.py +=
        (cy - Math.cos(a) * (r + Math.sin(t + n.angle) * 2) - n.py) * Math.min(1, dt * 5);
    }
    dots
      .attr('cx', (d) => d.px)
      .attr('cy', (d) => d.py)
      .attr('r', (d) => (pin && d.memberships.includes(pin) ? 5 : 3.5))
      .attr('opacity', (d) => (!pin || d.memberships.includes(pin) ? 1 : 0.1));
    curves
      .attr('d', (d) => {
        const a = (d.arc.startAngle + d.arc.endAngle) / 2;
        return line([
          [d.node.px, d.node.py],
          [cx + Math.sin(a) * 40, cy - Math.cos(a) * 40],
          [cx + Math.sin(a) * 235, cy - Math.cos(a) * 235],
        ]);
      })
      .attr('opacity', (d) => (pin ? (d.arc.data.label === pin ? 0.6 : 0.03) : 0.16));
    scene.probe.eventNodes = nodes.length;
    scene.probe.links = links.length;
    scene.probe.layout = mode;
  }
  render(1, 0);
  scene.frame(render);
  return scene;
}
