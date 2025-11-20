# 🧪 Migration Testing Checklist

**Project**: Webflow → Vercel Full Migration  
**Created**: November 2, 2025

---

## 📋 **PER-PAGE TESTING REQUIREMENTS**

### **Every Page Must Pass** ✅

- [ ] Desktop layout (Chrome)
- [ ] Desktop layout (Safari)
- [ ] Desktop layout (Firefox)
- [ ] Mobile layout (iOS Safari)
- [ ] Mobile layout (Android Chrome)
- [ ] SEO metadata (title, description, OG tags)
- [ ] Performance (Lighthouse score >90)
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] No console errors
- [ ] Images load correctly
- [ ] Links work correctly
- [ ] Forms submit (if applicable)
- [ ] Stripe checkout (if applicable)

---

## 🎯 **CORE PAGES TESTING** (Priority 0)

### **Homepage** (`/`)

**Functional Testing**:
- [ ] Hero section displays correctly
- [ ] Path selector works (4 service types)
- [ ] Lead magnet form submits
- [ ] Testimonials display
- [ ] FAQ accordion works
- [ ] CTAs link to correct pages
- [ ] Mobile navigation works

**Performance Testing**:
- [ ] Lighthouse Performance: _____ /100 (target: >90)
- [ ] Lighthouse SEO: _____ /100 (target: >90)
- [ ] Page load time: _____ seconds (target: <2s)
- [ ] Time to Interactive: _____ seconds (target: <3s)

**Stripe Testing**:
- [ ] N/A (no checkout on homepage)

---

### **Marketplace** (`/marketplace`)

**Functional Testing**:
- [ ] Hero section displays
- [ ] Categories grid displays
- [ ] Template cards render
- [ ] Pricing toggle works (DIY vs Full-Service)
- [ ] FAQ accordion works
- [ ] Lead magnet form submits
- [ ] Dynamic workflows load from API (if implemented)

**Stripe Testing**:
- [ ] DIY Template - Simple ($29) checkout
- [ ] DIY Template - Standard ($97) checkout
- [ ] DIY Template - Advanced ($197) checkout
- [ ] Full-Service - Basic ($797) checkout
- [ ] Full-Service - Professional ($1,997) checkout
- [ ] Full-Service - Enterprise ($3,500+) checkout
- [ ] All redirects to Stripe checkout correctly
- [ ] Webhook receives payment confirmation

**Performance Testing**:
- [ ] Lighthouse Performance: _____ /100
- [ ] API response time: _____ ms (target: <200ms)
- [ ] Page load time: _____ seconds

**Mobile Testing**:
- [ ] Template cards stack correctly
- [ ] Pricing toggle works on mobile
- [ ] Stripe checkout works on mobile

---

### **Subscriptions** (`/subscriptions`)

**Functional Testing**:
- [ ] Hero section displays
- [ ] Pricing tiers display (3 tiers)
- [ ] Comparison table displays
- [ ] FAQ accordion works
- [ ] Lead sample request form (if exists)

**Stripe Testing**:
- [ ] Starter ($299/mo) checkout
- [ ] Professional ($799/mo) checkout
- [ ] Enterprise ($1,499/mo) checkout
- [ ] All create recurring subscriptions correctly
- [ ] Webhook receives subscription confirmation

**Performance Testing**:
- [ ] Lighthouse Performance: _____ /100
- [ ] Page load time: _____ seconds

---

### **Ready Solutions** (`/ready-solutions`)

**Functional Testing**:
- [ ] Hero section displays
- [ ] Industry packages display
- [ ] Pricing tiers display
- [ ] FAQ accordion works

**Stripe Testing**:
- [ ] Starter Package ($890) checkout
- [ ] Professional Package ($2,990) checkout
- [ ] Enterprise Package ($2,990 + $797/workflow) checkout
- [ ] All redirects to Stripe correctly

---

### **Custom Solutions** (`/custom-solutions`)

**Functional Testing**:
- [ ] Hero section displays
- [ ] Consultation form submits
- [ ] Typeform integration works (if applicable)
- [ ] FAQ accordion works

**Stripe Testing**:
- [ ] Entry-Level ($297-$1,997) checkout (if applicable)
- [ ] Webhook receives payment confirmation

---

## 🎨 **SUPPORTING PAGES TESTING** (Priority 1)

### **About** (`/about`)

- [ ] Content displays correctly
- [ ] Team section (if applicable)
- [ ] Mission/vision section
- [ ] Mobile responsive

### **Contact** (`/contact`)

- [ ] Contact form submits
- [ ] Form validation works
- [ ] Email notifications sent (if applicable)
- [ ] Mobile form layout

### **Legal Pages** (`/legal/*`)

- [ ] Privacy Policy (`/legal/privacy`)
- [ ] Terms of Service (`/legal/terms`)
- [ ] Cookie Policy (`/legal/cookie-policy`)
- [ ] EULA (`/legal/eula`)
- [ ] Security Policy (`/legal/security`)
- [ ] All display correctly
- [ ] Mobile responsive
- [ ] SEO metadata complete

### **Help Center** (`/help-center`)

- [ ] FAQ sections display
- [ ] Search works (if applicable)
- [ ] Categories organize correctly
- [ ] Mobile responsive

### **Documentation** (`/docs`)

- [ ] Getting Started guide
- [ ] Navigation works
- [ ] Code examples display
- [ ] Mobile responsive

---

## 🏭 **NICHE PAGES TESTING** (16 pages)

**Batch Testing Strategy**: Test template, then verify all pages

**Template Tests**:
- [ ] Hero section (customizable title/subtitle)
- [ ] Industry benefits section
- [ ] CTA section (links to Ready Solutions)
- [ ] SEO metadata (industry keywords)
- [ ] Mobile responsive

**Individual Page Verification** (Sample):
- [ ] HVAC (`/hvac`)
- [ ] Realtor (`/realtor`)
- [ ] Roofers (`/roofers`)
- [ ] Dentist (`/dentist`)
- [ ] Amazon Seller (`/amazon-seller`)
- [ ] ... (remaining 11 pages)

---

## 🧩 **COMPONENT TESTING**

### **Shared Components**

Each component must pass:

- [ ] Renders without errors
- [ ] Props validation works
- [ ] Mobile responsive
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Performance (no layout shifts)

### **Component-Specific Tests**

**Hero Component**:
- [ ] Title displays correctly
- [ ] Subtitle displays correctly
- [ ] CTA buttons work
- [ ] Background gradient/color displays
- [ ] Mobile layout stacks correctly

**PricingCard Component**:
- [ ] Price displays correctly
- [ ] Features list displays
- [ ] CTA button works
- [ ] Stripe checkout triggers (if applicable)
- [ ] Mobile card layout

**FAQ Component**:
- [ ] Questions display
- [ ] Accordion toggle works
- [ ] Answers expand/collapse
- [ ] Mobile layout

---

## 🔄 **INTEGRATION TESTING**

### **Stripe Integration**

- [ ] Checkout session creation (all products)
- [ ] Redirect to Stripe works
- [ ] Payment processing works
- [ ] Webhook receives events
- [ ] Success page displays
- [ ] Error handling works
- [ ] Test mode vs live mode

### **Airtable Integration** (CMS)

- [ ] Blog posts fetch correctly
- [ ] Blog listing page displays
- [ ] Blog post page displays
- [ ] Markdown renders correctly
- [ ] Images load correctly

### **API Integration**

- [ ] Marketplace workflows API (`/api/marketplace/workflows`)
- [ ] Response time <200ms
- [ ] Error handling works
- [ ] Caching works (if applicable)

---

## 📱 **MOBILE TESTING**

### **Devices to Test**

- [ ] iPhone 14 Pro (Safari)
- [ ] iPhone SE (Safari)
- [ ] Samsung Galaxy S21 (Chrome)
- [ ] iPad (Safari)
- [ ] Chrome DevTools mobile emulation

### **Mobile-Specific Tests**

- [ ] No horizontal scrolling
- [ ] Touch targets >44px
- [ ] Forms submit correctly
- [ ] Stripe checkout works
- [ ] Navigation works (hamburger menu)
- [ ] Images load (responsive)
- [ ] Text readable (no zoom needed)

---

## 🚀 **PERFORMANCE TESTING**

### **Lighthouse Tests**

Run for each page:

- [ ] Performance score >90
- [ ] Accessibility score >90
- [ ] Best Practices score >90
- [ ] SEO score >90

### **Load Time Tests**

- [ ] First Contentful Paint <1.8s
- [ ] Largest Contentful Paint <2.5s
- [ ] Time to Interactive <3.8s
- [ ] Total Blocking Time <200ms
- [ ] Cumulative Layout Shift <0.1

### **API Performance**

- [ ] API response time <200ms
- [ ] API error rate <0.1%
- [ ] API uptime >99.9%

---

## 🔍 **SEO TESTING**

### **On-Page SEO**

For each page:

- [ ] Unique title tag (50-60 chars)
- [ ] Meta description (150-160 chars)
- [ ] OG tags (title, description, image)
- [ ] H1 tag present (one per page)
- [ ] Heading hierarchy (H1 → H2 → H3)
- [ ] Alt text on images
- [ ] Internal links present
- [ ] Canonical URL set

### **Technical SEO**

- [ ] XML sitemap generated
- [ ] Robots.txt configured
- [ ] 301 redirects set up (Webflow → Vercel)
- [ ] URLs preserve (no changes)
- [ ] HTTPS enabled
- [ ] Page speed optimized

---

## 🐛 **ERROR TESTING**

### **Error Scenarios**

- [ ] 404 page displays correctly
- [ ] 500 error page displays
- [ ] API errors handled gracefully
- [ ] Stripe errors handled (declined card, etc.)
- [ ] Form validation errors display
- [ ] Network errors handled (offline)

### **Error Monitoring**

- [ ] Sentry configured
- [ ] Error tracking works
- [ ] Alerts set up for critical errors
- [ ] Error logs accessible

---

## ✅ **SIGN-OFF CHECKLIST**

Before marking a page as complete:

- [ ] All functional tests pass
- [ ] All performance tests pass
- [ ] All mobile tests pass
- [ ] All SEO tests pass
- [ ] All Stripe tests pass (if applicable)
- [ ] No console errors
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Code reviewed (if applicable)

---

**Update this checklist as pages are migrated and tested.**

