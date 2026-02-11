# Claude Skills – Rensto Project

Agent skills for Cursor/Claude Code. These complement `n8n-skills-drafts/` and `directives/`.

## Skills

| Skill | Purpose | Use With |
|-------|---------|----------|
| **n8n-tax4us-agent** | Tax4Us customer workflows: content pipelines, WordPress, Slack | Tax4Us n8n cloud instance |
| **n8n-typescript-patterns** | n8n Code node standards, anti-patterns, optimizations | Custom n8n nodes |
| **n8n-workflow-generator** | Generate workflow JSON from natural language | Workflow creation, templates |

## Relationship to n8n-skills-drafts

- **n8n-skills-drafts/** = Runtime patterns (async polling, error handling, state, AI parsing, v2 compatibility)
- **.claude/skills/** = Domain-specific (Tax4Us) + code-quality (TypeScript) + generation (workflow JSON)

Use both for full n8n coverage. See `brain.md` and `directives/n8n_governance.md` for Antigravity vs n8n.
