# Route Inventory — Full Detail

## Web Routes (Next.js App Router)

### Authentication
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/auth/magic-link/send` | POST | Rate-limited | `{ email: string, redirectTo?: string }` | `{ success: true }` or `{ error: string }` |
| `/api/auth/magic-link/verify` | GET | Token | `?token=string` | Redirect to dashboard + Set-Cookie |
| `/api/auth/logout` | POST | Session | None | `{ success: true }` |

### Billing
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/billing/status` | GET | Session | None | `{ billing: { currentPeriod, invoices[], usageBreakdown, paymentMethod } }` |
| `/api/video/subscribe` | POST | Session | `{ plan: 'starter' \| 'pro' \| 'team' }` | `{ url: string }` (PayPal checkout URL) |
| `/api/checkout` | POST | Rate-limited | `{ flowType, productId, tier?, customerEmail, metadata? }` | `{ url: string }` |
| `/api/webhooks/paypal` | POST | PayPal sig | Raw body (PayPal event) | `{ received: true }` |

### Video Pipeline
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/video/jobs` | GET | Session | None | `{ jobs: Job[] }` |
| `/api/video/jobs` | POST | Session | `{ listingId: string, userId: string, model?: string }` | `{ job: Job }` |
| `/api/video/jobs/from-zillow` | POST | Session+Credits | `{ addressOrUrl, userId, floorplanBase64?, realtorBase64?, ... }` | `{ job: Job, listing: Listing }` |
| `/api/video/jobs/[id]` | GET | Session | Path: id | `{ job, clips, listing }` or `{ job, _fallback: true }` |
| `/api/video/jobs/[id]/regenerate` | POST | Session+Credits | `{ clipNumbers: number[] }` | `{ success, master_video_url, creditsDeducted }` |
| `/api/video/credits` | GET | Session | None | `{ balance: number }` |
| `/api/video/usage` | GET | Session | None | `{ events: UsageEvent[] }` |

### Marketplace
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/marketplace/templates` | GET | Public | `?category=&search=&sort=&page=&limit=&tag=&includeDrafts=&includeInternal=` | `{ templates: Template[], pagination: { total, page, pageSize, totalPages } }` |
| `/api/marketplace/[id]` | GET | Public | Path: id | `{ workflow: { id, name, price, features, integrations, rating, ... } }` |
| `/api/marketplace/downloads` | POST | Internal | `{ templateId, email, secret? }` | `{ downloadUrl, token, expiresIn: '72 hours' }` |
| `/api/marketplace/download/[token]` | GET | Token | Path: token | Binary JSON file with Content-Disposition |
| `/api/marketplace/customize` | POST | Rate-limited | `{ workflowId, parameters: {}, customerEmail? }` | `{ requestId: string }` |

### Admin — Clients & Projects
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/admin/clients` | GET | Admin | None | `{ clients: User[] }` |
| `/api/admin/clients` | POST | Admin | `{ name, email, businessName?, phone? }` | `{ client: User }` |
| `/api/admin/clients` | PATCH | Admin | `{ id, ...updates }` | `{ client: User }` |
| `/api/admin/clients` | DELETE | Admin | `{ id }` | `{ success: true }` |
| `/api/admin/projects` | GET | Admin | None | `{ projects: ServiceInstance[] }` |
| `/api/admin/impersonate` | GET | Admin | `?userId=string` | `{ impersonationUrl, clientEmail, clientName }` |
| `/api/admin/onboarding/[id]/approve` | POST | Admin | None | `{ success: true }` |

### Admin — Dashboard & Intelligence
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/admin/intelligence` | GET | Admin | None | `{ recommendations: Recommendation[] }` |
| `/api/admin/financials` | GET | Admin | None | `{ metrics: Metric[], projections: Projection[] }` |
| `/api/admin/dashboard/metrics` | GET | Admin | None | `{ revenue, customers, usage, system }` |

### Admin — Workflows & Tasks
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/admin/workflows/status` | GET | Admin | None | `{ workflowStatusMap: Record<string, WorkflowStatus> }` |
| `/api/admin/n8n` | GET | Admin | None | `{ diagnostics: { cpu, memory, disk, db, logs, backups, version } }` |
| `/api/admin/n8n` | POST | Admin | `{ action: 'restart'\|'backup'\|'prune'\|'rebuild'\|'upgrade', targetVersion? }` | Action result or stream |
| `/api/admin/launch-tasks` | GET | Admin | None | `{ tasks: LaunchTask[] }` |
| `/api/admin/launch-tasks` | POST | Admin | `{ title, description, category, status?, order? }` | `{ task: LaunchTask }` |
| `/api/admin/launch-tasks` | PATCH | Admin | `{ taskId, status }` | `{ task: LaunchTask }` |

### Admin — Products & Testimonials
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/admin/products/create` | POST | Admin | `{ name, description, slug, pricing, n8n, type }` | `{ manifest: ProductManifest }` |
| `/api/admin/testimonials` | GET | Admin | None | `{ testimonials: Testimonial[] }` |
| `/api/admin/testimonials` | POST | Admin | `{ name, text, image?, rating? }` | `{ testimonial: Testimonial }` |
| `/api/admin/testimonials/approve` | POST | Admin | `{ testimonialId }` | `{ success: true }` |

### Client Dashboard
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/app/dashboard` | GET | Session | None | `{ services: Service[], usageLogs: UsageLog[] }` |
| `/api/app/agents` | GET | Session | None | `{ agents: Agent[] }` |
| `/api/app/approvals` | GET | Session | None | `{ approvals: Approval[] }` |
| `/api/app/approvals/[id]/respond` | POST | Session | `{ approved: boolean, reason? }` | `{ success: true }` |

### Fulfillment
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/fulfillment/initiate` | POST | Admin | `{ clientId, clientEmail?, productId, productName?, configuration, paymentIntentId? }` | `{ instanceId: string }` |
| `/api/fulfillment/finalize` | POST | Admin | `{ instanceId, n8nWorkflowId, adminNotes? }` | `{ success: true }` |

### Misc
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/contact` | POST | Rate-limited | `{ name, email, message, company?, budget?, timeline? }` | `{ success: true }` |
| `/api/custom-solutions/intake` | POST | Public | `{ name, email, message, company?, budget?, timeline? }` | `{ success: true }` |
| `/api/custom-solutions/checkout` | POST | Public | `{ packageId, contractId, clientEmail, clientName, returnUrl? }` | `{ checkoutUrl, sessionId }` |
| `/api/knowledge/index` | POST | Session | Multipart file + clientId or `{ clientId, url }` | `{ documentId, status }` |
| `/api/cron/sync-aitable` | GET | Cron secret | `?key=CRON_SECRET` | `{ ok, results, remainingUnsynced, timestamp }` |

---

## Worker Routes (Express.js)

### Job Management
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/jobs` | GET | Query userId | `?userId=string` | `{ jobs: JobCard[] }` |
| `/api/jobs` | POST | Zod body | `{ listingId, userId, model? }` | `{ job: Job }` |
| `/api/jobs/:id` | GET | Path param | None | `{ job, clips, listing }` |
| `/api/jobs/from-zillow` | POST | Zod body | `{ addressOrUrl, userId, floorplanBase64?, realtorBase64?, ... }` | `{ job, listing }` |
| `/api/jobs/:id/regenerate` | POST | Zod body | `{ clipNumbers: number[] }` | `{ success, master_video_url }` |
| `/api/jobs/:id/retry-fresh` | POST | Path param | None | `{ success: true }` |

### RAG
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/rag/ingest` | POST | Zod body | `{ tenantId, source, title?, content, metadata?, chunkSize?, chunkOverlap? }` | `{ documentId, chunks, vectorDimensions }` |
| `/api/rag/search` | POST | Zod body | `{ tenantId, query, limit?, hybrid? }` | `{ results: SearchResult[], count }` |
| `/api/rag/documents` | GET | Query params | `?tenantId=&source=` | `{ documents: Document[], count }` |
| `/api/rag/documents/:id` | DELETE | Path param | None | `{ success: true }` |
| `/api/rag/documents` | DELETE | Query params | `?tenantId=&source=` | `{ success, deleted: number }` |

### Dev
| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/api/dev/ensure-test-user` | POST | None | None | `{ userId, hasAvatar }` |
| `/api/health` | GET | None | None | `{ status: 'ok' }` |
