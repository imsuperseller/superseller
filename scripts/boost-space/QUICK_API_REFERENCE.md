# Boost.space API - Quick Reference Card

**Base URL**: `https://superseller.boost.space`
**Token**: `BOOST_SPACE_KEY_REDACTED`

---

## Authentication

```bash
Authorization: Bearer BOOST_SPACE_KEY_REDACTED
```

---

## Essential curl Commands

### Get User Info
```bash
curl -X GET 'https://superseller.boost.space/api/user' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json'
```

### Get System Settings
```bash
curl -X GET 'https://superseller.boost.space/api/settings' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json'
```

### List Business Cases (for Workflows)
```bash
curl -X GET 'https://superseller.boost.space/api/business-case' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json'
```

### Create Business Case (for Workflow)
```bash
curl -X POST 'https://superseller.boost.space/api/business-case' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Workflow: INT-LEAD-001",
    "description": "Lead Machine Orchestrator v2",
    "status_system_id": 1,
    "spaceId": 27
  }'
```

### List Products (for MCP Servers)
```bash
curl -X GET 'https://superseller.boost.space/api/product' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json'
```

### Create Product (for MCP Server)
```bash
curl -X POST 'https://superseller.boost.space/api/product' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Airtable MCP Server",
    "sku": "airtable-mcp",
    "description": "MCP server for Airtable integration",
    "spaceId": 27
  }'
```

### List Notes (for Business References)
```bash
curl -X GET 'https://superseller.boost.space/api/note' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json'
```

### Create Note (for Business Reference)
```bash
curl -X POST 'https://superseller.boost.space/api/note' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Rensto BMAD Methodology",
    "content": "Build, Measure, Analyze, Deploy framework for systematic feature development",
    "category": "Business Process",
    "spaceId": 27
  }'
```

---

## Working Module Endpoints

```
GET/POST /api/user               - User management
GET/POST /api/business-case      - Business cases (USE FOR WORKFLOWS)
GET/POST /api/business-contract  - Contracts
GET/POST /api/invoice            - Invoices
GET/POST /api/product            - Products (USE FOR MCP SERVERS)
GET/POST /api/note               - Notes (USE FOR BUSINESS REFERENCES)
GET/POST /api/event              - Calendar events
GET/POST /api/todo               - Todo items
GET/POST /api/contact            - Contacts
GET/POST /api/project            - Projects
GET      /api/settings           - System settings
```

---

## Space IDs

- **26**: Contacts
- **27**: General/Business modules (most common)
- **29**: Business operations
- **31**: Projects

---

## Required Fields for POST

Always include:
- `name` or `title` - Record name
- `spaceId` - Space ID (usually 27)
- `status_system_id` - Status (usually 1 for active)

---

## What DOESN'T Work

❌ `/workflows` - Returns HTML, not JSON
❌ `/api/workflows` - Returns 404
❌ `/mcp-servers` - Returns HTML
❌ `/business-references` - Returns HTML
❌ Custom module REST endpoints

**Solution**: Use built-in modules instead
- Workflows → `/api/business-case`
- MCP Servers → `/api/product`
- Business References → `/api/note`

---

## Quick Test

```bash
# Test if API is working
curl -X GET 'https://superseller.boost.space/api/user' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED'

# Should return JSON with user "Shai Friedman"
```

---

**Last Updated**: October 5, 2025
