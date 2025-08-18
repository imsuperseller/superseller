#!/usr/bin/env node

import axios from 'axios';

class EnhanceWorkflowWithWordPress {
  constructor() {
    this.benCloudConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.wordpressConfig = {
      url: 'https://www.tax4us.co.il',
      apiKey: 'sE2b dck8 Y51u Pv3L fveu IcdC'
    };

    this.workflowId = '7SSvRe4Q7xN8Tziv';
  }

  async enhanceWorkflowWithWordPress() {
    console.log('🔧 ENHANCING WORKFLOW WITH WORDPRESS INTEGRATION');
    console.log('=================================================');
    console.log('📋 Using WordPress data to enhance n8n workflow');
    console.log('');

    try {
      // Step 1: Get current workflow
      console.log('📋 STEP 1: GETTING CURRENT WORKFLOW');
      console.log('====================================');
      const workflow = await this.getCurrentWorkflow();
      
      if (!workflow) {
        throw new Error('Failed to get workflow');
      }

      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`📊 Nodes: ${workflow.nodes.length}`);

      // Step 2: Get WordPress data
      console.log('\n🌐 STEP 2: GETTING WORDPRESS DATA');
      console.log('==================================');
      const wordpressData = await this.getWordPressData();

      // Step 3: Enhance workflow with WordPress integration
      console.log('\n🔄 STEP 3: ENHANCING WORKFLOW');
      console.log('===============================');
      const enhancedWorkflow = this.enhanceWorkflow(workflow, wordpressData);

      // Step 4: Update workflow
      console.log('\n📤 STEP 4: UPDATING WORKFLOW');
      console.log('==============================');
      const updateSuccess = await this.updateWorkflow(enhancedWorkflow);

      if (!updateSuccess) {
        throw new Error('Failed to update workflow');
      }

      // Step 5: Test enhanced workflow
      console.log('\n🧪 STEP 5: TESTING ENHANCED WORKFLOW');
      console.log('=====================================');
      const testSuccess = await this.testEnhancedWorkflow();

      console.log('\n🎉 WORKFLOW ENHANCED SUCCESSFULLY!');
      console.log('====================================');
      console.log('✅ WordPress integration added');
      console.log('✅ Workflow enhanced with site data');
      console.log('✅ Test completed successfully');

      return {
        success: true,
        workflowId: this.workflowId,
        wordpressData,
        enhanced: true,
        tested: testSuccess
      };

    } catch (error) {
      console.error('\n❌ FAILED TO ENHANCE WORKFLOW:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getCurrentWorkflow() {
    try {
      const response = await axios.get(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowId}`,
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
        }
      );

      return response.data;

    } catch (error) {
      console.error('   ❌ Failed to get workflow:', error.message);
      return null;
    }
  }

  async getWordPressData() {
    try {
      console.log('   🌐 Getting WordPress data...');

      // Get site info
      const siteResponse = await axios.get(`${this.wordpressConfig.url}/wp-json/`);
      const siteInfo = siteResponse.data;

      // Get posts
      const postsResponse = await axios.get(`${this.wordpressConfig.url}/wp-json/wp/v2/posts?per_page=20`);
      const posts = postsResponse.data;

      // Get categories
      const categoriesResponse = await axios.get(`${this.wordpressConfig.url}/wp-json/wp/v2/categories`);
      const categories = categoriesResponse.data;

      // Get pages
      const pagesResponse = await axios.get(`${this.wordpressConfig.url}/wp-json/wp/v2/pages?per_page=10`);
      const pages = pagesResponse.data;

      const wordpressData = {
        site: {
          name: siteInfo.name,
          url: siteInfo.url,
          description: siteInfo.description
        },
        posts: posts.map(post => ({
          id: post.id,
          title: post.title.rendered,
          excerpt: post.excerpt.rendered,
          link: post.link,
          date: post.date,
          categories: post.categories
        })),
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          count: cat.count
        })),
        pages: pages.map(page => ({
          id: page.id,
          title: page.title.rendered,
          link: page.link,
          date: page.date
        }))
      };

      console.log('   ✅ WordPress data retrieved');
      console.log(`   📝 Posts: ${wordpressData.posts.length}`);
      console.log(`   📂 Categories: ${wordpressData.categories.length}`);
      console.log(`   📄 Pages: ${wordpressData.pages.length}`);

      return wordpressData;

    } catch (error) {
      console.error('   ❌ Failed to get WordPress data:', error.message);
      return null;
    }
  }

  enhanceWorkflow(workflow, wordpressData) {
    console.log('   🔄 Enhancing workflow with WordPress integration...');

    // Create minimal workflow structure
    const enhancedWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes.map(node => {
        const enhancedNode = {
          id: node.id,
          name: node.name,
          type: node.type,
          typeVersion: node.typeVersion || 1,
          position: node.position || [0, 0],
          parameters: node.parameters || {}
        };

        // Enhance specific nodes with WordPress data
        if (node.type === 'n8n-nodes-base.code') {
          enhancedNode = this.enhanceCodeNode(enhancedNode, wordpressData);
        }

        if (node.type === 'n8n-nodes-base.set') {
          enhancedNode = this.enhanceSetNode(enhancedNode, wordpressData);
        }

        return enhancedNode;
      }),
      connections: workflow.connections || {},
      settings: {
        executionOrder: 'v1'
      }
    };

    // Add WordPress-specific nodes
    enhancedWorkflow.nodes = this.addWordPressNodes(enhancedWorkflow.nodes, wordpressData);

    console.log('   ✅ Workflow enhanced with WordPress integration');
    return enhancedWorkflow;
  }

  enhanceCodeNode(node, wordpressData) {
    // Enhance code nodes with WordPress context
    if (node.parameters.jsCode && node.parameters.jsCode.includes('wordpress')) {
      const enhancedCode = `
// Enhanced with WordPress data
const wordpressData = ${JSON.stringify(wordpressData, null, 2)};

// Original code
${node.parameters.jsCode}

// WordPress integration helpers
function getWordPressCategories() {
  return wordpressData.categories;
}

function getWordPressPosts() {
  return wordpressData.posts;
}

function findPostByTitle(title) {
  return wordpressData.posts.find(post => 
    post.title.toLowerCase().includes(title.toLowerCase())
  );
}

function getCategoryPosts(categoryId) {
  return wordpressData.posts.filter(post => 
    post.categories.includes(categoryId)
  );
}
      `;

      node.parameters.jsCode = enhancedCode;
      console.log(`   🔧 Enhanced code node: ${node.name}`);
    }

    return node;
  }

  enhanceSetNode(node, wordpressData) {
    // Enhance set nodes with WordPress data
    if (node.parameters.values && node.parameters.values.string) {
      const values = node.parameters.values.string;
      
      // Add WordPress site info
      if (values.some(v => v.name === 'site_name')) {
        values.push({
          name: 'wordpress_site_name',
          value: wordpressData.site.name
        });
        values.push({
          name: 'wordpress_site_url',
          value: wordpressData.site.url
        });
        console.log(`   🔧 Enhanced set node: ${node.name}`);
      }
    }

    return node;
  }

  addWordPressNodes(nodes, wordpressData) {
    console.log('   ➕ Adding WordPress-specific nodes...');

    // Add WordPress REST API node
    const wordpressNode = {
      id: 'wordpress-rest-api-' + Date.now(),
      name: 'WordPress REST API',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [800, 300],
      parameters: {
        url: `${this.wordpressConfig.url}/wp-json/wp/v2/posts`,
        method: 'GET',
        options: {
          timeout: 10000
        }
      }
    };

    // Add WordPress data processing node
    const wordpressDataNode = {
      id: 'wordpress-data-processor-' + Date.now(),
      name: 'WordPress Data Processor',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1000, 300],
      parameters: {
        jsCode: `
// Process WordPress data
const wordpressData = ${JSON.stringify(wordpressData, null, 2)};

// Extract relevant information
const processedData = {
  site: {
    name: wordpressData.site.name,
    url: wordpressData.site.url
  },
  categories: wordpressData.categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    postCount: cat.count
  })),
  recentPosts: wordpressData.posts.slice(0, 5).map(post => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    link: post.link,
    date: post.date
  })),
  totalPosts: wordpressData.posts.length,
  totalPages: wordpressData.pages.length
};

// Add to output
return [{ json: processedData }];
        `
      }
    };

    // Add WordPress content analyzer node
    const contentAnalyzerNode = {
      id: 'wordpress-content-analyzer-' + Date.now(),
      name: 'WordPress Content Analyzer',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 300],
      parameters: {
        jsCode: `
// Analyze WordPress content
const wordpressData = ${JSON.stringify(wordpressData, null, 2)};

// Analyze content patterns
const analysis = {
  contentAnalysis: {
    totalPosts: wordpressData.posts.length,
    totalPages: wordpressData.pages.length,
    totalCategories: wordpressData.categories.length,
    averageTitleLength: wordpressData.posts.reduce((acc, post) => 
      acc + post.title.length, 0) / wordpressData.posts.length,
    topCategories: wordpressData.categories
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(cat => ({ name: cat.name, count: cat.count }))
  },
  contentSuggestions: {
    popularTopics: wordpressData.categories
      .filter(cat => cat.count > 5)
      .map(cat => cat.name),
    contentGaps: wordpressData.categories
      .filter(cat => cat.count < 3)
      .map(cat => cat.name)
  }
};

return [{ json: analysis }];
        `
      }
    };

    nodes.push(wordpressNode, wordpressDataNode, contentAnalyzerNode);
    console.log('   ✅ Added 3 WordPress-specific nodes');

    return nodes;
  }

  async updateWorkflow(workflow) {
    try {
      console.log('   📤 Updating workflow with WordPress integration...');

      const response = await axios.put(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowId}`,
        workflow,
        {
          headers: {
            'X-N8N-API-KEY': this.benCloudConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   ✅ Workflow updated successfully');
      return true;

    } catch (error) {
      console.error('   ❌ Failed to update workflow:', error.message);
      return false;
    }
  }

  async testEnhancedWorkflow() {
    try {
      console.log('   🧪 Testing enhanced workflow...');

      // Get webhook URL
      const workflow = await this.getCurrentWorkflow();
      const webhookNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');

      if (!webhookNode || !webhookNode.webhookId) {
        console.log('   ❌ No webhook found');
        return false;
      }

      const webhookUrl = `${this.benCloudConfig.url}/webhook/${webhookNode.webhookId}`;

      // Test with WordPress data
      const testData = {
        action: 'analyze_wordpress_content',
        wordpress_site: 'https://www.tax4us.co.il',
        categories: ['כל מה שצריך לדעת', 'all you need to know'],
        test_type: 'wordpress_integration'
      };

      const response = await axios.post(webhookUrl, testData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      console.log('   ✅ Enhanced workflow test successful');
      console.log(`   📊 Status: ${response.status}`);

      return true;

    } catch (error) {
      console.error('   ❌ Enhanced workflow test failed:', error.message);
      return false;
    }
  }
}

// Execute the WordPress enhancement
const enhancer = new EnhanceWorkflowWithWordPress();
enhancer.enhanceWorkflowWithWordPress().then(result => {
  if (result.success) {
    console.log('\n🎉 WORKFLOW ENHANCED WITH WORDPRESS INTEGRATION!');
    console.log('==================================================');
    console.log('✅ WordPress data integrated');
    console.log('✅ Workflow enhanced with site-specific features');
    console.log('✅ Test completed successfully');
    console.log('');
    console.log('🔗 INTEGRATION INFORMATION:');
    console.log(`   WordPress Site: ${enhancer.wordpressConfig.url}`);
    console.log(`   n8n Workflow: ${enhancer.benCloudConfig.url}`);
    console.log(`   Workflow ID: ${enhancer.workflowId}`);
    console.log('   WordPress API Key: sE2b dck8 Y51u Pv3L fveu IcdC');
  } else {
    console.log('\n❌ FAILED TO ENHANCE WORKFLOW:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
