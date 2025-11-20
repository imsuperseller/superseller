# Airtable Usage Audit - Workflows Violating Architecture

**Date**: November 16, 2025  
**Status**: ❌ **8 ACTIVE WORKFLOWS USING AIRTABLE INCORRECTLY**

---

## 🚨 **CRITICAL FINDINGS**

**Per CLAUDE.md Architecture**:
- **PRIMARY**: Boost.space (customers, projects, financial, infrastructure)
- **OPERATIONAL**: n8n Data Tables (workflow execution, leads, customer interactions)
- **BACKUP ONLY**: Airtable (rate limited, migrating to Boost.space)

**Problem**: 8 active workflows are using Airtable for operational data that should be in n8n Data Tables or Boost.space

---

## 📋 **WORKFLOWS TO FIX**

### **1. Typeform Lead Magnet Workflows** (4 workflows) ❌ **CRITICAL**

All 4 workflows save **lead data** (operational) to Airtable instead of n8n Data Tables:

#### **TYPEFORM-READINESS-SCORECARD-001.json**
- **Airtable Nodes**: 2
- **What It Does**: Saves consultation/lead data
- **Should Use**: n8n Data Tables (operational lead data)
- **Priority**: HIGH

#### **TYPEFORM-TEMPLATE-REQUEST-001.json**
- **Airtable Nodes**: 2
- **What It Does**: Saves template request/lead data
- **Should Use**: n8n Data Tables (operational lead data)
- **Priority**: HIGH

#### **TYPEFORM-READY-SOLUTIONS-QUIZ-001.json**
- **Airtable Nodes**: 2 (including "Create Lead in Airtable")
- **What It Does**: Saves quiz responses/lead data
- **Should Use**: n8n Data Tables (operational lead data)
- **Priority**: HIGH

#### **TYPEFORM-FREE-LEADS-SAMPLE-001.json**
- **Airtable Nodes**: 2
- **What It Does**: Saves lead sample request/lead data
- **Should Use**: n8n Data Tables (operational lead data)
- **Priority**: HIGH

---

### **2. Stripe Payment Workflows** (4 workflows) ❌ **CRITICAL**

All 4 workflows save **customer/payment data** (should be in Boost.space) to Airtable:

#### **STRIPE-MARKETPLACE-001-WITH-EMAIL.json**
- **Airtable Nodes**: 5
- **What It Does**: Saves customer data, purchase records, revenue tracking
- **Should Use**: Boost.space (customer data, financial data)
- **Priority**: HIGH

#### **STRIPE-MARKETPLACE-001-UPDATED.json**
- **Airtable Nodes**: 5
- **What It Does**: Saves customer data, purchase records, revenue tracking
- **Should Use**: Boost.space (customer data, financial data)
- **Priority**: HIGH

#### **STRIPE-INSTALL-001-WITH-EMAIL.json**
- **Airtable Nodes**: 6
- **What It Does**: Saves customer data, installation requests, revenue tracking
- **Should Use**: Boost.space (customer data, financial data)
- **Priority**: HIGH

#### **STRIPE-INSTALL-001-UPDATED.json**
- **Airtable Nodes**: 6
- **What It Does**: Saves customer data, installation requests, revenue tracking
- **Should Use**: Boost.space (customer data, financial data)
- **Priority**: HIGH

---

## ✅ **WORKFLOWS THAT ARE OK** (Customer-Specific)

### **Tax4Us Workflows** (Customer Project)
- **tax4us_wordpress_agent_workflow.json**: Uses Airtable for customer's content management
- **tax4us-workflow-analysis.json**: Uses Airtable for customer's content specs
- **Status**: ✅ OK - Customer project, they may want Airtable

**Note**: Customer workflows can use Airtable if that's what the customer wants, but Rensto internal workflows should follow architecture.

---

## 📊 **SUMMARY**

| Category | Count | Storage Tier | Fix Required |
|----------|-------|--------------|--------------|
| **Typeform Lead Magnets** | 4 | n8n Data Tables | ❌ YES |
| **Stripe Payment Flows** | 4 | Boost.space | ❌ YES |
| **Customer Workflows** | Multiple | Customer choice | ✅ OK |
| **TOTAL TO FIX** | **8** | - | **8 workflows** |

---

## 🔧 **FIX PRIORITY**

### **Phase 1: Lead Magnet Workflows** (HIGH PRIORITY)
1. TYPEFORM-READINESS-SCORECARD-001
2. TYPEFORM-TEMPLATE-REQUEST-001
3. TYPEFORM-READY-SOLUTIONS-QUIZ-001
4. TYPEFORM-FREE-LEADS-SAMPLE-001

**Action**: Replace Airtable nodes with n8n Data Table nodes
**Time**: ~2 hours (30 min each)

### **Phase 2: Stripe Payment Workflows** (HIGH PRIORITY)
1. STRIPE-MARKETPLACE-001-WITH-EMAIL
2. STRIPE-MARKETPLACE-001-UPDATED
3. STRIPE-INSTALL-001-WITH-EMAIL
4. STRIPE-INSTALL-001-UPDATED

**Action**: Replace Airtable nodes with Boost.space HTTP Request nodes
**Time**: ~4 hours (1 hour each)

---

## 🎯 **MIGRATION STRATEGY**

### **For Lead Magnet Workflows**:
- **Replace**: `n8n-nodes-base.airtable` → `n8n-nodes-base.dataTable`
- **Table Name**: `typeform_leads` or `lead_magnet_submissions`
- **Columns**: Map existing Airtable fields to Data Table columns

### **For Stripe Payment Workflows**:
- **Replace**: `n8n-nodes-base.airtable` → `@n8n/n8n-nodes-langchain.boostSpaceHttpRequest`
- **Endpoint**: `https://superseller.boost.space/api/contact` (Space 53 for customers)
- **Endpoint**: `https://superseller.boost.space/api/project` (Space 53 for projects)
- **Endpoint**: `https://superseller.boost.space/api/invoice` (Space 51 for financial)

---

## ⚠️ **IMPACT**

**Current Issues**:
- ❌ Violates data storage architecture
- ❌ Rate limited (Airtable API billing plan limit exceeded)
- ❌ Wrong storage tier for data type
- ❌ Slower performance (external API calls)

**After Fix**:
- ✅ Follows architecture (n8n Data Tables for operational, Boost.space for customers/financial)
- ✅ No rate limits
- ✅ Faster performance (internal storage)
- ✅ Better scalability

---

**Status**: ❌ **8 WORKFLOWS NEED FIXING**  
**Estimated Time**: 6 hours total  
**Priority**: HIGH (affects all lead generation and payment processing)

