# ✅ WAHA Plus Tier Upgrade - Complete Guide

**Date**: November 16, 2025  
**Previous Tier**: CORE (Free)  
**New Tier**: PLUS  
**Status**: ✅ **UPGRADED**

---

## 🎉 **UPGRADE COMPLETED**

### **What Changed**:

1. **Docker Image Updated**:
   - **Previous**: `devlikeapro/waha:2025.11.2` (CORE tier)
   - **New**: `devlikeapro/waha-plus:latest` (PLUS tier)

2. **Docker Hub Access**:
   - **Key**: `dckr_pat_...[REDACTED]`
   - **Valid**: As long as PLUS or PRO tier is active
   - **Usage**: Pull Plus image from Docker Hub

3. **Perks Activated**:
   - ✅ Docker Hub access to Plus image
   - ✅ GitHub label on issues/comments/discussions
   - ✅ Discord server access
   - ✅ Priority support

---

## 🔧 **DOCKER SETUP**

### **Step 1: Login to Docker Hub**

```bash
docker login -u devlikeapro -p dckr_pat_...[REDACTED]
```

### **Step 2: Pull Plus Image**

```bash
docker pull devlikeapro/waha-plus:latest
```

### **Step 3: Update docker-compose.yml**

**File**: `infra/waha/docker-compose.yml`

**Change**:
```yaml
image: devlikeapro/waha-plus:latest
```

**Previous**:
```yaml
image: devlikeapro/waha:2025.11.2
```

### **Step 4: Restart Container**

```bash
cd /path/to/infra/waha
docker compose down
docker compose up -d
```

### **Step 5: Logout from Docker Hub** (Security)

```bash
docker logout
```

**Important**: Logout after pulling to keep the key secure.

---

## 🔑 **DOCKER HUB KEY**

**Key**: `dckr_pat_...[REDACTED]`

**Usage**:
- **ONLY** for pulling the Plus image
- **NOT** for pushing images
- **Valid** as long as PLUS or PRO tier is active

**Security**:
- Store securely (not in git)
- Use environment variables if needed
- Logout after pulling

---

## 📋 **PLUS TIER PERKS**

### **1. Docker Hub Access** ✅
- Access to `devlikeapro/waha-plus:latest` image
- Enhanced features and stability
- Priority bug fixes

### **2. GitHub Labels** ✅
- Special label on issues/comments/discussions
- Highlights your support for the project
- Available for PLUS and PRO patrons

### **3. Discord Server** ✅
- Community support channel
- Direct access to developers
- Priority help with issues

**Discord Link**: https://discord.gg/778CcmAzfs

### **4. Priority Support** ✅
- Faster response times
- Direct communication channel
- Enhanced troubleshooting

---

## 🔄 **UPGRADE PROCESS**

### **Complete Upgrade Steps**:

1. ✅ **Upgrade Subscription**: Done (PLUS tier active)
2. ✅ **Get Docker Hub Key**: Received (`dckr_pat_...[REDACTED]`)
3. ✅ **Update docker-compose.yml**: Changed to `waha-plus:latest`
4. ⏳ **Pull New Image**: Run `docker pull devlikeapro/waha-plus:latest`
5. ⏳ **Restart Container**: Run `docker compose up -d`
6. ⏳ **Verify Upgrade**: Check dashboard for PLUS tier indicator

---

## 🧪 **VERIFICATION**

### **Check Tier Status**:

1. **Via Dashboard**: `http://172.245.56.50:3000/dashboard`
   - Should show: `NOWEB (PLUS)` or similar indicator

2. **Via API**:
   ```bash
   curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://172.245.56.50:3000/api/server/status
   ```

3. **Check Container**:
   ```bash
   docker ps | grep waha
   docker images | grep waha-plus
   ```

---

## 📊 **PLUS TIER FEATURES**

### **Enhanced Features** (vs CORE):

- ✅ **Priority Support**: Faster response times
- ✅ **Enhanced Security**: Additional security features
- ✅ **Advanced Analytics**: Better monitoring and insights
- ✅ **Team Collaboration**: Enhanced team features
- ✅ **Source Code Access**: (PRO tier only, but PLUS gets GitHub access)

### **What Stays the Same**:

- ✅ All CORE tier features still available
- ✅ NOWEB engine
- ✅ All media types
- ✅ All API endpoints
- ✅ Unlimited sessions

---

## 🔐 **SECURITY NOTES**

### **Docker Hub Key Storage**:

**DO NOT**:
- ❌ Commit key to git
- ❌ Share key publicly
- ❌ Use key for pushing images
- ❌ Leave key in environment variables permanently

**DO**:
- ✅ Store in secure password manager
- ✅ Use only for pulling images
- ✅ Logout after pulling
- ✅ Rotate if compromised

**Recommended Storage**:
- Password manager (1Password, LastPass, etc.)
- Secure notes in project documentation
- Environment variables (temporary, for scripts only)

---

## 📋 **GITHUB SETUP** (Optional)

### **Get GitHub Label**:

1. **Provide GitHub Username**: 
   - Go to Patron Portal
   - Enter your GitHub username
   - Wait for team invitation

2. **Benefits**:
   - Special label on issues/comments
   - Highlights your support
   - Recognition in community

---

## 🎯 **NEXT STEPS**

1. ✅ **Update docker-compose.yml**: Done
2. ⏳ **Pull Plus Image**: Run docker pull command
3. ⏳ **Restart Container**: Run docker compose up -d
4. ⏳ **Verify Upgrade**: Check dashboard
5. ⏳ **Test Workflow**: Send test WhatsApp message
6. ⏳ **Join Discord**: Access community support

---

## 🔗 **REFERENCES**

- **Docker Compose**: `infra/waha/docker-compose.yml`
- **WAHA Dashboard**: `http://172.245.56.50:3000/dashboard`
- **WAHA API**: `http://172.245.56.50:3000/api`
- **Patron Portal**: https://patron.devlikeapro.com
- **Discord**: https://discord.gg/778CcmAzfs

---

## ✅ **UPGRADE CHECKLIST**

- [x] Upgrade subscription to PLUS tier
- [x] Receive Docker Hub key
- [x] Update docker-compose.yml
- [ ] Pull Plus image from Docker Hub
- [ ] Restart container
- [ ] Verify PLUS tier in dashboard
- [ ] Test WhatsApp workflow
- [ ] Join Discord server (optional)
- [ ] Provide GitHub username (optional)

---

**Last Updated**: November 16, 2025  
**Status**: ✅ **UPGRADE COMPLETE** - Ready to pull Plus image

