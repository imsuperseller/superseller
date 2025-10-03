# Customer Portal System - AI-Powered Business Automation

## 🎯 **System Overview**

The Rensto Customer Portal is an AI-powered, personalized business automation platform where customers purchase and manage **n8n workflows as agents**. Each customer gets a unique portal with intelligent onboarding, automated credential management, and personalized AI assistance.

## 🏗️ **Core Architecture**

### **Agent = n8n Workflow**
- **Definition**: Every "agent" is actually an n8n workflow
- **Deployment**: Workflows are deployed to customer's n8n cloud instance
- **Management**: Centralized workflow management through Rensto's MCP servers
- **Customization**: Each workflow is customized per customer's business needs

### **Single Account Multi-tenant Setup**
```

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

### **Customer Journey Flow**

```
1. Customer Discovery → 2. Typeform Assessment → 3. AI Analysis → 4. Market Research → 5. Plan Generation → 6. Agreement → 7. Payment → 8. Workflow Creation → 9. Portal Access
```

## 🚀 **Portal Features**

### **1. Intelligent Onboarding Chat Agent**
- **Purpose**: Guides customers through initial setup
- **Capabilities**:
  - Explains n8n cloud setup process
  - Collects and validates credentials
  - Automatically configures customer's n8n instance
  - Provides step-by-step guidance
  - Learns customer preferences over time
  - Personalized communication style

### **2. Tinder-Style Typeform Integration**
- **Interface**: Questions in center, answers on sides
- **Smart Disappearing**: Unnecessary questions fade out
- **Language Selection**: Portal interface language preference
- **Dynamic Flow**: Questions adapt based on previous answers
- **Data Collection**: Comprehensive business assessment

### **3. AI-Powered Analysis Pipeline**
```
Typeform Submission → AI Analysis Agent → Market Research Agent → Plan Generation Agent → Customer Portal
```

#### **AI Analysis Agent**
- Analyzes customer responses
- Identifies business automation opportunities
- Determines optimal workflow configurations
- Generates technical requirements

#### **Market Research Agent**
- Researches industry competitors
- Analyzes market trends
- Identifies best practices
- Generates competitive insights

#### **Plan Generation Agent**
- Creates personalized automation plan
- Generates detailed proposals
- Calculates pricing and ROI
- Prepares agreement documents

### **4. Smart Agent Recommendations**
- **Active Agents**: Shows when credentials are complete
- **Suggested Agents**: AI-recommended based on business analysis
- **Progressive Disclosure**: Reveals more agents as customer progresses
- **Industry-Specific**: Tailored recommendations per industry

### **5. Real-Time Status Tracking**
- **Offer Status**: Pending signature, approved, etc.
- **Payment Status**: Invoice status, payment tracking
- **Workflow Status**: Creation progress, deployment status
- **Credential Status**: Setup completion, validation status

## 🎯 **Customer-Specific Features System**

### **Dynamic Feature Toggles**
Each customer sees only features relevant to their business type and industry:

#### **🎙️ Tax Services (Ben Ginati)**
```javascript
{
  industry: 'tax-services',
  features: {
    podcastManagement: true,      // 🎙️ Podcast automation
    wordpressAutomation: true,    // 🌐 Website content
    socialMediaAutomation: true,  // 📱 Social media
    contentGeneration: true,      // 📝 Content creation
    excelProcessing: false,       // ❌ Not relevant
    dataAnalysis: false           // ❌ Not relevant
  },
  agents: [
    'WordPress Content Agent',    // 📝 Website content
    'Blog Posts Agent',          // 📝 SEO blog posts
    'Podcast Agent',             // 🎙️ Podcast production
    'Social Media Agent'          // 📱 Social management
  ]
}
```

#### **📊 Insurance Services (Shelly Mizrahi)**
```javascript
{
  industry: 'insurance',
  features: {
    podcastManagement: false,     // ❌ Not relevant
    wordpressAutomation: false,   // ❌ Not relevant
    socialMediaAutomation: false, // ❌ Not relevant
    contentGeneration: false,     // ❌ Not relevant
    excelProcessing: true,        // 📊 Excel automation
    dataAnalysis: true,           // 📈 Data analysis
    documentManagement: true,     // 📄 Document handling
    clientManagement: true        // 👥 Client profiles
  },
  agents: [
    'Excel Processing Agent',     // 📊 File processing
    'Family Profile Generator'    // 👨‍👩‍👧‍👦 Profile creation
  ]
}
```

### **Dynamic Tab System**
```typescript
interface CustomerTab {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
  content: React.ComponentType;
}

// Tabs are dynamically rendered based on customer features
const getCustomerTabs = (features: CustomerFeatures): CustomerTab[] => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', visible: true },
    { id: 'tasks', label: 'Tasks', icon: '📋', visible: true },
    { id: 'agents', label: 'Agents', icon: '🤖', visible: true }
  ];
  
  // Add feature-specific tabs
  if (features.podcastManagement) {
    tabs.push({ id: 'podcasts', label: 'Podcasts', icon: '🎙️', visible: true });
  }
  
  if (features.excelProcessing) {
    tabs.push({ id: 'excel', label: 'Excel Processing', icon: '📊', visible: true });
  }
  
  return tabs;
};
```

## 💰 **Affiliate Integration System**

### **Automatic Affiliate Detection**
- **Node Analysis**: Scans n8n workflows for affiliate opportunities
- **Partner Programs**: Integrates with various affiliate networks
- **Commission Tracking**: Automatic commission calculation
- **Revenue Optimization**: Suggests affiliate opportunities

### **Current Affiliate Partners**
- **n8n PartnerStack**: Primary workflow automation affiliate
- **Future Partners**: JungleScout, Amazon Ads, etc.

## 🎨 **Portal Design & UX**

### **Modern Interface**
- **Rensto Brand**: Consistent with brand guidelines
- **Responsive Design**: Works on all devices
- **Dark Theme**: Primary interface with brand colors
- **Smooth Animations**: GSAP-powered interactions

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

### **Personalization Features**
- **Weather Integration**: Local weather affects interface
- **Learning System**: Adapts to customer behavior
- **Customizable Layout**: Customer can adjust interface
- **Language Support**: Multi-language interface

### **Marketing Integration**
- **Upselling**: Smart product recommendations
- **Cross-selling**: Related service suggestions
- **Retention**: Automated follow-up sequences
- **Referral System**: Customer referral tracking

## 📊 **Technical Implementation**

### **Database Schema**
```sql
-- Customer portal data
CREATE TABLE customer_portals (
  rgid TEXT PRIMARY KEY,
  customer_rgid TEXT REFERENCES customers(rgid),
  portal_url TEXT UNIQUE NOT NULL,
  interface_language TEXT DEFAULT 'en',
  theme_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent (workflow) assignments
CREATE TABLE customer_agents (
  rgid TEXT PRIMARY KEY,
  customer_rgid TEXT REFERENCES customers(rgid),
  agent_type TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  n8n_workflow_id TEXT,
  n8n_workflow_url TEXT,
  status TEXT DEFAULT 'pending',
  credentials_status TEXT DEFAULT 'incomplete',
  configuration JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Typeform responses
CREATE TABLE customer_assessments (
  rgid TEXT PRIMARY KEY,
  customer_rgid TEXT REFERENCES customers(rgid),
  typeform_response JSONB NOT NULL,
  ai_analysis JSONB,
  market_research JSONB,
  generated_plan JSONB,
  status TEXT DEFAULT 'pending',
  assessment_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
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

### **AI Agent Workflow**
```typescript
// AI Analysis Pipeline
interface AIAnalysisPipeline {
  typeformSubmission: TypeformResponse;
  aiAnalysis: BusinessAnalysis;
  marketResearch: MarketInsights;
  planGeneration: AutomationPlan;
  customerPortal: PortalUpdate;
}
```

## 🔄 **Automation Workflow**

### **1. Customer Onboarding**
```
Customer Signs Up → Typeform Assessment → AI Analysis → Plan Generation → Agreement → Payment → Workflow Creation → Portal Access
```

### **2. Agent Management**
```
Add Agent Button → Tinder Typeform → AI Analysis → Workflow Creation → n8n Deployment → Portal Update
```

### **3. Status Updates**
```
Real-time Monitoring → Status Updates → Customer Notifications → Slack Alerts → Portal Refresh
```

## 🔐 **Access Control & Security**

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

## 🛡️ **Security & Compliance**

### **Credential Management**
- **Secure Storage**: Encrypted credential storage
- **Automatic Configuration**: Credentials auto-configured in n8n
- **Access Control**: Role-based access permissions
- **Audit Logging**: Complete credential access tracking

### **Data Protection**
- **GDPR Compliance**: Customer data protection
- **Encryption**: End-to-end data encryption
- **Backup**: Automated data backup
- **Recovery**: Disaster recovery procedures

## 📈 **Analytics & Reporting**

### **Customer Analytics**
- **Usage Tracking**: Agent performance metrics
- **Business Impact**: ROI calculations
- **Customer Satisfaction**: Feedback collection
- **Retention Metrics**: Customer lifecycle tracking

### **Business Intelligence**
- **Sales Analytics**: Revenue tracking
- **Agent Performance**: Workflow success rates
- **Market Insights**: Industry trends
- **Optimization**: Continuous improvement

## 🔧 **Integration Points**

### **External Services**
- **n8n Cloud**: Workflow deployment
- **Typeform**: Assessment collection
- **QuickBooks**: Invoice generation
- **Slack**: Team notifications
- **PartnerStack**: Affiliate tracking

### **AI Services**
- **OpenAI**: Content generation
- **OpenRouter**: AI model access
- **HuggingFace**: Specialized AI models
- **Custom AI**: Rensto-specific AI agents

## 🚀 **Deployment Strategy**

### **Phase 1: Core Portal**
- Basic customer portal
- Typeform integration
- Simple agent management

### **Phase 2: AI Integration**
- AI analysis pipeline
- Smart recommendations
- Personalized experience

### **Phase 3: Advanced Features**
- Affiliate integration
- Advanced analytics
- Multi-language support

## 📋 **Implementation Checklist**

- [ ] Database schema implementation
- [ ] Customer portal UI development
- [ ] Typeform integration
- [ ] AI analysis pipeline
- [ ] n8n workflow deployment system
- [ ] Payment processing integration
- [ ] Affiliate tracking system
- [ ] Real-time status updates
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Security implementation
- [ ] Testing and validation

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

**This system transforms n8n workflows into personalized business automation agents, providing customers with intelligent, AI-powered business solutions.**


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)