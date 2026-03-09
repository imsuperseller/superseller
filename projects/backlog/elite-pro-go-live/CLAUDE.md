# Backlog: Elite Pro Pipeline Go-Live

> **Status**: Blocked on Saar's credentials
> **Owner**: Customer: Elite Pro + Project 8 (ClaudeClaw)
> **Estimated time once unblocked**: 2-3 hours to go live

---

## What This Is

Getting the Elite Pro Instagram content pipeline from DRY_RUN=True to actually posting live content. Three blockers, all waiting on Saar.

---

## Exact Steps (once credentials received)

### Step 1: Get Meta App ID + Secret from Saar
Saar needs to provide access to his Facebook Developer App (or create a new one). This lets us generate a proper long-lived IG access token.

### Step 2: Fix IG Account ID
Edit `/opt/superseller-agents/config.py` on RackNerd:
```python
# Change from (SuperSeller's account — WRONG):
IG_ACCOUNT_ID = "17841410951596580"
# To (Elite Pro's actual IG account ID — get from Saar's IG):
IG_ACCOUNT_ID = "<elite-pro-actual-id>"
```

### Step 3: Refresh IG Access Token
Use Meta App ID + Secret + Saar's FB account to generate a new long-lived access token. Update `config.py`.

### Step 4: Get Saar + Mor phone numbers
For dual WhatsApp approval. Both must receive and approve each post before it publishes.

### Step 5: Disable DRY_RUN
```bash
# On RackNerd:
ssh root@172.245.56.50
# Edit /opt/superseller-agents/config.py: DRY_RUN = False
# OR set env var: SS_DRY_RUN=false
```

### Step 6: Test first post
Run publisher manually, confirm WhatsApp approval arrives on both phones, confirm IG post goes live.

---

## What To Tell Saar

"Saar, to launch your Instagram content pipeline, I need 3 things from you:
1. Your Facebook Developer App ID and Secret (or I can help you create a new app)
2. Your Instagram account ID (I can help you find it)
3. Your and Mor's WhatsApp phone numbers for the approval flow

Once I have these, your pipeline will be live within 24 hours."

---

## Contract First

Before going live: send the eSignatures contract (template `99de20b5-2bb9-4439-9532-e00902fe6824`) and get a signature. Don't go live on a handshake for $2,000/mo.
