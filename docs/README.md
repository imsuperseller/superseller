# 🚀 Rensto Business System
*Comprehensive Business Automation Platform*

## 📋 **OVERVIEW**

Rensto is a complete business automation platform that combines n8n workflows, AI agents, customer portals, and comprehensive business management tools. This system enables businesses to automate their operations, manage customers, and scale efficiently.

---

## 🏗️ **ARCHITECTURE**

### **Core Components**
- **Frontend**: Next.js 15.4.6 with TypeScript and Tailwind CSS
- **Backend**: Node.js with MongoDB for data storage
- **Automation**: n8n workflows for business process automation
- **AI Integration**: OpenAI GPT-4 and custom AI agents
- **Deployment**: Vercel for web application, VPS for n8n instances
- **Design**: Perfect Design System with ReactBits components and GSAP animations

### **System Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    RENSTO BUSINESS SYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)                                         │
│  ├── Admin Dashboard (/admin)                               │
│  ├── Customer Portals (/portal/[customer-slug])            │
│  ├── Public Pages (/, /contact, /offers)                   │
│  └── Perfect Design System                                  │
├─────────────────────────────────────────────────────────────┤
│  Backend (Node.js + MongoDB)                                │
│  ├── Customer Management                                    │
│  ├── Agent Management                                       │
│  ├── Analytics & Reporting                                  │
│  └── Billing & Payments                                     │
├─────────────────────────────────────────────────────────────┤
│  Automation (n8n)                                           │
│  ├── Rensto VPS Instance (Full API Access)                 │
│  ├── Customer Cloud Instances (Limited API Access)         │
│  └── MCP Server Integration                                 │
├─────────────────────────────────────────────────────────────┤
│  AI & Machine Learning                                      │
│  ├── OpenAI GPT-4 Integration                               │
│  ├── Custom AI Agents                                       │
│  └── Natural Language Processing                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 **DOCUMENTATION STRUCTURE**

### **🚀 Deployment & Operations**
- **[Development Guide](deployment/DEVELOPMENT_GUIDE.md)** - Single source of truth for development environment
- **[Production Guide](deployment/PRODUCTION_GUIDE.md)** - Production deployment and management
- **[DNS & Tunnel](deployment/DNS_AND_TUNNEL.md)** - Production tunnel setup
- **[Maintenance Plan](deployment/MAINTENANCE_PLAN.md)** - System maintenance procedures

### **🤖 n8n Workflow Management**
- **[Workflow Management](n8n/WORKFLOW_MANAGEMENT.md)** - Single source of truth for n8n operations
- **[MCP Server Guide](n8n/MCP_SERVER_GUIDE.md)** - MCP server configuration and usage
- **[API Reference](n8n/API_REFERENCE.md)** - n8n API documentation
- **[Credential Management](n8n/CREDENTIAL_MANAGEMENT.md)** - Credential setup and management

### **🎨 Design System**
- **[Perfect Design System](design/PERFECT_DESIGN_SYSTEM.md)** - Single source of truth for design implementation
- **[ReactBits Guide](design/REACTBITS_GUIDE.md)** - ReactBits component implementation
- **[Component Library](design/COMPONENT_LIBRARY.md)** - Component documentation
- **[Animation Guide](design/ANIMATION_GUIDE.md)** - GSAP and animation guide

### **👥 Customer Management**
- **[Portal Architecture](customers/PORTAL_ARCHITECTURE.md)** - Single source of truth for customer portal design
- **[Onboarding Guide](customers/ONBOARDING_GUIDE.md)** - Customer onboarding process
- **[Ben Ginati Status](customers/BEN_GINATI.md)** - Ben Ginati customer status
- **[Shelly Mizrahi Status](customers/SHELLY_MIZRAHI.md)** - Shelly Mizrahi customer status

### **🛠️ Technical Documentation**
- **[n8n Nodes Reference](technical/N8N_NODES_REFERENCE.md)** - n8n nodes documentation
- **[Database Architecture](technical/DATABASE_ARCHITECTURE.md)** - Database structure and design
- **[API Documentation](technical/API_DOCUMENTATION.md)** - API endpoints and usage
- **[Security Guide](technical/SECURITY_GUIDE.md)** - Security best practices

### **📋 Troubleshooting**
- **[Troubleshooting Guide](troubleshooting/TROUBLESHOOTING_GUIDE.md)** - Single source of truth for issue resolution
- **[Error Reference](troubleshooting/ERROR_REFERENCE.md)** - Common error solutions
- **[Debugging Guide](troubleshooting/DEBUGGING_GUIDE.md)** - Debugging procedures

---

## 🚀 **QUICK START**

### **Development Environment**
```bash
# Clone the repository
git clone [repository-url]
cd Rensto

# Install dependencies
cd web/rensto-site
npm install

# Start development server
npm run dev:reliable
```

### **Access URLs**
- **Admin Dashboard**: http://localhost:3000/admin
- **Customer Portal**: http://localhost:3000/portal
- **Rensto Components**: http://localhost:3000/rensto-components
- **React Bits Showcase**: http://localhost:3000/react-bits-showcase

### **Default Credentials**
- **Admin**: admin@rensto.com / admin123
- **Customer**: ben@tax4us.co.il / customer123

---

## 🎯 **KEY FEATURES**

### **Business Automation**
- **n8n Workflows**: Visual workflow builder with 400+ integrations
- **AI Agents**: Custom AI agents for specific business tasks
- **Process Automation**: Automated business processes and workflows
- **Real-time Monitoring**: Live monitoring of workflow executions

### **Customer Management**
- **Multi-tenant Architecture**: Single account, multiple customers
- **Customer Portals**: Personalized portals for each customer
- **Role-based Access**: Secure access control and permissions
- **Analytics Dashboard**: Comprehensive analytics and reporting

### **Design System**
- **Perfect Design System**: Iterative design method for perfect UI
- **ReactBits Components**: Modern React component library
- **GSAP Animations**: Professional timeline-based animations
- **Brand Consistency**: Consistent Rensto branding across all components

### **Deployment & Scaling**
- **Vercel Deployment**: Easy deployment and scaling
- **MongoDB Atlas**: Scalable database solution
- **Cloudflare Tunnel**: Secure access to n8n instances
- **Performance Monitoring**: Real-time performance tracking

---

## 🔧 **TECHNICAL STACK**

### **Frontend**
- **Framework**: Next.js 15.4.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4.x
- **Components**: ReactBits + Rensto branded components
- **Animations**: GSAP (GreenSock Animation Platform)

### **Backend**
- **Runtime**: Node.js 18+
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js
- **API**: RESTful API with TypeScript

### **Automation**
- **Workflow Engine**: n8n
- **AI Integration**: OpenAI GPT-4
- **MCP Servers**: Model Context Protocol servers
- **Webhooks**: Real-time integrations

### **Infrastructure**
- **Hosting**: Vercel (web app), VPS (n8n instances)
- **Database**: MongoDB Atlas
- **CDN**: Cloudflare
- **Monitoring**: Built-in monitoring and analytics

---

## 📊 **BUSINESS MODEL**

### **Revenue Streams**
- **Customer Subscriptions**: $99-999/month per customer
- **Agent Services**: $50-500/month per agent
- **Analytics Reports**: $25-200/month per report
- **Custom Development**: $100-1000/hour

### **Cost Structure**
- **Vercel Pro**: $20/month
- **MongoDB Atlas**: $0-57/month
- **Stripe Fees**: 2.9% + 30¢ per transaction
- **Other Services**: $0-100/month

**Profit Margin**: 90%+ after infrastructure costs

---

## 🎯 **DEVELOPMENT GUIDELINES**

### **Code Quality**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Testing**: Comprehensive test coverage

### **Design System**
- **Perfect Design System**: Use exclusively for new projects
- **Brand Colors**: Rensto red, orange, blue, cyan
- **Components**: Use Rensto branded components
- **Animations**: Implement GSAP animations

### **Architecture**
- **Single Sources of Truth**: One file per topic
- **Documentation**: Keep documentation updated
- **Security**: Follow security best practices
- **Performance**: Optimize for speed and efficiency

---

## 🚨 **IMPORTANT NOTES**

### **Terminal Issues**
If you encounter `posix_spawnp failed` errors:
- **Don't use terminal commands** for core fixes
- **Edit files directly** in your IDE
- **Use documented solutions** from this codebase
- **Focus on code changes** over process management

### **Documentation Organization**
- **Single Sources of Truth**: Each topic has one authoritative file
- **No Duplicates**: Conflicting files have been removed
- **Clear Structure**: Organized by topic and purpose
- **Easy Navigation**: Clear links and references

---

## 📞 **SUPPORT**

### **Documentation**
- **Troubleshooting Guide**: [docs/troubleshooting/TROUBLESHOOTING_GUIDE.md](troubleshooting/TROUBLESHOOTING_GUIDE.md)
- **Error Reference**: [docs/troubleshooting/ERROR_REFERENCE.md](troubleshooting/ERROR_REFERENCE.md)
- **Debugging Guide**: [docs/troubleshooting/DEBUGGING_GUIDE.md](troubleshooting/DEBUGGING_GUIDE.md)

### **Development**
- **Development Guide**: [docs/deployment/DEVELOPMENT_GUIDE.md](deployment/DEVELOPMENT_GUIDE.md)
- **Production Guide**: [docs/deployment/PRODUCTION_GUIDE.md](deployment/PRODUCTION_GUIDE.md)
- **Design System**: [docs/design/PERFECT_DESIGN_SYSTEM.md](design/PERFECT_DESIGN_SYSTEM.md)

---

**🎯 This is the main documentation hub for the Rensto Business System. All documentation is organized with single sources of truth to eliminate confusion and improve developer experience.**
