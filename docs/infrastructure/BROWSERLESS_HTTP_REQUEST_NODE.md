# Browserless HTTP Request Node Configuration

**Date**: December 19, 2025
**Status**: ✅ Working Configuration
**Workflow**: `1ugdy52MDCeUMKuR` - "My workflow 3"

---

## Problem Solved

The n8n Browserless node (version 2) has a bug where it sends invalid parameters (`timeout`, `blockAds`) as query parameters, causing 400 Bad Request errors. This HTTP Request node configuration bypasses that bug and works correctly.

---

## Node Configuration

### HTTP Request Node Settings

**Node Name**: `Browserless Content`
**Node Type**: `HTTP Request`
**Type Version**: `4.2`

### Parameters

| Setting | Value |
|---------|-------|
| **Method** | `POST` |
| **URL** | `http://172.245.56.50:3000/content` |
| **Authentication** | `Header Auth` |
| **Send Headers** | ✅ Enabled |
| **Send Body** | ✅ Enabled |
| **Body Content Type** | `JSON` |

### Headers

| Name | Value |
|------|-------|
| `Authorization` | `Bearer browserless-rensto-1a5f380127a79e645a45ca5f83cb11dc` |

### Body (JSON)

```json
{
  "url": "https://rensto.com"
}
```

---

## Making URL Dynamic

To make the URL configurable from the previous node, update the JSON Body to use n8n expressions:

```json
{
  "url": "={{ $json.url || 'https://rensto.com' }}"
}
```

Or if you want to pass it from the Manual Trigger:

1. In Manual Trigger, add a field: `url` with value `https://rensto.com`
2. In HTTP Request node, use: `"url": "={{ $json.url }}"`

---

## Alternative: Using Docker Internal Network

If both n8n and Browserless are on the same Docker network, you can use the internal hostname:

**URL**: `http://browserless_rensto:3000/content`

This is more efficient and doesn't require exposing port 3000 to the host.

---

## Testing

### Test the Workflow

1. Open workflow: `https://n8n.rensto.com/workflow/1ugdy52MDCeUMKuR`
2. Click **Execute Workflow**
3. Check the **Browserless Content** node output
4. Should return HTML content from `https://rensto.com`

### Expected Output

The node should return:
- **Status Code**: `200`
- **Content-Type**: `text/html; charset=UTF-8`
- **Body**: Full HTML content of the page

---

## Advanced Options

### Adding More Parameters

You can add additional Browserless parameters to the JSON body:

```json
{
  "url": "https://rensto.com",
  "waitForSelector": ".main-content",
  "waitForTimeout": 5000,
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

### Available Browserless Parameters

From [Browserless API Documentation](https://docs.browserless.io/):

- `url` - Target URL (required)
- `html` - HTML content to use instead of URL
- `waitForSelector` - CSS selector to wait for
- `waitForTimeout` - Timeout in milliseconds
- `viewport` - Viewport dimensions
- `userAgent` - Custom user agent string
- `emulateMediaType` - Media type (e.g., 'screen', 'print')
- `setJavaScriptEnabled` - Enable/disable JavaScript (default: true)
- `blockAds` - Block ads (uses uBlock Origin)
- `addScriptTag` - Add JavaScript to page
- `addStyleTag` - Add CSS to page

**Note**: Some parameters like `timeout` and `blockAds` should NOT be in query parameters (that's the bug). They can be in the JSON body if supported.

---

## Comparison: Browserless Node vs HTTP Request Node

| Feature | Browserless Node | HTTP Request Node |
|---------|------------------|-------------------|
| **Ease of Use** | ✅ Easier (UI-based) | ⚠️ Requires manual config |
| **Reliability** | ❌ Bug in v2 | ✅ Works correctly |
| **Flexibility** | ⚠️ Limited to node options | ✅ Full API control |
| **Maintenance** | ⚠️ Depends on node updates | ✅ Direct API calls |

**Recommendation**: Use HTTP Request node until Browserless node v2 bug is fixed.

---

## Troubleshooting

### Issue: Still Getting 400 Error

**Check**:
1. Token is correct: `browserless-rensto-1a5f380127a79e645a45ca5f83cb11dc`
2. URL format: `http://172.245.56.50:3000/content` (no trailing slash)
3. Body is valid JSON: `{"url":"https://rensto.com"}`
4. Authorization header: `Bearer browserless-rensto-1a5f380127a79e645a45ca5f83cb11dc`

### Issue: Connection Refused

**Check**:
1. Browserless container is running: `docker ps | grep browserless`
2. Port 3000 is accessible from n8n container
3. Network connectivity: Test with `curl` from n8n container

### Issue: Empty Response

**Check**:
1. Target URL is accessible: `curl https://rensto.com`
2. Browserless logs: `docker logs browserless_rensto --tail 50`
3. n8n execution logs for errors

---

## Related Documentation

- [Browserless Deployment Complete](./BROWSERLESS_DEPLOYMENT_COMPLETE.md)
- [Browserless n8n Setup Guide](./BROWSERLESS_N8N_SETUP.md)
- [Browserless n8n Fix](./BROWSERLESS_N8N_FIX.md)
- [Browserless Docker Config](https://docs.browserless.io/enterprise/docker/config)

---

**Status**: ✅ Configuration tested and working
**Last Updated**: December 19, 2025
