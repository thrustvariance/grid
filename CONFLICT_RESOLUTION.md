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
3. Resolves `webapp/*`, `tests/battle_test.py`, `scripts/execute_all.sh`, and `BATTLE_TESTING.md` with **ours** (the tested branch versions).
4. Resolves `.gitignore` by combining both sides without duplicates.
5. Continues rebase when safe.

## If using GitHub web conflict editor manually
For these files, click **Accept current change**:
- `BATTLE_TESTING.md`
- `scripts/execute_all.sh`
- `tests/battle_test.py`
- `webapp/app.js`
- `webapp/index.html`
- `webapp/styles.css`

For `.gitignore`, click **Accept both changes**, then delete conflict markers and keep unique lines.

## Validate after conflict resolution

```bash
python3 tests/battle_test.py
./scripts/execute_all.sh
```
