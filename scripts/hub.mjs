import { labs } from './labs.mjs';
import { COURSE, STARTER_CREDIT, STARTER_URL, STUDENT_NAME } from '../shared/identity.js';

const cards = [
  ['Seismic globe', 'USGS', 'Orbit the globe and compare earthquake depths.'],
  [
    'Population choreography',
    'World Bank',
    'Scrub annual data and compare two countries.',
  ],
  [
    'Forecast wind atelier',
    'Open-Meteo',
    'Brush a forecast interval and inspect temperature and wind.',
  ],
  [
    'Author–work constellation',
    'Open Library',
    'Pin a title and trace its catalog author credits.',
  ],
  [
    'Natural-event radial atlas',
    'NASA EONET',
    'Compare category counts and orbit recent events.',
  ],
  [
    'Seismic particle sculpture',
    'USGS',
    'Follow selected earthquakes through three layouts.',
  ],
  [
    'Economic phase space',
    'World Bank',
    'Trace GDP growth and jump to years with sign changes.',
  ],
  [
    'Rainfall observatory',
    'Open-Meteo',
    'Compare hourly precipitation across five cities.',
  ],
];

export function hubHTML({ publicBuild = false } = {}) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Live Motion Labs · CPS 5745</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#edf3f5;color:#172f3b;font:1rem/1.5 system-ui,sans-serif}
header{background:#102d3b;color:#f5fbfb;border-bottom:5px solid #5bd1bb}
.wrap{max-width:76rem;margin:auto;padding:0 clamp(1rem,4vw,3rem)}
.hero{padding-block:clamp(2.5rem,7vw,5rem)}
h1{font-size:clamp(2.75rem,7vw,5.5rem);line-height:.95;letter-spacing:-.065em;margin:.5rem 0 1.25rem}
.course{color:#9de6d6;font-weight:700}
.hero p{max-width:48ch}
nav{display:flex;flex-wrap:wrap;gap:.65rem 1.5rem}
a{color:inherit;text-underline-offset:.2em}
:focus-visible{outline:3px solid #167c70;outline-offset:4px}
header :focus-visible{outline-color:#9de6d6}
main.wrap{padding-block:2rem}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:1rem}
.card{display:flex;flex-direction:column;min-width:0;min-height:12rem;background:#fff;border:1px solid #bcced3;border-top:3px solid #278679;border-radius:.5rem;padding:1.15rem;text-decoration:none}
.card:hover{background:#f5fffc;border-color:#278679}
.card h2{font-size:1.24rem;line-height:1.2;margin:.5rem 0}
.card p{color:#3c535e;margin:0 0 .8rem}
.card .source{color:#1b6259;font-weight:700;font-size:.85rem;margin:0}
.card .open{margin-top:auto;font-weight:700;text-decoration:underline}
footer{border-top:1px solid #bcced3;padding-block:1rem 2rem;font-size:.9rem}
</style></head>
<body><header><div class="wrap hero">
<div class="course">${COURSE}</div>
<h1>Live Motion Labs</h1>
<p id="author"></p>
<p>Explore earthquakes, weather, historical statistics, books, and natural events through eight interactive D3 visualizations.</p>
<nav aria-label="Assignment resources"><a href="/assignment">Assignment guide</a><a href="/guide.pdf">Printable guide</a></nav>
</div></header>
<main class="wrap" aria-label="Eight framework labs"><div class="gallery">
${labs
  .map((lab, i) => {
    const [title, provider, description] = cards[i];
    const href = publicBuild ? `/labs/${lab.id}/` : `http://127.0.0.1:${lab.port}/`;
    return `<a class="card" href="${href}"><p class="source">${lab.framework} · ${provider}</p><h2>${title}</h2><p>${description}</p><span class="open">Open lab <span aria-hidden="true">↗</span></span></a>`;
  })
  .join('\n')}
</div></main>
<footer><div class="wrap"><a href="${STARTER_URL}">${STARTER_CREDIT}</a>.</div></footer>
<script>document.querySelector('#author').textContent=${JSON.stringify(STUDENT_NAME).replaceAll('<', '\\u003c')};</script>
</body></html>`;
}
