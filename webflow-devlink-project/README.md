# ⚛️ Webflow Devlink Project

**Purpose:** Webflow Devlink integration for custom React components in Webflow Designer

**Project Name:** rensto-webflow-devlink

**Current Size:** ~211M (210M node_modules, ~1M source code)

**Last Updated:** September 30, 2025

**Last Audit:** October 5, 2025

---

## 📖 What is Webflow Devlink?

**Webflow Devlink** allows you to build custom React components in your code editor and sync them to Webflow Designer. This enables:
- Custom interactive components
- Advanced logic and state management
- TypeScript type safety
- Component reusability
- Version control for components

**Official Docs**: https://developers.webflow.com/docs/devlink

---

## 📂 Project Structure

```
webflow-devlink-project/
├── components/
│   ├── index.ts              - Component exports
│   ├── PricingPage.tsx       - Pricing page component (React)
│   └── PricingPage.css       - Pricing page styles
├── node_modules/        210M - Dependencies (gitignored)
├── package.json              - Project dependencies
├── package-lock.json         - Dependency lock file
├── tsconfig.json             - TypeScript configuration
├── webflow.json              - Webflow CLI configuration
├── .webflowrc.json           - Webflow RC config
├── .env                      - Environment variables (gitignored)
└── README.md                 - This file
```

---

## 🔧 Components

### **PricingPage Component**

**Files**:
- `PricingPage.tsx` - React component
- `PricingPage.css` - Component styles
- `index.ts` - Export configuration

**Purpose**: Custom pricing page component for Webflow

**Technology**:
- React 18
- TypeScript 5
- CSS modules

**Status**: ⚠️ Development/prototype

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+
- npm or yarn
- Webflow account with Devlink access
- Webflow CLI installed globally: `npm install -g @webflow/webflow-cli`

### **Installation**

```bash
cd webflow-devlink-project/

# Install dependencies
npm install

# Login to Webflow
webflow login

# Start development
webflow dev
```

### **Development Workflow**

1. **Edit components** in `components/` directory
2. **Run dev server**: `webflow dev`
3. **Open Webflow Designer**: Components appear in left panel
4. **Drag component** onto Webflow page
5. **Configure props** in Webflow Designer
6. **Save and publish** in Webflow

---

## 📦 Dependencies

**Core Dependencies**:
- `@webflow/webflow-cli` ^1.8.44 - Webflow CLI tools
- `react` ^18.2.0 - React library
- `react-dom` ^18.2.0 - React DOM bindings

**Dev Dependencies**:
- `@types/react` ^18.2.0 - React TypeScript types
- `@types/react-dom` ^18.2.0 - React DOM TypeScript types
- `typescript` ^5.0.0 - TypeScript compiler

**Total node_modules Size**: 210M (gitignored)

---

## 🔗 Relationship to Other Folders

### **webflow-devlink-project/ vs /webflow/ vs /apps/marketplace**

**webflow-devlink-project/** (This folder):
- **Purpose**: Custom React components for Webflow Designer
- **Technology**: React + TypeScript + Webflow Devlink
- **Use Case**: Advanced interactive components that can't be built natively in Webflow

**/webflow/**:
- **Purpose**: Page embed files (HTML/JS) for Webflow pages
- **Technology**: Vanilla JavaScript, HTML
- **Use Case**: Page-level embed code for Stripe buttons, forms, etc.

**/apps/marketplace**:
- **Purpose**: Full-stack marketplace application
- **Technology**: Next.js 14+ with React
- **Use Case**: Complete marketplace app (admin.rensto.com or marketplace.rensto.com)

**Analogy**:
- **webflow-devlink-project/** = Custom Lego bricks (React components for Webflow)
- **/webflow/** = Instruction manual pages (HTML embed code)
- **/apps/marketplace** = Complete Lego set (full application)

---

## 📊 Webflow Devlink Audit Score

**Criteria Met**: 10/17 (59%) - ⚠️ **NEEDS IMPROVEMENT**

**Strengths**:
- ✅ Properly configured Webflow Devlink project
- ✅ TypeScript setup
- ✅ node_modules gitignored
- ✅ Package.json with correct dependencies
- ✅ Clean project structure

**Weaknesses**:
- ❌ No README.md (fixed Oct 5, 2025)
- ⚠️ Only 1 component (PricingPage) - underutilized
- ⚠️ Status unclear (prototype? production? abandoned?)
- ⚠️ No deployment documentation
- ⚠️ No usage examples or screenshots
- ⚠️ Not integrated with /webflow/ embed files

---

## ⚠️ Known Issues

### **Issue 1: Single Component Only**
**Impact**: Project setup for Devlink but only 1 component built
**Analysis**: Either this is a prototype, or other components planned but not built
**Status**: ⚠️ **CLARIFICATION NEEDED** - Is this active or abandoned?

### **Issue 2: Integration Status Unknown**
**Impact**: Unclear if PricingPage component is actually used in Webflow Designer
**Solution**: Check Webflow Designer for presence of PricingPage component
**Status**: ⏳ **VERIFICATION NEEDED**

### **Issue 3: No Usage Documentation**
**Impact**: Hard to know how to use PricingPage component
**Solution**: Add component props documentation and usage examples
**Status**: ⚠️ **ACTION REQUIRED**

### **Issue 4: Relationship to /webflow/ Unclear**
**Impact**: Two separate systems for Webflow customization - may be redundant
**Analysis**:
- `/webflow/` = Embed code (simple, works for most use cases)
- `/webflow-devlink-project/` = React components (complex, rarely needed)
**Recommendation**: Consider consolidating or clarifying when to use each
**Status**: ⚠️ **DECISION NEEDED**

---

## 🔧 Usage Instructions

### **Editing the PricingPage Component**

```bash
cd webflow-devlink-project/

# Edit component
nano components/PricingPage.tsx

# Start dev server (syncs to Webflow)
webflow dev
```

### **Adding a New Component**

1. **Create component files**:
   ```bash
   touch components/NewComponent.tsx
   touch components/NewComponent.css
   ```

2. **Write component**:
   ```typescript
   // components/NewComponent.tsx
   import React from 'react';
   import './NewComponent.css';

   export const NewComponent = () => {
     return <div className="new-component">Hello Webflow!</div>;
   };
   ```

3. **Export component**:
   ```typescript
   // components/index.ts
   export { NewComponent } from './NewComponent';
   ```

4. **Sync to Webflow**:
   ```bash
   webflow dev
   ```

5. **Use in Webflow Designer**:
   - Open Webflow Designer
   - Find NewComponent in left panel (Custom Components)
   - Drag onto page
   - Configure and publish

---

## 🎯 Recommended Actions

### **Decision 1: Active or Deprecated?**
**Question**: Is this project actively used or can it be archived?
**Options**:
- **Keep Active**: If PricingPage is deployed in Webflow Designer
- **Archive**: If this was a prototype and not in production
- **Expand**: If planning to build more React components

### **Decision 2: Integration Strategy**
**Question**: Should Devlink be the primary Webflow customization method?
**Current State**:
- `/webflow/` (23 pages) uses embed code (simple, working)
- `/webflow-devlink-project/` (1 component) uses React (complex, status unknown)
**Recommendation**: Use embed code for most pages, Devlink only for advanced interactive components

### **Decision 3: Component Expansion**
**If keeping active**, consider building components for:
- Advanced Stripe checkout flows
- Dynamic product listings
- Interactive calculators
- Multi-step forms
- Real-time dashboards

---

## 📞 Questions?

**For Webflow Devlink setup**: See installation instructions above
**For component development**: Edit files in components/ directory
**For deployment**: Run `webflow dev` to sync to Webflow Designer
**For Devlink documentation**: https://developers.webflow.com/docs/devlink
**For project status**: Clarify if active or can be archived

---

**Last Updated:** October 5, 2025 (Phase 2 Audit #17)
**Next Review:** After determining if project is active or deprecated
**Maintained By:** Rensto Team
**Components**: 1 (PricingPage)
**Status**: ⚠️ Unclear - Needs clarification
