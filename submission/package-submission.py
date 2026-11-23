"""Build and verify the source and evidence ZIPs from the repository root."""
from pathlib import Path, PurePosixPath
import hashlib
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent.parent
SUBMISSION = ROOT / 'submission'
tracked = subprocess.check_output(
    ['git', 'ls-files', '-z'], cwd=ROOT
).decode().rstrip('\0').split('\0') if (ROOT / '.git').exists() else []

source = {name for name in tracked if name and not name.startswith('submission/')}
if not source:
    folders = ['api', 'apps', 'docs', 'evidence', 'output/pdf', 'scripts', 'shared', 'tests']
    for folder in folders:
        source.update(p.relative_to(ROOT).as_posix() for p in (ROOT / folder).rglob('*') if p.is_file())
    source.update(['.gitignore', '.prettierrc.json', 'README.md', 'package.json', 'package-lock.json',
                   'playwright.config.js', 'vercel.json', 'Start-All-Labs.cmd', 'Stop-All-Labs.cmd'])
source = {name for name in source if not name.startswith('evidence/v2/') and name != 'evidence/browser-results.json'}
source.update(['api/data/[key].js', 'scripts/live-response.mjs', 'shared/identity.js', 'guide.pdf'])
source.update(p.relative_to(ROOT).as_posix() for p in (ROOT / 'apps').glob('*/src/shared/identity.js'))
source.update('submission/' + name for name in [
    'README_SUBMISSION.md', 'DEPLOYMENT_GUIDE.md', 'CHANGES.md', 'VERIFICATION.md',
    'capture-evidence.mjs', 'package-submission.py',
])

excluded = {'node_modules', '.git', '.runtime', '.vercel', 'dist', 'public-site',
            'test-results', 'playwright-report', '__pycache__', '.DS_Store'}
def allowed(name):
    parts = PurePosixPath(name).parts
    return (not excluded.intersection(parts)
            and all(not p.startswith('.env') for p in parts)
            and not name.endswith(('.pem', '.key', '.p12', '.zip')))

source = {name for name in source if allowed(name)}
required = {'README.md', 'guide.pdf', 'package.json', 'package-lock.json', 'vercel.json',
            'api/data/[key].js', 'scripts/live-response.mjs', 'shared/identity.js',
            'output/pdf/Unit12_Corrected_Beginner_Guide.pdf', 'submission/README_SUBMISSION.md'}
for folder in ['01-vanilla', '02-vue', '03-react', '04-preact', '05-lit', '06-svelte', '07-solid', '08-qwik']:
    required.update('apps/' + folder + '/' + name for name in ['package.json', 'index.html', 'src/shared/identity.js'])
assert required <= source, required - source

evidence = {
    p.relative_to(ROOT).as_posix()
    for folder in ['screenshots', 'code-diffs', 'evidence']
    for p in (SUBMISSION / folder).rglob('*')
    if p.is_file() and allowed(p.relative_to(ROOT).as_posix())
}
evidence.update(['submission/CHANGES.md', 'submission/VERIFICATION.md'])
assert 'submission/evidence/observations.json' in evidence
assert 'submission/code-diffs/unit12-changes.diff' in evidence

def pack(filename, files):
    dest = SUBMISSION / filename
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED, compresslevel=7) as archive:
        for name in sorted(files):
            file = ROOT / name
            assert file.is_file() and not file.is_symlink(), name
            archive.write(file, name)
    with zipfile.ZipFile(dest) as archive:
        assert set(archive.namelist()) == files
        assert archive.testzip() is None
        assert all(archive.read(name) == (ROOT / name).read_bytes() for name in files)
    print(f'{filename} | {len(files)} files | {dest.stat().st_size:,} bytes')
    print('SHA-256 ' + hashlib.file_digest(dest.open('rb'), 'sha256').hexdigest())

pack('CPS5745_Unit12_Submission.zip', source)
pack('CPS5745_Unit12_Evidence.zip', evidence)
