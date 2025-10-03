# 🎨 **WEBFLOW DESIGNER IMPLEMENTATION GUIDE**

## **Complete Visual Implementation for Pricing Page**

### **Prerequisites:**
- Webflow Designer must be open and connected to site ID: `66c7e551a317e0e9c9f906d8`
- Pricing Plans collection already created with all data
- Pricing page exists at `/pricing-plans`

---

## **STEP 1: CONNECT TO DESIGNER**

1. **Open Webflow Designer**: Go to https://webflow.com/designer
2. **Select Rensto Site**: Choose the Rensto site (ID: 66c7e551a317e0e9c9f906d8)
3. **Navigate to Pricing Page**: Go to Pages → Pricing Plans

---

## **STEP 2: CREATE HERO SECTION**

### **A. Hero Container:**
```html
<div class="pricing-hero">
  <h1>Simple, Transparent Pricing</h1>
  <p>Choose the perfect automation plan for your business. All plans include our core automation features with no hidden fees.</p>
  
  <div class="pricing-badges">
    <span class="badge">✓ 14-day free trial</span>
    <span class="badge">✓ No setup fees</span>
    <span class="badge">✓ Cancel anytime</span>
  </div>
</div>
```

### **B. CSS Styles:**
```css
.pricing-hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #fe3d51 0%, #bf5700 100%);
  color: white;
  border-radius: 12px;
  margin: 2rem 0;
}

.pricing-hero h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.pricing-hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.pricing-badges {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}
```

---

## **STEP 3: CREATE PRICING CARDS SECTION**

### **A. Cards Container:**
```html
<div class="pricing-cards">
  <!-- Cards will be populated from CMS -->
</div>
```

### **B. Card Structure (for CMS integration):**
```html
<div class="pricing-card" data-plan="{{plan.name}}">
  <div class="plan-header">
    <h3>{{plan.name}}</h3>
    <div class="price">
      <span class="currency">$</span>
      <span class="amount">{{plan.price}}</span>
      <span class="period">/month</span>
    </div>
    <p class="plan-description">{{plan.description}}</p>
  </div>
  
  <div class="plan-features">
    {{plan.features}}
  </div>
  
  <button class="cta-button">{{plan.button-text}}</button>
</div>
```

### **C. CSS Styles:**
```css
.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.pricing-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
  background: white;
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.pricing-card[data-plan="Professional Plan"] {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.pricing-card[data-plan="Professional Plan"]::before {
  content: "Most Popular";
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.price {
  font-size: 3rem;
  font-weight: 700;
  color: #1f2937;
  margin: 1rem 0;
}

.currency {
  font-size: 1.5rem;
  vertical-align: top;
}

.amount {
  font-size: 3rem;
}

.period {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 400;
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
}

.plan-features li {
  padding: 0.5rem 0;
  color: #374151;
}

.cta-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #3b82f6;
  color: white;
}

.cta-button:hover {
  background: #2563eb;
}
```

---

## **STEP 4: INTEGRATE CMS DATA**

### **A. Connect Collection:**
1. **Add Collection List**: Drag Collection List element
2. **Select Collection**: Choose "Pricing Plans" collection
3. **Set Items Per Row**: 3 (for desktop)
4. **Enable Pagination**: No

### **B. Map Fields:**
- **Name** → Heading element
- **Price** → Price display
- **Description** → Paragraph element
- **Features** → Rich Text element
- **Button Text** → Button element
- **Most Popular** → Conditional styling

---

## **STEP 5: ADD USAGE-BASED PRICING**

### **A. Usage Section:**
```html
<div class="usage-pricing">
  <h2>Usage-Based Pricing</h2>
  <p>Pay only for what you use beyond your plan limits. No surprises, no hidden fees.</p>
  
  <div class="usage-cards">
    <div class="usage-card">
      <h3>API Calls</h3>
      <div class="usage-price">$0.01 <span>per call</span></div>
      <p>Additional API calls beyond your plan limit</p>
    </div>
    
    <div class="usage-card">
      <h3>Data Processing</h3>
      <div class="usage-price">$0.10 <span>per GB</span></div>
      <p>Data processing and storage beyond your plan limit</p>
    </div>
    
    <div class="usage-card">
      <h3>Custom Integrations</h3>
      <div class="usage-price">$500 <span>per integration</span></div>
      <p>Custom third-party integrations and connectors</p>
    </div>
  </div>
</div>
```

### **B. CSS Styles:**
```css
.usage-pricing {
  background: #f9fafb;
  padding: 3rem;
  border-radius: 12px;
  margin: 3rem 0;
  text-align: center;
}

.usage-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.usage-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.usage-price {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 1rem 0;
}
```

---

## **STEP 6: ADD FEATURES COMPARISON**

### **A. Features Section:**
```html
<div class="features-comparison">
  <h2>All Plans Include</h2>
  
  <div class="features-grid">
    <div class="feature-item">
      <div class="feature-icon">⚡</div>
      <h3>Workflow Automation</h3>
      <p>Automate repetitive tasks with visual workflows</p>
    </div>
    
    <div class="feature-item">
      <div class="feature-icon">👥</div>
      <h3>Team Collaboration</h3>
      <p>Share workflows and collaborate with your team</p>
    </div>
    
    <div class="feature-item">
      <div class="feature-icon">🔗</div>
      <h3>Data Integration</h3>
      <p>Connect with 100+ popular business tools</p>
    </div>
    
    <div class="feature-item">
      <div class="feature-icon">🛡️</div>
      <h3>Enterprise Security</h3>
      <p>Bank-level security and compliance</p>
    </div>
  </div>
</div>
```

### **B. CSS Styles:**
```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.feature-item {
  text-align: center;
  padding: 2rem;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
```

---

## **STEP 7: ADD CALL-TO-ACTION**

### **A. CTA Section:**
```html
<div class="pricing-cta">
  <h2>Ready to Get Started?</h2>
  <p>Join thousands of businesses already automating with Rensto</p>
  
  <div class="cta-buttons">
    <button class="primary-cta">Start Free Trial</button>
    <button class="secondary-cta">Contact Sales</button>
  </div>
</div>
```

### **B. CSS Styles:**
```css
.pricing-cta {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 12px;
  margin: 3rem 0;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.primary-cta, .secondary-cta {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-cta {
  background: white;
  color: #3b82f6;
}

.secondary-cta {
  background: transparent;
  color: white;
  border: 2px solid white;
}
```

---

## **STEP 8: PUBLISH AND TEST**

### **A. Publish Site:**
1. **Click Publish** in top right
2. **Select "Publish to Webflow"**
3. **Wait for completion**

### **B. Test Page:**
1. **Visit**: https://www.rensto.com/pricing-plans
2. **Verify**: All plans display correctly
3. **Check**: Mobile responsiveness
4. **Test**: All buttons and links

---

## **EXPECTED RESULT:**

A professional pricing page with:
- ✅ Hero section with badges
- ✅ 4 service type cards (Marketplace, Custom, Subscriptions, Ready Solutions) from CMS
- ✅ Usage-based pricing section
- ✅ Features comparison
- ✅ Call-to-action section
- ✅ Mobile-responsive design
- ✅ Rensto branding

**This will complete the visual implementation of the pricing page!** 🎉
