# 🚀 PRODUCTION ENVIRONMENT SETUP GUIDE

## **📋 PREREQUISITES**

### **Required Accounts:**
- ✅ **Vercel Account** - For deployment
- ✅ **MongoDB Atlas Account** - For database
- ✅ **Gmail/SMTP Account** - For email notifications
- ✅ **Domain Name** (Optional) - For custom domain

---

## **🗄️ STEP 1: MONGODB ATLAS SETUP**

### **1.1 Create MongoDB Atlas Account**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project called "Rensto Business System"

### **1.2 Create Database Cluster**
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select cloud provider (AWS/Google Cloud/Azure)
4. Choose region (closest to your users)
5. Click "Create"

### **1.3 Configure Network Access**
1. Go to "Network Access" tab
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### **1.4 Create Database User**
1. Go to "Database Access" tab
2. Click "Add New Database User"
3. Username: `rensto-admin`
4. Password: Generate a strong password
5. Role: "Atlas admin"
6. Click "Add User"

### **1.5 Get Connection String**
1. Go to "Database" tab
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

**Connection String Format:**
```
mongodb+srv://rensto-admin:<password>@cluster0.xxxxx.mongodb.net/rensto?retryWrites=true&w=majority
```

---

## **🌐 STEP 2: VERCEL DEPLOYMENT**

### **2.1 Connect to Vercel**
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your Rensto repository

### **2.2 Configure Project Settings**
1. **Framework Preset**: Next.js
2. **Root Directory**: `web/rensto-site`
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. **Install Command**: `npm install`

### **2.3 Set Environment Variables**
Add these environment variables in Vercel Dashboard:

#### **Database Configuration:**
```bash
MONGODB_URI=mongodb+srv://rensto-admin:<password>@cluster0.xxxxx.mongodb.net/rensto?retryWrites=true&w=majority
```

#### **Authentication Configuration:**
```bash
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=6Y253hlJR1ZYGLQlb6Uvsao/MnvRHLQbAEdlfCg7sxk=
```

#### **Email Configuration:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@rensto.com
```

#### **File Storage Configuration:**
```bash
UPLOAD_DIR=./uploads
```

#### **Optional Configuration:**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/
```

### **2.4 Deploy**
1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment is successful

---

## **📧 STEP 3: EMAIL CONFIGURATION**

### **3.1 Gmail Setup (Recommended)**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable "2-Step Verification"
3. Go to "App passwords"
4. Generate app password for "Mail"
5. Use this password in `SMTP_PASS`

### **3.2 Alternative SMTP Providers**
- **SendGrid**: Use SendGrid SMTP settings
- **Mailgun**: Use Mailgun SMTP settings
- **AWS SES**: Use AWS SES SMTP settings

### **3.3 Test Email Configuration**
After deployment, test email functionality:
1. Go to your deployed app
2. Create a new user account
3. Verify welcome email is received

---

## **📁 STEP 4: FILE STORAGE SETUP**

### **4.1 Local Storage (Development)**
For development, files are stored locally:
```bash
UPLOAD_DIR=./uploads
```

### **4.2 Cloud Storage (Production)**
For production, consider using:
- **AWS S3**: Scalable cloud storage
- **Google Cloud Storage**: Google's storage solution
- **Azure Blob Storage**: Microsoft's storage solution

### **4.3 File Upload Directory**
Ensure the upload directory exists:
```bash
mkdir -p uploads
chmod 755 uploads
```

---

## **🔒 STEP 5: SECURITY CONFIGURATION**

### **5.1 SSL/HTTPS**
- ✅ **Automatic with Vercel** - SSL certificates are auto-generated
- ✅ **Custom Domain** - SSL certificates are auto-generated for custom domains

### **5.2 Security Headers**
Already configured in `next.config.mjs`:
```javascript
headers: [
  {
    source: '/(.*)',
    headers: [
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
    ],
  },
],
```

### **5.3 Environment Variable Security**
- ✅ **Never commit secrets** - All secrets are in environment variables
- ✅ **Vercel encryption** - Environment variables are encrypted
- ✅ **Access control** - Only authorized users can access secrets

---

## **🌍 STEP 6: CUSTOM DOMAIN (OPTIONAL)**

### **6.1 Add Custom Domain**
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your custom domain
5. Follow DNS configuration instructions

### **6.2 DNS Configuration**
Add these DNS records:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### **6.3 Update Environment Variables**
Update `NEXTAUTH_URL` with your custom domain:
```bash
NEXTAUTH_URL=https://your-domain.com
```

---

## **📊 STEP 7: MONITORING & ANALYTICS**

### **7.1 Vercel Analytics**
- ✅ **Automatic** - Vercel provides built-in analytics
- ✅ **Performance** - Page load times and Core Web Vitals
- ✅ **Errors** - Error tracking and reporting

### **7.2 Error Tracking (Recommended)**
Consider adding:
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error tracking
- **Bugsnag**: Error monitoring and reporting

### **7.3 Health Checks**
Your app includes health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/setup/health` - Detailed system health

---

## **🧪 STEP 8: TESTING & VERIFICATION**

### **8.1 Pre-Deployment Checklist**
- ✅ **Build Success** - `npm run build` passes
- ✅ **Environment Variables** - All required variables set
- ✅ **Database Connection** - MongoDB Atlas accessible
- ✅ **Email Configuration** - SMTP settings correct
- ✅ **File Storage** - Upload directory configured

### **8.2 Post-Deployment Testing**
1. **Homepage** - Verify main page loads
2. **Authentication** - Test login/signup
3. **Admin Dashboard** - Verify admin functionality
4. **File Upload** - Test file upload/download
5. **Search** - Test global search functionality
6. **Email** - Verify email notifications work

### **8.3 Performance Testing**
- **Page Load Times** - Should be < 3 seconds
- **API Response Times** - Should be < 500ms
- **Bundle Size** - Should be < 100KB
- **Mobile Responsiveness** - Test on mobile devices

---

## **🚀 STEP 9: GO LIVE**

### **9.1 Final Verification**
- ✅ **All features working** - Email, file management, search
- ✅ **Security configured** - SSL, headers, environment variables
- ✅ **Performance optimized** - Fast load times, small bundle
- ✅ **Monitoring active** - Error tracking and analytics

### **9.2 User Onboarding**
1. **Create Admin Account** - Set up initial admin user
2. **Configure Organizations** - Set up customer organizations
3. **Test Customer Portal** - Verify customer access works
4. **Documentation** - Create user guides and help docs

### **9.3 Launch Checklist**
- ✅ **Domain configured** - Custom domain working
- ✅ **SSL active** - HTTPS working
- ✅ **Email working** - Notifications sending
- ✅ **File storage** - Uploads working
- ✅ **Search working** - Global search functional
- ✅ **Admin dashboard** - All admin features working
- ✅ **Customer portal** - Customer access working

---

## **📞 SUPPORT & MAINTENANCE**

### **Monitoring**
- **Vercel Dashboard** - Monitor deployment and performance
- **MongoDB Atlas** - Monitor database performance
- **Email Logs** - Monitor email delivery
- **Error Tracking** - Monitor application errors

### **Backup Strategy**
- **Database** - MongoDB Atlas provides automatic backups
- **Files** - Consider cloud storage for file backups
- **Code** - GitHub provides version control and backup

### **Updates & Maintenance**
- **Dependencies** - Regular security updates
- **Features** - Continuous feature development
- **Performance** - Regular performance optimization
- **Security** - Regular security audits

---

## **🎯 SUCCESS METRICS**

### **Technical Metrics:**
- ✅ **Uptime**: 99.9%+
- ✅ **Response Time**: < 500ms
- ✅ **Error Rate**: < 1%
- ✅ **Security**: 0 critical vulnerabilities

### **Business Metrics:**
- ✅ **User Onboarding**: Automated email flow
- ✅ **File Management**: Document handling capability
- ✅ **Search**: Content discovery functionality
- ✅ **Scalability**: Production-ready architecture

**🎯 Your Rensto Business System is now ready for production and customer use!**
