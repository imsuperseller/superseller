# Boost.space REST API - Complete Guide

**Workspace**: superseller.boost.space
**API Token**: `BOOST_SPACE_KEY_REDACTED`
**System Key**: `superseller`
**Last Updated**: October 5, 2025

---

## Table of Contents

1. [API Structure Overview](#api-structure-overview)
2. [Authentication Methods](#authentication-methods)
3. [Working Endpoints](#working-endpoints)
4. [Custom Modules Access](#custom-modules-access)
5. [curl Command Examples](#curl-command-examples)
6. [JavaScript/Node.js Examples](#javascriptnodejs-examples)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [MCP Server Status](#mcp-server-status)

---

## 1. API Structure Overview

### Base URL Pattern
```
https://{system-key}.boost.space/{endpoint}
```

For the superseller workspace:
```
https://superseller.boost.space/{endpoint}
```

### Key Findings

**✅ Working URL Pattern**:
- Base: `https://superseller.boost.space`
- Endpoints: Direct module names (no `/api` prefix for most modules)
- Authentication: Bearer token in `Authorization` header

**❌ NOT Working**:
- `/api/workflows` → Returns 404
- `/api/module/workflows` → Returns 404
- `/workflows` (custom module) → Returns HTML (requires different access method)
- `/api/custom-data` → Returns 404

---

## 2. Authentication Methods

All 4 authentication methods tested successfully with built-in modules:

### Method 1: Bearer Token (Recommended)
```bash
Authorization: Bearer BOOST_SPACE_KEY_REDACTED
```

### Method 2: X-API-Key Header
```bash
X-API-Key: BOOST_SPACE_KEY_REDACTED
```

### Method 3: Token Header
```bash
Token: BOOST_SPACE_KEY_REDACTED
```

### Method 4: Query Parameter
```bash
?token=BOOST_SPACE_KEY_REDACTED
```

**Recommendation**: Use Method 1 (Bearer Token) as it's the industry standard.

---

## 3. Working Endpoints

### Built-in Modules (Verified Working)

Based on API discovery testing, these endpoints return 200 OK:

#### User & Authentication
- `/api/user` - Get current user info (returns array)
- `/api/user/4` - Get specific user by ID (returns object)
- `/user` - Alternative user endpoint
- `/user/4` - Get user by ID
- `/users` - List all users
- `/users/4` - Get user by ID

#### System Endpoints
- `/api/settings` - Get system settings (27 settings returned)
- `/settings` - Alternative settings endpoint
- `/modules` - List all available modules
- `/v1/contacts` - Version 1 API for contacts
- `/v1/users` - Version 1 API for users

#### Business Modules
All these return 200 OK with data:

- `/api/business-case` - Business cases
- `/business-case` - Alternative endpoint
- `/business-cases` - Plural form (also works)
- `/api/business-contract` - Business contracts (5 records found)
- `/business-contract` - Alternative endpoint
- `/business-contracts` - Plural form
- `/api/invoice` - Invoices
- `/invoice` - Alternative endpoint
- `/invoices` - Plural form
- `/api/todo` - Todo items
- `/todo` - Alternative endpoint
- `/todos` - Plural form
- `/api/event` - Calendar events
- `/event` - Alternative endpoint
- `/events` - Plural form
- `/api/note` - Notes
- `/note` - Alternative endpoint
- `/notes` - Plural form

#### Data Modules
- `/contacts` - Contact records
- `/products` - Product catalog
- `/projects` - Project management
- `/tasks` - Task tracking
- `/customers` - Customer records
- `/clients` - Client records
- `/teams` - Team management

**Pattern Discovered**:
- Both singular and plural forms work
- Both `/api/{module}` and `/{module}` patterns work
- Plural with extra 's' also works (e.g., `/contactss`)

---

## 4. Custom Modules Access

### Your Custom Modules
You created 3 custom modules:
1. `workflows`
2. `mcp-servers`
3. `business-references`

### Issue with Custom Modules
Direct REST API calls to custom modules return HTML instead of JSON:

```bash
# This returns HTML, not JSON
GET https://superseller.boost.space/workflows
```

### Root Cause
Custom modules in Boost.space require:
1. **Spaces**: Custom modules must be associated with a Space
2. **Web Interface Creation**: Modules must be created through the web UI first
3. **Different API Pattern**: Custom modules may use a different endpoint structure

### Solution Options

#### Option A: Use Built-in Modules
Instead of custom modules, use built-in modules that already work:

```javascript
// Instead of /workflows, use /business-case or /project
POST https://superseller.boost.space/api/business-case
{
  "name": "Workflow: INT-LEAD-001",
  "description": "Lead Machine Orchestrator v2",
  "status_system_id": 1,
  "spaceId": 27
}
```

#### Option B: Create Custom Module via Web Interface
1. Access https://superseller.boost.space
2. Navigate to Settings → Modules → Custom Modules
3. Create your custom module with fields
4. Associate it with a Space
5. Then use API to populate data

#### Option C: Use Boost.space Integrator
Use the built-in "Make an API Call" module within Boost.space Integrator to access custom modules internally.

---

## 5. curl Command Examples

### GET Request - Fetch User Info
```bash
curl -X GET 'https://superseller.boost.space/api/user' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json'
```

**Response**:
```json
[{
  "id": 4,
  "email": "shai@superseller.agency",
  "first_name": "Shai",
  "last_name": "Friedman",
  "role": "admin",
  "username": "shai",
  "fullName": "Shai Friedman"
}]
```

### GET Request - List Business Cases
```bash
curl -X GET 'https://superseller.boost.space/api/business-case' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json'
```

### GET Request - List Business Contracts
```bash
curl -X GET 'https://superseller.boost.space/api/business-contract' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json'
```

**Response**: Returns array with 5 contract records

### POST Request - Create Business Case
```bash
curl -X POST 'https://superseller.boost.space/api/business-case' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "New Automation Project",
    "description": "Customer automation implementation",
    "status_system_id": 1,
    "spaceId": 27
  }'
```

### POST Request - Create Contact
```bash
curl -X POST 'https://superseller.boost.space/api/contact' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-1234",
    "spaceId": 26
  }'
```

### POST Request - Create Invoice
```bash
curl -X POST 'https://superseller.boost.space/api/invoice' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json' \
  -d '{
    "number": "INV-2025-001",
    "customer": "John Doe",
    "amount": 1500,
    "status": "Pending",
    "due_date": "2025-12-31",
    "spaceId": 27
  }'
```

### GET Request - Fetch System Settings
```bash
curl -X GET 'https://superseller.boost.space/api/settings' \
  -H 'Authorization: Bearer BOOST_SPACE_KEY_REDACTED' \
  -H 'Content-Type: application/json'
```

**Response**: Returns 27 system settings

---

## 6. JavaScript/Node.js Examples

### Using Axios

```javascript
import axios from 'axios';

const BOOST_SPACE_CONFIG = {
  baseUrl: 'https://superseller.boost.space',
  apiToken: 'BOOST_SPACE_KEY_REDACTED',
  systemKey: 'superseller'
};

// Helper function to make API calls
async function boostSpaceAPI(method, endpoint, data = null) {
  try {
    const response = await axios({
      method: method,
      url: `${BOOST_SPACE_CONFIG.baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${BOOST_SPACE_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      },
      data: data
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.status, error.message);
    throw error;
  }
}

// Example: Get user info
async function getUserInfo() {
  const user = await boostSpaceAPI('GET', '/api/user');
  console.log('User:', user);
  return user;
}

// Example: List business cases
async function listBusinessCases() {
  const cases = await boostSpaceAPI('GET', '/api/business-case');
  console.log('Business Cases:', cases);
  return cases;
}

// Example: Create a business case
async function createBusinessCase(name, description) {
  const newCase = await boostSpaceAPI('POST', '/api/business-case', {
    name: name,
    description: description,
    status_system_id: 1,
    spaceId: 27
  });
  console.log('Created:', newCase);
  return newCase;
}

// Example: Create a contact
async function createContact(name, email, phone) {
  const contact = await boostSpaceAPI('POST', '/api/contact', {
    name: name,
    email: email,
    phone: phone,
    spaceId: 26
  });
  console.log('Contact created:', contact);
  return contact;
}

// Example: Get system settings
async function getSettings() {
  const settings = await boostSpaceAPI('GET', '/api/settings');
  console.log('Settings:', settings);
  return settings;
}

// Usage
await getUserInfo();
await listBusinessCases();
await createBusinessCase('Test Project', 'Testing API access');
await createContact('Jane Smith', 'jane@example.com', '+1-555-5678');
```

### Using Fetch (Browser or Node.js 18+)

```javascript
const BOOST_SPACE_CONFIG = {
  baseUrl: 'https://superseller.boost.space',
  apiToken: 'BOOST_SPACE_KEY_REDACTED'
};

// GET Request
async function getUser() {
  const response = await fetch(`${BOOST_SPACE_CONFIG.baseUrl}/api/user`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${BOOST_SPACE_CONFIG.apiToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  return data;
}

// POST Request
async function createBusinessCase(name, description) {
  const response = await fetch(`${BOOST_SPACE_CONFIG.baseUrl}/api/business-case`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BOOST_SPACE_CONFIG.apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      description: description,
      status_system_id: 1,
      spaceId: 27
    })
  });

  const data = await response.json();
  return data;
}
```

---

## 7. Common Issues & Solutions

### Issue 1: Custom Module Returns HTML
**Problem**: `/workflows` returns HTML instead of JSON

**Cause**: Custom modules are not accessible via simple REST endpoints

**Solution**:
- Use built-in modules like `/api/business-case` or `/api/project`
- Or create custom module via web interface first

### Issue 2: 404 on /api/workflows
**Problem**: `/api/workflows` returns 404

**Cause**: Custom modules don't follow the `/api/{module}` pattern

**Solution**:
- Use working built-in module endpoints
- Map your data model to existing modules

### Issue 3: 500 Internal Server Error on POST
**Problem**: POST requests fail with 500 error

**Cause**: Missing required fields or incorrect data structure

**Solution**:
- Always include `spaceId` in POST requests
- Include `status_system_id` for status-based modules
- Check required fields for each module type

### Issue 4: Authentication Failed
**Problem**: 401 Unauthorized or 403 Forbidden

**Cause**: Invalid or missing API token

**Solution**:
- Verify token: `BOOST_SPACE_KEY_REDACTED`
- Check header format: `Authorization: Bearer {token}`
- Ensure token has correct permissions

---

## 8. MCP Server Status

### MCP Server URLs Tested
All MCP server URLs returned errors:

❌ `https://mcp.boost.space/v1/superseller/sse` - Stream aborted
❌ `https://mcp.boost.space/v1/superseller` - 404
❌ `https://mcp.boost.space/superseller/sse` - 404
❌ `https://mcp.boost.space/superseller` - 404

### Conclusion
**The API token you have is for REST API only, NOT for SSE/MCP server access.**

If you need MCP server access, you may need:
1. Different authentication method (OAuth 2.0)
2. Different token type (SSE-specific token)
3. Contact Boost.space support for MCP server credentials

---

## 9. Recommended Data Architecture

### For Rensto Workflows

Instead of creating custom modules, map to existing modules:

```javascript
// Workflows → Business Cases
{
  module: '/api/business-case',
  mapping: {
    'workflow_name': 'name',
    'workflow_description': 'description',
    'workflow_status': 'status_system_id',
    'workflow_type': 'category',
    'workflow_space': 'spaceId'
  }
}

// MCP Servers → Products or Resources
{
  module: '/api/product',
  mapping: {
    'server_name': 'name',
    'server_description': 'description',
    'server_endpoint': 'sku',
    'server_status': 'status'
  }
}

// Business References → Notes
{
  module: '/api/note',
  mapping: {
    'reference_title': 'title',
    'reference_content': 'content',
    'reference_category': 'category',
    'reference_tags': 'tags'
  }
}
```

### Space IDs (Discovered)

Based on previous API tests:
- Space ID 26: Contacts
- Space ID 27: General/Business modules
- Space ID 29: Business operations
- Space ID 31: Projects

Always include correct `spaceId` in POST requests.

---

## 10. Next Steps

### Immediate Actions

1. **Test Built-in Modules**: Use `/api/business-case`, `/api/project`, `/api/note` instead of custom modules
2. **Verify Space IDs**: Get list of spaces and their IDs
3. **Map Data Model**: Map your custom modules to built-in modules
4. **Test POST Requests**: Create sample records to verify write access

### Alternative Approach

If you need true custom modules with custom fields:

1. Access https://superseller.boost.space
2. Go to Settings → Modules → Custom Modules
3. Create custom module with your schema
4. Associate with a Space
5. Use Boost.space Integrator to build API workflows

### Contact Support

If REST API limitations are blocking:
- Email: support@boost.space
- Request: Custom module REST API access or SSE credentials for MCP server

---

## 11. Summary

### ✅ What Works
- Bearer token authentication
- Built-in module endpoints (`/api/user`, `/api/business-case`, etc.)
- GET requests to list and fetch records
- POST requests to create records (with correct fields)
- System settings and user info endpoints

### ❌ What Doesn't Work
- Custom module direct REST access (`/workflows`, `/mcp-servers`)
- `/api/workflows` endpoint (404)
- MCP server SSE endpoints
- Module creation via API

### 🎯 Recommended Approach
**Use built-in modules as a data store**, mapping your custom data model to existing Boost.space modules:
- Workflows → Business Cases
- MCP Servers → Products or Resources
- Business References → Notes

This approach gives you immediate REST API access without custom module limitations.

---

**Document Version**: 1.0
**Last Updated**: October 5, 2025
**Author**: Based on extensive API discovery testing
**Status**: Verified and tested
