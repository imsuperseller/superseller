
## 📋 **OVERVIEW**


---

## 🏗️ **ARCHITECTURE COMPONENTS**

- **Domain**: `rensto.com`
- **Purpose**: Main business website, content management, marketing pages
- **Features**:
  - Professional landing pages
  - Blog and content management
  - SEO optimization
  - Contact forms
  - Brand showcase

- **Admin Dashboard**: `admin.rensto.com`
- **Customer Portal**: `portal.rensto.com`
- **API Services**: `api.rensto.com`
- **Purpose**: Business operations, user management, data processing

---

## 🔧 **TECHNICAL CONFIGURATION**

```json
{
  "siteId": "66c7e551a317e0e9c9f906d8",
  "apiToken": "fd74dac2e8dc23c2e8047d7854be9e303afe85249301b14a91b657b36d1759ed",
  "clientId": "b77ecda6a3e0feba68ad9c75c1b18cf0fb71d8859c7e4ada713d228e4da73716",
  "clientSecret": "fd74dac2e8dc23c2e8047d7854be9e303afe85249301b14a91b657b36d1759ed"
}
```

### **DNS Configuration**
```json
{
}
```

### **MCP Server Integration**
- **Status**: ✅ **ACTIVE AND RUNNING**
- **Tools Available**: CMS management, site configuration, content operations

---

## 📁 **PROJECT STRUCTURE**

```
rensto/
│   ├── Main landing pages
│   ├── Blog and content
│   ├── Contact forms
│   └── SEO optimization
│
│   ├── admin.rensto.com/
│   │   ├── Dashboard interface
│   │   ├── User management
│   │   └── Business analytics
│   │
│   ├── portal.rensto.com/
│   │   ├── Customer login
│   │   ├── Project management
│   │   └── File sharing
│   │
│   └── api.rensto.com/
│       ├── REST API endpoints
│       ├── Authentication
│       └── Data processing
│
└── 🔧 Infrastructure
    ├── MCP servers (Racknerd VPS)
    ├── DNS management (Cloudflare)
    └── Integration workflows (n8n)
```

---

## 🔗 **INTEGRATION WORKFLOWS**

### **Content Management Flow**
2. **Data Sync**: MCP server syncs content to Airtable
4. **Real-time Updates**: Webhooks trigger application updates

### **User Management Flow**
1. **Authentication**: Centralized auth system
2. **Role Management**: Admin vs Customer access
3. **Data Access**: Secure API endpoints
4. **Analytics**: Cross-platform user tracking

---

## 🚀 **DEPLOYMENT PROCESS**

- **Automatic**: Changes publish immediately
- **Version Control**: Built-in versioning
- **Custom Domain**: rensto.com configured
- **SSL**: Automatic HTTPS

- **Git Integration**: Automatic deployments from Git
- **Preview Deployments**: Branch-based previews
- **Custom Domains**: Subdomains configured
- **Edge Functions**: Serverless API endpoints

---

## 🔐 **SECURITY & AUTHENTICATION**

### **Cross-Domain Authentication**
- **Single Sign-On**: Unified login across platforms
- **JWT Tokens**: Secure token-based authentication
- **CORS Configuration**: Proper cross-origin setup
- **API Security**: Rate limiting and validation

### **Data Protection**
- **Encryption**: All data encrypted in transit
- **Access Control**: Role-based permissions
- **Audit Logging**: Complete access tracking
- **Backup Strategy**: Automated data backups

---

## 📊 **MONITORING & ANALYTICS**

### **Performance Monitoring**
- **Uptime Monitoring**: 24/7 availability tracking
- **Error Tracking**: Comprehensive error logging

### **Business Analytics**
- **User Behavior**: Cross-platform user tracking
- **Conversion Tracking**: Lead and customer tracking

---

## 🔄 **MAINTENANCE & UPDATES**

### **Regular Maintenance**
- **Security Updates**: Monthly security patches
- **Performance Optimization**: Quarterly performance reviews
- **Content Updates**: Weekly content reviews
- **Backup Verification**: Monthly backup testing

### **Update Procedures**
1. **Development**: Local development and testing
3. **Production**: Automated production deployment
4. **Verification**: Post-deployment testing

---

## 📋 **NEXT STEPS**

### **Immediate Actions**
1. ✅ **DNS Configuration**: Complete
2. ✅ **MCP Server Setup**: Complete

### **Short-term Goals**
1. **Authentication System**: Implement SSO
2. **API Development**: Build REST API endpoints
4. **Integration Testing**: Test cross-platform workflows

### **Long-term Goals**
1. **Advanced Analytics**: Implement comprehensive tracking
2. **Automation**: Expand n8n workflows
3. **Scalability**: Optimize for growth
4. **Performance**: Continuous optimization

---

## 🛠️ **TROUBLESHOOTING**

### **Common Issues**
- **DNS Propagation**: Allow 24-48 hours for full propagation
- **CORS Errors**: Ensure proper CORS configuration
- **Authentication**: Verify JWT token configuration

### **Support Resources**
- **MCP Server**: Deployed on Racknerd VPS
- **Cloudflare DNS**: Managed via Cloudflare dashboard

---

## 📞 **CONTACT & SUPPORT**

- **Technical Issues**: Check MCP server logs on Racknerd VPS
- **DNS Management**: Use Cloudflare dashboard

---

*Last Updated: August 29, 2025*
*Architecture Version: 1.0*


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)