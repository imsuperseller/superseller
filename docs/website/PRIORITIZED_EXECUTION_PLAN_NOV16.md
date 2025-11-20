# Prioritized Execution Plan - Gap Fixes

**Date**: November 16, 2025  
**Status**: 🚀 **EXECUTING**  
**Strategy**: Quick Wins First → High Impact → Strategic

---

## 🎯 PRIORITIZATION MATRIX

### **Quick Wins** (High Impact, Low Effort) - DO FIRST
1. ✅ Fix Watch Demo button (5 min)
2. ✅ Add 10 more industries to Ready Solutions (2-3 hours)
3. ✅ Fix Ready Solutions checkout flow - Quiz before checkout (2-3 hours)

### **High Impact** (High Impact, Medium Effort) - DO NEXT
4. ✅ Lead magnet backend integrations (4 forms, ~2 hours total)
5. ✅ Add cost comparison to Subscriptions (1 hour)
6. ✅ Add lead sources showcase to Subscriptions (1 hour)

### **Strategic** (High Impact, High Effort) - PHASE 2
7. ⏳ Voice AI deployment (3-4 days)
8. ⏳ Case studies with real data (2-3 hours)

### **Nice to Have** (Low Impact) - LATER
9. ⏳ Demo/installation video
10. ⏳ Featured templates section
11. ⏳ Industry filter functionality

---

## 📋 EXECUTION PLAN

### **PHASE 1: Quick Wins** (4-6 hours) - STARTING NOW

#### **Task 1.1: Fix Watch Demo Button** (5 minutes)
**File**: `apps/web/rensto-site/src/app/solutions/page.tsx`  
**Current**: Button exists but no onClick handler  
**Fix**: Add handler to open Typeform quiz or remove button

**Options**:
- Option A: Link to Industry Quiz Typeform (`jqrAhQHW`) - Quick fix
- Option B: Remove button if no demo available
- Option C: Link to placeholder video page

**Recommendation**: Option A (link to quiz) - maintains functionality

---

#### **Task 1.2: Add 10 More Industries** (2-3 hours)
**File**: `apps/web/rensto-site/src/app/solutions/page.tsx`  
**Current**: 6 industries (HVAC, Roofer, Realtor, Insurance, Locksmith, Photographer)  
**Target**: 16 industries (as documented)

**Missing Industries** (10):
1. Amazon Seller
2. Dentist
3. Bookkeeping
4. Busy Mom
5. E-commerce
6. Fence Contractor
7. Lawyer
8. Product Supplier
9. Synagogue
10. Torah Teacher

**Action**: Add to `niches` array with same structure

---

#### **Task 1.3: Fix Ready Solutions Checkout Flow** (2-3 hours)
**File**: `apps/web/rensto-site/src/app/solutions/page.tsx`  
**Current**: "Get This Package" → Direct Stripe checkout  
**Target**: "Get This Package" → Industry Quiz → Email with recommendation → Stripe checkout

**Implementation**:
1. Change "Get This Package" button to open Industry Quiz Typeform (`jqrAhQHW`)
2. Update workflow to include Stripe checkout link in recommendation email
3. Pre-fill Stripe checkout with email from quiz

**Alternative** (if keeping direct checkout):
- Add "Take Quiz First" as primary CTA
- Make "Get This Package" secondary

---

### **PHASE 2: High Impact Fixes** (4-5 hours)

#### **Task 2.1: Lead Magnet Backend Integration** (2 hours)
**Forms to Connect**:
1. ✅ Readiness Scorecard (`TBij585m`) - Workflow exists, verify connection
2. ⚠️ Industry Checklist - Form doesn't exist, needs creation
3. ⚠️ FREE Starter Template - Form doesn't exist, needs creation
4. ✅ FREE 50 Leads (`xXJi0Jbm`) - Verify workflow status

**Action**:
- Verify existing workflows are active
- Create missing forms or connect existing Typeforms
- Test all 4 end-to-end

---

#### **Task 2.2: Subscriptions Page Enhancements** (2 hours)
**Add**:
1. Cost comparison strip ($50-$200 vs $3-$7 per lead)
2. Lead sources showcase (LinkedIn, GMaps, Facebook, Apify)
3. Credibility bar (12,000+ leads/month, 92% deliverability)

---

### **PHASE 3: Strategic** (3-4 days)

#### **Task 3.1: Voice AI Deployment** (3-4 days)
- Deploy Voice AI consultation system
- Connect ElevenLabs + OpenAI Whisper
- Replace Typeform fallback

---

## 🚀 EXECUTING NOW: Phase 1 Quick Wins

Starting with the highest-impact, lowest-effort fixes.

