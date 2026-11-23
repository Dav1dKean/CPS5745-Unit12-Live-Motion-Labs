# CPS 5745 Unit 12 submission

**David Vasquez · November 22, 2026**

The instructor’s guide asks for all eight runnable apps, screenshots, source URLs and retrieval times, edited diffs, data-versus-animation explanations, and phone and unavailable-source checks. This pack supplies a source ZIP, a report, and supporting evidence. GitHub and Vercel publication are optional unless the instructor gives additional instructions.

## Canvas uploads

1. Upload [CPS5745_Unit12_Submission.zip](CPS5745_Unit12_Submission.zip) for all eight apps with the source, lockfile, starter-credit README, guide, and deployment files.
2. Upload [CPS5745_Unit12_Lab_Report.pdf](CPS5745_Unit12_Lab_Report.pdf). Use [CPS5745_Unit12_Lab_Report.docx](CPS5745_Unit12_Lab_Report.docx) if an editable report is requested or to add your own interpretations first.
3. Attach [CPS5745_Unit12_Evidence.zip](CPS5745_Unit12_Evidence.zip) for screenshots, provider observations, command logs, the verification matrix, and the comparison diff. Individual files are also available in [screenshots](screenshots/), [evidence](evidence/), and [code-diffs](code-diffs/).
4. Add your personal repository and deployment URLs if you publish and verify them. Both are **PENDING** while this work is local.

## Review before upload

Use the lab-specific review prompts in the report to confirm each interpretation yourself. The recorded figures and screenshots are from automated browser sessions, and fresh requests may return different results. [VERIFICATION.md](VERIFICATION.md) records any incomplete checks and the related retest steps.

## Run locally

From the extracted source ZIP, open the directory containing package.json. With Node.js 22.12 or higher and an internet connection, run:

~~~sh
npm ci
npm run dev
~~~

Visit http://127.0.0.1:5280 and open the eight cards. Stop the workbench with Ctrl+C or npm run stop. On Windows, use npm.cmd in PowerShell if script execution is restricted.

Regenerate both ZIP files from the project root with python3 submission/package-submission.py. The script validates paths, archive integrity, required content and file parity after creation.
