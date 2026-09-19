# Canonical rule index

Always: [project profile](../project.md), [core](00-project-core.md), [efficiency](agent-efficiency.md).

Load only what the task touches:

- [Architecture](architecture.md) when changing `src/`
- [API contracts](api-data.md) when changing routes, DTOs, or repositories
- [Verification](verification.md) when implementing or checking runtime behavior
- [IronBee](ironbee-devtools-use.md) via `.cursor/rules/ironbee-devtools-use.mdc`
- [Portable instructions](portable-guidance.md) when editing `.agents` or `.cursor`
- Skills: read [the catalog](../README.md), then only the matching skill

Cursor files under `.cursor/rules` and `.cursor/skills` are discovery adapters.
