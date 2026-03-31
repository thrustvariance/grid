# PR Conflict Resolution Playbook

If GitHub shows conflicts on this branch, run the following locally:

```bash
# 1) Add remote if needed
# git remote add origin <repo-url>

# 2) Fetch latest target branch
git fetch origin

# 3) Rebase current work branch onto target branch
git checkout work
git rebase origin/main
```

If conflicts appear in these files:
- `.gitignore`
- `BATTLE_TESTING.md`
- `scripts/execute_all.sh`
- `tests/battle_test.py`
- `webapp/app.js`
- `webapp/index.html`
- `webapp/styles.css`

Use the branch version for the generated/demo assets:

```bash
git checkout --ours BATTLE_TESTING.md scripts/execute_all.sh tests/battle_test.py webapp/app.js webapp/index.html webapp/styles.css
```

For `.gitignore`, keep both sides where possible and ensure these entries exist:

```gitignore
artifacts/*.png
artifacts/*.jpg
artifacts/*.jpeg
artifacts/*.webp
artifacts/*.pdf
artifacts/*.html
artifacts/*.txt
!artifacts/README.md
build/
dist/
*.spec
```

Then continue:

```bash
git add .
git rebase --continue
```

Run validation:

```bash
python3 tests/battle_test.py
./scripts/execute_all.sh
```
