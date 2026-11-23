# CPS 5745 Unit 12 verification

**David Vasquez · November 22, 2026 · America/New_York**

Checkout: unit12-live-motion-labs on feature/unit12-custom-labs. Baseline 0ce4765ced8ab85271616652f71f050eee609859. The checkout’s origin points to the instructor’s GitHub repository. Node v24.22.0, npm 11.19.1, macOS, Playwright in installed Google Chrome. The inspection found dev, start, stop, build, test, test:browser, sync, postinstall, check:servers, audit:live and build:public. Dependencies were already installed.

## Lab results

| Lab and change | Desktop and evidence | Phone 390 × 844 | Controlled unavailable source | Investigation |
|---|---|---|---|---|
| 1 Vanilla JS · depth legend and event picker | Pass · [after](screenshots/after/lab-1.png) | [Pass](screenshots/mobile/lab-1.png) | [Pass](screenshots/outages/lab-1.png) | Pass · centered two comparable magnitudes at different depths |
| 2 Vue · country pair and annual gap | Pass · [after](screenshots/after/lab-2.png) | [Pass](screenshots/mobile/lab-2.png) | [Pass](screenshots/outages/lab-2.png) | Pass · inspected China and India at common reporting years |
| 3 React · brushed interval comparison | Pass · [after](screenshots/after/lab-3.png) | [Pass](screenshots/mobile/lab-3.png) | [Pass](screenshots/outages/lab-3.png) | Pass · brushed temperature extrema and paired hourly wind |
| 4 Preact · persistent pin and catalog details | Pass · [after](screenshots/after/lab-4.png) | [Pass](screenshots/mobile/lab-4.png) | [Pass](screenshots/outages/lab-4.png) | Pass · selected a work and verified the returned authors |
| 5 Lit · membership count comparison | Pass · [after](screenshots/after/lab-5.png) | [Pass](screenshots/mobile/lab-5.png) | [Pass](screenshots/outages/lab-5.png) | Pass · switched rules and checked memberships, IDs and links |
| 6 Svelte · tracked event and brushed IDs | Pass · [after](screenshots/after/lab-6.png) | [Pass](screenshots/mobile/lab-6.png) | [Pass](screenshots/outages/lab-6.png) | Pass · confirmed the same pinned ID and brushed subset in two layouts |
| 7 Solid · GDP sign-change marker | Pass · [after](screenshots/after/lab-7.png) | [Pass](screenshots/mobile/lab-7.png) | [Pass](screenshots/outages/lab-7.png) | Pass · plotted consecutive annual rates on opposite sides of zero |
| 8 Qwik · same-time city amounts | Pass · [after](screenshots/after/lab-8.png) | [Pass](screenshots/mobile/lab-8.png) | [Pass](screenshots/outages/lab-8.png) | Pass · compared a dry and wet hourly forecast for one city |

[Observations](evidence/observations.json) records selected provider values, source URLs, timestamps in UTC, units, counts, filters and response hashes. The report also gives New York timestamps. Every updated lab showed live data in the desktop and phone checks. The phone pass includes panning the canvas and checking page-width overflow. Controlled browser requests returned HTTP 502 and confirmed the UI showed an error with an empty scene. The desktop check independently recalculated the response hash and checked the displayed hash. The starter browser suite also verified the exported response hash.

See [baseline screenshots](screenshots/before/), [baseline results](evidence/baseline.json), and the [updated launcher](screenshots/after/overview.png). Lab 5’s baseline screenshot records the real NASA connection failure. Its after screenshot records a successful request. Captures use reduced motion. The starter browser suite also verifies animation and play/pause with motion enabled.

## Commands and results

| Command | Result |
|---|---|
| npm run dev | An initial launch found the same checkout already listening on ports 5280–5288. Used it for the baseline, then ran npm run stop and npm run dev to load the updated launcher. |
| npm run check:servers | Pass. All eight assigned ports returned HTTP 200. [Log](evidence/servers.log) |
| npm run sync | Pass. Root shared modules synchronized to all eight applications. |
| npm run audit:live | Initial audit returned five successes and two connection failures. Precipitation and EONET recovered on the second run and all seven returned HTTP 200. [Initial audit](evidence/provider-audit-initial.json), [successful audit](evidence/provider-audit.json) |
| npm run build | Pass. Eight workspace builds. [Log](evidence/build.log) |
| npm test | Pass. Six normalization tests, including missing wind metadata and first-category counting. [Log](evidence/unit-tests.log) |
| CPS_CHROME_CHANNEL=chrome node submission/capture-evidence.mjs | Final pass. Eight desktop, eight phone, and eight controlled-outage checks, with eight live investigations. [Log](evidence/custom-browser.log) |
| npm run test:browser -- --config .runtime/unit12-playwright.config.mjs --retries 1 | Final pass. 26 of 26. The temporary config extended the original config with one worker and the installed Chrome channel. The initial run passed 23 of 26, with a globe frame polling timeout, a Lit live-data wait timeout, and a Solid page navigation during source synchronization. [Initial log](evidence/browser-tests-initial.log), [final log](evidence/browser-tests.log) |
| npm run build:public | Pass. All production bundles assembled. [Log](evidence/build-public.log) |
| node .runtime/public-smoke.mjs | Pass. Local harness served the built files and invoked the checked-in Node API handler. All eight production pages loaded, used same-origin provider requests that returned HTTP 200, and linked back to the public launcher. The guide and PDF resolved, and rejected API requests returned expected 404, 405 and 410 statuses. [Log](evidence/public-smoke.log) |
| git apply --check --whitespace=error | Pass against an extracted copy of the baseline. The diff includes generated shared copies required by the individual apps. [Diff](code-diffs/unit12-changes.diff) |

No dependency installation was needed. The existing Chrome installation ran the browser tests. On another workstation, use npx playwright install chromium and npm run test:browser with the servers active. The assignment and instructor demo links belong to the instructor.

## Remaining review

- The recorded data and screenshots were verified by automated browser sessions. Review all eight cases in the report and add your own interpretation before uploading.
- The GitHub URL for this student edition and Vercel deployment remain **PENDING**. Actual cloud runtime behavior is **NOT VERIFIED**. If you authorize publication, use the production verification steps in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).
- Upload according to [README_SUBMISSION.md](README_SUBMISSION.md).
