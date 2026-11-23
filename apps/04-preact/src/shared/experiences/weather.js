import { d3, createScene, label, number } from './core.js';
export function weather(node, packet, rows) {
  const scene = createScene(
    node,
    'Forecast wind atelier',
    'ADVECTED PARTICLES · LINKED WEATHER RIBBON · BRUSH OR SCRUB',
  );
  const { svg, surface } = scene;
  const canvas = document.createElement('canvas');
  canvas.width = 1100;
  canvas.height = 600;
  canvas.className = 'particle-layer';
  surface.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 450 }, () => ({
    x: 80 + Math.random() * 660,
    y: 55 + Math.random() * 340,
    age: Math.random(),
  }));
  let index = 0,
    clock = 0,
    auto = true,
    trail = true,
    interval = rows;
  const nyTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const x = d3
      .scaleLinear()
      .domain(d3.extent(rows, (d) => d.time))
      .range([80, 750]),
    temp = d3
      .scaleLinear()
      .domain(d3.extent(rows, (d) => d.value))
      .range([390, 90]);
  if (temp.domain()[0] === temp.domain()[1])
    temp.domain([temp.domain()[0] - 1, temp.domain()[1] + 1]);
  const base = d3
    .area()
    .x((d) => x(d.time))
    .y0(430)
    .y1((d) => temp(d.value))
    .curve(d3.curveCatmullRom);
  for (let i = 12; i >= 0; i--)
    svg
      .append('path')
      .datum(rows)
      .attr('class', 'thermal-ribbon')
      .attr('d', base)
      .attr('transform', `translate(${i * 2},${i * 3})`)
      .attr('fill', d3.interpolateBlues(0.2 + i * 0.035))
      .attr('fill-opacity', 0.035 + i * 0.012)
      .attr('stroke', '#4d9eb8')
      .attr('stroke-opacity', 0.15);
  const path = svg
    .append('path')
    .datum(rows)
    .attr(
      'd',
      d3
        .line()
        .x((d) => x(d.time))
        .y((d) => temp(d.value))
        .curve(d3.curveCatmullRom),
    )
    .attr('fill', 'none')
    .attr('stroke', '#a45a97')
    .attr('stroke-width', 3);
  const scan = svg
    .append('line')
    .attr('y1', 58)
    .attr('y2', 438)
    .attr('stroke', '#ba6b91')
    .attr('stroke-dasharray', '3 4');
  const halo = svg
    .append('circle')
    .attr('r', 11)
    .attr('fill', '#fff')
    .attr('stroke', '#9a538a')
    .attr('stroke-width', 3);
  label(svg, 820, 73, 'WEATHER, AS A FIELD', 12, '#ab6f92');
  const big = label(svg, 820, 136, '', 53, '#2b476b'),
    wind = label(svg, 820, 181, '', 17),
    humidity = label(svg, 820, 212, '', 17),
    hour = label(svg, 820, 253, '', 13);
  label(svg, 820, 314, 'Particle flow follows forecast');
  label(svg, 820, 337, 'wind direction and speed.');
  label(svg, 820, 379, 'Motion is an illustrative field,');
  label(svg, 820, 402, 'not a geographic wind model.');
  svg
    .append('g')
    .attr('transform', 'translate(0,450)')
    .call(
      d3
        .axisBottom(x)
        .ticks(4)
        .tickFormat((v) =>
          new Date(v).toLocaleString('en-US', {
            hour: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'America/New_York',
          }),
        ),
    );
  const brush = svg
    .append('g')
    .attr('class', 'weather-brush')
    .call(
      d3
        .brushX()
        .extent([
          [80, 475],
          [750, 540],
        ])
        .on('brush end', (e) => {
          if (e.selection) {
            const [start, end] = e.selection.map(x.invert);
            interval = rows.filter((d) => d.time >= start && d.time <= end);
            const t = (start + end) / 2;
            index = d3.leastIndex(rows, (d) => Math.abs(d.time - t));
            auto = false;
            update();
          } else {
            interval = rows;
          }
          reportInterval();
        }),
    );
  svg
    .append('path')
    .datum(rows)
    .attr('pointer-events', 'none')
    .attr(
      'd',
      d3
        .area()
        .x((d) => x(d.time))
        .y0(538)
        .y1((d) => 490 - (d.value - temp.domain()[0]) * 1.2)
        .curve(d3.curveMonotoneX),
    )
    .attr('fill', '#c6d9e5');
  brush.raise();
  label(svg, 80, 574, 'DRAG A WINDOW IN THE OVERVIEW TO REFOCUS THE WIND FIELD', 11);
  scene.controls(
    'Weather playback',
    ['Play forecast', 'Hold hour'],
    (_, i) => (auto = i === 0),
  );
  scene.controls(
    'Particle mode',
    ['Persistent trails', 'Clear particles'],
    (_, i) => (trail = i === 0),
  );
  const timeline = scene.timeline('Forecast hour', 0, rows.length - 1, 0, (i) => {
    index = i;
    auto = false;
    update();
  });
  function update() {
    const d = rows[index];
    if (!d) return;
    big.text(number(d.value) + '°C');
    wind.text(
      Number.isFinite(d.wind) ? `${number(d.wind)} m/s wind` : 'Wind not reported',
    );
    humidity.text(
      Number.isFinite(d.humidity)
        ? `${d.humidity}% relative humidity`
        : 'Humidity not reported',
    );
    hour.text(nyTime.format(d.time));
    scan.attr('x1', x(d.time)).attr('x2', x(d.time));
    halo.attr('cx', x(d.time)).attr('cy', temp(d.value));
    timeline.set(index, nyTime.format(d.time));
    scene.probe.hour = d.time;
    scene.probe.wind = d.wind;
    scene.probe.temperature = d.value;
  }
  function reportInterval() {
    const warmest = d3.greatest(interval, (d) => d.value);
    const coolest = d3.least(interval, (d) => d.value);
    const windText = (d) =>
      Number.isFinite(d.wind)
        ? `${d.wind} m/s${Number.isFinite(d.direction) ? ` from ${d.direction}°` : ''}`
        : 'wind unreported';
    scene.report(
      warmest
        ? `${interval.length} forecast hours · ${nyTime.format(interval[0].time)} – ${nyTime.format(interval.at(-1).time)}. Warmest ${warmest.value} °C at ${nyTime.format(warmest.time)}, ${windText(warmest)}. Coolest ${coolest.value} °C at ${nyTime.format(coolest.time)}, ${windText(coolest)}.`
        : 'No reporting hour falls inside the brushed window.',
    );
    scene.probe.interval = interval.map((d) => d.time);
  }
  update();
  reportInterval();
  scene.inspect(
    'A temperature ribbon and a live-requested wind field',
    'Scrub time: color, wind advection, humidity and the crosshair stay linked to the same forecast hour.',
  );
  scene.frame((dt, t) => {
    clock += dt;
    if (auto && clock > 0.22) {
      index = (index + 1) % rows.length;
      clock = 0;
      update();
    }
    const d = rows[index];
    const theta = (((d?.direction || 0) + 180) * Math.PI) / 180,
      speed = Number.isFinite(d?.wind) ? d.wind : 0;
    ctx.fillStyle = trail ? 'rgba(248,250,253,.06)' : 'rgba(248,250,253,1)';
    ctx.fillRect(0, 0, 1100, 600);
    ctx.save();
    ctx.beginPath();
    ctx.rect(76, 45, 690, 390);
    ctx.clip();
    ctx.lineWidth = 1.4;
    for (const p of particles) {
      const ox = p.x,
        oy = p.y;
      p.x += Math.sin(theta) * speed * dt * 9;
      p.y -= Math.cos(theta) * speed * dt * 9;
      p.age += dt * 0.25;
      if (p.x < 76 || p.x > 766 || p.y < 45 || p.y > 435 || p.age > 1) {
        p.x = 80 + Math.random() * 670;
        p.y = 55 + Math.random() * 365;
        p.age = 0;
      }
      ctx.strokeStyle = d3.interpolateCool(
        Math.max(0, Math.min(1, (d?.value + 10) / 45)),
      );
      ctx.globalAlpha = Math.sin(p.age * Math.PI) * 0.7;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      if (Math.abs(p.x - ox) < 50 && Math.abs(p.y - oy) < 50) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.restore();
    halo.attr('r', 9 + Math.sin(t * 3) * 2);
  });
  return scene;
}
