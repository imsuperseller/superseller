# 👨‍💼 Email Persona 6: Quinn Williams - Finance

## 📊 **OVERVIEW**

**Status**: ❌ **MISSING - NEEDS IMPLEMENTATION**  
**Persona**: Quinn Williams  
**Role**: Finance Manager  
**Email**: `quinn.williams@rensto.com`  
**Shared Mailbox**: `finance@rensto.com`

## 🎯 **PURPOSE**

Quinn Williams handles all finance communications, including:
1. **Invoice Processing** - Invoice generation, payment tracking, and billing inquiries
2. **Payment Issues** - Payment problems, failed transactions, and refund requests
3. **Financial Reporting** - Financial reports, analytics, and budget planning
4. **Billing Inquiries** - Subscription management, pricing questions, and billing disputes
5. **Financial Planning** - Budget planning, cost analysis, and financial forecasting

## 🔧 **EMAIL AUTOMATION WORKFLOW**

### **Planned n8n Workflow Structure**
```
Email Webhook → Content Analysis → Persona Identification → Quinn Williams Handler → Financial Analysis → Response Generation → Email Send → Airtable Update
```

### **Detailed Workflow Configuration**

#### **1. Email Webhook Trigger**
- **Type**: `n8n-nodes-base.webhook`
- **Method**: POST
- **Path**: `email-webhook`
- **Purpose**: Receives emails from service@rensto.com

#### **2. Content Analysis**
- **Type**: `n8n-nodes-base.function`
- **Purpose**: Analyzes email content for finance keywords
- **Keywords**: `invoice`, `payment`, `financial`, `billing`, `money`, `cost`, `budget`, `refund`

#### **3. Persona Identification**
- **Type**: `n8n-nodes-base.function`
- **Purpose**: Routes emails to Quinn Williams based on content analysis
- **Confidence Threshold**: 0.96 for finance topics

#### **4. Quinn Williams Handler**
- **Type**: `n8n-nodes-base.function`
- **Purpose**: Processes finance emails
- **Actions**:
  - Analyze financial requests
  - Generate financial reports
  - Process payment issues
  - Create billing solutions

#### **5. Financial Analysis**
- **Type**: `n8n-nodes-base.function`
- **Purpose**: Analyzes financial data and generates insights
- **Analysis**:
  - Payment status analysis
  - Financial report generation
  - Cost analysis and optimization
  - Budget planning and forecasting

#### **6. Response Generation**
- **Type**: `n8n-nodes-base.function`
- **Purpose**: Generates finance responses
- **Templates**: Invoice processing, payment issues, financial reports, billing inquiries

#### **7. Email Send**
- **Type**: `n8n-nodes-base.gmail`
- **Operation**: `send`
- **From**: `quinn.williams@rensto.com`
- **Purpose**: Sends finance responses

#### **8. Airtable Update**
- **Type**: `n8n-nodes-base.airtable`
- **Resource**: `record`
- **Operation**: `create`
- **Table**: `Finance Requests`
- **Purpose**: Logs all finance interactions

## 📧 **EMAIL TEMPLATES**

### **Invoice Processing Template**
```
Subject: Re: [Original Subject] - Invoice Processing Update 💰

Hi [Contact Name],

Thank you for reaching out about your invoice. I'm Quinn Williams, Finance Manager at Rensto, and I'm here to help you with your billing needs.

**Invoice Analysis:**
Based on your request, I've analyzed:
✅ **Invoice Status**: [Current invoice status]
✅ **Payment History**: [Payment history analysis]
✅ **Outstanding Balance**: [Outstanding amount]
✅ **Payment Options**: [Available payment methods]

**Invoice Details:**
- **Invoice Number**: [Invoice number]
- **Invoice Date**: [Invoice date]
- **Due Date**: [Due date]
- **Amount**: [Invoice amount]
- **Status**: [Payment status]

**Payment Options:**
1. **Online Payment**: [Payment portal link]
2. **Bank Transfer**: [Bank transfer details]
3. **Credit Card**: [Credit card payment link]
4. **Payment Plan**: [Payment plan options]

**Payment Processing:**
- **Processing Time**: [Processing timeframes]
- **Confirmation**: [Payment confirmation process]
- **Receipt**: [Receipt generation]

**Next Steps:**
1. **Payment Processing**: [Payment processing steps]
2. **Confirmation**: [Payment confirmation]
3. **Receipt**: [Receipt delivery]
4. **Account Update**: [Account status update]

**Payment Support:**
If you need assistance with payment processing, I'm here to help. You can also:
- **Payment Portal**: [Self-service payment portal]
- **Payment History**: [Payment history access]
- **Billing Support**: [Billing support contact]

I'm available to assist with any payment-related questions or concerns.

Best regards,
Quinn Williams
Finance Manager
Rensto
```

### **Payment Issue Template**
```
Subject: Re: [Original Subject] - Payment Issue Resolution 💳

Hi [Contact Name],

Thank you for reaching out about your payment issue. I'm Quinn Williams, Finance Manager, and I'm here to help you resolve this quickly.

**Payment Issue Analysis:**
Based on your report, I've analyzed:
✅ **Issue Type**: [Payment issue classification]
✅ **Root Cause**: [Root cause analysis]
✅ **Impact Assessment**: [Impact on account status]
✅ **Resolution Plan**: [Resolution strategy]

**Issue Details:**
- **Issue Type**: [Specific issue type]
- **Date Occurred**: [Issue date]
- **Amount Affected**: [Amount involved]
- **Current Status**: [Current resolution status]

**Resolution Steps:**
1. **Immediate Action**: [Immediate resolution steps]
2. **Account Protection**: [Account protection measures]
3. **Payment Processing**: [Payment processing steps]
4. **Confirmation**: [Resolution confirmation]

**Payment Options:**
- **Retry Payment**: [Payment retry process]
- **Alternative Payment**: [Alternative payment methods]
- **Payment Plan**: [Payment plan options]
- **Refund Process**: [Refund process if applicable]

**Account Status:**
- **Current Status**: [Account status]
- **Service Impact**: [Service impact assessment]
- **Resolution Timeline**: [Expected resolution time]

**Prevention Measures:**
- **Payment Method Update**: [Payment method update process]
- **Automatic Payments**: [Automatic payment setup]
- **Payment Alerts**: [Payment alert configuration]

**Next Steps:**
1. **Issue Resolution**: [Resolution steps]
2. **Account Update**: [Account status update]
3. **Prevention Setup**: [Prevention measures]
4. **Follow-up**: [Follow-up communication]

I'm committed to resolving this issue quickly and ensuring your account remains in good standing.

Best regards,
Quinn Williams
Finance Manager
Rensto
```

### **Financial Report Template**
```
Subject: Re: [Original Subject] - Financial Report & Analysis 📊

Hi [Contact Name],

Thank you for requesting financial information. I'm Quinn Williams, Finance Manager, and I'm here to provide you with comprehensive financial insights.

**Financial Analysis:**
Based on your request, I've prepared:
✅ **Financial Summary**: [Financial overview]
✅ **Revenue Analysis**: [Revenue breakdown]
✅ **Cost Analysis**: [Cost structure analysis]
✅ **Performance Metrics**: [Key performance indicators]

**Financial Summary:**
[Detailed financial summary with key metrics]

**Revenue Analysis:**
- **Total Revenue**: [Revenue amount]
- **Revenue Growth**: [Growth percentage]
- **Revenue Sources**: [Revenue source breakdown]
- **Revenue Trends**: [Revenue trend analysis]

**Cost Analysis:**
- **Total Costs**: [Total cost amount]
- **Cost Breakdown**: [Cost category breakdown]
- **Cost Optimization**: [Cost optimization opportunities]
- **Cost Trends**: [Cost trend analysis]

**Performance Metrics:**
- **Profit Margin**: [Profit margin percentage]
- **ROI**: [Return on investment]
- **Cash Flow**: [Cash flow analysis]
- **Financial Health**: [Financial health indicators]

**Budget Planning:**
- **Current Budget**: [Current budget status]
- **Budget Performance**: [Budget performance analysis]
- **Budget Recommendations**: [Budget optimization recommendations]
- **Future Planning**: [Future budget planning]

**Financial Forecasting:**
- **Revenue Forecast**: [Revenue projections]
- **Cost Forecast**: [Cost projections]
- **Profit Forecast**: [Profit projections]
- **Risk Assessment**: [Financial risk analysis]

**Recommendations:**
1. [Financial recommendation 1]
2. [Financial recommendation 2]
3. [Financial recommendation 3]

**Next Steps:**
1. **Report Review**: [Report review process]
2. **Discussion**: [Financial discussion scheduling]
3. **Implementation**: [Recommendation implementation]
4. **Monitoring**: [Ongoing financial monitoring]

I'm available for a detailed financial discussion to help you make informed business decisions.

Best regards,
Quinn Williams
Finance Manager
Rensto
```

## 🎯 **KEYWORD TRIGGERS**

### **High Confidence (0.96+)**
- `invoice`
- `payment`
- `financial`
- `billing`
- `money`
- `cost`

### **Medium Confidence (0.80-0.95)**
- `budget`
- `refund`
- `pricing`
- `subscription`
- `revenue`
- `expense`

### **Low Confidence (0.65-0.79)**
- `account`
- `transaction`
- `receipt`
- `statement`
- `tax`
- `audit`

## 🔗 **INTEGRATIONS**

### **Airtable Integration**
- **Base**: Finance Requests
- **Fields**: Request Type, Amount, Status, Payment Method, Resolution
- **Purpose**: Track all finance requests and payment processing

### **Gmail Integration**
- **Purpose**: Send finance responses
- **Templates**: Invoice processing, payment issues, financial reports
- **Attachments**: Invoices, receipts, financial reports, payment confirmations

### **Payment Integration**
- **Purpose**: Process payments and manage billing
- **Tools**: Payment processing, invoice generation, receipt management
- **Automation**: Payment reminders, failed payment retries, refund processing

## 📊 **PERFORMANCE METRICS**

### **Response Time**
- **Target**: <2 hours for payment issues
- **Target**: <4 hours for financial reports
- **Escalation**: >8 hours triggers manager alert

### **Payment Processing**
- **Target**: >95% successful payment rate
- **Target**: <2% payment failure rate
- **Measurement**: Payment success and failure tracking

### **Customer Satisfaction**
- **Target**: >4.5/5 average rating
- **Measurement**: Post-interaction surveys
- **Frequency**: Monthly satisfaction reports

## 🚨 **ESCALATION RULES**

### **Automatic Escalation**
- **Payment Failures**: Critical payment processing issues
- **Billing Disputes**: Complex billing disputes requiring management
- **Financial Issues**: Significant financial problems

### **Manual Escalation**
- **Customer Request**: Customer specifically asks for senior finance
- **Complex Issues**: Multi-system or complex financial issues
- **Legal Issues**: Financial matters requiring legal review

## 🔧 **CONFIGURATION REQUIREMENTS**

### **Microsoft 365 Setup**
- **Shared Mailbox**: `finance@rensto.com`
- **Email Rules**: Route finance emails to shared mailbox
- **Auto-Reply**: Set up auto-reply for after-hours
- **Signatures**: Finance signature with contact information

### **n8n Workflow Configuration**
- **Webhook URL**: `http://173.254.201.134:5678/webhook/email-webhook`
- **Gmail Credentials**: `fTyaZH1mJ8TQ95L6`
- **Airtable Credentials**: `3lTwFd8waEI1UQEW`

### **Environment Variables**
- `GMAIL_FROM_ADDRESS`: `quinn.williams@rensto.com`
- `AIRTABLE_BASE_ID`: Finance Requests base ID
- `PAYMENT_API_KEY`: Payment processing API key

## 🚀 **IMPLEMENTATION PLAN**

### **Phase 1: Basic Setup (Week 1)**
1. Create Microsoft 365 shared mailbox
2. Set up email routing rules
3. Create basic n8n workflow
4. Configure Gmail integration

### **Phase 2: Advanced Features (Week 2)**
1. Add financial analysis capabilities
2. Implement response templates
3. Set up Airtable integration
4. Configure payment integration

### **Phase 3: Testing & Optimization (Week 3)**
1. Test with sample finance requests
2. Optimize response templates
3. Set up monitoring and metrics
4. Deploy to production

## 🎯 **SUCCESS METRICS**

- **Response Time**: <2 hours for payment issues
- **Payment Success Rate**: >95% successful payments
- **Customer Satisfaction**: >4.5/5 rating
- **Email Volume**: Handle 30+ finance requests/day
- **Issue Resolution**: >90% first-contact resolution

## 📚 **RELATED DOCUMENTATION**

- [Email Persona Implementation Report](../../email-persona-implementation-report.json)
- [BIG BMAD PLAN Final Summary](../../BIG_BMAD_PLAN_FINAL_SUMMARY.md)
- [Finance Automation Workflows](../n8n-workflows/01-advanced-business-process-automation.md)

---

**Last Updated**: January 25, 2025  
**Status**: Missing - Needs Implementation  
**Priority**: HIGH - Critical for financial operations
