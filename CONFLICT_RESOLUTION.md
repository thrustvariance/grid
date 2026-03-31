# PR Conflict Resolution Playbook

## Why GitHub still shows conflicts
`.gitattributes` merge rules only help when they are already present in the merge base.
If the PR was opened before those rules existed, GitHub can still report the same conflict set.

## One-command fix (recommended)

```bash
./scripts/resolve_pr_conflicts.sh
```

This script:
1. Fetches `origin/main`.
2. Rebases your current branch onto `origin/main`.
3. If conflicts occur in the known high-churn files, auto-resolves them with `--theirs` to unblock merge.
4. Continues rebase when safe.

## Manual fallback

```bash
git fetch origin
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

Use target branch versions for quickest unblock:

```bash
git checkout --theirs .gitignore BATTLE_TESTING.md scripts/execute_all.sh tests/battle_test.py webapp/app.js webapp/index.html webapp/styles.css
git add .
git rebase --continue
```

## Validate after conflict resolution

```bash
python3 tests/battle_test.py
./scripts/execute_all.sh
```
