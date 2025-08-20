# 🏗️ **MCP ARCHITECTURE OVERVIEW**

## 📋 **DUAL MCP IMPLEMENTATION**

Rensto operates **two separate MCP servers** for different purposes and revenue models.

---

## 🏠 **VPS MCP (Racknerd) - Internal Business Tools**

### **📍 Location**
- **Server**: `173.254.201.134` (Racknerd VPS)
- **Purpose**: Internal business operations
- **Users**: You and your team

### **💰 Revenue Model**
- **Primary**: n8n affiliate commissions
- **Secondary**: Workflow automation efficiency

### **🎯 Tools & Functions**
- **n8n Workflow Management**: Deploy, monitor, manage workflows
- **Affiliate Tracking**: Monitor n8n usage and commissions
- **Business Process Automation**: Internal operations
- **Customer Data Management**: Access to customer databases

### **🔧 Integration**
- **n8n**: Direct integration for workflow management
- **MongoDB**: Customer and business data
- **Racknerd Infrastructure**: Hosted on your VPS

---

## ☁️ **Cloudflare MCP - Customer Portal Tools**

### **📍 Location**
- **URL**: `https://customer-portal-mcp.service-46a.workers.dev`
- **Purpose**: Customer-facing services
- **Users**: Your customers

### **💰 Revenue Model**
- **Subscription**: $29/month per customer
- **Payment**: Stripe integration
- **Authentication**: Google OAuth

### **🎯 Tools & Functions**
1. **Onboarding Status Tool**: Check customer progress
2. **Missing Information Submission**: Self-service data updates
3. **Customer Support Q&A**: AI-powered support
4. **Progress Tracking**: Detailed onboarding monitoring

### **🔧 Integration**
- **Stripe**: Payment processing
- **Google OAuth**: User authentication
- **Cloudflare D1**: Database storage
- **Racknerd APIs**: Customer data access

---

## 🎯 **WHEN TO USE WHICH MCP**

### **Use VPS MCP (Racknerd) For:**
- ✅ Internal business operations
- ✅ n8n workflow management
- ✅ Customer data access
- ✅ Affiliate commission tracking
- ✅ Team collaboration tools

### **Use Cloudflare MCP For:**
- ✅ Customer onboarding support
- ✅ Customer self-service tools
- ✅ Subscription revenue generation
- ✅ Customer support automation
- ✅ External customer access

---

## 🚀 **IMPLEMENTATION STATUS**

### **VPS MCP (Racknerd)**
- **Status**: ✅ **OPERATIONAL**
- **Revenue**: Active n8n affiliate commissions
- **Tools**: Internal business tools ready
- **Next**: Enhance with additional VPS-specific tools

### **Cloudflare MCP**
- **Status**: ✅ **OPERATIONAL**
- **Revenue**: $29/month subscription model active
- **Tools**: 4 customer portal tools deployed
- **Next**: Customer onboarding and testing

---

## 📊 **REVENUE COMPARISON**

| Aspect | VPS MCP (Racknerd) | Cloudflare MCP |
|--------|-------------------|----------------|
| **Revenue Model** | Affiliate commissions | Subscription ($29/month) |
| **Revenue Source** | n8n usage | Customer subscriptions |
| **Scalability** | Limited by n8n usage | Unlimited by customer count |
| **Setup Cost** | VPS hosting | Cloudflare Workers |
| **Maintenance** | Self-managed | Cloudflare managed |

---

## 🔄 **WORKFLOW INTEGRATION**

### **Customer Journey**
1. **Customer signs up** → Cloudflare MCP handles onboarding
2. **Customer needs n8n** → VPS MCP manages n8n deployment
3. **Affiliate revenue** → VPS MCP tracks and reports
4. **Ongoing support** → Cloudflare MCP provides 24/7 assistance

### **Revenue Flow**
1. **Cloudflare MCP**: Generates $29/month subscriptions
2. **VPS MCP**: Generates n8n affiliate commissions
3. **Combined**: Multiple revenue streams from same customers

---

## 🎯 **NEXT STEPS**

### **VPS MCP Enhancement**
1. **Implement VPS-specific tools** for n8n management
2. **Add affiliate tracking tools** for commission monitoring
3. **Create business process tools** for internal operations

### **Cloudflare MCP Growth**
1. **Onboard first customers** using the 4 tools
2. **Monitor subscription revenue** in Stripe
3. **Scale customer base** for increased revenue

---

**🏗️ Both MCP servers are operational and ready for their respective purposes!**
