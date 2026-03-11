# Project 6: Customer Projects (Client Sites)

> **Role**: Individual customer sites, proposals, landing pages.
> **Isolation**: Each customer directory is 100% standalone — zero imports from main codebase.

---

## File Ownership

### CAN edit (this project OWNS these files)
```
elite pro remodeling/**
rensto - online directory/**
ac-&-c-llc-hvac/**
kedem developments/**
ortal pilates/**
wonder.care/**
yoram-friedman-insurance/**
(any other customer-specific directories, excluding tax4us)
```

### CANNOT edit (owned by other projects)
```
apps/**                           → Projects 1 & 2
fb marketplace lister/**          → Project 3 (Marketplace Bot)
platforms/marketplace/**          → Project 3 (Marketplace Bot)
infra/**                          → Project 4 (Infrastructure)
scripts/**                        → Project 4 (Infrastructure)
.env*                             → Project 4 (Infrastructure)
shai friedman social/**           → Project 5 (Social & Content)
docs/**                           → Project 7 (Strategy & Docs)
brain.md, CLAUDE.md, *.md (root)  → Project 7 (Strategy & Docs)
```

### CAN read (for reference, but never modify)
- All root `.md` files for context
- `apps/web/superseller-site/` — for pattern reference when building customer sites

---

## Assigned Skills
- agentforge

---

## Known Customer Projects

### AC&C HVAC
- **Path**: `ac-&-c-llc-hvac/`
- **Main site**: Vite+React at `dist-chi-three-91.vercel.app`
- **Dashboard**: Static HTML at `dist-dashboard-eight.vercel.app`

### Elite Pro Remodeling
- **Path**: `elite pro remodeling/`
- **Type**: Customer-specific site/content

### Rensto Online Directory
- **Path**: `~/rensto - online directory/` (SEPARATE repo, NOT inside SuperSeller)
- **Type**: Separate business — contractor directory. Rensto contractors = SuperSeller prospects.

---

## Cross-Project Rules

1. **Complete isolation**: Customer directories have ZERO dependencies on the main codebase. Do not create imports.
2. **Content extraction rule**: NEVER invent content for customer-facing pages. Always extract from existing strategy docs.
3. **Root docs**: To update root `.md` files, create a request for Project 7.
4. **Deployment**: Customer sites typically deploy to Vercel independently. For infra needs, coordinate with Project 4.

---

## Content Rules (CRITICAL)
- Search for customer docs (strategy files in separate repos)
- READ every doc fully — not skim
- Extract verbatim — copy from docs, don't paraphrase or fabricate
- If content doesn't exist in docs, LEAVE IT EMPTY
- If docs say "we don't have this yet" → OMIT the section
- Cite source in seed scripts (which doc, which section)
