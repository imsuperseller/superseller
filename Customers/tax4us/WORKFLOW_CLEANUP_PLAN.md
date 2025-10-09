# Tax4Us n8n Cloud - Workflow Cleanup Plan

**Instance**: https://tax4usllc.app.n8n.cloud
**Date**: October 8, 2025
**Total Workflows**: 63 (5 active, 58 inactive)

---

## 🚨 Critical Finding

**58 inactive workflows** cluttering the instance - mostly duplicates created during debugging instead of editing existing workflows.

---

## ✅ Active Workflows (5) - KEEP ALL

| ID | Name | Status | Notes |
|----|------|--------|-------|
| zQIkACTYDgaehp6S | WF: Blog Master - AI Content Pipeline | ✅ KEEP | **Agent 1** - Working, needs optimization |
| GpFjZNtkwh1prsLT | ✨ Automate Multi-Platform Social Media | ✅ KEEP | **Agent 3** - Working, needs Tax4Us adaptation |
| UCsldaoDl1HINI3K | Tax4US Podcast Agent v2 - Fixed | ⚠️ EVALUATE | Only 9 nodes, missing ElevenLabs/Captivate/OpenAI - skeleton only |
| Qm1XXTzNmvcv0nFx | Sora Video Agent | ⚠️ EVALUATE | Tagged "rensto-internal" - not Tax4Us? |
| RTTpslpqpminO85b | Landing Page Intelligence | ⚠️ EVALUATE | Not Tax4Us related? |

### Recommendation for Active Workflows
- **Agent 1 & 3**: Keep active, optimize in place (no duplicates)
- **Podcast Agent v2**: Deactivate (incomplete, only 9 nodes) - build proper Agent 4 from scratch
- **Sora Video & Landing Page**: Verify with user if these belong to Tax4Us or should be moved to Rensto VPS

---

## ❌ Inactive Workflows (58) - DELETE ALL

### Category 1: WordPress Blog Duplicates (30 workflows)

**Pattern**: Someone kept creating new workflows instead of fixing the existing one

#### Subcategory 1a: "Ultra-Optimized v2 - Fixed" (9 duplicates)
| ID | Name | Created | Action |
|----|------|---------|--------|
| 2DTFrb4RSKhhwa4Z | Tax4US WordPress Posts Workflow (Ultra-Optimized v2 - Fixed) | 2025-09-05 | 🗑️ DELETE |
| 9I08ULbyYDpxlppj | Tax4US WordPress Posts Workflow (Ultra-Optimized v2 - Fixed) | 2025-09-05 | 🗑️ DELETE |
| WWvl85e4T3OSiIl0 | Tax4US WordPress Posts Workflow (Ultra-Optimized v2 - Fixed) | 2025-09-05 | 🗑️ DELETE |
| Xm9O0MW4huVjJDOd | Tax4US WordPress Posts Workflow (Ultra-Optimized v2 - Fixed) | 2025-09-05 | 🗑️ DELETE |
| YgBXH9nt7xSW3HuH | Tax4US WordPress Posts Workflow (Ultra-Optimized v2 - Fixed) | 2025-09-05 | 🗑️ DELETE |
| aQk5CwQIawtu8o7k | Tax4US WordPress Posts Workflow (Ultra-Optimized v2 - Fixed) | 2025-09-05 | 🗑️ DELETE |
| kr0EdpZwt64E0caf | Tax4US WordPress Posts Workflow (Ultra-Optimized v2 - Fixed) | 2025-09-05 | 🗑️ DELETE |
| oGscxpOIYAkiTSOC | Tax4US WordPress Posts Workflow (Ultra-Optimized v2 - Fixed) | 2025-09-05 | 🗑️ DELETE |
| xCJM7CD7hbnhuuVB | Tax4US WordPress Posts Workflow (Ultra-Optimized v2 - Fixed) | 2025-09-05 | 🗑️ DELETE |

#### Subcategory 1b: "COMPLETE FIXED" (4 duplicates)
| ID | Name | Created | Action |
|----|------|---------|--------|
| 0brnt1zd5KYj6nST | Tax4US WordPress Posts Workflow (COMPLETE FIXED) | 2025-09-05 | 🗑️ DELETE |
| DkAr1HI6zPdJ1jzq | Tax4US WordPress Posts Workflow (COMPLETE FIXED) | 2025-09-05 | 🗑️ DELETE |
| F86jCSeABgpurWDC | Tax4US WordPress Posts Workflow (COMPLETE FIXED) | 2025-09-05 | 🗑️ DELETE |
| mjdFbsnfCV2zjtMT | Tax4US WordPress Posts Workflow (COMPLETE FIXED) | 2025-09-05 | 🗑️ DELETE |

#### Subcategory 1c: "Fixed Trigger" variants (3 duplicates)
| ID | Name | Created | Action |
|----|------|---------|--------|
| 5dP4JI7eT2X0XOGb | Tax4US WordPress Posts Workflow (FIXED TRIGGER) | 2025-09-05 | 🗑️ DELETE |
| GP6oMT0hBiRAIx4F | Tax4US WordPress Posts Workflow (Fixed Trigger) | 2025-09-05 | 🗑️ DELETE |
| u818c5Es4oj2pqPN | Tax4US WordPress Posts Workflow (Fixed Trigger) | 2025-09-05 | 🗑️ DELETE |

#### Subcategory 1d: Other WordPress duplicates (14 workflows)
| ID | Name | Created | Action |
|----|------|---------|--------|
| 2aJ7k2a5Z85gWW6C | Tax4US WordPress Posts Workflow (FIXED COMPLETE) | 2025-09-05 | 🗑️ DELETE |
| 3WMEBib8JhPHVmZU | Tax4US WordPress Posts Workflow (Ultra-Optimized v2) | 2025-09-05 | 🗑️ DELETE |
| 8gbCdQpVPFVYFdR9 | Tax4US WordPress Posts Workflow (Fixed Trigger + Documentation) | 2025-09-05 | 🗑️ DELETE |
| 9sseyOJRrHSkGtwC | Tax4US WordPress Posts Workflow (Ultra-Optimized v2) | 2025-09-05 | 🗑️ DELETE |
| BmQvQlh6Jq8z8na6 | Tax4US WordPress Posts Workflow (Ultra-Optimized v3) | 2025-09-05 | 🗑️ DELETE |
| EbTDoxwbhcFxDPxq | Tax4US Complete Workflow Test (With Documentation) | 2025-09-05 | 🗑️ DELETE |
| UnJQr5JVn0NGmfnj | Tax4US WordPress Posts Workflow (Complete with Documentation) | 2025-09-05 | 🗑️ DELETE |
| hCGOQg6Qi7va1vJw | 3. Tax4US WordPress Posts Workflow (Optimized) | 2025-08-31 | 🗑️ DELETE |
| iXOdTHKK0q0CIfYa | Tax4US WordPress Posts Workflow (FINAL FIXED) | 2025-09-05 | 🗑️ DELETE |
| nRRBrxGwUc6zrMnb | 2. Tax4US WordPress Pages Workflow (Fixed) | 2025-08-31 | 🗑️ DELETE |
| rX0Fj602n3xS4Tg5 | Tax4US WordPress Posts Workflow (Ultra-Optimized) | 2025-09-05 | 🗑️ DELETE |
| tFDGTP0jHoCjuzw6 | Tax4US WordPress Posts Workflow (Fixed Trigger v2) | 2025-09-05 | 🗑️ DELETE |
| xZlaq0rfEaAIEs5b | Tax4US WordPress Posts Workflow (COMPLETE WITH DOCUMENTATION) | 2025-09-05 | 🗑️ DELETE |
| GWCeWStBcafV47pA | Tax4US Content Automation | 2025-09-02 | 🗑️ DELETE |

---

### Category 2: Test Workflows (6 workflows)

| ID | Name | Created | Action |
|----|------|---------|--------|
| Bvf2ypr1fh6mNc63 | Test Airtable Field Consistency | 2025-09-02 | 🗑️ DELETE |
| TVPzRQYytzICiKr6 | Test Airtable Trigger | 2025-09-05 | 🗑️ DELETE |
| aw5B5eNPpyaIT3mB | Test JavaScript Code Execution | 2025-09-05 | 🗑️ DELETE |
| SYuFHKeoyTOXg5kc | LinkedIn Org ID Test | 2025-09-12 | 🗑️ DELETE |
| hgi89eHnqb625BDA | LinkedIn Org ID Test - Quick | 2025-09-12 | 🗑️ DELETE |
| qL4H404kz7S0Y9jJ | Get LinkedIn Organization ID - Test | 2025-09-12 | 🗑️ DELETE |

---

### Category 3: Connectivity Tests (2 workflows)

| ID | Name | Created | Action |
|----|------|---------|--------|
| WAwGMk5EzIdknHOT | Complete HTTP Request Workflow - Validated and Tested | 2025-09-02 | 🗑️ DELETE |
| rzbeFUVdjMROkMDN | WP REST Connectivity | 2025-10-08 | 🗑️ DELETE |

---

### Category 4: Generic Test Workflows (2 workflows)

| ID | Name | Created | Action |
|----|------|---------|--------|
| dnyWFllSPSmS6ey2 | My workflow 2 | 2025-10-03 | 🗑️ DELETE |
| nPEDmq6LIfsOG5MN | My workflow | 2025-09-12 | 🗑️ DELETE |

---

### Category 5: n8n Template Library Workflows (18 workflows)

**These were imported from n8n's template library but never used for Tax4Us**

| ID | Name | Created | Action |
|----|------|---------|--------|
| 6AO35303nKagIhEn | Automate SEO-Optimized WordPress Posts with AI | 2025-09-01 | 🗑️ DELETE |
| CsuBFZXIwgAAooXn | Generate SEO Blog Content with GPT-4, Firecrawl & WordPress Auto-Publishing | 2025-09-01 | 🗑️ DELETE |
| D0brcqS0yHL5RSSF | 1. WF-ERR: Alarm & Triage | 2025-08-31 | 🗑️ DELETE |
| D5GygDOLPiYlop5R | Convert PDF Documents to AI Podcasts with Google Gemini and Text-to-Speech | 2025-09-01 | 🗑️ DELETE |
| D8AnthkbOJ07JT0A | Convert RSS Feeds into a Podcast with Google Gemini, Kokoro TTS, and FFmpeg | 2025-09-01 | 🗑️ DELETE |
| Glouz1nIJzgMY5Bm | Automate Content Generator for WordPress | 2025-09-01 | 🗑️ DELETE |
| Mc21yTSsT6bKqfME | Generate Podcast Transcript Summaries & Keywords with OpenAI and Gmail | 2025-09-01 | 🗑️ DELETE |
| Piq4yvFeziCRDU8e | Automate Blog Creation in Brand Voice with AI | 2025-09-01 | 🗑️ DELETE |
| QGIbe2zacJHHGfbg | Convert Newsletters into AI Podcasts with GPT-4o Mini and ElevenLabs | 2025-09-01 | 🗑️ DELETE |
| SBiLLa1GcewIf87U | Create new wordpress posts with a featured Image with Airtable | 2025-09-01 | 🗑️ DELETE |
| TpIYm1OWD9PyVZu8 | Generate Multiple Language Blogpost with OpenAI, Support Yoast & Polylang | 2025-09-01 | 🗑️ DELETE |
| WAXQUvMbYWW8s3e4 | 🚀Transform Podcasts into Viral TikTok Clips with Gemini+ Multi-Platform Posting✅ | 2025-09-01 | 🗑️ DELETE |
| dC8GGKCGU5sjFoJE | Generate AI Powered SEO-Optimized WordPress Content | 2025-09-01 | 🗑️ DELETE |
| p9P7xpnSaiUtqJcc | Auto-Tag Blog Posts in WordPress with AI | 2025-09-01 | 🗑️ DELETE |
| uKHB1oi3z86kSZkz | Create Multi-Speaker Podcasts with Google Sheets, ElevenLabs v3, and Drive | 2025-09-01 | 🗑️ DELETE |
| wAg6x1HaQcXfl78f | WordPress Blog & Posts Manager Agent v2 | 2025-09-01 | 🗑️ DELETE |
| xNUZXFvbp7kKI1El | Easy WordPress Content Creation from PDF Docs + Human in the Loop Gmail | 2025-09-01 | 🗑️ DELETE |
| zZMjPZ7ZKZ9BKs4l | Write a WordPress post with AI | 2025-09-01 | 🗑️ DELETE |

---

## Deletion Summary

| Category | Count | Action |
|----------|-------|--------|
| WordPress Blog Duplicates | 30 | DELETE ALL |
| Test Workflows | 6 | DELETE ALL |
| Connectivity Tests | 2 | DELETE ALL |
| Generic Test Workflows | 2 | DELETE ALL |
| n8n Template Library | 18 | DELETE ALL |
| **TOTAL TO DELETE** | **58** | **🗑️ DELETE ALL** |

---

## Execution Plan

### Step 1: Backup (CRITICAL)
Before deleting anything, export all 58 workflows to JSON files as backup.

```bash
# Create backup directory
mkdir -p /Users/shaifriedman/New\ Rensto/rensto/Customers/Tax4Us/workflow-backups/

# Export each workflow (Python script)
```

### Step 2: Delete in Batches
Delete workflows in batches of 10-15 to avoid API rate limits.

**Batch 1** (WordPress duplicates 1-15):
- IDs: 2DTFrb4RSKhhwa4Z, 9I08ULbyYDpxlppj, WWvl85e4T3OSiIl0, etc.

**Batch 2** (WordPress duplicates 16-30):
- IDs: 0brnt1zd5KYj6nST, DkAr1HI6zPdJ1jzq, F86jCSeABgpurWDC, etc.

**Batch 3** (Test workflows + connectivity):
- IDs: Bvf2ypr1fh6mNc63, TVPzRQYytzICiKr6, aw5B5eNPpyaIT3mB, etc.

**Batch 4** (n8n templates 1-18):
- IDs: 6AO35303nKagIhEn, CsuBFZXIwgAAooXn, D0brcqS0yHL5RSSF, etc.

### Step 3: Verify
After deletion, verify:
- Only 5 workflows remain (or 2-3 if we deactivate Sora/Landing Page/Podcast v2)
- All active workflows still function correctly

---

## Prevent Future Duplication

**Rules going forward**:
1. ✅ **NEVER create new workflows for fixes** - always edit existing workflows
2. ✅ Use workflow versioning in the name if testing major changes (e.g., "WF: Blog Master v2")
3. ✅ Deactivate old version before activating new version
4. ✅ Delete old version after new version validated (within 1 week)
5. ✅ Maximum 5 active workflows for Tax4Us (1 per agent + maybe 1 scheduler)

---

## Post-Cleanup State

**Target**: 2-3 active workflows
- ✅ WF: Blog Master - AI Content Pipeline (Agent 1)
- ✅ Automate Multi-Platform Social Media (Agent 3)
- 🆕 WF: WordPress Pages - ACF Content (Agent 2) - to be built
- 🆕 WF: Podcast Producer - Weekly Scheduler (Agent 4) - to be built
- 🆕 WF: Podcast Producer - Content Pipeline (Agent 4) - to be built

**Target Total**: 5 workflows (clean, organized, no duplicates)

---

## Next Actions

1. ⏭️ Create backup script to export all 58 workflows
2. ⏭️ Run backup script
3. ⏭️ Create deletion script (batch delete with confirmation)
4. ⏭️ Run deletion script
5. ⏭️ Verify cleanup successful
6. ⏭️ Update Boost.space Agent 1 note with cleanup status
7. ⏭️ Begin Agent 1 optimization (edit existing workflow, no duplicates)

---

**Created**: October 8, 2025
**Status**: Plan ready, awaiting execution approval
