# Restore HTTPS for n8n.rensto.com - Quick Instructions

**Problem**: `https://n8n.rensto.com` stopped working after migration  
**Cause**: Cloudflare Tunnel was removed (it provided HTTPS automatically)  
**Solution**: Restore Cloudflare Tunnel on new VPS

---

## 🚀 **QUICK FIX** (10-15 minutes)

### **Step 1: SSH into VPS**
```bash
ssh root@172.245.56.50
# Password: y0JEu4uI0hAQ606Mfr
```

### **Step 2: Download and Run Script**
```bash
# Download script
wget -q https://raw.githubusercontent.com/imsuperseller/rensto/main/scripts/restore-cloudflare-tunnel-n8n.sh -O /root/restore-tunnel.sh
chmod +x /root/restore-tunnel.sh

# Run script
bash /root/restore-tunnel.sh
```

### **Step 3: When Prompted - Authenticate**
The script will ask you to authenticate. Run:
```bash
cloudflared tunnel login
```
- This opens your browser
- Select domain: `rensto.com`
- Authorize
- Press Enter in terminal to continue

### **Step 4: Wait for DNS** (2-5 minutes)
After script completes, wait 2-5 minutes for DNS propagation.

### **Step 5: Test**
```bash
curl https://n8n.rensto.com/healthz
# Should return: {"status":"ok"}
```

---

## ✅ **WHAT THIS RESTORES**

**Before Migration** (Working):
- ✅ `https://n8n.rensto.com` worked
- ✅ DNS: CNAME to Cloudflare Tunnel
- ✅ HTTPS automatically via Cloudflare

**After Migration** (Broken):
- ❌ `https://n8n.rensto.com` doesn't work
- ❌ DNS: A record (direct IP)
- ❌ No HTTPS

**After Restoration** (Fixed):
- ✅ `https://n8n.rensto.com` works again
- ✅ DNS: CNAME to Cloudflare Tunnel (restored)
- ✅ HTTPS automatically via Cloudflare

---

## 📋 **WHAT THE SCRIPT DOES**

1. Installs `cloudflared`
2. Creates Cloudflare Tunnel: `n8n-tunnel`
3. Creates config: `/root/.cloudflared/config.yml`
4. Updates DNS: CNAME to `*.cfargotunnel.com`
5. Installs as systemd service
6. Starts tunnel service

---

## 🧪 **VERIFY IT WORKED**

```bash
# Check service
systemctl status cloudflared

# Check DNS (should show cfargotunnel.com)
dig +short n8n.rensto.com @8.8.8.8

# Test HTTPS
curl https://n8n.rensto.com/healthz
```

---

**Script**: `scripts/restore-cloudflare-tunnel-n8n.sh`  
**Full Docs**: `docs/infrastructure/N8N_CLOUDFLARE_TUNNEL_RESTORE.md`
