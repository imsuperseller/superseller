# Wonder.Care n8n - Quick Start Guide

## 🚀 Fast Installation (Copy-Paste Method)

**SSH into your server:**
```bash
ssh ubuntu@192.227.249.73
```

**Run the automated installer:**
```bash
# Download and run installation script
curl -o /tmp/install-n8n.sh https://raw.githubusercontent.com/yourusername/rensto/main/Customers/wonder.care/03-infrastructure/install-n8n.sh
chmod +x /tmp/install-n8n.sh
/tmp/install-n8n.sh
```

**Or copy the script manually and run:**
```bash
# Copy install-n8n.sh to server, then:
chmod +x install-n8n.sh
./install-n8n.sh
```

---

## ✅ Verification Checklist

After installation completes:

1. **Access n8n UI:**
   - Open: http://192.227.249.73:5678
   - Should see n8n setup page

2. **Create Account:**
   - Email: ortal@wonder.care
   - Password: [strong password, 12+ characters]
   - Save credentials securely!

3. **Generate API Key:**
   - Go to: Settings → API
   - Click "Create API Key"
   - Name: "Rensto Management"
   - Copy and save key

4. **Test Basic Workflow:**
   - Create new workflow
   - Add "Schedule" trigger (every 5 minutes)
   - Add "HTTP Request" node (GET https://api.ipify.org?format=json)
   - Activate workflow
   - Check executions

---

## 📋 Server Access

**SSH Command:**
```bash
ssh ubuntu@192.227.249.73
```

**n8n Commands:**
```bash
# View logs
cd /home/ubuntu/n8n && docker-compose logs -f n8n

# Restart n8n
cd /home/ubuntu/n8n && docker-compose restart

# Check status
docker ps | grep n8n

# Check resource usage
docker stats --no-stream n8n-wondercare
```

---

## 🔗 Important URLs

- **n8n UI:** http://192.227.249.73:5678
- **Webhook Base:** http://192.227.249.73:5678/webhook/
- **Health Check:** http://192.227.249.73:5678/healthz

---

## 🛟 Troubleshooting

### Cannot access n8n UI

```bash
# Check if container is running
docker ps -a | grep n8n

# If not running, start it
cd /home/ubuntu/n8n
docker-compose up -d

# Check logs for errors
docker-compose logs --tail=100 n8n
```

### Forgot password

```bash
# Reset owner password (in n8n container)
docker exec -it n8n-wondercare n8n user:password --email=ortal@wonder.care
```

### Out of disk space

```bash
# Check disk usage
df -h

# Clean old executions (via UI: Settings → Executions → Clear)
# Or clean Docker
docker system prune -a
```

---

## 📞 Support

**Technical Issues:**
- Contact: Rensto (Shai Friedman)
- Email: [your email]

**Server Issues:**
- RackNerd Support
- API Key: KPRVI-ZWX76-X7GEF

---

## 🎯 Next Steps

1. ✅ Install n8n (you are here)
2. ⏭️ Configure Google Sheets credentials
3. ⏭️ Configure Monday.com credentials
4. ⏭️ Import first workflow
5. ⏭️ Test workflow execution
6. ⏭️ Migrate remaining Make.com scenarios

---

## 📦 Installation Details

- **Version:** n8n Community Edition (latest)
- **Installation Method:** Docker Compose
- **Data Location:** `/home/ubuntu/n8n/data`
- **Backups:** Automatic daily at 3 AM
- **Backup Location:** `/home/ubuntu/n8n/backups`

---

**Installation Date:** _______________  
**Installed By:** _______________  
**First Login:** _______________  
**API Key Generated:** _______________

