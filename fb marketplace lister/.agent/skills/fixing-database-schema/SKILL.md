---
name: fixing-database-schema
description: >-
  DEPRECATED — n8n Data Table schema issues are no longer relevant. The marketplace bot now uses
  PostgreSQL fb_listings table directly via webhook-server on port 8082. This skill is kept for
  historical reference only.
version: 1.1.0
disable-model-invocation: true
triggers:
  - "database schema error"
  - "missing column fb_listings"
negative_triggers:
  - "prisma schema"
  - "drizzle schema"
---

# Database Schema — FB Marketplace Bot

> [!NOTE]
> **DEPRECATED**: The n8n Data Table is no longer used. The bot reads jobs from PostgreSQL `fb_listings` table via `webhook-server.js` on port 8082.

## Current Schema (PostgreSQL `fb_listings`)

```sql
CREATE TABLE fb_listings (
    id SERIAL PRIMARY KEY,
    unique_hash TEXT,
    client_id TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'queued',
    product_name TEXT,
    listing_title TEXT,
    listing_description TEXT,
    price INTEGER,
    phone_number TEXT,
    location TEXT,
    image_url TEXT,
    video_url TEXT,
    facebook_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    posted_at TIMESTAMP
);
```

## Status Values
- `queued` — waiting to be posted
- `processing` — bot is currently posting
- `posted` — successfully posted to Facebook
- `failed` — posting failed (see `error_message`)

## Connection
```javascript
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'app_db',
    password: 'a1efbcd564b928d3ef1d7cae',
    port: 5432,
});
```

## Common Queries

### Add Job
```sql
INSERT INTO fb_listings (client_id, status, listing_title, listing_description, price, phone_number, location)
VALUES ('uad', 'queued', 'Title', 'Description', 2500, '+1-972-954-2407', 'Dallas, TX');
```

### Check Status
```sql
SELECT id, client_id, status, listing_title, location, posted_at
FROM fb_listings ORDER BY created_at DESC LIMIT 10;
```

### Reset Failed Job
```sql
UPDATE fb_listings SET status = 'queued', error_message = NULL WHERE id = 123;
```
