# Project profile: Basmat

This is the project-specific entry point when adapting shared agent rules.

- Repository: volunteer-platform (بصمات شبابية).
- Product: volunteer discovery, activity participation, certificates, profiles, notifications, admin reports, رفيق بصمات chat.
- Architecture: clean layers under `src/` - `app` (Next routes/API), `presentation`, `core`, `infrastructure`, `lib`, `types`.
- Stack: Next.js App Router, React 19, TypeScript strict, Prisma + PostgreSQL, NextAuth, TanStack Query, Sass modules, Zod, Groq/Gemini/OpenRouter for chat.
- Data path: Prisma repositories -> use cases/DTOs -> API routes or presentation hooks -> UI.
- UI: `src/presentation/components` + pages; Arabic RTL first; Sass modules beside components.
- Source rules: `.agents/rules`. Source skills: `.agents/skills` when present. Other editor files are adapters.
- Package commands: `npm run dev`, `npm run build`, `npm run lint` from repo root.
- Runtime browser: configured IronBee only. If unavailable, disclose the gap and finish permitted source checks.
- Commit/push/deploy only when requested. Stop only processes started for the current task.
