const fs = require('fs');
const path = require('path');

// Build script for Rensto HTML pages
class RenstoBuilder {
  constructor() {
    this.componentsDir = 'components';
    this.outputDir = '.';
    this.templateDir = '.';
  }

  // Read component file
  readComponent(componentName) {
    const filePath = path.join(this.componentsDir, `${componentName}.html`);
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`Error reading component ${componentName}:`, error.message);
      return '';
    }
  }

  // Read template file
  readTemplate(templateName) {
    const filePath = path.join(this.templateDir, `${templateName}.html`);
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`Error reading template ${templateName}:`, error.message);
      return '';
    }
  }

  // Build a complete page
  buildPage(pageName, content) {
    console.log(`Building ${pageName}...`);
    
    // Read master template
    let html = this.readTemplate('template-master');
    if (!html) {
      console.error(`Master template not found`);
      return;
    }

    // Read all components
    const logo = this.readComponent('logo');
    const navigation = this.readComponent('navigation');
    const ctaButton = this.readComponent('cta-button');
    const heroSection = this.readComponent('hero-section');
    const pricingCard = this.readComponent('pricing-card');
    const footer = this.readComponent('footer');
    const styles = this.readComponent('styles');

    // Replace template placeholders
    html = html.replace('{{PAGE_TITLE}}', content.title || 'Rensto');
    html = html.replace('{{PAGE_DESCRIPTION}}', content.description || '');
    html = html.replace('{{PAGE_CONTENT}}', content.body || '');

    // Replace component includes with actual content
    html = html.replace('<!--#include file="components/logo.html" -->', logo);
    html = html.replace('<!--#include file="components/navigation.html" -->', navigation);
    html = html.replace('<!--#include file="components/cta-button.html" -->', ctaButton);
    html = html.replace('<!--#include file="components/hero-section.html" -->', heroSection);
    html = html.replace('<!--#include file="components/pricing-card.html" -->', pricingCard);
    html = html.replace('<!--#include file="components/footer.html" -->', footer);
    html = html.replace('<!--#include file="components/styles.html" -->', styles);

    // Write output file
    const outputPath = path.join(this.outputDir, `${pageName}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`✅ Built ${pageName}.html`);
  }

  // Build all pages
  buildAll() {
    console.log('🚀 Starting Rensto HTML build process...\n');

    // Define all pages to build
    const pages = [
      {
        name: 'home-updated',
        content: {
          title: 'Rensto - Make Your Business Run Itself',
          description: 'Stop doing repetitive tasks manually. Let Rensto handle the boring stuff so you can focus on growing your business. Simple, affordable, and it actually works.',
          body: `
            <section class="hero">
              <div class="hero-content">
                <h1 class="hero-title">Make Your Business Run Itself</h1>
                <p class="hero-subtitle">
                  Stop doing the same boring tasks over and over. Let Rensto handle the repetitive stuff so you can focus on what actually makes you money. No tech skills needed.
                </p>
                
                <div class="hero-buttons">
                  <a href="/lead-generator.html" class="btn-primary">Start Free Trial</a>
                  <a href="/marketplace" class="btn-secondary">Browse Marketplace</a>
                </div>
              </div>
            </section>

            <section class="section">
              <div class="section-container">
                <h2 class="section-title">How We Help Your Business</h2>
                <p class="section-subtitle">
                  Pick what works best for you. We have ready-made solutions, custom help, or you can do it yourself. Whatever you're comfortable with.
                </p>
                
                <div class="service-types">
                  <div class="service-card">
                    <div class="service-icon">🏪</div>
                    <h3 class="service-title">Ready-Made Solutions</h3>
                    <p class="service-description">Pre-built tools that work right out of the box</p>
                    <ul class="service-features">
                      <li>Download and use immediately</li>
                      <li>We install it for you</li>
                      <li>Do it yourself option</li>
                      <li>See what others say</li>
                      <li>Book help when you need it</li>
                    </ul>
                    <div class="service-pricing">From $29/template</div>
                    <a href="/marketplace" class="btn-primary">Browse Templates</a>
                  </div>
                  
                  <div class="service-card popular">
                    <div class="service-icon">🎤</div>
                    <h3 class="service-title">Personal Help</h3>
                    <p class="service-description">We build exactly what you need for your business</p>
                    <ul class="service-features">
                      <li>Free phone call to understand your needs</li>
                      <li>Custom plan just for you</li>
                      <li>We do all the technical stuff</li>
                      <li>We manage the whole project</li>
                      <li>We're here when you need us</li>
                    </ul>
                    <div class="service-pricing">Free consultation</div>
                    <a href="/custom" class="btn-primary">Book Free Consultation</a>
                  </div>
                  
                  <div class="service-card">
                    <div class="service-icon">👥</div>
                    <h3 class="service-title">Lead Generation</h3>
                    <p class="service-description">We find and deliver qualified customers to you</p>
                    <ul class="service-features">
                      <li>Pick your ideal customer type</li>
                      <li>Choose how many leads you want</li>
                      <li>Connects to your existing systems</li>
                      <li>We score leads by quality</li>
                      <li>See how well it's working</li>
                    </ul>
                    <div class="service-pricing">From $97/month</div>
                    <a href="/subscriptions" class="btn-primary">Start Subscription</a>
                  </div>
                  
                  <div class="service-card">
                    <div class="service-icon">📦</div>
                    <h3 class="service-title">Industry Packages</h3>
                    <p class="service-description">Everything you need for your specific business type</p>
                    <ul class="service-features">
                      <li>Made for your industry</li>
                      <li>5 tools per package</li>
                      <li>Everything included</li>
                      <li>Buy individual tools or the whole package</li>
                      <li>Works immediately</li>
                    </ul>
                    <div class="service-pricing">Industry pricing</div>
                    <a href="/solutions" class="btn-primary">Explore Solutions</a>
                  </div>
                </div>
              </div>
            </section>

            <section class="section-alt">
              <div class="section-container">
                <h2 class="section-title">Why Choose Rensto?</h2>
                <p class="section-subtitle">
                  We make business automation simple. No confusing tech stuff. Just tell us what you want to happen, and we make it work.
                </p>
                
                <div class="benefits-grid">
                  <div class="benefit-card">
                    <div class="benefit-icon">🤖</div>
                    <h3 class="benefit-title">Smart Suggestions</h3>
                    <p class="benefit-description">
                      We learn what works best for your business and suggest improvements. Like having a smart assistant that gets better over time.
                    </p>
                  </div>
                  
                  <div class="benefit-card">
                    <div class="benefit-icon">🔧</div>
                    <h3 class="benefit-title">No Tech Skills Needed</h3>
                    <p class="benefit-description">
                      If you can click and drag, you can use our tools. No programming or technical knowledge required.
                    </p>
                  </div>
                  
                  <div class="benefit-card">
                    <div class="benefit-icon">📈</div>
                    <h3 class="benefit-title">Grows With You</h3>
                    <p class="benefit-description">
                      Start small and add more as your business grows. You only pay for what you use.
                    </p>
                  </div>
                  
                  <div class="benefit-card">
                    <div class="benefit-icon">💰</div>
                    <h3 class="benefit-title">Fair Pricing</h3>
                    <p class="benefit-description">
                      Prices that make sense for small businesses. You'll save more money than you spend.
                    </p>
                  </div>
                  
                  <div class="benefit-card">
                    <div class="benefit-icon">⚡</div>
                    <h3 class="benefit-title">Works Right Away</h3>
                    <p class="benefit-description">
                      Set up in minutes, not months. Start saving time and money immediately.
                    </p>
                  </div>
                  
                  <div class="benefit-card">
                    <div class="benefit-icon">🎯</div>
                    <h3 class="benefit-title">Works With Everything</h3>
                    <p class="benefit-description">
                      One place for all your business needs. Works with whatever tools you already use.
                    </p>
                  </div>
                </div>
                
                <div class="stats-bar">
                  <div class="stat-item">
                    <span class="stat-number">4,000+</span>
                    <span class="stat-label">Happy Customers</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">$470K</span>
                    <span class="stat-label">Monthly Revenue</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">10x</span>
                    <span class="stat-label">Time Saved</span>
                  </div>
                </div>
              </div>
            </section>

            <section class="section">
              <div class="section-container">
                <h2 class="section-title">Simple Pricing</h2>
                <p class="section-subtitle">
                  Pick the plan that works for your business. No hidden fees, no surprises.
                </p>
                
                <div class="pricing-grid">
                  <div class="pricing-card">
                    <div class="pricing-title">Basic</div>
                    <div class="price">$97</div>
                    <p class="service-description">Perfect for small businesses getting started</p>
                    <ul class="pricing-features">
                      <li>Up to 1,000 tasks per month</li>
                      <li>5 ready-made tools</li>
                      <li>Works with 5 popular apps</li>
                      <li>Email help when you need it</li>
                      <li>We set it up for you</li>
                    </ul>
                    <a href="/lead-generator.html" class="btn-primary">Get Started</a>
                  </div>
                  
                  <div class="pricing-card popular">
                    <div class="pricing-title">Professional</div>
                    <div class="price">$197</div>
                    <p class="service-description">Ideal for growing businesses</p>
                    <ul class="pricing-features">
                      <li>Up to 10,000 tasks per month</li>
                      <li>15 ready-made tools</li>
                      <li>Works with 15 popular apps</li>
                      <li>Priority help when you need it</li>
                      <li>Professional setup</li>
                      <li>Monthly check-in calls</li>
                    </ul>
                    <a href="/lead-generator.html" class="btn-primary">Get Started</a>
                  </div>
                  
                  <div class="pricing-card">
                    <div class="pricing-title">Enterprise</div>
                    <div class="price">$497</div>
                    <p class="service-description">For large organizations</p>
                    <ul class="pricing-features">
                      <li>Unlimited tasks</li>
                      <li>Unlimited tools</li>
                      <li>Works with any app</li>
                      <li>Your own support person</li>
                      <li>Custom branding</li>
                      <li>Custom tools just for you</li>
                      <li>Detailed reports</li>
                    </ul>
                    <a href="/lead-generator.html" class="btn-primary">Get Started</a>
                  </div>
                </div>
              </div>
            </section>

            <section class="section-alt" style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);">
              <div class="section-container">
                <h2 class="section-title" style="color: white;">Ready to Stop Doing Boring Tasks?</h2>
                <p class="section-subtitle" style="color: rgba(255, 255, 255, 0.9);">
                  Join thousands of businesses already saving time and money with Rensto.
                </p>
                
                <div class="hero-buttons">
                  <a href="/lead-generator.html" class="btn-primary" style="background: white; color: var(--primary) !important;">
                    Start Free Trial
                  </a>
                  <a href="/marketplace" class="btn-secondary" style="border-color: white; color: white !important;">
                    Browse Marketplace
                  </a>
                </div>
              </div>
            </section>
          `
        }
      },
      {
        name: 'pricing',
        content: {
          title: 'Rensto - Pricing Plans',
          description: 'Simple, transparent pricing for your business automation needs. Choose the plan that works for you.',
          body: `
            <section class="hero">
              <div class="hero-content">
                <h1 class="hero-title">Simple Pricing</h1>
                <p class="hero-subtitle">
                  Pick the plan that works for your business. No hidden fees, no surprises.
                </p>
              </div>
            </section>

            <section class="section">
              <div class="section-container">
                <div class="pricing-grid">
                  <div class="pricing-card">
                    <div class="pricing-title">Basic</div>
                    <div class="price">$97<span>/month</span></div>
                    <p class="service-description">Perfect for small businesses getting started</p>
                    <ul class="pricing-features">
                      <li>Up to 1,000 tasks per month</li>
                      <li>5 ready-made tools</li>
                      <li>Email support</li>
                      <li>Basic analytics</li>
                    </ul>
                    <a href="/lead-generator.html" class="btn-primary">Get Started</a>
                  </div>

                  <div class="pricing-card popular">
                    <div class="popular-badge">Most Popular</div>
                    <div class="pricing-title">Professional</div>
                    <div class="price">$197<span>/month</span></div>
                    <p class="service-description">For growing businesses that need more power</p>
                    <ul class="pricing-features">
                      <li>Up to 5,000 tasks per month</li>
                      <li>15 ready-made tools</li>
                      <li>Priority support</li>
                      <li>Advanced analytics</li>
                      <li>Custom integrations</li>
                    </ul>
                    <a href="/lead-generator.html" class="btn-primary">Get Started</a>
                  </div>

                  <div class="pricing-card">
                    <div class="pricing-title">Enterprise</div>
                    <div class="price">$497<span>/month</span></div>
                    <p class="service-description">For large businesses with complex needs</p>
                    <ul class="pricing-features">
                      <li>Unlimited tasks</li>
                      <li>All tools + custom development</li>
                      <li>Dedicated support</li>
                      <li>Full analytics dashboard</li>
                      <li>White-label options</li>
                    </ul>
                    <a href="/lead-generator.html" class="btn-primary">Get Started</a>
                  </div>
                </div>
              </div>
            </section>
          `
        }
      },
      {
        name: 'lead-generator',
        content: {
          title: 'Rensto - AI-Powered Lead Generation',
          description: 'Transform your business with AI-powered lead generation. Get 5-500 qualified leads automatically with our advanced automation platform.',
          body: `
            <section class="hero">
              <div class="hero-content">
                <h1 class="hero-title">AI-Powered Lead Generation</h1>
                <p class="hero-subtitle">
                  Transform your business with AI-powered lead generation. Get 5-500 qualified leads automatically with our advanced automation platform.
                </p>
                
                <div class="typeform-container">
                  <div data-tf-widget="DyDRE3PD" data-tf-opacity="100" data-tf-iframe-props="title=Rensto Lead Generation" data-tf-transitive-search-params data-tf-medium="snippet" style="width:100%;height:600px;"></div>
                  <script src="//embed.typeform.com/next/embed.js"></script>
                </div>
              </div>
            </section>

            <script>
              // Typeform webhook handler
              window.addEventListener('message', function(event) {
                if (event.data.type === 'form-submit') {
                  // Handle form submission
                  const formData = event.data.form_response;
                  
                  // Parse Typeform response
                  const answers = formData.answers;
                  const parsedData = {
                    firstName: answers.find(a => a.field.title === 'First Name')?.text || '',
                    lastName: answers.find(a => a.field.title === 'Last Name')?.text || '',
                    email: answers.find(a => a.field.title === 'Email Address')?.email || '',
                    businessDescription: answers.find(a => a.field.title === 'About Your Business')?.text || '',
                    targetLeads: answers.find(a => a.field.title === 'What type of leads are you looking for?')?.text || '',
                    pricingTier: answers.find(a => a.field.title === 'Choose Your Plan')?.choice?.label || ''
                  };

                  // Send to n8n workflow
                  fetch('http://173.254.201.134:5678/webhook/f7c8e6ff-7a1b-46b0-acbb-348367a8d19d', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(parsedData)
                  }).then(response => {
                    if (response.ok) {
                      // Redirect to success page
                      window.location.href = '/success.html';
                    }
                  }).catch(error => {
                    console.error('Error:', error);
                  });
                }
              });
            </script>
          `
        }
      }
    ];

    // Build each page
    pages.forEach(page => {
      this.buildPage(page.name, page.content);
    });

    console.log(`\n✅ Build complete! Generated ${pages.length} pages.`);
    console.log('\n📁 Files created:');
    pages.forEach(page => {
      console.log(`   - ${page.name}.html`);
    });
  }
}

// Run the build
const builder = new RenstoBuilder();
builder.buildAll();
