# CPS 5745 — Unit 12 Live Motion Labs: Instructions for Codex

## Mission

You are working inside my locally cloned copy of the instructor's repository:

- Original repository: https://github.com/ykumar2020/unit12-live-motion-labs
- Instructor demo: https://unit12-live-motion-labs.vercel.app/
- Assignment: https://unit12-live-motion-labs.vercel.app/assignment
- Unit 12 guide: `guide.pdf` (if available in this workspace)
- Course: CPS 5745 — Interactive Information Visualization
- Working branch: `feature/unit12-custom-labs`

**Goal:** Produce a visibly customized, reliable, well-documented version of the existing eight-framework D3 live-data website. Preserve the working original architecture and authentic public-source data. Prepare evidence suitable for submission, and a deployable public site if possible.

**Do not construct eight new projects from scratch.** Inspect and adapt the instructor's code. The instructor's guide calls for each mini-lab to run, inspect provenance, identify a source field and its visual encoding, make a visual change without changing measurements, complete its investigation, take screenshots, record source URL/time, provide a code diff and data-versus-animation explanation, and test small-screen and unavailable-source behavior. The guide also says to submit all eight apps. A live website and DOCX report are **recommended presentation/submission formats, not explicitly required by the instructor**.

## User ownership / safety / scope

1. Operate within the current checkout only. Never push to the instructor's GitHub repository; do not rewrite its history.
2. Before changes, report `pwd`, `git remote -v`, `git branch --show-current`, `git status --short`, `node --version`, and the available `package.json` scripts. Check whether the specified branch exists. If the user's checkout has uncommitted changes, preserve them; do not reset or overwrite.
3. Read `README.md`, `package.json`, `vercel.json`, `scripts/providers.mjs`, `scripts/vite-common.mjs`, `shared/sources.js`, `shared/lab.js`, `shared/experiences/index.js`, scene files, framework-specific app entries and relevant tests. Read the instructor's website instructions as reference when access is available. Do not assume every file or script name is unchanged.
4. Make a baseline commit or create a clearly documented baseline comparison only after inspecting repo state and confirming it will not mix with existing user changes. Record starting Git revision (`git rev-parse HEAD`) in the report.
5. Keep real source measurements unchanged. Do not fabricate API observations, timestamps, screenshots, test results, checksum results, names, URLs, or deployment success. Represent unverified information as `NOT VERIFIED` and supply a manual action.
6. Preserve source attribution, units, provenance, accessibility, API error reporting, refresh/abort/cleanup, and reduced-motion support. Never introduce cached response fallback or substitute fabricated records when providers fail. Respect free API quotas.
7. Do not use paid APIs, API keys, or unnecessary dependencies. Do not expose credentials or commit `.env` secrets.
8. Favor small, meaningful, understandable code changes rather than replacing functional scenes wholesale. Clearly distinguish starter functionality from contributions made during this assignment.
9. Do not deploy, publish, push to any remote, or create cloud resources without showing the user the specific action and obtaining their go-ahead. Local edits/tests and artifact preparation may proceed.
10. Do not silently alter the assignment or claim that the instructor requires a public deployment or Word document.

## Phase A — Inspect and establish baseline

- Print a concise repository map and eight-app matrix with app framework, live provider, key native entry file, canonical scene file, implemented interactions, and the proposed minimal contribution.
- Run `npm ci` if needed. Start with `npm run dev` (the launcher is normally `http://127.0.0.1:5280`, eight apps use ports 5281–5288). If execution tools do not support persistent servers, explain how to run them locally.
- Visit all eight routes or clearly state which routes could not be inspected. Capture **baseline** screenshots in `submission/screenshots/before/` if browser tooling is available. Capture real screenshots, never synthetic replacements. Record failures separately.
- Identify source file canonicalization: edits to root `shared/` may require `npm run sync`. Avoid editing only generated `apps/*/src/shared/` copies when a canonical shared file exists.
- Show a short implementation plan before editing, then proceed with best-effort local work without repeatedly requesting confirmation for non-destructive code changes.

## Phase B — Customize the site and eight mini-labs

### Shared site appearance

- Produce a professional, responsive, clearly personalized launcher/homepage that links to all eight actual working apps. Use original site as a functional reference, not a pixel-perfect copy. Make each card accurately describe the framework, source and interaction.
- Add an editable author constant or clearly marked placeholder `STUDENT_NAME` where the user can insert the correct name (do not guess the user's full name). Display `CPS 5745 — Unit 12` and the author on the launcher and each app, without misleading viewers about the original author.
- Add a brief "Adapted from the CPS 5745 Unit 12 instructor starter repository" credit and source link in README and appropriate UI place.
- Ensure keyboard accessibility, adequate contrast, loading/error states, responsive layout, and respect for reduced-motion settings.

### Mandatory per-app work

For each app, implement **at least one clearly identifiable and meaningful visual/interactive improvement** consistent with the instructor's existing scene and assignment. Favor a control, highlighted comparison, accessible data-detail readout, legend improvement, or adjustable encoding rather than a purely decorative change. Keep observations and values real. Possible starting ideas follow; verify feasibility in code before selecting:

| # | Framework and scene | Live source | Suggested improvement | Required investigation |
|---|---|---|---|---|
| 1 | Vanilla JS — earthquake depth globe (`shared/experiences/globe.js`) | USGS | Improved depth/magnitude legend or adjustable mark emphasis | Compare similar-magnitude earthquakes of different depths; explain projection occlusion |
| 2 | Vue — population choreography (`population.js`) | World Bank | More useful selected-country comparison / year labeling | Compare two countries' trajectories, quoting real years and population values |
| 3 | React — forecast wind atelier (`weather.js`) | Open-Meteo | Better forecast interval/selection readout | Find a warmer interval and associated wind values, with units |
| 4 | Preact — author-work constellation (`books.js`) | Open Library | Clearer pinned node details / links or legend | Pin a work and identify author(s); separate source metadata from layout |
| 5 | Lit — natural-event radial atlas (`events.js`) | NASA EONET | Toggle or clarify membership counts and distinct events | Compare all-category vs first-category counts; disclose 500-request and 150-displayed caps if applicable |
| 6 | Svelte — earthquake particle sculpture (`swarm.js`) | USGS | Better selected-particle persistence/readout across layouts | Select real IDs in one layout and find the same ones in another |
| 7 | Solid — GDP phase-space trajectories (`economy.js`) | World Bank | Highlight quadrant crossings and year labels | Identify an actual country crossing with years; explain why this is not prediction |
| 8 | Qwik — rainfall observatory (`rain.js`) | Open-Meteo | More readable selected city/hour precipitation values | Compare actual dry vs wet intervals and verify source values |

For each scene:

1. Identify one raw data field and point to its exact source/normalization path.
2. Explain how D3 maps that field to geometry/color/area/position/size; identify units and any scale limitations.
3. Implement the improvement without altering source values or inventing observations.
4. Demonstrate relevant user interaction (brush, scrub, pin, drag, layout toggle, etc.).
5. Verify live attribution/source URL, retrieval time, units, record count and response checksum where supported by the existing provenance UI.
6. Test desktop and phone-size layout; verify that an unavailable API shows an honest error rather than stale or synthetic data.
7. Ensure timers, subscriptions, listeners, simulations and Canvas effects are cleaned up appropriately on unmount.
8. Note what the animation shows and what it **does not** mean scientifically (e.g. aesthetic pulses are not seismic waves; forecast particle paths are not actual fluid simulation; historical population playback is not a real-time counter).

Maintain native framework semantics for DOM/Vue/React/Preact/Lit/Svelte/Solid/Qwik rather than replacing them with one generic framework. Avoid dependency upgrades unless needed to fix a reproducible fault.

## Phase C — Verification and evidence

Inspect the real `package.json` before running scripts. The instructor README documents the following intended workflow on macOS/Linux:

```bash
npm run sync
npm run audit:live
npm run build
npm test
npx playwright install chromium
# Keep npm run dev active in another terminal:
npm run test:browser
npm run build:public
```

- Run tests suited to the environment. Record exact commands, pass/fail/skip outcomes, error excerpts, and whether failures are caused by code vs unavailable provider/network/browser setup.
- Capture real after screenshots for each of the eight visualizations and at least one overview screenshot. Prefer browser screenshots via Playwright if available. Save under `submission/screenshots/after/`. Do not generate simulated screenshots.
- Collect before/after comparisons where baseline captures are available; report missing baselines honestly.
- Export `git diff` against the baseline revision as `submission/code-diffs/unit12-changes.diff` (if appropriate) and an easy-to-read `submission/CHANGES.md` listing filenames and exactly what changed. Be careful not to overwrite other user edits or unintentionally include generated/secret files.
- Record actual observation values with their retrieval date/time, source URL, units and selection/filters; if provider unavailable, leave a clear blank placeholder for the student's later manual observation.
- Produce `submission/VERIFICATION.md` showing each lab's status, visual change, investigation status, screenshots, API error test, mobile check, and remaining user actions.

## Phase D — Editable report and submission pack

Create an editable Word document at `submission/CPS5745_Unit12_Lab_Report.docx` **if DOCX authoring tooling is available**. If not available, create `submission/CPS5745_Unit12_Lab_Report.md` with complete content so the student can easily convert it to Word. Do not call a Markdown file a DOCX. Optionally export a PDF if supported, but the editable source is essential.

Use this report structure:

1. Cover: CPS 5745, Unit 12 Live Motion Labs, `STUDENT_NAME` placeholder, date, project GitHub URL and live site URL (clearly marked `PENDING` until verified).
2. Short overview, project source attribution, technical environment and ethical handling of live data.
3. **One full section per lab**, each including: framework, exact source URL/provider, access time with timezone, what a specific source field represents, D3 encoding/scale, implemented code change with paths, screenshot, investigation and real observed values, data-vs-animation explanation, mobile and failure testing, limitation and evidence reference.
4. A comparison/lessons-learned section about framework lifecycles and data visualization.
5. Test results and issues/limitations.
6. Appendix: commands to run, GitHub URL and public deployment URL when verified, file list, diff location and screenshot list.

Do not invent student-written reflections; mark sections for student review and keep a concise list of places where manual interpretation is essential. The reports should clearly indicate what the student personally verified and what was automatically tested.

Create `submission/README_SUBMISSION.md` with exact Canvas upload recommendations: source-code ZIP (excluding node_modules, .git, generated caches and secrets, but including required source/config/package lock), report PDF/DOCX, screenshots and diffs, links to personal GitHub repository and public site if deployed. The guide requests all eight apps, screenshots, source URLs/times, edited diffs, explanations, mobile and unavailable-source testing. It does not explicitly demand a Vercel URL or a DOCX report.

Provide a script or documented command to create `submission/CPS5745_Unit12_Submission.zip` **after** checking that it has necessary project files and no `node_modules`, `.git`, credentials, or oversized redundant artifacts. Keep README links or a launch guide within the ZIP.

## Phase E — Prepare deployment but do not deploy without permission

- Verify the existing Vercel configuration and `npm run build:public` command. Do not replace a functioning Vercel server function with static calls that would break CORS or API provenance.
- Explain how the user can create a separate GitHub repository, update the Git remote to their own repository, and publish without making changes to the instructor's remote. Do not push before permission.
- Document Vercel CLI steps in `submission/DEPLOYMENT_GUIDE.md`; note deployment may require `vercel login` and linking a project. Public deployment is optional unless the professor separately specifies otherwise.
- Confirm whether Vercel configuration/functions are packaged correctly for `/labs/1/` … `/labs/8/`. Avoid hardcoded localhost references in public builds.
- Explain how to verify live routes and live data after deployment. If not deployed, show `PENDING`, not a fabricated live URL.

## Completion standard / final response to user

After work, report:

- Which of the eight labs were edited, the concrete change made, and whether each is functioning.
- Which commands actually passed/failed and what remains unverified.
- The exact generated paths for website code, real screenshots, DOCX/Markdown/PDF report, source diff, README, ZIP and deployment guide; do not claim paths for files that do not exist.
- Step-by-step next user actions, especially inserting the correct author name, manually validating eight investigation results, creating their personal GitHub remote, optionally deploying to Vercel, and uploading the final submission.
- **STOP before Git push or Vercel deploy**, requesting the user's authorization for those external actions.

Work in a staged manner; perform as much local implementation and testing as feasible. Do not stop after drafting a plan, and do not claim completion without verifiable evidence.
