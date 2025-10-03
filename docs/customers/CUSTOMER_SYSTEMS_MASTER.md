# CUSTOMER SYSTEMS MASTER DOCUMENTATION

## 📋 **OVERVIEW**
This document consolidates all customer systems and configurations across the entire business, including the new **Unified Lead Generation Machine**.

## 🎯 **UNIFIED LEAD GENERATION MACHINE**

### **Status**: Active
### **Files**: 4 core files + 15+ integrated systems
### **Location**: `/lead-machine-unified/`
### **Description**: Universal lead generation platform that consolidates all 15+ existing lead generation systems

#### **Core Components**:
- **Lead Generation Engine**: Multi-AI support (Gemini, Claude, OpenAI)
- **Web Scraping Engine**: Facebook, LinkedIn, websites, real estate
- **Data Processing**: Consolidation, cleaning, deduplication
- **API System**: RESTful API with 20+ endpoints
- **Customer Portals**: White-label portals for external customers

#### **Integrated Systems**:
- Local-IL Portal (Israeli professionals)
- Facebook Scraping (Apify integration)
- LinkedIn Scraping (Firecrawl integration)
- Real Estate Scraping (MLS data)
- Email Automation (BMAD processing)
- Social Media Agents (Facebook/LinkedIn)
- AI-Powered Systems (Multi-model)
- Data Processing (All formats)
- Customer-Specific Systems (Tax4Us, Ben Ginati, Shelly Mizrahi)

---

## 👥 **CUSTOMER SYSTEMS**

### **1. SHELLY MIZRAHI SYSTEM**
- **Status**: Active
- **Files**: 14
- **Newest Workflow**: ./scripts/create-shelly-workflow-via-mcp.js
- **Newest Config**: Not found
- **Conflicts**: 63

### **2. BEN GINATI SYSTEM**
- **Status**: Active
- **Files**: 52
- **Newest Workflow**: ./scripts/deploy-ben-ginati-cloud-workflows.js
- **Newest Config**: ./config/n8n/ben-ginati-config.json
- **Conflicts**: 151

### **3. OTHER CUSTOMER SYSTEMS**
- **Status**: Various
- **Files**: 41
- **Conflicts**: 806

## 🔄 **UNIFIED CUSTOMER ONBOARDING PROCESS**

### **Phase 1: Lead Intake**
1. Customer inquiry received
2. Initial assessment and qualification
3. Proposal generation and presentation

### **Phase 2: System Setup**
1. Customer-specific configuration
2. Workflow deployment
3. Integration testing

### **Phase 3: Deployment**
1. Production deployment
2. Training and handover
3. Ongoing support

## ⚙️ **SYSTEM CONFIGURATIONS**

### **n8n Workflows**
- Each customer gets dedicated n8n instance
- Custom webhook endpoints
- Customer-specific data processing

### **Make.com Scenarios**
- Customer-specific blueprints
- Custom API integrations
- Automated workflows

### **API Credentials**
- Secure credential management
- Customer-specific API keys
- Access control and monitoring

## 📊 **DEPLOYMENT STATUS**

### **Active Deployments**
- Shelly: Family Profile Generator (n8n + Make.com)
- Ben Ginati: Content Automation (WordPress + Social Media)

### **Pending Deployments**
- [List any pending customer deployments]

## 🔧 **TROUBLESHOOTING**

### **Common Issues**
1. **API Key Expiration**: Regular credential rotation
2. **Workflow Failures**: Automated monitoring and alerts
3. **Integration Issues**: Standardized testing procedures

### **Resolution Procedures**
1. Identify issue source
2. Apply standard fixes
3. Test and verify
4. Document resolution

## 📈 **PERFORMANCE METRICS**

### **System Health**
- Uptime monitoring
- Response time tracking
- Error rate monitoring

### **Customer Satisfaction**
- Regular feedback collection
- Performance reviews
- Continuous improvement

---
*Last Updated: 2025-08-22T16:58:03.206Z*
*Consolidated from 107 files*


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)