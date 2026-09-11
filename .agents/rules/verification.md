# Verification

- Run existing package commands from the repo root. Read package.json before selecting a script.
- Prefer the affected check over unrelated suites.
- Distinguish typecheck/lint, build, and browser checks.
- Follow ironbee-devtools-use for browser work. If the configured tools are unavailable, report that limitation, complete other checks, and do not substitute an unauthorized browser tool.
- Stop only processes you started unless the user explicitly asks otherwise.
