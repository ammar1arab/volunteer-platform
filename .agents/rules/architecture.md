# Architecture

## Repo map

```
src/app/                 Next.js routes, layouts, API route handlers
src/presentation/        Pages, components, hooks, query helpers, constants
src/core/                Domain entities, enums, DTOs, mappers, use cases
src/infrastructure/      Prisma, external providers, persistence
src/lib/                 Shared pure helpers and cross-cutting utilities
src/types/               Shared TS helpers when not domain DTOs
.agents/rules/           Agent rules
AGENTS.md                Agent entry overview
```

## Placement

- New screen UI -> `presentation/pages` or `presentation/components`, then wire from `app/.../page.tsx`
- Business rules -> `core/application/useCases` (+ DTOs/mappers as needed)
- Persistence / vendors -> `infrastructure`
- Thin API handlers in `app/api/**/route.ts` - validate input, call use cases or focused runtime modules, return responses
- Do not invent top-level `src/` folders without need

## Naming

- Match sibling file naming in the touched folder (PascalCase components, `*.logic.ts` where that pattern exists)
- Named exports for shared helpers; Next `page.tsx` / route handlers follow existing defaults

## Imports

- Use `@/` path aliases
- Presentation may use core DTOs/enums; it must not import infrastructure internals that siblings avoid
- API routes may use core + infrastructure; keep provider-specific chat runtime next to the route when it is route-local

## Shared audience targeting

Admin notifications and bulk emails resolve recipients through `AudienceTarget` and `findAudienceUsers`. Do not add a second audience resolver.
