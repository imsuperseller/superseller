# Restore Cloudflare Tunnel for n8n.rensto.com

**Date**: December 5, 2025  
**Issue**: HTTPS not working after migration  
**Root Cause**: Cloudflare Tunnel was removed during migration  
**Status**: 🔧 **RESTORATION SCRIPT READY**

---

## 🔍 **WHAT HAPPENED**

### **Before Migration** (Working):
- ✅ **DNS**: CNAME to `04515a2f-5626-4e02-b085-a46777f2cb40.cfargotunnel.com`
- ✅ **Proxied**: `true`
- ✅ **HTTPS**: `https://n8n.rensto.com` worked automatically
- ✅ **Cloudflare Tunnel**: Running on old VPS (172.245.56.50)

### **After Migration** (Broken):
- ❌ **DNS**: Changed to A record pointing to `172.245.56.50`
- ❌ **Proxied**: `false` (direct access)
- ❌ **HTTPS**: `https://n8n.rensto.com` doesn't work (no SSL)
- ❌ **Cloudflare Tunnel**: Not installed on new VPS

---

## ✅ **SOLUTION: Restore Cloudflare Tunnel**

I've created a script to restore the Cloudflare Tunnel setup on the new VPS.

### **Script Location**:
- **Local**: `scripts/restore-cloudflare-tunnel-n8n.sh`
- **On VPS**: `/root/restore-tunnel.sh` (already uploaded)

---

## 🚀 **RESTORATION STEPS**

### **Step 1: SSH into New VPS**
```bash
ssh root@172.245.56.50
# Password: y0JEu4uI0hAQ606Mfr
```

### **Step 2: Run Restoration Script**
```bash
bash /root/restore-tunnel.sh
```

**The script will**:
1. ✅ Install `cloudflared` if not installed
2. ⚠️ **Prompt you** to run `cloudflared tunnel login` (opens browser)
3. ✅ Create tunnel: `n8n-tunnel`
4. ✅ Create config file: `/root/.cloudflared/config.yml`
5. ✅ Create DNS route (CNAME to tunnel)
6. ✅ Install as systemd service
7. ✅ Start the service

### **Step 3: Authenticate with Cloudflare** (Manual Step)

When prompted, run:
```bash
cloudflared tunnel login
```

This will:
1. Open your browser
2. Ask you to select domain: `rensto.com`
3. Download certificate to `/root/.cloudflared/cert.pem`

**Then continue** with the script.

---

## 📋 **WHAT THE SCRIPT DOES**

1. **Installs cloudflared** (if needed)
2. **Creates tunnel**: `n8n-tunnel`
3. **Creates config**: Points `n8n.rensto.com` → `http://localhost:5678`
4. **Updates DNS**: Creates CNAME to `*.cfargotunnel.com`
5. **Installs service**: Runs tunnel as systemd service
6. **Starts tunnel**: Makes it run on boot

---

## ✅ **AFTER RESTORATION**

### **DNS Will Change**:
- **From**: A record → `172.245.56.50` (proxied: false)
- **To**: CNAME → `*.cfargotunnel.com` (proxied: true)

### **HTTPS Will Work**:
- ✅ `https://n8n.rensto.com` will work automatically
- ✅ SSL certificate provided by Cloudflare
- ✅ No firewall issues (tunnel bypasses firewall)

### **Wait Time**:
- **DNS propagation**: 2-5 minutes
- **Tunnel connection**: Immediate

---

## 🧪 **VERIFICATION**

After running the script:

```bash
# Check service status
systemctl status cloudflared

# Check tunnel logs
journalctl -u cloudflared -f

# Test HTTPS (after DNS propagation)
curl https://n8n.rensto.com/healthz
# Should return: {"status":"ok"}
```

---

## 🚨 **IF SCRIPT FAILS**

### **Manual Steps**:

1. **Install cloudflared**:
   ```bash
   wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   dpkg -i cloudflared-linux-amd64.deb
   ```

2. **Login**:
   ```bash
   cloudflared tunnel login
   ```

3. **Create tunnel**:
   ```bash
   cloudflared tunnel create n8n-tunnel
   # Save the Tunnel ID
   ```

4. **Create config** (`/root/.cloudflared/config.yml`):
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /root/.cloudflared/<TUNNEL_ID>.json
   
   ingress:
     - hostname: n8n.rensto.com
       service: http://localhost:5678
     - service: http_status:404
   ```

5. **Create DNS route**:
   ```bash
   cloudflared tunnel route dns n8n-tunnel n8n.rensto.com
   ```

6. **Run tunnel**:
   ```bash
   cloudflared service install
   systemctl start cloudflared
   systemctl enable cloudflared
   ```

---

## 📊 **EXPECTED RESULT**

After restoration:
- ✅ `https://n8n.rensto.com` works
- ✅ DNS: CNAME to `*.cfargotunnel.com`
- ✅ Cloudflare Tunnel service running
- ✅ Same setup as before migration

---

**Script**: `scripts/restore-cloudflare-tunnel-n8n.sh`  
**Status**: ✅ Ready to run  
**Time**: ~10-15 minutes (including DNS propagation)
