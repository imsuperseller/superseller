# ⚡ QUICK SETUP SCRIPT - Rensto Business System

## **🔧 COPY-PASTE ENVIRONMENT VARIABLES**

### **Step 1: MongoDB Atlas Setup**
1. Go to: https://cloud.mongodb.com
2. Create free account
3. Create cluster (M0 free tier)
4. Add network access: `0.0.0.0/0`
5. Create user: `rensto-admin` with password
6. Get connection string

### **Step 2: Vercel Environment Variables**
Go to: https://vercel.com/dashboard → your project → Settings → Environment Variables

**Add these EXACT variables:**

```bash
# REQUIRED - Copy these exactly
MONGODB_URI=mongodb+srv://rensto-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rensto-prod?retryWrites=true&w=majority
NEXTAUTH_URL=https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app
NEXTAUTH_SECRET=6Y253hlJR1ZYGLQlb6Uvsao/MnvRHLQbAEdlfCg7sxk=
```

**Replace in MONGODB_URI:**
- `YOUR_PASSWORD` = Your MongoDB Atlas user password
- `cluster0.xxxxx.mongodb.net` = Your actual cluster URL

### **Step 3: Redeploy**
```bash
cd web/rensto-site
npx vercel@latest --prod
```

### **Step 4: Test**
1. Go to: https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app/admin
2. Login: admin@rensto.com / admin123
3. Verify everything works!

---

## **🎯 EXACT STEPS TO FOLLOW**

### **MongoDB Atlas (5 minutes):**
1. **Sign up**: https://cloud.mongodb.com
2. **Create cluster**: M0 free tier, any region
3. **Network access**: Add `0.0.0.0/0`
4. **Database user**: Username `rensto-admin`, strong password
5. **Get connection string**: Copy from "Connect" button

### **Vercel (2 minutes):**
1. **Dashboard**: https://vercel.com/dashboard
2. **Project**: Click `my-website`
3. **Settings**: Environment Variables
4. **Add variables**: Copy the 3 required variables above
5. **Redeploy**: Run the redeploy command

### **Test (1 minute):**
1. **Admin**: https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app/admin
2. **Login**: admin@rensto.com / admin123
3. **Verify**: All features working

---

## **✅ SUCCESS INDICATORS**

- ✅ Admin dashboard loads without errors
- ✅ Customer data displays correctly
- ✅ No database connection errors
- ✅ All API endpoints working
- ✅ System fully operational

**🚀 Your Rensto Business System will be ready for customers!**
