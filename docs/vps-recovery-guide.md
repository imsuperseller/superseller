# 🛡️ SAFE VPS RECOVERY GUIDE

## **🔍 CURRENT STATUS**
- **VPS IP**: 173.254.201.134
- **Status**: Online (responds to ping)
- **SSH Port 22**: CLOSED ❌
- **Issue**: SSH service down or firewall blocking
- **Note**: MCP servers now use NPX packages instead of VPS deployment

## **🛡️ SAFE RECOVERY OPTIONS**

### **OPTION 1: RACKNERD CONTROL PANEL (SAFEST)**

1. **Login to Racknerd Control Panel**
   - Go to: https://my.racknerd.com/
   - Login with your Racknerd credentials

2. **Access VPS Management**
   - Find your VPS (173.254.201.134)
   - Look for "Console" or "VNC" access
   - This gives you direct access without SSH

3. **Check SSH Service**
   ```bash
   # In VNC console
   systemctl status ssh
   systemctl status sshd
   ```

4. **Restart SSH Service**
   ```bash
   # If SSH is down
   systemctl start ssh
   systemctl enable ssh
   ```

5. **Check Firewall**
   ```bash
   # Check if firewall is blocking SSH
   ufw status
   iptables -L
   ```

### **OPTION 2: RACKNERD SUPPORT (IF CONSOLE FAILS)**

1. **Submit Support Ticket**
   - Subject: "SSH Service Down - VPS 173.254.201.134"
   - Request: "Please restart SSH service and ensure port 22 is open"

2. **Provide Details**
   - VPS IP: 173.254.201.134
   - Issue: SSH port 22 closed, cannot connect
   - Request: Safe restart without data loss

### **OPTION 3: EMERGENCY RECOVERY (LAST RESORT)**

1. **Reboot VPS via Control Panel**
   - Use "Reboot" option in Racknerd panel
   - This is usually safe and won't lose data

2. **If Reboot Fails**
   - Use "Force Reboot" (still usually safe)
   - VPS will restart with all data intact

## **🔧 WHAT TO CHECK ONCE SSH IS BACK**

### **1. Verify All Services**
```bash
# Check if n8n is running
docker ps | grep n8n
systemctl status n8n

# Check if MCP servers are running
ps aux | grep mcp
netstat -tlnp | grep -E ':(4000|5678)'
```

### **2. Start MCP Servers**
```bash
cd /root/rensto/infra/mcp-servers/

# Start Make MCP Server

# Start n8n MCP Server

# Start MCP Proxy
cd ../mcp-proxy/
nohup node dist/index.js > /var/log/mcp-proxy.log 2>&1 &
```

### **3. Verify Everything Works**
```bash
# Check processes
ps aux | grep -E '(mcp|n8n)' | grep -v grep

# Check ports
netstat -tlnp | grep -E ':(4000|5678)'

# Test n8n API
curl -s "http://localhost:5678/api/v1/workflows" \
  -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## **📊 DATA SAFETY GUARANTEES**

### **✅ SAFE OPERATIONS (NO DATA LOSS)**
- SSH service restart
- VPS reboot via control panel
- Firewall rule changes
- Service restarts

### **⚠️ RISKY OPERATIONS (AVOID)**
- Reinstalling OS
- Formatting disks
- Deleting user accounts
- Changing network configuration

## **🎯 RECOMMENDED ACTION PLAN**

1. **IMMEDIATE**: Try Racknerd Control Panel → Console access
2. **IF CONSOLE WORKS**: Restart SSH service
3. **IF CONSOLE FAILS**: Submit support ticket
4. **ONCE SSH IS BACK**: Start MCP servers
5. **VERIFY**: Test all connections

## **📞 RACKNERD SUPPORT INFO**

- **Support Portal**: https://my.racknerd.com/
- **Ticket Priority**: High (SSH down = VPS unusable)
- **Expected Response**: Usually within 1-2 hours
- **Recovery Time**: Typically 15-30 minutes once they respond

---

**🛡️ REMEMBER**: Your data is safe! SSH being down doesn't affect your files, databases, or applications. It just prevents remote access.


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)