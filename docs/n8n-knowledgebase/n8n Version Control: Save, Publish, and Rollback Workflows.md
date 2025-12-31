# n8n 2.0 Version Control: Save, Publish, and Rollback Workflows

A practical guide to using n8n's version control system for safer development, testing, and deployment of workflows.

---

## Overview

n8n 2.0 introduced enhanced version control with two distinct actions:

| Button | Function | Effect |
|--------|----------|--------|
| **Save** | Creates a snapshot of the current workflow state | Does NOT activate the workflow |
| **Publish** | Deploys a specific version to production | Makes the workflow live (24/7) |

These can be used independently, allowing you to:
- Save multiple development versions
- Publish only stable versions
- Quickly rollback when issues arise
- Maintain separate test and production states

---

## Key Concepts

### Save vs Publish

```
┌─────────────────────────────────────────────────────────────────┐
│ SAVE                                                             │
│ • Creates a snapshot/checkpoint                                  │
│ • Does NOT turn workflow on or off                              │
│ • Can save unlimited versions                                    │
│ • Used for development iterations                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PUBLISH                                                          │
│ • Deploys a specific version to production                      │
│ • Turns the workflow ON (live on internet, 24/7)                │
│ • Only ONE version can be published at a time                   │
│ • Used when ready for real traffic                               │
└─────────────────────────────────────────────────────────────────┘
```

### The Workflow History Panel

Access via the clock icon button in the workflow editor. Shows:
- All saved versions with timestamps
- Which version is currently published (tagged)
- Options to restore, publish, or clone any version

---

## Practical Workflow

### Development Pattern

1. **Build locally first** — Use chat nodes or manual triggers instead of webhooks
2. **Save frequently** — Create snapshots at each milestone
3. **Publish stable versions only** — Deploy when tested and working
4. **Rollback instantly** — Restore previous versions when issues arise

### Example Development Flow

```
[Initial Build] → Save as v0 → Publish v0
       ↓
[Add feature] → Save (not published)
       ↓
[Add tool call] → Save as v0.1 → Publish v0.1
       ↓
[Something breaks!] → Rollback to v0 (republish)
       ↓
[Fix and iterate] → Clone v0.1 to new workflow → Test in isolation
       ↓
[Fixes complete] → Copy JSON back → Save as v1 → Publish v1
```

---

## Step-by-Step Operations

### Saving a Version

1. Make changes to your workflow
2. Click **Save** button
3. Optionally add a description/version name
4. Snapshot is stored in workflow history

**Best Practice**: Include meaningful descriptions:
- `v0 - Testing workflow using chat nodes`
- `v0.1 - Added HTTP tool call`
- `v1.0 - Production ready with Supabase`

### Publishing a Version

1. Click **Publish** button
2. Add version name and description
3. Workflow becomes live immediately
4. Webhook production URLs become active

**Note**: Publishing creates BOTH a save snapshot AND activates the workflow.

### Viewing Version History

1. Click the clock icon (workflow history button)
2. View all saved versions in chronological order
3. Published version is tagged/highlighted
4. Each entry shows timestamp and description

### Rolling Back to a Previous Version

**When something breaks:**

1. Open workflow history panel
2. Find the last known working version
3. Click the action menu (three dots)
4. Select **Publish this version**
5. Confirm the rollback

The workflow immediately reverts to the selected version in production.

### Unpublishing a Workflow

1. Open workflow history panel
2. Click action menu on the published version
3. Select **Unpublish**
4. No version is live (workflow stops receiving traffic)

### Cloning a Version to New Workflow

**Useful for isolated testing:**

1. Open workflow history panel
2. Find the version you want to branch
3. Click action menu → **Clone to new workflow**
4. Name the new workflow (e.g., "AI Agent - Tool Call Testing")
5. Iterate freely without affecting the original

**To merge changes back:**
1. Copy the JSON from the test workflow
2. Return to the original workflow
3. Paste the JSON to overlay
4. Save as new version
5. Test and publish when ready

---

## Use Case: Test vs Production Databases

A common pattern is using lightweight databases during development, then switching to production-ready databases for deployment.

### Development Phase (Google Sheets)

```
[Chat Trigger] → [Google Sheets: Get Data] → [AI Agent] → [Google Sheets: Log Result]
```

**Benefits:**
- Fast to set up
- Easy to modify columns on the fly
- Visual inspection of data
- No schema planning required

**Save as**: `v1.0 - Testing with Google Sheets database`

### Production Phase (Supabase)

```
[Webhook Trigger] → [Supabase: Get Data] → [AI Agent] → [Supabase: Log Result]
```

**Benefits:**
- Scalable and reliable
- Proper relational database
- Row-level security
- API access for portals

**Save as**: `v2.0 - Production with Supabase database`

### Version History Result

| Version | Description | Status |
|---------|-------------|--------|
| v1.0 | Testing with Google Sheets | Saved |
| v1.1 | Added logging columns | Saved |
| v2.0 | Production with Supabase | **Published** |

You can always rollback to v1.x for debugging or testing new features with the simpler database setup.

---

## Local Testing Strategy

### Problem with Direct Webhook Testing

Testing directly with webhooks requires:
- Sending real API calls
- Waiting for external triggers
- Potentially polluting production data
- Complex setup for each test

### Solution: Local Trigger Nodes

Replace webhooks with local triggers during development:

| Instead of... | Use... |
|---------------|--------|
| Webhook node | Chat node |
| Form trigger | Manual trigger + Edit Fields |
| External API trigger | Manual trigger with test payload |

### Example: AI Agent Development

**Production workflow:**
```
[Webhook] → [AI Agent] → [Respond to Webhook]
```

**Development workflow:**
```
[Chat Node] → [AI Agent] → [Set Fields (emulate response)]
```

**Benefits:**
- Test instantly without external calls
- Iterate rapidly on prompts and logic
- No need for Postman or external tools
- Same core logic, different trigger

### Workflow Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ TESTING TRIGGERS (use during development)                        │
│ ┌──────────────┐  ┌──────────────┐                              │
│ │ Chat Node    │  │ Manual       │                              │
│ │              │  │ Trigger      │                              │
│ └──────┬───────┘  └──────┬───────┘                              │
│        └────────┬────────┘                                       │
└─────────────────┼───────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CORE WORKFLOW (same for test and production)                     │
│ [Edit Fields] → [AI Agent] → [Code Node] → [Output]             │
└─────────────────────────────────────────────────────────────────┘
                  ↑
┌─────────────────┼───────────────────────────────────────────────┐
│ PRODUCTION TRIGGERS (use when publishing)                        │
│        ┌────────┴────────┐                                       │
│ ┌──────┴───────┐  ┌──────┴───────┐                              │
│ │ Webhook      │  │ Respond to   │                              │
│ │ Inbound      │  │ Webhook      │                              │
│ └──────────────┘  └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Version Naming Conventions

### Semantic Versioning (Recommended)

| Version | Meaning |
|---------|---------|
| v0.x | Testing/development |
| v1.0 | First production release |
| v1.1 | Minor improvements |
| v2.0 | Major changes (new database, architecture) |

### Descriptive Tags

Include what changed in the description:
- `v0.1 - Added HTTP tool call`
- `v0.2 - Fixed response parsing`
- `v1.0 - Production ready, Supabase integration`
- `v1.1 - Added error logging`

### Example Version History

```
v2.0 - Production with rate limiting          [PUBLISHED]
v1.2 - Added user validation
v1.1 - Switched to Supabase
v1.0 - First stable release
v0.3 - Fixed agent prompt
v0.2 - Added HTTP tool call
v0.1 - Initial testing with chat node
```

---

## Account Limitations

### Free Account
- **1 day** of version history
- Limited ability to leverage full version control
- Workaround: Clone important versions to separate workflows

### Paid Accounts
- Extended version history (check your plan)
- Full rollback capabilities
- Better suited for production workflows

### Workaround for Limited History

If you have limited version history:
1. Clone milestone versions to separate workflows
2. Name them clearly: `Project X - v1.0 Backup`
3. Keep them inactive (don't publish)
4. Use as reference or restore points

---

## Best Practices

### Development Workflow

1. **Start with local triggers** — Chat nodes, manual triggers
2. **Save early, save often** — Create snapshots at each milestone
3. **Use test databases first** — Google Sheets, Airtable for rapid iteration
4. **Don't one-shot production** — Build incrementally, test each piece

### Version Management

1. **Meaningful descriptions** — Document what changed in each version
2. **Publish conservatively** — Only deploy tested, stable versions
3. **Keep rollback options** — Don't delete working versions
4. **Clone for experiments** — Test risky changes in isolated workflows

### Production Safety

1. **Test before publishing** — Run through all scenarios locally
2. **Monitor after publishing** — Watch for errors in first hours
3. **Know your rollback** — Identify which version to restore if needed
4. **Document breaking changes** — Note what might affect dependent systems

---

## Quick Reference

### Keyboard Shortcuts / Actions

| Action | How |
|--------|-----|
| Save snapshot | Click **Save** button |
| Publish workflow | Click **Publish** button |
| View history | Click clock icon |
| Rollback | History → Version → Publish |
| Clone version | History → Version → Clone |
| Unpublish | History → Published version → Unpublish |

### Mental Model

```
SAVE = Checkpoint (for you)
PUBLISH = Deploy (for users)

You can SAVE without PUBLISHING
You can PUBLISH any SAVED version
You can ROLLBACK by PUBLISHING an older version
```

---

## Summary

n8n 2.0's version control enables professional development workflows:

1. **Iterate safely** — Save snapshots without affecting production
2. **Deploy confidently** — Publish only tested versions
3. **Recover quickly** — Rollback to working versions instantly
4. **Test in isolation** — Clone versions for experimental work

The key insight: **Don't try to one-shot production workflows.** Build incrementally, test locally, save frequently, and publish only when stable. Version control makes this workflow natural and safe.