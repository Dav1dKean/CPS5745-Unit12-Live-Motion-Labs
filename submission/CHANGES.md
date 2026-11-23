# Source changes

Baseline revision **0ce4765ced8ab85271616652f71f050eee609859**. The original branch already contained all eight native apps, D3 scenes, controls, and live source wiring. The baseline comparison uses the checked-in revision without creating a commit. The original instruction Markdown and PDF remain intact.

| Lab | Canonical file | Student customization |
|---|---|---|
| Vanilla JS | shared/experiences/globe.js | Quantitative depth scale tied to mark colors. Select a real USGS event to center it, highlight it, and inspect its magnitude, timestamp, depth and visibility. |
| Vue | shared/experiences/population.js | Country pair selectors show exact same-year populations, headcount gap, and highlighted points on the linked history. |
| React | shared/experiences/weather.js | Brushed-hour comparison reports warmest and coolest temperature and their linked wind values using explicit New York timestamps. |
| Preact | shared/experiences/books.js | Select a work by keyboard or pin a node. A persistent panel exposes edition counts, authors, first-publication year and a validated catalog link. |
| Lit | shared/experiences/events.js | Show all membership counts, first assignments and distinct IDs together. Dots and links follow the same category rule as the sectors. |
| Svelte | shared/experiences/swarm.js | Track an event by USGS ID and retain the brushed IDs and pinned highlight through layout changes. |
| Solid | shared/experiences/economy.js | Jump to consecutive-year GDP sign changes and mark the exact plotted pair with a ring and annual rates. |
| Qwik | shared/experiences/rain.js | Compare city totals at one timestamp, expose missing city-hours, and update the location selection when jumping to the wettest interval. |

- scripts/hub.mjs and shared/identity.js add a responsive eight-card launcher and the student name and starter credit used across the site.
- shared/lab.js, shared/style.css, shared/experiences/core.js and shared/experiences/index.js add the author, accessible investigation controls and provenance checksums. Scene disposal clears the active reference. npm run sync propagates shared modules to all eight builds.
- shared/sources.js shares EONET category selection between normalization and rendering and preserves missing weather metadata. Forecast record totals count hourly entries before normalization.
- The Vue, React, Preact, Lit, Svelte, Solid and Qwik native entries dispose of D3 scenes with their framework lifecycles. Vanilla uses its existing pagehide cleanup.
- scripts/live-response.mjs, scripts/vite-common.mjs, api/data/[key].js and .gitignore wire the missing public API handler and reuse local allowlisted request logic. scripts/build-public.mjs generates public card URLs from the same launcher.
- README.md credits the instructor and points to the submission and publication guides.
