# Basmat core

## Identity

**بصمات شبابية** (`volunteer-platform`) connects volunteers in Jordan with in-person and remote activities, profiles, hours tracking, certificates, and admin operations.

Stack, commands, and layer map live in [project.md](../project.md).

## Absolute constraints

- Prefer **no `any` and no `unknown`**. Parse with Zod, an existing named contract, or a named DTO/Prisma/discriminated type. For `catch`, narrow with `instanceof` / typed helpers immediately.
- Prefer **no new `useEffect`** when a handler, query hook, or existing sibling pattern fits.
- Prefer **no code comments** unless naming cannot make the logic clear.
- Never use the em dash character. Use a normal hyphen `-`.
- Commit, push, or open PRs only when the user explicitly asks.
- Do not invent API routes, Prisma fields, or env keys. Extend existing modules; ask if the contract is unclear.
- Minimal diffs. Do not refactor unrelated code.

## Code shape

- Fewer files and fewer lines. DRY.
- Reuse presentation components, hooks, core use cases, and infrastructure providers before adding abstractions.
- Search before creating a util.
- Keep Arabic copy and RTL behavior consistent with siblings.

## Workflow

1. Read the task and matching rules.
2. Check existing layers (route, use case, repository, UI).
3. Confirm contracts exist (or plan the minimal Zod/DTO/Prisma change).
4. Flag unclear business rules before coding.
5. Implement small diffs.
6. Verify on the running app (IronBee browser for UI).
7. Git only when asked.
