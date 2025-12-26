# Browserless n8n Node Configuration Fix

**Issue**: Execution #41499 failed with "Bad request - please check your parameters" (400 error)
**Date**: December 19, 2025
**Status**: ✅ Browserless service working, n8n node configuration issue

---

## Problem Analysis

The execution failed because the n8n Browserless node is receiving a 400 Bad Request error. However, **Browserless service is working correctly** - direct API calls succeed.

**Test Results**:
- ✅ Browserless container: Running
- ✅ Direct API call: Success (returns HTML content)
- ✅ Token authentication: Working
- ❌ n8n Browserless node: 400 error

---

## Root Cause

The n8n Browserless node credentials may be configured incorrectly. The node expects:
- **Base URL**: `http://172.245.56.50:3000` (no trailing slash, no `/api` path)
- **Token**: Should be sent automatically by the node

---

## Solution

### Step 1: Verify Browserless Credentials in n8n

1. Go to: **Credentials** → **Browserless Credentials account** (ID: `hCO8fCIa8icN9MnU`)
2. Check the configuration:
   - **Base URL**: Should be `http://172.245.56.50:3000`
   - **Token**: `browserless-rensto-1a5f380127a79e645a45ca5f83cb11dc`

### Step 2: Common Issues to Check

**Issue 1: Base URL Format**
- ❌ Wrong: `http://172.245.56.50:3000/`
- ❌ Wrong: `http://172.245.56.50:3000/api`
- ✅ Correct: `http://172.245.56.50:3000`

**Issue 2: Token Format**
- The token should be entered as-is (no "Bearer" prefix)
- n8n will add the "Bearer" prefix automatically

**Issue 3: Network Access**
- Ensure n8n container can reach Browserless on port 3000
- Both containers should be on the same Docker network (`n8n-network`)

### Step 3: Test the Fix

1. Update the credentials if needed
2. Re-execute workflow: `https://n8n.rensto.com/workflow/1ugdy52MDCeUMKuR/executions/41499`
3. Or create a new test execution

---

## Verification Commands

### Test Browserless Service Directly

```bash
# From the server
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer browserless-rensto-1a5f380127a79e645a45ca5f83cb11dc" \
  -d '{"url":"https://www.rensto.com"}' \
  http://localhost:3000/content
```

**Expected**: Returns HTML content (this works ✅)

### Check Container Network

```bash
# Verify both containers are on the same network
docker network inspect n8n-network | grep -A 5 "Containers"
```

**Expected**: Both `n8n_rensto` and `browserless_rensto` should be listed

### Test from n8n Container

```bash
# Test connectivity from n8n container
docker exec n8n_rensto curl -s http://browserless_rensto:3000/content \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer browserless-rensto-1a5f380127a79e645a45ca5f83cb11dc" \
  -d '{"url":"https://example.com"}'
```

---

## Alternative: Use Internal Docker Network

If the issue persists, you can configure n8n to use the internal Docker network name:

**Base URL**: `http://browserless_rensto:3000`

This uses Docker's internal DNS resolution and doesn't require exposing port 3000 to the host.

**Note**: This only works if n8n is also running in Docker on the same network (which it is).

---

## Workflow Configuration

The workflow is configured correctly:
- **Node**: Browserless → Content
- **URL**: `https://www.rensto.com`
- **Operation**: Content

The issue is purely with the credential configuration.

---

## Expected Behavior After Fix

Once credentials are correctly configured:
1. Manual Trigger executes successfully
2. Browserless node receives the request
3. Browserless fetches content from `https://www.rensto.com`
4. Returns HTML content to n8n
5. Execution completes successfully

---

## Related Documentation

- [Browserless Deployment Complete](./BROWSERLESS_DEPLOYMENT_COMPLETE.md)
- [Browserless n8n Setup Guide](./BROWSERLESS_N8N_SETUP.md)
- [n8n Browserless Node Docs](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.browserless/)

---

**Next Action**: Update the Browserless credentials in n8n with the correct Base URL format.
