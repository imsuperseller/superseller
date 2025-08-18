# 🔧 MongoDB Atlas Production Setup - Rensto Business System

## **🚀 STEP-BY-STEP MONGODB ATLAS CONFIGURATION**

### **Step 1: Create MongoDB Atlas Account**
1. Go to: https://cloud.mongodb.com
2. Click "Try Free" or "Sign Up"
3. Create account with your email
4. Verify email address

### **Step 2: Create Production Cluster**
1. **Choose Plan**: Select "FREE" tier (M0) - perfect for starting
2. **Cloud Provider**: Choose AWS, Google Cloud, or Azure
3. **Region**: Select closest to your users (e.g., US East for US customers)
4. **Cluster Name**: `rensto-production`
5. Click "Create"

### **Step 3: Configure Network Access**
1. Go to **Network Access** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### **Step 4: Create Database User**
1. Go to **Database Access** in left sidebar
2. Click **"Add New Database User"**
3. **Username**: `rensto-admin`
4. **Password**: Generate strong password (save this!)
5. **User Privileges**: Select "Read and write to any database"
6. Click **"Add User"**

### **Step 5: Get Connection String**
1. Go to **Clusters** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 5.0 or later
6. Copy the connection string

### **Step 6: Format Connection String**
Replace the connection string with your credentials:
```
mongodb+srv://rensto-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rensto-prod?retryWrites=true&w=majority
```

**Save this connection string - you'll need it for Vercel!**

---

## **🔧 VERCEL ENVIRONMENT VARIABLES SETUP**

### **Step 1: Access Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Find your project: `my-website`
3. Click on the project

### **Step 2: Add Environment Variables**
1. Go to **Settings** → **Environment Variables**
2. Add these variables one by one:

#### **Required Variables:**
```bash
# Database Connection
MONGODB_URI=mongodb+srv://rensto-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rensto-prod?retryWrites=true&w=majority

# Authentication
NEXTAUTH_URL=https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here

# Generate a strong secret key:
# Run this in terminal: openssl rand -base64 32
```

#### **Optional Variables (for full functionality):**
```bash
# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@your-domain.com

# Security
CORS_ORIGIN=https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### **Step 3: Redeploy Application**
After adding environment variables:
```bash
cd web/rensto-site
npx vercel@latest --prod
```

---

## **🎯 TEST YOUR SETUP**

### **Step 1: Test Database Connection**
1. Go to your app: https://my-website-5mpm4ql37-shais-projects-f9b9e359.vercel.app
2. Navigate to `/admin`
3. Login with: admin@rensto.com / admin123
4. Check if data loads properly

### **Step 2: Test Customer Portal**
1. Go to: `/portal/shelly-mizrahi`
2. Verify customer data displays
3. Check if all features work

### **Step 3: Test API Endpoints**
1. Test: `/api/organizations`
2. Test: `/api/agents`
3. Test: `/api/analytics/metrics`

---

## **🔍 TROUBLESHOOTING**

### **Common Issues:**

#### **Database Connection Error:**
- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify username/password in connection string
- Ensure cluster is running

#### **Authentication Error:**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure environment variables are saved

#### **Deployment Issues:**
- Check Vercel deployment logs
- Verify all environment variables are set
- Ensure no syntax errors in connection string

---

## **✅ SUCCESS CHECKLIST**

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied and formatted
- [ ] Environment variables added to Vercel
- [ ] Application redeployed
- [ ] Admin dashboard accessible
- [ ] Customer portal working
- [ ] API endpoints responding

**🎉 Once complete, your Rensto Business System will be fully operational and ready for customers!**
