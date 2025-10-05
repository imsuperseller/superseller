# 🔒 CLOUDFLARE TUNNEL FOR N8N HTTPS

**Purpose**: Give your n8n instance HTTPS access so Telegram webhooks work

**Current**: `http://173.254.201.134:5678` (HTTP only)
**After**: `https://n8n.rensto.com` (HTTPS via Cloudflare)

---

## 📋 WHAT IS CLOUDFLARE TUNNEL?

Cloudflare Tunnel creates a secure connection between your server and Cloudflare, giving you:
- ✅ HTTPS automatically (no need to manage SSL certificates)
- ✅ DDoS protection
- ✅ No need to open firewall ports
- ✅ Works behind NAT/firewall

**Not via API/MCP** - This is infrastructure setup on your server running n8n.

---

## 🚀 QUICK SETUP (15-20 min)

### **Step 1: Install cloudflared on your n8n server**

SSH into your server where n8n runs:

```bash
# For Ubuntu/Debian
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# For other systems, see: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### **Step 2: Authenticate with Cloudflare**

```bash
cloudflared tunnel login
```

This will:
1. Open browser to Cloudflare
2. Ask you to select a domain (rensto.com)
3. Download cert to `~/.cloudflared/cert.pem`

### **Step 3: Create the tunnel**

```bash
cloudflared tunnel create n8n-tunnel
```

This creates a tunnel and gives you a **Tunnel ID** (save this!)

### **Step 4: Create config file**

Create `/root/.cloudflared/config.yml`:

```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: /root/.cloudflared/<YOUR_TUNNEL_ID>.json

ingress:
  - hostname: n8n.rensto.com
    service: http://localhost:5678
  - service: http_status:404
```

Replace `<YOUR_TUNNEL_ID>` with the ID from Step 3.

### **Step 5: Create DNS record**

```bash
cloudflared tunnel route dns n8n-tunnel n8n.rensto.com
```

This creates a CNAME record in Cloudflare DNS pointing `n8n.rensto.com` to your tunnel.

### **Step 6: Run the tunnel**

```bash
# Test run (foreground)
cloudflared tunnel run n8n-tunnel

# If works, make it run on startup
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### **Step 7: Update n8n webhook URL**

In your n8n settings, update the webhook URL:

**Before**: `http://173.254.201.134:5678`
**After**: `https://n8n.rensto.com`

---

## ✅ VERIFICATION

1. Visit: `https://n8n.rensto.com`
2. Should see n8n login page via HTTPS ✅
3. Try activating DEV-004 workflow
4. Telegram webhook should now work ✅

---

## 🔄 ALTERNATIVE: USE EXISTING DOMAIN

If you want to use a subdomain of your existing Rensto domain:

**Option A**: `https://n8n.rensto.com` (recommended)
**Option B**: `https://workflows.rensto.com`
**Option C**: `https://automation.rensto.com`

Just replace in Step 4 config file.

---

## 📊 WHAT THIS FIXES

After Cloudflare Tunnel setup:

✅ **DEV-004** can activate (Telegram webhooks work via HTTPS)
✅ All webhook-based integrations work better
✅ More secure (HTTPS encryption)
✅ DDoS protection from Cloudflare
✅ Better for production use

---

## ⏱️ TIME ESTIMATE

- **Setup**: 15-20 minutes
- **DNS propagation**: 5-10 minutes
- **Total**: ~30 minutes

---

## 🆘 IF YOU NEED HELP

The setup is done on your server (VPS at 173.254.201.134), not via API/MCP.

**Commands you'll need SSH access to run**:
1. Install cloudflared package
2. Login to Cloudflare
3. Create tunnel
4. Create config file
5. Run tunnel service

**I can't do this via API** - you need to SSH into the server or give me SSH access.

---

## 💡 EASIER ALTERNATIVE

If Cloudflare Tunnel is too complex right now:

**Quick Fix for DEV-004**:
You already updated it to use polling instead of webhook trigger - that should work now!

**Test it**:
1. Go to: http://173.254.201.134:5678/workflow/cJbG8MpomtNrR1Sa
2. Check if it activates successfully
3. If yes, no need for Cloudflare Tunnel right now

---

**So to answer your question**:
- **Not via API/MCP** - It's infrastructure setup on your n8n server
- **Not n8n credentials** - It's a tunnel service running on your VPS
- **Requires SSH access** to your server at 173.254.201.134

**Do you want to**:
1. Set up Cloudflare Tunnel now (I'll guide you)
2. Skip it since DEV-004 now uses polling
3. Give me SSH access and I'll set it up
