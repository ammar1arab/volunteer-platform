# Agent skills and rules

Start with [project context](project.md) and the [rule index](rules/project-rules.md). Load only the matching skill.

| Skill | Use when |
| --- | --- |
| [staged-quality-review](skills/staged-quality-review/SKILL.md) | Review staged files, `git diff --cached`, or a pre-commit pass |
| [code-review](skills/code-review/SKILL.md) | Independent second-pass review of a change or PR |
| [truth-first-verify](skills/truth-first-verify/SKILL.md) | Debugging, "does this work", or unverified assumptions |

Canonical bodies: `.agents/skills/<name>/SKILL.md`. Cursor adapters: `.cursor/skills/<name>/SKILL.md`.

## Use with another agent or editor

The root AGENTS.md is the general entry point. `.cursor/rules`, `.cursor/skills`, and `.agent/rules/project.md` point at the same canonical source. When a host does not discover them, tell it to read AGENTS.md.

## Reuse in another project

Copy `.agents` and the entry/adaptor files. Update [project.md](project.md), then review domain rules and skills. Keep secrets and temporary permissions out of these files.
