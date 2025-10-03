

---
# From: DEPLOYMENT_GUIDE.md
---

# Ortal's Lead Generation SaaS - Deployment Guide

## 🚀 Production Deployment

### 1. **Payment System** (`http://localhost:8088`)
- **File**: `payment.html` + `payment-server.js`
- **Features**: Stripe integration, subscription options, QuickBooks invoice generation
- **Domain**: `ortal-payment.rensto.com`

### 2. **Delivery System** (`http://localhost:8087`)
- **File**: `ortal-3cent-delivery.js` (current local version)
- **Production**: `production-delivery.js` (deployment-ready)
- **Domain**: `ortal-leads.rensto.com`

### 3. **SaaS Landing Page** (`http://localhost:8086`)
- **File**: `index.html` + `serve-saas.js`
- **Domain**: `ortal-saas.rensto.com`

## 📋 Deployment Checklist

### **Stripe Configuration**
```bash
# Set environment variables
export STRIPE_PUBLISHABLE_KEY="pk_live_your_actual_key"
export STRIPE_SECRET_KEY="sk_live_your_actual_key"
export STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

### **Domain Setup**
1. **ortal-payment.rensto.com** → Payment processing
2. **ortal-leads.rensto.com** → Lead delivery dashboard
3. **ortal-saas.rensto.com** → Marketing landing page

### **SSL Certificates**
- All domains need SSL certificates
- Use Cloudflare for automatic SSL

### **Data Files**
- Ensure lead data files are accessible at production paths
- Update file paths in `production-delivery.js`

## 🔧 Environment Variables

### **Payment Server** (`payment-server.js`)
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=3000
```

### **Delivery Server** (`production-delivery.js`)
```bash
PORT=3000
LEADS_DATA_PATH=/path/to/lead/data
```

## 📊 Current System Status

### **✅ Ready for Production:**
- Payment processing with Stripe
- Subscription management
- QuickBooks invoice generation
- Lead delivery dashboard
- CSV export functionality
- Phone numbers included in all leads

### **📞 Lead Data Includes:**
- **9,401 total leads**
- **3,382 NYC leads**
- **6,019 major US cities leads**
- **Email addresses + Phone numbers**
- **Ages 24-50, Israeli/Jewish community**
- **3¢ per lead pricing ($282.03 total)**

## 🎯 Payment Flow

1. **Customer visits** `ortal-saas.rensto.com`
2. **Fills out form** with lead requirements
3. **Redirected to** `ortal-payment.rensto.com`
4. **Chooses payment option:**
   - One-time: $282.03 (9,401 leads)
   - Subscription: $199/month (15,000 leads)
5. **Stripe processes payment**
6. **QuickBooks invoice generated**
7. **Redirected to** `ortal-leads.rensto.com/delivery`
8. **Access to lead dashboard and downloads**

## 💰 Pricing Structure

### **One-Time Purchase**
- **9,401 leads** at **3¢ each** = **$282.03**
- Includes email + phone numbers
- Immediate access to all leads

### **Monthly Subscription**
- **15,000 leads** per month = **$199/month**
- **Annual savings**: $2,500+ vs one-time purchases
- **62% below market rates**

## 🔄 Webhook Configuration

### **Stripe Webhooks**
- **Endpoint**: `https://ortal-payment.rensto.com/webhook`
- **Events**: `payment_intent.succeeded`, `invoice.payment_succeeded`
- **Purpose**: Handle payment confirmations and subscription renewals

## 📧 Email Integration

### **Invoice Emails**
- Sent automatically after successful payment
- Includes invoice details and delivery links
- Integration with email service (SendGrid, etc.)

## 🚀 Quick Deploy Commands

```bash
# Install dependencies
cd ortal-saas-landing
npm install

# Start payment server
npm start

# Start delivery server (separate terminal)
node production-delivery.js

# Start SaaS landing page (separate terminal)
node serve-saas.js
```

## 🌐 Production URLs

- **Landing Page**: `https://ortal-saas.rensto.com`
- **Payment**: `https://ortal-payment.rensto.com`
- **Delivery**: `https://ortal-leads.rensto.com`
- **Health Check**: `https://ortal-leads.rensto.com/health`

## 📱 Mobile Responsive

All pages are fully responsive and optimized for:
- Desktop
- Tablet
- Mobile devices

## 🔒 Security Features

- Stripe secure payment processing
- HTTPS/SSL encryption
- CORS protection
- Input validation
- Error handling

## 📈 Analytics Ready

Ready for integration with:
- Google Analytics
- Facebook Pixel
- Conversion tracking
- A/B testing

---

**Ready for production deployment!** 🎉


---
# From: DEPLOYMENT_GUIDE.md
---

# Tax4Us Portal Deployment Guide

## 🎯 Overview
This guide covers deploying the Next.js application with the Tax4Us portal functionality to production.

## ✅ Pre-Deployment Checklist
- [x] All Tax4Us n8n workflows are active
- [x] All API credentials are configured
- [x] Portal code is implemented and tested locally
- [x] Middleware and routing are configured
- [ ] Next.js application needs to be deployed

## 🚀 Deployment Options

```bash

# Deploy from the Next.js app directory
cd apps/web/rensto-site

```

### Option 2: Netlify
```bash
# Build the application
cd apps/web/rensto-site
npm run build

# Deploy to Netlify
npx netlify deploy --prod --dir=out
```

### Option 3: Custom Server
```bash
# Build the application
cd apps/web/rensto-site
npm run build

# Start production server
npm start
```

## 🔧 Environment Variables
Ensure these are set in your deployment platform:

```env
# n8n Configuration
N8N_TAX4US_URL=https://tax4usllc.app.n8n.cloud
N8N_TAX4US_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Other API Keys (if needed)
TAVILY_API_KEY=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
CAPTIVATE_API_KEY=cJ3zT4tcdgdRAhTf1tkJXOeS1O2LIyx2h01K8ag0
AIRTABLE_API_KEY=patnvGcDyEXcN6zbu.a5a237b0d3c661bc55cf83337a9128094dada5b58dcb145147fb89ecbbd779b3
```

## 🌐 DNS Configuration
After deployment, update DNS records to point to the new Next.js application:

1. **A Record**: Point `rensto.com` to your deployment IP
2. **CNAME Record**: Point `www.rensto.com` to your deployment domain
3. **Wait for propagation**: DNS changes can take 24-48 hours

## 🧪 Post-Deployment Testing

### 1. Test Portal Access
```bash
# Test the portal redirect
curl -I https://rensto.com/ben-ginati-portal

# Test direct portal access
curl -I https://rensto.com/portal/tax4us
```

### 2. Test API Endpoints
```bash
# Test customer configuration API
curl https://rensto.com/api/customers/tax4us/config
```

### 3. Test n8n Webhooks
```bash
# Test webhook endpoints (replace with actual webhook URLs)
curl -X POST https://tax4usllc.app.n8n.cloud/webhook/tax4us-podcast-agent \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 🔍 Monitoring Setup

### 1. Application Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor API response times
- Track portal usage metrics

### 2. n8n Workflow Monitoring
- Monitor workflow execution success rates
- Set up alerts for failed executions
- Track webhook response times

### 3. Infrastructure Monitoring
- Monitor server resources
- Track DNS resolution times
- Monitor SSL certificate expiration

## 🚨 Troubleshooting

### Portal Returns 404
- Check if Next.js app is deployed
- Verify DNS is pointing to correct server
- Check middleware configuration

### API Endpoints Not Working
- Verify environment variables are set
- Check API route implementations
- Test locally first

### n8n Webhooks Failing
- Verify webhook URLs are correct
- Check n8n workflow status
- Test webhook endpoints directly

## 📞 Support Contacts
- **Technical Issues**: Development team
- **n8n Issues**: Check n8n instance status
- **DNS Issues**: Domain registrar support

## 📋 Deployment Checklist
- [ ] Build Next.js application successfully
- [ ] Deploy to hosting platform
- [ ] Configure environment variables
- [ ] Update DNS records
- [ ] Test portal functionality
- [ ] Test API endpoints
- [ ] Test n8n webhooks
- [ ] Set up monitoring
- [ ] Document any issues
- [ ] Notify stakeholders of deployment

## 🎉 Success Criteria
- ✅ Portal accessible at https://rensto.com/ben-ginati-portal
- ✅ API endpoints responding correctly
- ✅ n8n workflows executing successfully
- ✅ No 404 errors on portal pages
- ✅ All monitoring systems operational
