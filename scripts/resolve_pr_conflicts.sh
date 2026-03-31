#!/usr/bin/env bash
set -euo pipefail

# Resolve common PR conflicts against origin/main for this repository.
# Usage:
#   ./scripts/resolve_pr_conflicts.sh

TARGET_REMOTE="${TARGET_REMOTE:-origin}"
TARGET_BRANCH="${TARGET_BRANCH:-main}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not in a git repository" >&2
  exit 1
fi

if ! git remote get-url "$TARGET_REMOTE" >/dev/null 2>&1; then
  echo "Remote '$TARGET_REMOTE' not configured. Set TARGET_REMOTE or add remote first." >&2
  exit 1
fi

echo "Fetching $TARGET_REMOTE/$TARGET_BRANCH..."
git fetch "$TARGET_REMOTE" "$TARGET_BRANCH"

echo "Rebasing current branch onto $TARGET_REMOTE/$TARGET_BRANCH..."
set +e
git rebase "$TARGET_REMOTE/$TARGET_BRANCH"
REBASERC=$?
set -e

if [ "$REBASERC" -ne 0 ]; then
  echo "Rebase paused due to conflicts. Applying deterministic resolutions..."

  # Prefer target branch versions for fast unblocking on high-churn generated/demo files.
  CONFLICT_FILES=(
    .gitignore
    BATTLE_TESTING.md
    scripts/execute_all.sh
    tests/battle_test.py
    webapp/app.js
    webapp/index.html
    webapp/styles.css
  )

  for f in "${CONFLICT_FILES[@]}"; do
    if git ls-files -u -- "$f" | grep -q .; then
      echo "Resolving $f with --theirs"
      git checkout --theirs -- "$f"
      git add "$f"
    fi
  done

  if git diff --name-only --diff-filter=U | grep -q .; then
    echo "Unresolved conflicts remain:" >&2
    git diff --name-only --diff-filter=U >&2
    echo "Resolve remaining files manually, then run: git rebase --continue" >&2
    exit 2
  fi

  git rebase --continue
fi

echo "Rebase complete. Run tests before pushing:"
echo "  python3 tests/battle_test.py"
echo "  ./scripts/execute_all.sh"
