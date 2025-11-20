# Typeform Webhook Final Fix - November 16, 2025

## 🔍 Root Cause

The Typeform Trigger node uses a **different webhook URL format** than manual webhooks:

**Format**: `{workflow-id}/{node-name-lowercase}/webhook`

**Example**: `KXVJUtRiwozkKBmO/typeform trigger/webhook`

The node should auto-register this with Typeform, but it's failing. We need to **manually register** these webhooks.

## ✅ Correct Webhook URLs

| Workflow ID | Form ID | Node Name | Webhook URL |
|-------------|---------|-----------|-------------|
| `KXVJUtRiwozkKBmO` | `jqrAhQHW` | Typeform Trigger | `http://173.254.201.134:5678/webhook/KXVJUtRiwozkKBmO/typeform trigger/webhook` |
| `1NgUtwNhG19JoVCX` | `ydoAn3hv` | Typeform Trigger | `http://173.254.201.134:5678/webhook/1NgUtwNhG19JoVCX/typeform trigger/webhook` |
| `NgqR5LtBhhaFQ8j0` | `TBij585m` | Typeform Trigger | `http://173.254.201.134:5678/webhook/NgqR5LtBhhaFQ8j0/typeform trigger/webhook` |

## 🔧 Manual Registration Commands

**Form 1: Ready Solutions Quiz**
```bash
curl -X PUT "https://api.typeform.com/forms/jqrAhQHW/webhooks/n8n-ss6lfgypek" \
  -H "Authorization: Bearer tfp_...[REDACTED]" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://173.254.201.134:5678/webhook/KXVJUtRiwozkKBmO/typeform trigger/webhook","enabled":true}'
```

**Form 2: Template Request**
```bash
curl -X PUT "https://api.typeform.com/forms/ydoAn3hv/webhooks/n8n-ifsdodhorz" \
  -H "Authorization: Bearer tfp_...[REDACTED]" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://173.254.201.134:5678/webhook/1NgUtwNhG19JoVCX/typeform trigger/webhook","enabled":true}'
```

**Form 3: Readiness Scorecard**
```bash
curl -X PUT "https://api.typeform.com/forms/TBij585m/webhooks/n8n-ipnv8bn6pl" \
  -H "Authorization: Bearer tfp_...[REDACTED]" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://173.254.201.134:5678/webhook/NgqR5LtBhhaFQ8j0/typeform trigger/webhook","enabled":true}'
```

## 📊 Verification

After registration, test each webhook:
1. Go to Typeform admin: https://admin.typeform.com/form/{form-id}/connect#/section/webhooks
2. Click "Send test request"
3. Should return 200 OK
4. Check n8n executions: http://173.254.201.134:5678/executions

