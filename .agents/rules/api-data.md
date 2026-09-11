# API and data

## Route handlers

- Validate body/query with Zod before use
- Return stable error codes/messages consistent with siblings
- Keep secrets in server env only (`GROQ_API_KEY`, `GEMINI_API_KEY`, Redis, auth, storage)
- Prefer streaming plain text for chat; JSON for structured errors

## Core and infrastructure

- Controllers/routes stay thin
- Business rules live in use cases
- Repositories wrap Prisma; do not sprinkle raw queries across UI
- Shared wire shapes: Zod schemas and/or core DTOs

## Presentation data

- Pages compose hooks; prefer existing query helpers over ad-hoc fetch sprawl
- Client components that call `/api/*` should type responses with Zod or explicit interfaces

## Env

- Never commit keys
- Missing optional AI/provider keys must fail soft with user-safe fallbacks, not crash the whole app boot
