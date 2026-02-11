---
description: General verification loop for any task (RALPH methodology)
---

# RALPH-Style Verification Loop

Based on Anthropic's RALPH technique for preventing premature task completion.

## Core Principle
> Never output "Done" until verification passes. If verification fails, loop again.

## The Loop
```
1. Execute task
2. Verify result
3. If errors found → fix → go to step 2
4. If no errors AND 2+ loops completed → declare complete
```

## Verification Types

### Code Changes
- [ ] Lint/type check passes
- [ ] Related tests pass
- [ ] No new errors introduced

### API Updates (n8n, Kie.ai, etc.)
- [ ] Response code is success
- [ ] Response body has no error messages
- [ ] Test execution succeeds

### UI/Visual Changes
- [ ] Screenshot reviewed (not skipped)
- [ ] No obvious layout issues
- [ ] Interactive elements work

## Anti-Patterns to Avoid
1. ❌ Declaring success after one attempt
2. ❌ Assuming update worked without checking response
3. ❌ Ignoring error messages in success responses
4. ❌ Skipping verification "because it should work"

## When to Use This
- Complex multi-step tasks
- External API integrations
- Any task that failed once already
