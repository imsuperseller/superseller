# Workflow Naming Convention Analysis

## 🎯 Question

**What naming convention issue do you see in workflow records?**

---

## 🔍 Possible Issues

### Issue 1: Inconsistent Prefixes
**Example:**
- Some: "INT-LEAD-001 - Lead Machine Orchestrator v2"
- Some: "Lead Machine Orchestrator" (missing prefix)
- Some: "CUSTOMER-WHATSAPP-002A: Human-in-Loop - Question Handler"

**Problem:** Not all workflows follow the `{TYPE}-{FUNCTION}-{VERSION}` pattern

---

### Issue 2: Inconsistent Separators
**Example:**
- Some: "INT-LEAD-001 - Description"
- Some: "CUSTOMER-WHATSAPP-002A: Description"
- Some: "SUB-LEAD-003 Description" (no separator)

**Problem:** Mix of ` - `, `: `, and no separator

---

### Issue 3: Version Format Inconsistency
**Example:**
- Some: "INT-LEAD-001" (no version)
- Some: "INT-LEAD-001 v2" (version after)
- Some: "CUSTOMER-WHATSAPP-002A" (version in ID)

**Problem:** Version numbers in different places

---

### Issue 4: Too Long Names
**Example:**
- "INT-LEAD-001 - Lead Machine Orchestrator v2 - Complete Automation System with AI Integration"

**Problem:** Names too long, hard to read in lists

---

### Issue 5: Missing Category Prefixes
**Example:**
- Some workflows don't have INT-, SUB-, MKT-, CUSTOMER-, STRIPE-, DEV- prefix
- Makes it hard to categorize

**Problem:** Can't easily identify workflow type

---

## 📋 Standard Naming Convention (Recommended)

**Format:** `{TYPE}-{FUNCTION}-{VERSION} - {Short Description}`

**Examples:**
- `INT-LEAD-001 - Lead Machine Orchestrator v2`
- `SUB-LEAD-003 - Local Lead Finder`
- `MKT-EMAIL-001 - Email Persona System`
- `CUSTOMER-WHATSAPP-002A - Question Handler`
- `STRIPE-MARKETPLACE-001 - Template Purchase Handler`
- `DEV-FIN-006 - Revenue Sync to Airtable`

**Rules:**
1. **Prefix required:** INT-, SUB-, MKT-, CUSTOMER-, STRIPE-, DEV-, TYPEFORM-
2. **Function code:** 3-4 letter code (LEAD, EMAIL, WHATSAPP, etc.)
3. **Version:** 3-digit number (001, 002, 003) or letter (002A, 002B)
4. **Separator:** ` - ` (space-dash-space)
5. **Description:** Short, descriptive (max 50 chars)

---

## 🔧 Fix Script Needed

**Once you identify the issue, I'll create a script to:**
1. Analyze all workflow names
2. Identify inconsistencies
3. Standardize naming convention
4. Update workflow names in Boost.space

---

**What specific naming convention issue do you see?** Please describe it, and I'll create a fix!
