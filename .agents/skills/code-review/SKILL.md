---
name: code-review
description: Independent second-pass review of Basmat code changes. Use when the user asks for a code review, PR review, second pass, or code-review.
---

# Code review

Treat this as a second pass. Do not reuse the implementer's assumptions as facts.

## Scope

Prefer the user's named range. If they say staged, use `git diff --cached`. If they say the branch or a PR, review that diff. If they name files, review those files only.

## Checks

- Correctness and edge cases against existing DTOs, use cases, and sibling UI
- Security: auth/role gates, verified-email sends, secrets, extra data in responses
- Maintainability: duplication, layer leaks (presentation importing infra internals)
- Shared audience targeting stays on `AudienceTarget` + `findAudienceUsers`
- Verification evidence: what was typechecked, linted, or exercised in IronBee

## Output

Findings by severity with path and line, then a one-line residual risk. Do not apply fixes unless asked. Do not commit.
