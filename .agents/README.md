# Agent skills and rules

Start with [project context](project.md) and the [rule index](rules/project-rules.md).

## Use with another agent or editor

The root AGENTS.md is the general entry point. `.cursor/rules` and `.agent/rules/project.md` point at the same canonical source. When a host does not discover them, tell it to read AGENTS.md.

## Reuse in another project

Copy `.agents` and the entry/adaptor files. Update [project.md](project.md), then review domain rules for applicability. Keep secrets and temporary permissions out of these files.
