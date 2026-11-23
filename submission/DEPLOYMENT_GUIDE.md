# Optional publication

**Personal GitHub repository** PENDING  
**Student live site** PENDING

The instructor’s repository is the current origin. Keep it as your reference and add a separate personal remote only after you create your own empty repository. Consult your course policy before making your assignment public.

## GitHub

After approving publication, replace YOUR_ACCOUNT with your actual account and run the commands from the project root.

~~~sh
git remote -v
git remote add student https://github.com/YOUR_ACCOUNT/unit12-live-motion-labs.git
git remote -v
git status --short
~~~

Stage the reviewed source changes, including api/data/[key].js, scripts/live-response.mjs, shared/identity.js, and the synchronized copies in apps. Review git diff --cached. Commit on feature/unit12-custom-labs. From that branch, publish to your personal repository only after confirming the destination.

~~~sh
git push -u student HEAD:main
~~~

## Vercel

Local build validation uses npm run build:public. The public launcher uses relative app URLs. vercel.json serves public-site and routes /labs/:id to its index, with a Node function at api/data/[key].js. That handler imports the same allowlisted upstream request logic as local Vite. It returns source metadata and a SHA-256 checksum and controls caching on the API response.

After approving deployment and installing the Vercel CLI, sign in and link the student project. Confirm the linked account, team and project before deployment.

~~~sh
vercel login
vercel link
npm run build:public
vercel deploy --prod
~~~

Open the resulting URL and click all eight cards. Confirm each /labs/1/ through /labs/8/ page and its assets load. Check the provenance drawer for a provider URL, timestamp, units, values and checksum. Check that /assignment and /guide.pdf resolve and that the app’s back link returns to the published launcher. An upstream HTTP 502 should appear as a provider error in the UI. After those checks, add the verified personal URLs to the report and Canvas submission.
