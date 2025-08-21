# 🔧 Environment Variables Setup - Vercel Deployment

## **🚀 Your App is Live!**

**Production URL**: https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app

## **⚡ Quick Setup Steps**

### **Step 1: Access Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Find your project: `my-website`
3. Click on the project

### **Step 2: Add Environment Variables**
1. Go to **Settings** → **Environment Variables**
2. Add these variables:

```bash
# REQUIRED - Add these first
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rensto-prod
NEXTAUTH_URL=https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here

# OPTIONAL - Add these for full functionality
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
SENDGRID_API_KEY=your_sendgrid_api_key
```

### **Step 3: Redeploy**
After adding environment variables:
```bash
npx vercel@latest --prod
```

## **🎯 Test Your Deployment**

### **Admin Dashboard**
- **URL**: https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app/admin
- **Login**: admin@rensto.com / admin123

### **Customer Portals**
- **Shelly Mizrahi (Insurance)**: https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app/portal/shelly-mizrahi
- **Ben Ginati (AI Agents)**: https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app/portal/ben-ginati

### **Public Pages**
- **Landing**: https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app
- **Contact**: https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app/contact

## **🔧 MongoDB Atlas Setup**

### **Create Production Database**
1. Go to: https://cloud.mongodb.com
2. Create new cluster (M0 free tier works)
3. Create database user with read/write permissions
4. Get connection string and add to MONGODB_URI

### **Network Access**
- Add `0.0.0.0/0` to allow all IPs (or your Vercel IPs)

## **🎉 Success!**

Once environment variables are set:
- ✅ Admin dashboard will work
- ✅ Customer portals will function
- ✅ Database will be connected
- ✅ All features will be operational

**Your Rensto Business System is ready to generate revenue!**
