---
name: staged-quality-review
description: Review only staged Git files for Basmat. Use when the user asks to review staged files, git diff --cached, a pre-commit pass, or staged-quality-review.
---

# Staged quality review

## Scope

1. Run `git diff --cached --name-only` and `git diff --cached`.
2. Review only staged files. Ignore unstaged and untracked files unless the user says otherwise.
3. If the staged diff is empty, say so and stop.

## Checks

Follow [00-project-core](../../rules/00-project-core.md). Look for real defects: bugs, security, logic, missing edge cases, extra files, invented API/Prisma/env, `any`/`unknown`, new `useEffect` when a sibling pattern exists, a second audience resolver, and Arabic/RTL drift.

## Output

Group findings by severity (blocker, warning, note) with path and line. Do not edit unless the user asks. Do not commit.
