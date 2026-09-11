# Durable project decisions

- Chat assistant brand: رفيق بصمات. API under `src/app/api/chat`. UI: `src/presentation/components/volunteer/Chatbot`.
- Provider failover order and health live in `chatRuntime.ts`. Keep answers Arabic-first and never leak provider thinking tags.
- Prefer Zod for request/storage parsing. Prefer named domain/DTO types over loose object maps.
- Do not store secrets, credentials, or one-off authorizations in this file.
