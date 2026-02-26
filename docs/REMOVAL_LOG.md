# 📔 REMOVAL LOG & HISTORICAL LESSONS (The "Why")

> **Purpose**: Record of every system, doc, and idea that was discarded.  
> **Rule**: DO NOT resurrect anything in this log without consulting this document first.

---

## 🏗️ 1. Infrastructure & Backend Pivots

### 🛑 Firestore (Deprecated Feb 2026)
*   **Reason**: Limited relational querying made SaaS reporting (usage, multi-tenant billing) extremely fragile. No native support for complex aggregations needed for the "Self-Serving SaaS" model.
*   **Replacement**: **PostgreSQL** via Prisma.
*   **Wasted Time**: 3 months of maintaining dual sync logic.
*   **How we dealt with it**: Built a 5-phase migration script that synced collections to tables while keeping standard lookups active.
*   **Lesson**: Start with a relational DB for any project requiring multi-tenant billing.

### 🛑 storage.realtor-video.com "Hallucination Trap"
*   **Failure**: Previous agents repeatedly generated broken URLs using this domain, which didn't exist or was misconfigured.
*   **Wasted Time**: Dozens of failed video runs.
*   **How we dealt with it**: Purged all references to the domain and locked the `R2_PUBLIC_URL` into the `PIPELINE_SPEC`.
*   **Lesson**: Never trust an AI-generated URL for asset storage; use the fixed R2 Environment Variable.


### 🛑 Webflow Scripts (Retired Feb 2026)
*   **Reason**: Hosting complex SaaS logic on Webflow was a "duct-tape" solution. Custom JS injections became unmanageable for deep agent integrations.
*   **Replacement**: **Next.js (superseller-site)**.
*   **Wasted Time**: $2k+ in subscription/dev time for a site that ultimately limited programmatic freedom.
*   **Lesson**: Portfolios look great on Webflow; SaaS products belong on Next.js.

---

## 🤖 2. Automation & Workflow Pivots

### 🛑 n8n Video Processing (Retired Feb 2026)
*   **Reason**: n8n is excellent for *prototyping* but fails as a *production engine* for high-throughput video generation. Lack of native unit testing and poor version control for complex branching logic.
*   **Replacement**: **apps/worker (Node.js/BullMQ)**.
*   **Wasted Time**: Countless hours spent debugging OOM (Out of Memory) errors in Docker containers during bulk video runs.
*   **FFMPEG Failure**: ffmpeg transitions in n8n nodes were often visible/buggy (flickering between scenes).
*   **How we dealt with it**: Extractedffmpeg logic into a dedicated programmatic worker using `fluent-ffmpeg` and implemented crossfade filters directly in code.
*   **Lesson**: If it takes more than 10 nodes or requires high reliability, move it to a Worker.


### 🛑 BMAD Strategy (Retired Feb 2026)
*   **Reason**: The "Beginner Mode" automation strategy was too manual. The "Antigravity" programmatic approach is the only way to scale a high-volume SaaS.
*   **Lesson**: Do not build tools for "Ease of Setup" at the cost of "Ease of Scale".

---

## 🎨 3. Product & Design Pivots

### 🛑 Care Plan Model (Moved to Credits/SaaS)
*   **Reason**: Selling "Time/Maintenance" (Care Plans) is a service business. Selling "Results/Credits" (Autonomous Agents) is a SaaS business. We are a SaaS.
*   **Lesson**: Align the billing model with the automation outcome, not the humans labor.

---

## 📂 4. Doc Clean-Up Registry

| Document | Status | Destination of Logic |
| :--- | :--- | :--- |
| `ENV_VARS.md` | Deleted | `INFRA_SSOT.md` |
| `SYSTEMS_INVENTORY.md` | Deleted | `INFRA_SSOT.md` |
| `PRODUCT_MAP.md` | Deleted | `PRODUCT_BIBLE.md` |
| `directives/*.md` | Archived | `infra/archive/docs/n8n-directives/` |
| `FIRESTORE_*.md` | Archived | `infra/archive/docs/firestore/` |
