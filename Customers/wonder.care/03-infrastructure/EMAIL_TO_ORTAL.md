Hi Ortal! 👋

I've prepared complete n8n installation scripts for your RackNerd server, but there's one quick step you need to do first: **enable SSH access**.

## 🔑 Quick Fix (5 minutes):

The username/password you provided (vmuser275199 / mcEJVMG637) are for the **RackNerd control panel**, not SSH access to the server.

### To enable SSH:

**1. Log into RackNerd:**
   - Go to: https://my.racknerd.com/
   - Username: vmuser275199
   - Password: mcEJVMG637

**2. Open your server console:**
   - Click on "racknerd-0ab0933"
   - Click "Console" or "VNC" button
   - This opens a direct terminal to your server

**3. In the console, run these 3 commands:**

```bash
# Set root password
sudo passwd root
# Enter new password twice (make it strong!)

# Enable SSH password login
sudo sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart sshd
```

**4. Test SSH (from your computer):**
```bash
ssh root@192.227.249.73
# Enter the password you just created
```

---

## 🚀 Once SSH works, install n8n:

Just copy-paste this entire script and run it:

```bash
curl -o /tmp/install.sh https://raw.githubusercontent.com/[YOUR_REPO]/install-n8n.sh
chmod +x /tmp/install.sh
/tmp/install.sh
```

**OR** paste the complete installation script I sent in the DIY guide.

---

## 📦 What I've Prepared:

All scripts are ready in your `/Customers/wonder.care/03-infrastructure/` folder:
- ✅ Automated installer
- ✅ Verification script
- ✅ Backup system
- ✅ Complete documentation

**Installation time:** 5-10 minutes after SSH access works

---

## 🆘 Need Help?

**Can't get SSH working?**
- Use the RackNerd VNC console (works without SSH)
- Just run the installation script directly in the console

**Want me to do it?**
- Once SSH works, share the root password and I'll run the installation

**Questions?**
- Reply anytime!

---

Let me know once you've enabled SSH and we'll get n8n running! 🎉

- Shai (Rensto)

