---
name: truth-first-verify
description: Separate verified facts from guesses before changing Basmat code. Use when debugging, when the user asks if something works, when targeting or email recipients look wrong, or when they name truth-first-verify.
---

# Truth-first verify

## Before editing

Label each claim as **verified**, **unknown**, or **assumption**.

Verified means you observed it in the repo, a command, a response, or IronBee. Unknown stays unknown. Do not implement a fix for an unverified cause.

## Evidence

- Read the matching route, use case, and resolver (for audience work: `findAudienceUsers`).
- Prefer the affected check (`npx tsc --noEmit`, lint, or IronBee) over a full suite.
- If IronBee is unavailable or unauthenticated, say that. Do not use another browser tool.

## Output

State what is verified, what is still unknown, and the next smallest check. Edit only after the cause is verified, or if the user explicitly wants a change anyway.
