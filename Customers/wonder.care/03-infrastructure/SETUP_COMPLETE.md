# Wonder.Care n8n - Complete Setup Summary

**Customer:** Ortal Flanary  
**Company:** Wonder.Care  
**Setup Date:** December 12, 2025  
**Status:** ✅ COMPLETE

---

## 🔑 Access Credentials

### Server (RackNerd VPS)
| Item | Value |
|------|-------|
| **IP Address** | 192.227.249.73 |
| **Hostname** | racknerd-0ab0933 |
| **SSH User** | root |
| **SSH Password** | 20nfGHTa84Vyp5LUb7 |
| **OS** | Ubuntu 24.04 64 Bit |
| **RAM** | 4 GB |
| **Disk** | 130 GB |
| **Location** | Dallas (DAL175KVM) |
| **Timezone** | America/Chicago |

### RackNerd Control Panel
| Item | Value |
|------|-------|
| **URL** | https://my.racknerd.com/ |
| **Username** | vmuser275199 |
| **Password** | mcEJVMG637 |
| **API Key** | KPRVI-ZWX76-X7GEF |
| **API Hash** | 1cfb36cef451d82978b46aba19891f22b2e81dc7 |

### n8n Instance
| Item | Value |
|------|-------|
| **URL** | http://192.227.249.73:5678 |
| **Webhook Base** | http://192.227.249.73:5678/webhook/ |
| **Version** | Community Edition (latest) |
| **License Key** | fec94891-579b-4f34-9abc-84420515403f |
| **API Key** | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYzYyMzI1ZS0zMDE4LTQ3ZDYtYjNkMy04OWQ4ZGEyODNhY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY1NTY1MzIxfQ.oz00VPn4irZtAsq67xF2JfetDgS3pZugUDIj7lPlCC8 |
| **Data Directory** | /root/n8n/data |
| **Backups** | /root/n8n/backups (daily at 3 AM) |

### MCP Server (Cursor Integration)
| Item | Value |
|------|-------|
| **Server Name** | n8n-wondercare |
| **Config Location** | ~/.cursor/mcp.json |
| **Status** | ✅ Configured |

---

## ✅ What's Installed

- ✅ Docker (latest)
- ✅ Docker Compose
- ✅ n8n Community Edition (latest)
- ✅ Firewall configured (ports 22, 80, 443, 5678)
- ✅ Automatic daily backups (3 AM Chicago time)
- ✅ 7-day backup retention
- ✅ MCP server for Cursor integration
- ✅ Secure cookie disabled (for HTTP access)
- ✅ Timezone set to Chicago/Dallas

---

## 🔧 Common Commands

```bash
# SSH to server
ssh root@192.227.249.73
# Password: 20nfGHTa84Vyp5LUb7

# View logs
cd /root/n8n && docker-compose logs -f n8n

# Restart n8n
cd /root/n8n && docker-compose restart

# Stop n8n
cd /root/n8n && docker-compose stop

# Start n8n
cd /root/n8n && docker-compose start

# Update n8n to latest
cd /root/n8n && docker-compose pull && docker-compose up -d

# Manual backup
cd /root/n8n && ./backup.sh

# Check status
docker ps | grep n8n

# Check disk space
df -h
```

---

## 📦 Directory Structure

```
/root/n8n/
├── docker-compose.yml     # Docker configuration
├── backup.sh              # Backup script (runs daily at 3 AM)
├── data/                  # n8n data (workflows, credentials, etc.)
├── backups/               # Automatic backups (kept 7 days)
└── logs/                  # Application logs
```

---

## 🔄 Migration from Make.com

**Existing Make.com workflows to migrate:**
1. Healthcare_Appointment_Processor
2. Google Sheets to Monday.com Sync
3. [Other scenarios from Make.com]

**Migration process:**
1. Export scenario from Make.com (as JSON blueprint)
2. Analyze workflow logic
3. Recreate in n8n (no direct import available)
4. Test thoroughly
5. Activate and monitor
6. Deactivate Make.com scenario

---

## 📞 Support

**Rensto (Technical Support):**
- Contact: Shai Friedman
- For: n8n workflows, automation, integration

**RackNerd (Server Support):**
- API Key: KPRVI-ZWX76-X7GEF
- For: Server issues, network issues

---

## ⚠️ Important Notes

1. **Keep passwords secure** - These are production credentials
2. **Backup before updates** - Always run backup.sh before updating n8n
3. **Monitor disk space** - Check monthly with `df -h`
4. **This is SEPARATE from Rensto** - Different server, different instance

---

**Setup Completed By:** Rensto (Shai Friedman)  
**Date:** December 12, 2025

