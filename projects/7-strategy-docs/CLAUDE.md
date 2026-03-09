# Project 7: Strategy & Docs (Business Intelligence)

> **Role**: Master documentation, NotebookLM sync, product strategy, business intelligence.
> **Authority**: SOLE owner of root-level .md files — all other projects READ but never WRITE.

---

## File Ownership

### CAN edit (this project OWNS these files)
```
docs/**  (except docs/cross-project-requests/ which is shared)
brain.md
CLAUDE.md
ARCHITECTURE.md
METHODOLOGY.md
DECISIONS.md
findings.md
progress.md
PRODUCT_STATUS.md
REPO_MAP.md
VERCEL_PROJECT_MAP.md
CREDENTIAL_REFERENCE.md
PORT_REFERENCE.md
README.md
PROJECTS.md
```

### CANNOT edit (owned by other projects)
```
apps/**                           → Projects 1 & 2
fb marketplace lister/**          → Project 3 (Marketplace Bot)
platforms/marketplace/**          → Project 3 (Marketplace Bot)
infra/**                          → Project 4 (Infrastructure)
scripts/**                        → Project 4 (Infrastructure)
tools/**                          → Project 4 (Infrastructure)
.env*                             → Project 4 (Infrastructure)
shai friedman social/**           → Project 5 (Social & Content)
elite pro remodeling/**           → Project 6 (Customer Projects)
```

### CAN read (for reference — read everything to document accurately)
- All files in the monorepo

---

## Assigned Skills
- notebooklm-hub
- api-contracts

---

## Key Files
| Resource | Path |
|----------|------|
| Brain (North Star) | `brain.md` |
| Master CLAUDE.md | `CLAUDE.md` |
| Architecture | `ARCHITECTURE.md` |
| Methodology | `METHODOLOGY.md` |
| Decisions | `DECISIONS.md` |
| Findings | `findings.md` |
| Progress | `progress.md` |
| Product Status | `PRODUCT_STATUS.md` |
| Repo Map | `REPO_MAP.md` |
| Vercel Map | `VERCEL_PROJECT_MAP.md` |
| Credentials | `CREDENTIAL_REFERENCE.md` |
| Ports | `PORT_REFERENCE.md` |
| Business Index | `docs/BUSINESS_COVERAGE_INDEX.md` |
| Infra SSOT | `docs/INFRA_SSOT.md` |
| Product Bible | `docs/PRODUCT_BIBLE.md` |
| Data Dictionary | `docs/DATA_DICTIONARY.md` |
| Remotion Bible | `docs/REMOTION_BIBLE.md` |

---

## Cross-Project Rules

1. **Documentation authority**: This project is the SOLE authority for all root `.md` files and `docs/` directory.
2. **Update requests**: Other projects request doc updates via `docs/cross-project-requests/doc-update-*.md`.
3. **Read everything**: This project CAN read all files in the repo to document accurately.
4. **NotebookLM sync**: After documenting changes, push updates to relevant NotebookLM notebooks.
5. **Never modify code**: This project never modifies source code files (.ts, .js, .json configs, etc.).

---

## NotebookLM Notebook Map
| Notebook | ID | Purpose |
|----------|----|---------|
| BLAST | 5811a372 (needs recreation) | Agent behavior, methodology |
| VideoForge | 0baf5f36 | Video pipeline spec |
| Mivnim/Yossi | e109bcb2 | Winner Studio |
| Social Media & Lead Gen | cb99e6aa | FB Bot, SocialHub |
| Automation & Core Infra | fc048ba8 | Infrastructure |
| KIE.AI | 3e820274 | Model catalog |
| WAHA Pro | 0789acdb | WhatsApp |
| SuperSeller AI Website | 719854ee | Website content |
| Remotion | f67b6668 | Remotion compositions |
| Changelog | 12724368 | Change tracking |

---

## Documentation Standards
- **brain.md**: North Star, agent protocol, authority precedence
- **CLAUDE.md**: Technical router — architecture, stack, commands
- **findings.md**: Root causes, never-repeat lessons
- **progress.md**: What was done, where we are (updated end of every task)
- **DECISIONS.md**: User decisions as canonical truth
- **PRODUCT_STATUS.md**: Honest per-product status with feature matrices
