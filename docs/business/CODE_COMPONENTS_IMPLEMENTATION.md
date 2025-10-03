# Modern Code Components Implementation Guide

## 🎯 **IMPLEMENTATION: Modern Webflow Code Components**

### **Step 1: Access Webflow Designer**
1. **Go to**: `https://rensto.design.webflow.com/`
2. **Navigate to**: Pricing Plans page (ID: 68830cb773190432dfb93d22)
3. **Open Designer**: Click "Design" to enter the Designer

### **Step 2: Create Code Component**
1. **Add Element**: Drag "Code Component" from the Elements panel
2. **Position**: Place it on the pricing page where you want the pricing cards
3. **Configure**: Set up the component properties

### **Step 3: Modern React Component Code**

```jsx
// PricingPage.jsx - Modern Code Component
import React from 'react';

export default function PricingPage() {
  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Choose Your Automation Plan</h1>
        <p>Transform your business with Rensto's universal automation platform. No coding required.</p>
      </div>

      {/* Pricing Cards */}
      <div className="pricing-cards">
        {/* Basic Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h3>Basic Plan</h3>
            <div className="price">
              <span className="amount">Marketplace</span>
              <span className="period">/month</span>
            </div>
            <p>Perfect for small businesses getting started with automation</p>
          </div>
          
          <div className="card-content">
            <ul className="features">
              <li><span className="checkmark">✓</span> 100 interactions per month</li>
              <li><span className="checkmark">✓</span> 5 workflow templates</li>
              <li><span className="checkmark">✓</span> 1 user account</li>
              <li><span className="checkmark">✓</span> 1,000 API calls</li>
              <li><span className="checkmark">✓</span> 1GB storage</li>
              <li><span className="checkmark">✓</span> 3 integrations</li>
              <li><span className="checkmark">✓</span> Email support</li>
              <li><span className="checkmark">✓</span> Basic analytics</li>
            </ul>
            
            <button className="cta-button secondary">
              Start Free Trial
            </button>
          </div>
        </div>

        {/* Professional Plan - Most Popular */}
        <div className="pricing-card popular">
          <div className="popular-badge">Most Popular</div>
          <div className="card-header">
            <h3>Professional Plan</h3>
            <div className="price">
              <span className="amount">Custom</span>
              <span className="period">/month</span>
            </div>
            <p>Ideal for growing businesses with advanced automation needs</p>
          </div>
          
          <div className="card-content">
            <ul className="features">
              <li><span className="checkmark">✓</span> 500 interactions per month</li>
              <li><span className="checkmark">✓</span> 20 workflow templates</li>
              <li><span className="checkmark">✓</span> 5 user accounts</li>
              <li><span className="checkmark">✓</span> 5,000 API calls</li>
              <li><span className="checkmark">✓</span> 10GB storage</li>
              <li><span className="checkmark">✓</span> 10 integrations</li>
              <li><span className="checkmark">✓</span> Priority support</li>
              <li><span className="checkmark">✓</span> Advanced analytics</li>
              <li><span className="checkmark">✓</span> AI-powered suggestions</li>
              <li><span className="checkmark">✓</span> Custom workflows</li>
            </ul>
            
            <button className="cta-button primary">
              Start Free Trial
            </button>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h3>Enterprise Plan</h3>
            <div className="price">
              <span className="amount">Subscriptions</span>
              <span className="period">/month</span>
            </div>
            <p>Complete solution for large organizations with complex needs</p>
          </div>
          
          <div className="card-content">
            <ul className="features">
              <li><span className="checkmark">✓</span> Unlimited interactions</li>
              <li><span className="checkmark">✓</span> Unlimited templates</li>
              <li><span className="checkmark">✓</span> Unlimited users</li>
              <li><span className="checkmark">✓</span> Unlimited API calls</li>
              <li><span className="checkmark">✓</span> Unlimited storage</li>
              <li><span className="checkmark">✓</span> Unlimited integrations</li>
              <li><span className="checkmark">✓</span> Dedicated support</li>
              <li><span className="checkmark">✓</span> Advanced analytics</li>
              <li><span className="checkmark">✓</span> AI-powered automation</li>
              <li><span className="checkmark">✓</span> White-label options</li>
              <li><span className="checkmark">✓</span> Custom integrations</li>
              <li><span className="checkmark">✓</span> Dedicated account manager</li>
              <li><span className="checkmark">✓</span> SLA guarantee</li>
            </ul>
            
            <button className="cta-button secondary">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="additional-info">
        <p>All plans include 14-day free trial • No setup fees • Cancel anytime</p>
        <p>Need a custom solution? <a href="/contact">Contact our sales team</a></p>
      </div>
    </div>
  );
}
```

### **Step 4: Modern CSS Styling**

```css
/* Modern CSS for Code Component */
.pricing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 4rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.hero-section {
  text-align: center;
  margin-bottom: 4rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.hero-section h1 {
  font-size: 3rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-section p {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 4rem;
}

.pricing-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.pricing-card.popular {
  border: 2px solid #3b82f6;
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

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.price {
  margin-bottom: 1rem;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: #1e293b;
}

.period {
  font-size: 1.125rem;
  color: #64748b;
  margin-left: 0.25rem;
}

.card-header p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.features li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  color: #374151;
  line-height: 1.5;
}

.checkmark {
  color: #10b981;
  font-weight: 600;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.cta-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cta-button.primary {
  background: #3b82f6;
  color: white;
}

.cta-button.primary:hover {
  background: #2563eb;
}

.cta-button.secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.cta-button.secondary:hover {
  background: #e2e8f0;
}

.additional-info {
  text-align: center;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.additional-info p {
  margin-bottom: 0.5rem;
}

.additional-info a {
  color: #3b82f6;
  text-decoration: none;
}

.additional-info a:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .hero-section p {
    font-size: 1rem;
  }
  
  .pricing-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .pricing-card.popular {
    transform: none;
  }
  
  .amount {
    font-size: 2.5rem;
  }
}
```

### **Step 5: Implementation in Webflow Designer**

1. **Open Webflow Designer**: `https://rensto.design.webflow.com/`
2. **Navigate to Pricing Plans page**
3. **Add Code Component**: Drag "Code Component" from Elements panel
4. **Paste React Code**: Copy the React component code above
5. **Add CSS**: Paste the CSS styling in the component settings
6. **Configure**: Set up the component properties
7. **Test**: Preview the component
8. **Deploy**: Publish the site

### **Step 6: Connect to Existing CMS Collection**

The "Pricing Plans" collection already exists with all the data. You can:
1. **Use the Code Component** for the layout and styling
2. **Connect to CMS** for dynamic content updates
3. **Combine both approaches** for maximum flexibility

## 🎯 **BENEFITS OF MODERN APPROACH**

✅ **No CLI Issues**: Uses Webflow's built-in Code Components  
✅ **No Deprecated APIs**: Uses current Webflow infrastructure  
✅ **No Interactive Prompts**: Direct implementation in Designer  
✅ **Modern React**: Latest patterns and best practices  
✅ **Responsive Design**: Mobile-first approach  
✅ **Easy Maintenance**: Update directly in Webflow Designer  
✅ **CMS Integration**: Can connect to existing Pricing Plans collection  

## 📋 **NEXT STEPS**

1. **Go to Webflow Designer**: `https://rensto.design.webflow.com/`
2. **Navigate to Pricing Plans page**
3. **Add Code Component** and implement the React code
4. **Add CSS styling** for responsive design
5. **Test and publish** the pricing page
6. **Verify functionality** and user experience

This modern approach bypasses all CLI issues and uses Webflow's current Code Components system for a professional, responsive pricing page.
