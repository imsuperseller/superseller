# Wonder.Care n8n Infrastructure

**Customer:** Ortal Flanary  
**Company:** Wonder.Care  
**Server:** RackNerd VPS (racknerd-0ab0933)  
**IP:** 192.227.249.73  

---

## 📁 Files in This Directory

| File | Purpose | Usage |
|------|---------|-------|
| **n8n-installation-guide.md** | Complete installation guide with detailed steps | Read first for understanding |
| **install-n8n.sh** | Automated installation script | Run on server: `./install-n8n.sh` |
| **verify-n8n.sh** | Installation verification script | Run after install: `./verify-n8n.sh` |
| **QUICK_START.md** | Fast installation reference | Quick copy-paste commands |
| **README.md** | This file | Overview and navigation |

---

## 🚀 Installation Process

### Method 1: Automated (Recommended)

1. **Copy script to server:**
   ```bash
   scp install-n8n.sh ubuntu@192.227.249.73:/tmp/
   ```

2. **SSH to server:**
   ```bash
   ssh ubuntu@192.227.249.73
   ```

3. **Run installer:**
   ```bash
   chmod +x /tmp/install-n8n.sh
   /tmp/install-n8n.sh
   ```

4. **Verify installation:**
   ```bash
   # Copy verification script
   scp verify-n8n.sh ubuntu@192.227.249.73:/tmp/
   
   # Run it
   chmod +x /tmp/verify-n8n.sh
   /tmp/verify-n8n.sh
   ```

### Method 2: Manual

Follow the step-by-step guide in `n8n-installation-guide.md`

---

## ✅ Post-Installation Checklist

- [ ] n8n accessible at http://192.227.249.73:5678
- [ ] Owner account created (ortal@wonder.care)
- [ ] API key generated and saved securely
- [ ] Automatic backups configured (daily 3 AM)
- [ ] Firewall rules configured
- [ ] First test workflow created and executed
- [ ] Google Sheets credentials configured
- [ ] Monday.com credentials configured
- [ ] First production workflow migrated from Make.com

---

## 📊 Server Specifications

**Hardware:**
- CPU: KVM Virtual CPU
- RAM: 4 GB
- Disk: 130 GB SSD
- Bandwidth: 2.93 TB/month
- Location: Dallas (DAL175KVM)

**Software:**
- OS: Ubuntu 24.04 LTS
- Docker: Latest
- Docker Compose: Latest
- n8n: Community Edition (latest)

**Network:**
- IPv4: 192.227.249.73
- Open Ports: 22 (SSH), 5678 (n8n), 80 (HTTP), 443 (HTTPS)

---

## 🔑 Access Information

**Server SSH:**
```bash
ssh ubuntu@192.227.249.73
```

**n8n UI:**
```
http://192.227.249.73:5678
```

**n8n API:**
```
http://192.227.249.73:5678/api/v1
```

**Webhooks:**
```
http://192.227.249.73:5678/webhook/{path}
```

**RackNerd Panel:**
- API Key: KPRVI-ZWX76-X7GEF
- API Hash: 1cfb36cef451d82978b46aba19891f22b2e81dc7

---

## 🛠️ Common Commands

```bash
# SSH to server
ssh ubuntu@192.227.249.73

# n8n directory
cd /home/ubuntu/n8n

# View logs
docker-compose logs -f n8n

# Restart n8n
docker-compose restart

# Stop n8n
docker-compose stop

# Start n8n
docker-compose start

# Update n8n
docker-compose pull && docker-compose up -d

# Check status
docker-compose ps

# Check resource usage
docker stats n8n-wondercare

# Manual backup
./backup.sh

# Check disk space
df -h

# Check backups
ls -lh backups/
```

---

## 📦 Directory Structure

```
/home/ubuntu/n8n/
├── docker-compose.yml     # Docker configuration
├── backup.sh             # Backup script (runs daily)
├── data/                # n8n data (workflows, credentials, etc.)
├── backups/             # Automatic backups (kept 7 days)
└── logs/                # Application logs
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
7. Document changes

---

## 📈 Monitoring & Maintenance

**Daily:**
- Check n8n is running: `docker ps | grep n8n`
- Review failed executions in n8n UI

**Weekly:**
- Review resource usage: `docker stats n8n-wondercare`
- Check disk space: `df -h`
- Review logs for errors: `docker-compose logs --tail=100 n8n`

**Monthly:**
- Update n8n: `cd /home/ubuntu/n8n && docker-compose pull && docker-compose up -d`
- Review and clean old backups: `ls -lh /home/ubuntu/n8n/backups/`
- Review execution history (in n8n UI: Settings → Executions)

**Automatic:**
- Daily backups at 3 AM
- Execution data pruned after 7 days (configured in docker-compose.yml)

---

## 🚨 Troubleshooting

### n8n Won't Start

```bash
# Check logs
cd /home/ubuntu/n8n
docker-compose logs --tail=100 n8n

# Check if port is in use
sudo lsof -i :5678

# Restart Docker
sudo systemctl restart docker
docker-compose up -d
```

### Cannot Access UI

1. Check firewall: `sudo ufw status`
2. Check container: `docker ps | grep n8n`
3. Check logs: `docker-compose logs n8n`
4. Try accessing from server: `curl -I http://localhost:5678`

### Out of Disk Space

```bash
# Check disk usage
df -h
du -sh /home/ubuntu/n8n/*

# Clean old backups
find /home/ubuntu/n8n/backups -name "*.tar.gz" -mtime +7 -delete

# Clean Docker
docker system prune -a

# Clean old executions (via n8n UI: Settings → Executions)
```

### High CPU/Memory Usage

```bash
# Check resource usage
docker stats n8n-wondercare

# Review active workflows
# Disable resource-intensive workflows temporarily
# Check for infinite loops in workflow logic
```

---

## 📞 Support Contacts

**Rensto (Technical Support):**
- Contact: Shai Friedman
- For: n8n installation, workflows, migration

**RackNerd (Server Support):**
- API Key: KPRVI-ZWX76-X7GEF
- For: Server issues, network issues

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [n8n YouTube Channel](https://www.youtube.com/@n8nio)
- [Docker Documentation](https://docs.docker.com/)

---

## 📝 Change Log

| Date | Change | By |
|------|--------|-----|
| [Date] | Initial installation | Rensto |
| [Date] | First workflow migrated | [Name] |
| [Date] | SSL configured | [Name] |

---

**Last Updated:** [Date]  
**Installed By:** [Name]  
**Current n8n Version:** [Version]

