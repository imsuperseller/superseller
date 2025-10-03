# Correct Pricing Page Implementation

## 🎯 **FIX: Match Homepage Design System**

### **Step 1: Clear Current Content**
1. Go to: `https://rensto.design.webflow.com/?locale=en&pageId=68830cb773190432dfb93d22`
2. Delete all existing content
3. Start fresh with proper brand consistency

### **Step 2: Use Correct HTML Structure**
```html
<section class="hero">
    <div class="hero-content">
        <h1 class="hero-title">Simple, Transparent Pricing</h1>
        <p class="hero-subtitle">
            Choose the plan that fits your business needs. No hidden fees, no surprises.
        </p>
    </div>
</section>

<section class="section">
    <div class="section-container">
        <div class="card-grid">
            <div class="pricing-card" style="display: flex; flex-direction: column; height: 100%;">
                <div class="pricing-title">Starter</div>
                <div class="price">$99</div>
                <p class="card-description">
                    Perfect for solo entrepreneurs getting started with AI automation.
                </p>
                <ul class="pricing-features" style="flex-grow: 1;">
                    <li>✓ Alex Hot Lead (Lead Scoring)</li>
                    <li>✓ Jordan Smart Flow (Lead Nurturing)</li>
                    <li>✓ Chris News Sweep (Content)</li>
                    <li>✓ Save 5-10 hours/week</li>
                    <li>✓ Self-Service Dashboard</li>
                    <li>✓ Video Tutorials</li>
                </ul>
                <a href="/pricing/starter" class="btn-primary" style="margin-top: auto;">Get Started</a>
            </div>
            
            <div class="pricing-card popular" style="display: flex; flex-direction: column; height: 100%;">
                <div class="pricing-title">Professional</div>
                <div class="price">$199</div>
                <p class="card-description">
                    Ideal for solo entrepreneurs scaling their AI automation.
                </p>
                <ul class="pricing-features" style="flex-grow: 1;">
                    <li>✓ All 12 HVAC Workers</li>
                    <li>✓ 3 Workers from Other Industries</li>
                    <li>✓ Save 15-20 hours/week</li>
                    <li>✓ Priority Support (4-hour response)</li>
                    <li>✓ Analytics Dashboard</li>
                    <li>✓ Custom Integrations</li>
                </ul>
                <a href="/pricing/professional" class="btn-primary" style="margin-top: auto;">Get Started</a>
            </div>
            
            <div class="pricing-card" style="display: flex; flex-direction: column; height: 100%;">
                <div class="pricing-title">Enterprise</div>
                <div class="price">$499</div>
                <p class="card-description">
                    For solo entrepreneurs ready to scale their business.
                </p>
                <ul class="pricing-features" style="flex-grow: 1;">
                    <li>✓ All 36 Virtual Workers</li>
                    <li>✓ Custom AI Training</li>
                    <li>✓ Dedicated Success Manager</li>
                    <li>✓ White-label Solutions</li>
                    <li>✓ Advanced Analytics</li>
                    <li>✓ API Access</li>
                </ul>
                <a href="/pricing/enterprise" class="btn-primary" style="margin-top: auto;">Get Started</a>
            </div>
        </div>
    </div>
</section>
```

### **Step 3: Use Homepage CSS (Already in Page Settings)**
The homepage CSS is already loaded, so the pricing page will automatically use:
- ✅ Correct brand colors (`#fe3d51`, `#bf5700`, `#5ffbfd`, `#110d28`)
- ✅ Correct typography (`'Outfit'` font)
- ✅ Correct dark theme with glassmorphism
- ✅ Consistent button styles and spacing

### **Step 4: Add CTA Section**
```html
<section class="section-alt" style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);">
    <div class="section-container">
        <h2 class="section-title" style="color: white;">Ready to Transform Your Work?</h2>
        <p class="section-subtitle" style="color: rgba(255, 255, 255, 0.9);">
            Join hundreds of solo entrepreneurs already using AI-powered virtual workers to grow.
        </p>
        
        <div class="hero-buttons">
            <a href="https://form.typeform.com/to/noAaEhea?utm_source=webflow&utm_medium=pricing&utm_campaign=lead_gen" 
               target="_blank" 
               class="btn-primary" 
               style="background: var(--primary); color: white !important; border: 2px solid var(--primary) !important;">
                Get Your Free Assessment
            </a>
            <a href="/categories" class="btn-secondary" style="border-color: white; color: white !important;">
                Browse Workers
            </a>
        </div>
    </div>
</section>
```

## 🎯 **KEY FIXES**

1. **Use Homepage CSS**: Don't add custom CSS - use the existing homepage styles
2. **Match Service Types**: 4 service types (Marketplace, Custom, Subscriptions, Ready Solutions)
3. **Match Brand Colors**: Use the existing CSS variables
4. **Match Layout**: Use the same card structure as homepage
5. **Match Typography**: Use the same font system
6. **Match Buttons**: Use the same button styles

This will create a consistent, professional pricing page that matches the homepage perfectly!
