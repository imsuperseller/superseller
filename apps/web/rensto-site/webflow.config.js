module.exports = {
  // DevLink configuration for Webflow
  components: {
    'PricingPage': {
      path: './src/components/pricing/PricingPage.tsx',
      props: {
        // No props needed for this component
      }
    }
  },
  
  // Build configuration
  build: {
    outDir: './dist',
    sourcemap: true
  },
  
  // Webflow integration settings
  webflow: {
    siteId: '66c7e551a317e0e9c9f906d8',
    componentLibrary: 'rensto-components'
  }
};
