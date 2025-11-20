/**
 * Custom Solutions Checkout Handler - ENHANCED VERSION
 *
 * Handles Stripe checkout for:
 * - Business Audit ($297)
 * - Automation Sprint ($1,997)
 * - Full Custom Projects ($3,500-$8,000+)
 *
 * NEW Features v1.2.0:
 * - Enhanced hover animations & micro-interactions
 * - Scroll progress indicator
 * - Glassmorphism card effects
 * - Smooth gradient backgrounds
 * - Premium visual polish
 *
 * Usage: Load after stripe-core.js
 * Version: 1.2.0 (Enhanced with Priority 1 optimizations - Nov 19, 2025)
 */

(function () {
  'use strict';

  // Wait for DOM and stripe-core to be ready
  function init() {
    if (!window.RenstoStripe) {
      console.error('❌ RenstoStripe core not loaded');
      return;
    }

    console.log('🎯 Custom Solutions Checkout: Initializing Enhanced Version v1.2.0...');

    // Initialize Custom Solutions buttons - Support both class variations
    const hasSpecificClass = document.querySelectorAll('.custom-solutions-button').length > 0;
    const selector = hasSpecificClass ? '.custom-solutions-button' : '.pricing-button';

    window.RenstoStripe.initCheckoutButtons(
      selector,
      'custom-solutions',
      'custom-solutions'
    );

    // Add Priority 1 Enhancements
    addScrollProgressIndicator();
    enhanceCardAnimations();
    addHoverEffects();
    addMicroInteractions();
    handleScorecardForm();

    console.log(`✅ Custom Solutions Checkout: Ready with enhancements (using selector: ${selector})`);
  }

  /**
   * Add Scroll Progress Indicator
   * Shows user how far they've scrolled down the page
   */
  function addScrollProgressIndicator() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #fe3d51 0%, #bf5700 50%, #5ffbfd 100%);
      z-index: 9999;
      transition: width 0.1s ease-out;
      box-shadow: 0 2px 10px rgba(94, 251, 253, 0.5);
    `;
    document.body.prepend(progressBar);

    // Update progress on scroll
    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }

  /**
   * Enhance Card Animations
   * Add smooth entrance animations to cards using Intersection Observer
   */
  function enhanceCardAnimations() {
    const projectCards = document.querySelectorAll('.project-card, .investment-range, .mechanism-step, .problem-card');

    if (projectCards.length === 0) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100); // Stagger animation
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    projectCards.forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(card);
    });
  }

  /**
   * Add Enhanced Hover Effects
   * Premium hover interactions for cards and buttons
   */
  function addHoverEffects() {
    // Inject hover styles
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced Card Hover Effects */
      .project-card,
      .investment-range,
      .mechanism-step,
      .problem-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }

      .project-card:hover,
      .investment-range:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 60px rgba(94, 251, 253, 0.3);
        border-color: rgba(94, 251, 253, 0.6);
        background: linear-gradient(145deg, rgba(94, 251, 253, 0.05), rgba(30, 174, 247, 0.05));
      }

      .mechanism-step:hover {
        background: linear-gradient(135deg, rgba(30, 174, 247, 0.15), rgba(94, 251, 253, 0.1));
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(94, 251, 253, 0.2);
      }

      .problem-card:hover {
        border-color: rgba(254, 61, 81, 0.6);
        box-shadow: 0 15px 40px rgba(254, 61, 81, 0.2);
        transform: translateY(-5px);
      }

      /* Button Micro-Interactions */
      .cta-button,
      .custom-solutions-button,
      .pricing-button {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .cta-button::before,
      .custom-solutions-button::before,
      .pricing-button::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }

      .cta-button:hover::before,
      .custom-solutions-button:hover::before,
      .pricing-button:hover::before {
        width: 300px;
        height: 300px;
      }

      .cta-button:hover,
      .custom-solutions-button:hover,
      .pricing-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(94, 251, 253, 0.4);
      }

      /* Glassmorphism Effect for Lead Magnet */
      .lead-magnet-content {
        background: rgba(26, 22, 53, 0.7) !important;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      /* Smooth gradient animation for hero */
      .hero {
        background-size: 200% 200%;
        animation: gradientShift 15s ease infinite;
      }

      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      /* Stat number counting animation */
      .stat-value {
        transition: color 0.3s ease;
      }

      .stat-value:hover {
        color: #5ffbfd !important;
        transform: scale(1.1);
        display: inline-block;
      }

      /* FAQ item hover */
      .faq-question:hover {
        background: rgba(94, 251, 253, 0.05);
        padding-left: 35px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Add Button Micro-Interactions
   * Ripple effect and loading states
   */
  function addMicroInteractions() {
    const buttons = document.querySelectorAll('.cta-button, .custom-solutions-button, .pricing-button');

    buttons.forEach(button => {
      // Add ripple effect on click
      button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          top: ${y}px;
          left: ${x}px;
          pointer-events: none;
          animation: ripple 0.6s ease-out;
        `;

        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Add ripple animation
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
      @keyframes ripple {
        from {
          transform: scale(0);
          opacity: 1;
        }
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(rippleStyle);
  }

  /**
   * Handle Scorecard Form Submission
   * Intercepts form submit and sends to Rensto API
   */
  function handleScorecardForm() {
    const form = document.querySelector('#email-form-2'); // Webflow form ID
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const submitBtn = form.querySelector('input[type="submit"]');
      const originalBtnText = submitBtn.value;
      submitBtn.value = 'Sending...';
      submitBtn.disabled = true;

      // Collect form data
      const formData = new FormData(form);
      const data = {
        email: formData.get('email'),
        name: formData.get('name') || 'Visitor',
        company: formData.get('company') || 'Unknown',
        answers: {} // Collect other inputs if needed
      };

      try {
        const response = await fetch('https://rensto-webflow-scripts.vercel.app/api/scorecard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          // Show success message
          form.style.display = 'none';
          const successMsg = document.querySelector('.w-form-done');
          if (successMsg) successMsg.style.display = 'block';
        } else {
          throw new Error('Submission failed');
        }
      } catch (error) {
        console.error('Scorecard Error:', error);
        // Show error message
        const errorMsg = document.querySelector('.w-form-fail');
        if (errorMsg) errorMsg.style.display = 'block';
        submitBtn.value = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
