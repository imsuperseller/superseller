# 👥 Customer Portal Architecture
*Single source of truth for customer portal design*

## 🎯 **ARCHITECTURE OVERVIEW**

### **Single Account Multi-tenant Setup**
```
Your Vercel Domain: rensto-business-system.vercel.app

Customer Access:
├── Admin Dashboard: /admin
│   ├── Login: admin@rensto.com / admin123
│   ├── Customer Management
│   ├── Agent Control
│   ├── Analytics & Reporting
│   └── System Monitoring
│
├── Customer Portals:
│   ├── /portal/shelly-mizrahi
│   ├── /portal/ben-ginati
│   ├── /portal/[any-customer-slug]
│   └── Dynamic customer portals
│
└── Public Pages:
    ├── / (landing page)
    ├── /contact
    ├── /offers
    └── /knowledgebase
```

### **Data Architecture**
```
MongoDB (Multi-tenant Portal)
├── Organizations (multi-tenant)
├── Users (role-based access)
├── Agents (workflow configurations)
├── Agent Runs (execution logs)
└── Events (system events)
```

---

## 🚀 **CUSTOMER ONBOARDING PROCESS**

### **Step-by-Step Process**

#### **1. Admin Adds Customer**
- Admin accesses `/admin` dashboard
- Adds new customer via customer management interface
- System generates unique customer slug
- Creates customer-specific data collections

#### **2. System Generates Portal**
- Portal created at `/portal/[customer-slug]`
- Customer-specific data isolation implemented
- Role-based access control configured
- Initial agent templates deployed

#### **3. Customer Configuration**
- Customer accesses their portal
- Uses AI chat agent for credential setup guidance
- Configures n8n credentials manually in their n8n Cloud instance
- Tests workflow functionality

#### **4. System Activation**
- Customer activates agents via portal
- Real-time monitoring begins
- Analytics and reporting enabled
- Billing and subscription management activated

---

## 🏗️ **PORTAL FEATURES**

### **Dashboard Tab**
- **Overview Metrics**: Active agents, tasks completed, time saved, revenue impact
- **Recent Activity**: Latest workflow executions and system events
- **Quick Actions**: Upload files, process data, configure agents
- **Performance Charts**: Visual representation of system performance

### **Agents Tab**
- **Agent Management**: View, activate, deactivate agents
- **Agent Status**: Real-time status monitoring
- **Execution History**: Past workflow runs and results
- **Configuration**: Agent settings and parameters

### **Analytics Tab**
- **Performance Metrics**: System performance and efficiency
- **Usage Statistics**: Agent usage and execution patterns
- **Cost Analysis**: Resource usage and cost optimization
- **Trend Analysis**: Performance trends over time

### **Billing Tab**
- **Subscription Management**: Current plan and billing cycle
- **Payment History**: Past payments and invoices
- **Usage Tracking**: Resource usage and associated costs
- **Plan Upgrades**: Upgrade options and pricing

### **Support Tab**
- **AI Chat Agent**: Intelligent support and guidance
- **Documentation**: Help articles and tutorials
- **Troubleshooting**: Common issues and solutions
- **Contact Support**: Direct support channels

---

## 🔐 **ACCESS CONTROL & SECURITY**

### **Role-Based Permissions**

#### **Admin Role (Full Access)**
- ✅ **Customer Management**: Add, edit, delete customers
- ✅ **System Monitoring**: Monitor all customer instances
- ✅ **Agent Deployment**: Deploy workflows to any customer
- ✅ **Analytics Access**: View system-wide analytics
- ✅ **Billing Management**: Manage all customer billing

#### **Customer Role (Limited Access)**
- ✅ **Own Portal**: Access only their own portal
- ✅ **Agent Management**: Activate/deactivate own agents
- ✅ **Execution Monitoring**: Monitor own workflow executions
- ✅ **Billing Access**: View own billing information
- ❌ **Other Customers**: No access to other customer data

### **Data Isolation**
- **Collection-level isolation**: Each customer has separate data collections
- **Customer ID filtering**: All queries filtered by customer_id
- **Row-level security**: Database-level access control
- **Encrypted storage**: Sensitive data encrypted at rest

---

## 🎨 **DESIGN SYSTEM INTEGRATION**

### **Perfect Design System Implementation**
- **Brand Colors**: Rensto red, orange, blue, cyan
- **Typography**: Inter font family with responsive sizing
- **Animations**: GSAP timeline + CSS animations
- **Components**: ReactBits + Rensto branded components

### **Portal-Specific Components**
```typescript
// Customer Portal Header
<PortalHeader 
  customer={customer}
  logo={<RenstoLogo size="md" variant="gradient" />}
  status={<RenstoStatusIndicator status="online" />}
/>

// Agent Management Card
<AgentCard 
  agent={agent}
  onActivate={handleActivate}
  onDeactivate={handleDeactivate}
  status={<RenstoProgress value={agent.progress} />}
/>

// Analytics Dashboard
<AnalyticsDashboard 
  metrics={metrics}
  charts={<PerformanceCharts data={chartData} />}
  actions={<QuickActions />}
/>
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Route Structure**
```
src/app/
├── admin/
│   └── page.tsx              # Admin dashboard
├── portal/
│   ├── [customer-slug]/
│   │   └── page.tsx          # Customer portal
│   ├── ben-ginati/
│   │   └── page.tsx          # Ben's portal
│   └── shelly-mizrahi/
│       └── page.tsx          # Shelly's portal
└── layout.tsx                # Root layout
```

### **Data Models**
```typescript
interface Customer {
  _id: string;
  slug: string;
  name: string;
  email: string;
  organization: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

interface Agent {
  _id: string;
  customerId: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  lastRun?: Date;
  tasksCompleted: number;
  description: string;
}

interface AgentRun {
  _id: string;
  agentId: string;
  customerId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}
```

### **API Endpoints**
```typescript
// Customer Management
GET    /api/customers                    # List customers (admin)
POST   /api/customers                    # Create customer (admin)
GET    /api/customers/[slug]             # Get customer data
PUT    /api/customers/[slug]             # Update customer

// Agent Management
GET    /api/customers/[slug]/agents      # List customer agents
POST   /api/customers/[slug]/agents      # Create agent
PUT    /api/customers/[slug]/agents/[id] # Update agent
DELETE /api/customers/[slug]/agents/[id] # Delete agent

// Agent Execution
POST   /api/customers/[slug]/agents/[id]/run    # Run agent
GET    /api/customers/[slug]/agents/[id]/runs   # Get execution history
```

---

## 🚀 **DEPLOYMENT & SCALING**

### **Vercel Deployment**
- **Platform**: Vercel (recommended)
- **Command**: `npx vercel --prod`
- **Environment**: Configure in Vercel dashboard
- **Domain**: Custom domain setup available

### **Scaling Strategy**
- **Vertical Scaling**: Current MongoDB Atlas plan sufficient
- **Horizontal Scaling**: Future sharding for high-volume customers
- **Auto-scaling**: Automatic scaling based on usage metrics
- **Performance Monitoring**: Real-time performance tracking

### **Cost Structure**
```
Your Revenue Model:
├── Customer Subscriptions: $99-999/month per customer
├── Agent Services: $50-500/month per agent
├── Analytics Reports: $25-200/month per report
└── Custom Development: $100-1000/hour

Your Costs:
├── Vercel Pro: $20/month
├── MongoDB Atlas: $0-57/month
├── Stripe Fees: 2.9% + 30¢ per transaction
└── Other Services: $0-100/month
```

**Profit Margin**: 90%+ after infrastructure costs

---

## 🎯 **BEST PRACTICES**

### **Development Guidelines**
1. **Always use customer isolation**: Filter all data by customer_id
2. **Implement proper error handling**: Graceful error handling for all operations
3. **Use Rensto design system**: Consistent branding across all portals
4. **Optimize for performance**: Fast loading times and smooth interactions
5. **Test thoroughly**: Comprehensive testing for all customer scenarios

### **Security Guidelines**
1. **Validate all inputs**: Sanitize and validate all user inputs
2. **Implement rate limiting**: Prevent abuse and ensure fair usage
3. **Use secure authentication**: Proper session management and authentication
4. **Encrypt sensitive data**: Encrypt all sensitive customer data
5. **Regular security audits**: Periodic security reviews and updates

### **Maintenance Guidelines**
1. **Monitor system health**: Regular health checks and monitoring
2. **Update dependencies**: Keep all dependencies up to date
3. **Backup data regularly**: Automated backups for all customer data
4. **Document changes**: Maintain clear documentation of all changes
5. **Test deployments**: Thorough testing before production deployments

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **Portal Not Loading**
- Check customer slug in URL
- Verify customer exists in database
- Check customer status (active/inactive)
- Verify authentication and permissions

#### **Agent Not Working**
- Check agent status in database
- Verify n8n credentials are configured
- Check workflow execution logs
- Verify customer has sufficient credits/quota

#### **Data Not Syncing**
- Check database connection
- Verify API endpoints are working
- Check for network connectivity issues
- Verify data isolation is working correctly

---

**🎯 This is the single source of truth for customer portal architecture. All other customer portal files should be deleted to avoid confusion.**
