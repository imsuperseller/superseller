# n8n Advanced Skills - Draft Package

**Proposed additions to [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills)**

These skills fill critical gaps identified while building production n8n workflows. **Stack note:** Antigravity is primary automation; n8n is backup. Use these skills when working with n8n workflows. See brain.md and CLAUDE.md.

---

## New Skills Overview

### 1. n8n v2.x Compatibility Guide (NEW)
**File**: `skill-v2-compatibility/SKILL.md`

Critical for anyone running n8n 2.0+:
- Task Runners configuration (internal vs external mode)
- Environment variable access blocked by default
- ExecuteCommand/LocalFileTrigger disabled by default
- Python Code node changes (Pyodide removed)
- Binary data mode changes
- OAuth callback authentication
- Docker Compose templates for v2.x

**Triggers**: n8n 2.0, v2 changes, task runner, ExecuteCommand disabled, env access blocked

---

### 2. Async Polling & Long-Running Tasks
**File**: `skill-async-polling/SKILL.md`

Covers patterns the [original skills](https://github.com/czlonkowski/n8n-skills) don't address:
- Polling external APIs for task completion
- TaskId preservation across loop iterations (using `$("Node").first().json`)
- StaticData for execution-scoped state
- Robust status checking (handling `"success"` vs `4` vs `true`)
- Parsing nested/stringified JSON results

**Triggers**: polling, poll status, long-running, async task, wait for completion, taskId

---

### 3. AI Response Parsing
**File**: `skill-ai-response-parsing/SKILL.md`

Handles differences between AI providers:
- OpenAI: `choices[0].message.content`
- Gemini: `content[0].text` or `candidates[0].content.parts[0].text`
- Anthropic: `content[0].text`
- n8n AI nodes: `text` or `output`

Also covers:
- Extracting JSON from markdown code blocks
- Universal extractor pattern
- Schema validation for AI outputs

**Triggers**: AI response, parse AI, Gemini, OpenAI, Claude, JSON from AI

---

### 4. Workflow State Management
**File**: `skill-workflow-state/SKILL.md`

Deep dive into state persistence:
- Direct node references (`$("NodeName").first().json`)
- Why `$json` fails in loops
- Global vs node-scoped staticData
- Execution-scoped state to prevent cross-execution pollution
- Collecting data across loop iterations
- Memory leak prevention with cleanup patterns

**Triggers**: staticData, state management, persist data, cross-node data, loop state

---

### 5. Error Handling Patterns
**File**: `skill-error-handling/SKILL.md`

Production-grade error handling:
- `continueOnFail` for non-critical nodes
- `alwaysOutputData` for data propagation
- Error Trigger workflow pattern
- Try/catch in Code nodes
- Graceful degradation with fallbacks
- Retry patterns with exponential backoff
- Partial success handling

**Triggers**: error handling, continueOnFail, error trigger, graceful degradation

---

## Why These Skills Are Needed

These gaps were identified during development of a real estate video generation pipeline that:
- Submits multiple image-to-video tasks to Kie.ai
- Polls for completion with 5-minute timeouts
- Parses AI (Gemini) responses for room analysis
- Collects video URLs across 100+ polling iterations
- Sends notifications via email and WhatsApp (non-blocking)

**Issues encountered without these skills**:
1. `taskId is required` - TaskId lost in polling loops
2. `resultUrl undefined` - Nested JSON not parsed
3. `No JSON array found` - Wrong AI response format assumed
4. Workflow stops - Missing `alwaysOutputData` on DataTable nodes
5. Data pollution - Global staticData shared across concurrent executions

---

## Integration with Existing Skills

These skills complement the existing 7 skills:

| Existing Skill | New Skill | Relationship |
|----------------|-----------|--------------|
| n8n Code JavaScript | AI Response Parsing | Extends with provider-specific patterns |
| n8n Code JavaScript | Workflow State | Extends with staticData patterns |
| n8n Workflow Patterns | Async Polling | New pattern category |
| n8n Validation Expert | Error Handling | Runtime error patterns |

---

## File Structure

```
n8n-skills-drafts/
├── README.md (this file)
├── skill-v2-compatibility/
│   └── SKILL.md          (~450 lines)
├── skill-async-polling/
│   └── SKILL.md          (~400 lines)
├── skill-ai-response-parsing/
│   └── SKILL.md          (~350 lines)
├── skill-workflow-state/
│   └── SKILL.md          (~400 lines)
└── skill-error-handling/
    └── SKILL.md          (~380 lines)
```

**Total: 5 new skills, ~2000 lines of documentation**

---

## Contributing

To propose these skills to the main repo:

1. Fork [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills)
2. Copy skill folders to `skills/` directory
3. Add evaluations in `evaluations/` directory
4. Submit PR with real-world test cases

---

## License

MIT License - Same as parent project
