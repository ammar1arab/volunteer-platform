# Efficient work

- Read AGENTS.md, the matching rules, and at most the skills needed for the task. Do not load the complete catalog into context.
- Start searches with a relevant path. Batch independent reads; serialize edits and dependent operations.
- Inspect the working diff before edits. Preserve unrelated work. Stop and investigate unexpected concurrent changes to a target instead of overwriting them.
- Continue authorized work. Ask only for a material missing requirement or an unapproved consequential action.
- Validate the behavior affected by the change. Do not equate a source check with a full runtime pass.
- Report cause, result, verification, and material limitations. Never claim a write succeeded before checking its postcondition.
- No automatic commits, pushes, deploys, or outbound messages merely because a rule suggests them. Follow the user's request and the current host's capabilities.
- Permanent memory is versioned project guidance. Never save credentials or one-time destructive authorization there.
