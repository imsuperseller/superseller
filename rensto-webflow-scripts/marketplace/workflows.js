/**
 * Marketplace Dynamic Workflows Loader
 * 
 * Fetches workflows from /api/marketplace/workflows and renders them dynamically
 * Replaces the need for manual HTML editing when adding new workflows
 * 
 * Usage: Load after stripe-core.js and checkout.js
 * Version: 1.0.0
 */

(function() {
  'use strict';

  const API_ENDPOINT = 'https://api.rensto.com/api/marketplace/workflows';
  const N8N_AFFILIATE_LINK = 'https://tinyurl.com/ym3awuke';

  /**
   * Render a workflow card from API data
   */
  function renderWorkflowCard(workflow) {
    // Calculate support days based on price tier
    const supportDays = workflow.downloadPrice >= 197 ? 90 : 
                       workflow.downloadPrice >= 97 ? 30 : 14;
    
    // Training time based on complexity
    const trainingTime = workflow.complexity === 'Advanced' ? '2-hour' : 
                        workflow.complexity === 'Intermediate' ? '1-hour' : '30-minute';
    
    // Support period for install
    const supportPeriod = workflow.installPrice >= 3500 ? '1 year' : 
                         workflow.installPrice >= 1997 ? '6 months' : '90 days';

    return `
      <div class="workflow-card" data-workflow-id="${workflow.workflowId}">
        <div class="workflow-header">
          <span class="workflow-category">${escapeHtml(workflow.category)}</span>
          <h3>${escapeHtml(workflow.name)}</h3>
        </div>
        
        <p class="workflow-description">${escapeHtml(workflow.description || workflow.name)}</p>
        
        <div class="workflow-meta">
          <div class="workflow-rating">
            <span class="stars">★★★★★</span>
            <span>New</span>
          </div>
          <div class="workflow-complexity">
            <span>Complexity: ${escapeHtml(workflow.complexity)}</span>
            <span>Setup Time: ${escapeHtml(workflow.setupTime)}</span>
          </div>
        </div>

        <div class="workflow-features">
          <ul>
            ${workflow.features.map(f => `<li>✓ ${escapeHtml(f)}</li>`).join('')}
          </ul>
        </div>

        <div class="affiliate-notice" style="background: rgba(31, 174, 247, 0.1); border: 1px solid #1eaef7; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 14px;">
          <p style="margin: 0;">
            ⚡ <strong>Requires n8n Cloud:</strong> 
            <a href="${N8N_AFFILIATE_LINK}" target="_blank" rel="noopener" style="color: #1eaef7; text-decoration: underline;">Get your account here</a> 
            <span style="color: #999;">(Use our affiliate link to support Rensto development)</span>
          </p>
        </div>

        <div class="workflow-pricing">
          <div class="pricing-option download-option">
            <div class="option-header">
              <span class="option-type">DIY Download</span>
              <span class="option-price">$${workflow.downloadPrice}</span>
            </div>
            <ul class="option-features">
              <li>JSON workflow file</li>
              <li>Step-by-step setup guide</li>
              <li>${supportDays} days email support</li>
              <li>Lifetime updates</li>
            </ul>
            <button 
              class="workflow-btn workflow-download-btn cta-button cta-primary marketplace-download-btn"
              data-flow-type="marketplace-template"
              data-tier="${workflow.downloadTier}"
              data-template-price="${workflow.downloadPrice}"
              data-template-id="${workflow.workflowId}"
              data-template-name="${escapeHtml(workflow.name)}">
              Download - $${workflow.downloadPrice}
            </button>
          </div>

          <div class="pricing-option install-option">
            <div class="option-header">
              <span class="option-type">Full-Service Install</span>
              <span class="option-price">$${workflow.installPrice}</span>
            </div>
            <ul class="option-features">
              <li>We install & configure workflow</li>
              <li>Custom setup for your tools</li>
              <li>End-to-end testing</li>
              <li>${trainingTime} training session</li>
              <li>${supportPeriod} support included</li>
            </ul>
            <button 
              class="workflow-btn workflow-install-btn cta-button cta-primary marketplace-install-btn"
              data-flow-type="marketplace-install"
              data-tier="${workflow.installTier}"
              data-install-price="${workflow.installPrice}"
              data-template-id="${workflow.workflowId}-install"
              data-template-name="${escapeHtml(workflow.name)} Installation">
              Book Install - $${workflow.installPrice}
            </button>
            <p class="tidycal-note" style="font-size: 14px; color: #999; margin-top: 8px; font-style: italic;">
              📅 <strong>Note:</strong> TidyCal booking link will be sent after payment
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Fetch workflows from API and render
   */
  async function loadWorkflows() {
    const container = document.querySelector('.workflows-container, #workflows-container, .featured-templates');
    
    if (!container) {
      console.warn('⚠️ Workflows container not found. Looking for .workflows-container, #workflows-container, or .featured-templates');
      return;
    }

    // Show loading state
    container.innerHTML = '<div class="workflows-loading" style="text-align: center; padding: 40px;">Loading workflows...</div>';

    try {
      const response = await fetch(API_ENDPOINT);
      const data = await response.json();

      if (!data.success || !data.workflows || data.workflows.length === 0) {
        container.innerHTML = '<div class="workflows-empty" style="text-align: center; padding: 40px; color: #999;">No workflows available at this time.</div>';
        console.warn('⚠️ No workflows returned from API');
        return;
      }

      // Render workflow cards
      const cardsHTML = data.workflows.map(workflow => renderWorkflowCard(workflow)).join('');
      container.innerHTML = cardsHTML;

      // Initialize Stripe checkout buttons for newly rendered cards
      if (window.RenstoStripe) {
        const downloadBtns = container.querySelectorAll('.marketplace-download-btn');
        const installBtns = container.querySelectorAll('.marketplace-install-btn');
        
        if (downloadBtns.length > 0) {
          window.RenstoStripe.initCheckoutButtons(
            '.marketplace-download-btn',
            'marketplace-template',
            'marketplace'
          );
        }
        
        if (installBtns.length > 0) {
          window.RenstoStripe.initCheckoutButtons(
            '.marketplace-install-btn',
            'marketplace-install',
            'marketplace'
          );
        }
      }

      console.log(`✅ Loaded ${data.workflows.length} workflows dynamically`);
    } catch (error) {
      console.error('❌ Error loading workflows:', error);
      container.innerHTML = '<div class="workflows-error" style="text-align: center; padding: 40px; color: #fe3d51;">Error loading workflows. Please refresh the page.</div>';
    }
  }

  /**
   * Initialize when DOM is ready
   */
  function init() {
    // Wait for DOM and check if we should load workflows dynamically
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // Only load if container exists and doesn't have static content
        const hasStaticCards = document.querySelector('.workflow-card, .template-card');
        if (!hasStaticCards) {
          loadWorkflows();
        }
      });
    } else {
      const hasStaticCards = document.querySelector('.workflow-card, .template-card');
      if (!hasStaticCards) {
        loadWorkflows();
      }
    }
  }

  init();
})();

