# 🎯 **WEBFLOW PRICING PAGE IMPLEMENTATION**

## **Complete Pricing Page Content for Webflow**

### **Page URL**: `/pricing-plans`
### **SEO Title**: "Pricing Plans - Rensto Automation Platform"
### **Meta Description**: "Choose your automation path with 4 service types: Marketplace, Custom Solutions, Subscriptions, and Ready Solutions for your industry."

---

## **1. HERO SECTION**

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

---

## **2. PRICING CARDS SECTION**

```html
<div class="pricing-cards">
  
  <!-- BASIC PLAN -->
  <div class="pricing-card">
    <div class="plan-header">
      <h3>Basic</h3>
      <div class="price">
        <span class="currency">$</span>
        <span class="amount">97</span>
        <span class="period">/month</span>
      </div>
      <p class="plan-description">Perfect for small businesses getting started with automation</p>
    </div>
    
    <div class="plan-features">
      <ul>
        <li>✓ 100 interactions per month</li>
        <li>✓ 5 workflow templates</li>
        <li>✓ 1 user account</li>
        <li>✓ 1,000 API calls</li>
        <li>✓ 1GB storage</li>
        <li>✓ 3 integrations</li>
        <li>✓ Email support</li>
        <li>✓ Basic analytics</li>
      </ul>
    </div>
    
    <div class="plan-limitations">
      <h4>Limitations:</h4>
      <ul>
        <li>• Limited to 1 user</li>
        <li>• Basic support only</li>
        <li>• Standard templates only</li>
      </ul>
    </div>
    
    <button class="cta-button">Start Free Trial</button>
  </div>

  <!-- PROFESSIONAL PLAN -->
  <div class="pricing-card popular">
    <div class="popular-badge">Most Popular</div>
    <div class="plan-header">
      <h3>Professional</h3>
      <div class="price">
        <span class="currency">$</span>
        <span class="amount">197</span>
        <span class="period">/month</span>
      </div>
      <p class="plan-description">Ideal for growing businesses with advanced automation needs</p>
    </div>
    
    <div class="plan-features">
      <ul>
        <li>✓ 500 interactions per month</li>
        <li>✓ 20 workflow templates</li>
        <li>✓ 5 user accounts</li>
        <li>✓ 5,000 API calls</li>
        <li>✓ 10GB storage</li>
        <li>✓ 10 integrations</li>
        <li>✓ Priority support</li>
        <li>✓ Advanced analytics</li>
        <li>✓ AI-powered suggestions</li>
        <li>✓ Custom workflows</li>
      </ul>
    </div>
    
    <div class="plan-limitations">
      <h4>Limitations:</h4>
      <ul>
        <li>• Limited to 5 users</li>
        <li>• No white-label options</li>
      </ul>
    </div>
    
    <button class="cta-button primary">Start Free Trial</button>
  </div>

  <!-- ENTERPRISE PLAN -->
  <div class="pricing-card">
    <div class="plan-header">
      <h3>Enterprise</h3>
      <div class="price">
        <span class="currency">$</span>
        <span class="amount">497</span>
        <span class="period">/month</span>
      </div>
      <p class="plan-description">Complete solution for large organizations with complex needs</p>
    </div>
    
    <div class="plan-features">
      <ul>
        <li>✓ Unlimited interactions</li>
        <li>✓ Unlimited templates</li>
        <li>✓ Unlimited users</li>
        <li>✓ Unlimited API calls</li>
        <li>✓ Unlimited storage</li>
        <li>✓ Unlimited integrations</li>
        <li>✓ Dedicated support</li>
        <li>✓ Advanced analytics</li>
        <li>✓ AI-powered automation</li>
        <li>✓ White-label options</li>
        <li>✓ Custom integrations</li>
        <li>✓ Dedicated account manager</li>
        <li>✓ SLA guarantee</li>
      </ul>
    </div>
    
    <div class="plan-limitations">
      <h4>No Limitations</h4>
      <p>Everything included</p>
    </div>
    
    <button class="cta-button">Contact Sales</button>
  </div>
  
</div>
```

---

## **3. USAGE-BASED PRICING SECTION**

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

---

## **4. FEATURES COMPARISON SECTION**

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

---

## **5. CALL-TO-ACTION SECTION**

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

---

## **6. CSS STYLES (Add to Webflow Designer)**

```css
/* Pricing Cards */
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
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.pricing-card.popular {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.popular-badge {
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
}

.cta-button.primary {
  background: #3b82f6;
  color: white;
}

.cta-button.primary:hover {
  background: #2563eb;
}

.cta-button:not(.primary) {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.cta-button:not(.primary):hover {
  background: #e5e7eb;
}

/* Usage Pricing */
.usage-pricing {
  background: #f9fafb;
  padding: 3rem;
  border-radius: 12px;
  margin: 3rem 0;
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

/* Features Grid */
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

/* CTA Section */
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

.primary-cta:hover {
  background: #f3f4f6;
}

.secondary-cta:hover {
  background: white;
  color: #3b82f6;
}
```

---

## **IMPLEMENTATION INSTRUCTIONS:**

1. **Open Webflow Designer** for your Rensto site
2. **Navigate to the Pricing Plans page** (`/pricing-plans`)
3. **Add the HTML content** section by section
4. **Apply the CSS styles** in the Designer
5. **Test the page** to ensure it displays correctly
6. **Publish the site** to make changes live

## **EXPECTED RESULT:**
A professional pricing page with:
- ✅ Marketplace: n8n templates & installation
- ✅ Custom Solutions: Voice AI consultation (most popular)
- ✅ Subscriptions: Enhanced hot leads service
- ✅ Ready Solutions: Niche-specific packages
- ✅ Usage-based pricing
- ✅ Feature comparison
- ✅ Clear call-to-action buttons

**This will complete the pricing page implementation and make the platform fully ready for customers!** 🚀
