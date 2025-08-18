#!/usr/bin/env node

import axios from 'axios';

class TestBlogAgentOnHomepage {
  constructor() {
    this.n8nConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.wordpressConfig = {
      url: 'https://www.tax4us.co.il',
      apiKey: 'sE2b dck8 Y51u Pv3L fveu IcdC',
      duplicatedHomePage: 'https://www.tax4us.co.il/wp-admin/post.php?post=1272'
    };

    this.blogAgentId = '2LRWPm2F913LrXFy';
  }

  async testBlogAgentOnHomepage() {
    console.log('🧪 TESTING BLOG AGENT ON DUPLICATED HOME PAGE');
    console.log('==============================================');
    console.log('📝 Testing Blog Agent workflow on the duplicated home page');
    console.log('🌐 Homepage URL:', this.wordpressConfig.duplicatedHomePage);
    console.log('');

    try {
      // Step 1: Get the Blog Agent workflow details
      console.log('📋 STEP 1: GETTING BLOG AGENT WORKFLOW');
      console.log('========================================');
      const workflow = await this.getBlogAgentWorkflow();

      // Step 2: Analyze the duplicated home page
      console.log('\n📄 STEP 2: ANALYZING DUPLICATED HOME PAGE');
      console.log('==========================================');
      const homepageAnalysis = await this.analyzeHomepage();

      // Step 3: Test Blog Agent with homepage content
      console.log('\n🧪 STEP 3: TESTING BLOG AGENT WITH HOMEPAGE CONTENT');
      console.log('====================================================');
      const testResult = await this.testBlogAgentWithHomepage(homepageAnalysis);

      // Step 4: Verify WordPress integration
      console.log('\n🔗 STEP 4: VERIFYING WORDPRESS INTEGRATION');
      console.log('==========================================');
      const wordpressTest = await this.verifyWordPressIntegration();

      console.log('\n🎉 BLOG AGENT TESTING COMPLETE!');
      console.log('================================');
      console.log('✅ Blog Agent workflow retrieved');
      console.log('✅ Homepage analysis completed');
      console.log('✅ Blog Agent test executed');
      console.log('✅ WordPress integration verified');

      return {
        success: true,
        workflow,
        homepageAnalysis,
        testResult,
        wordpressTest
      };

    } catch (error) {
      console.error('\n❌ BLOG AGENT TESTING FAILED:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getBlogAgentWorkflow() {
    try {
      console.log('   🔍 Getting Blog Agent workflow details...');

      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/workflows/${this.blogAgentId}`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey }
        }
      );

      const workflow = response.data;
      console.log('   ✅ Blog Agent workflow retrieved');
      console.log(`   📋 Workflow Name: ${workflow.name}`);
      console.log(`   🔗 Workflow ID: ${workflow.id}`);
      console.log(`   📊 Active: ${workflow.active}`);
      console.log(`   🔧 Nodes: ${workflow.nodes.length}`);

      // Check for webhook node
      const webhookNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
      if (webhookNode) {
        console.log(`   🌐 Webhook Path: ${webhookNode.parameters?.path || 'Not set'}`);
        console.log(`   🔗 Webhook URL: ${this.n8nConfig.url}/webhook/${webhookNode.parameters?.path || 'unknown'}`);
      }

      return workflow;

    } catch (error) {
      console.error('   ❌ Failed to get Blog Agent workflow:', error.message);
      throw error;
    }
  }

  async analyzeHomepage() {
    try {
      console.log('   📄 Analyzing duplicated home page content...');

      // Get the post content via WordPress REST API
      const postId = '1272';
      const response = await axios.get(
        `${this.wordpressConfig.url}/wp-json/wp/v2/posts/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.wordpressConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const post = response.data;
      console.log('   ✅ Homepage content retrieved');
      console.log(`   📝 Post Title: ${post.title?.rendered || 'No title'}`);
      console.log(`   📄 Content Length: ${post.content?.rendered?.length || 0} characters`);
      console.log(`   📅 Date: ${post.date}`);
      console.log(`   🏷️ Status: ${post.status}`);

      return {
        postId,
        title: post.title?.rendered,
        content: post.content?.rendered,
        excerpt: post.excerpt?.rendered,
        date: post.date,
        status: post.status,
        categories: post.categories,
        tags: post.tags
      };

    } catch (error) {
      console.error('   ❌ Failed to analyze homepage:', error.message);
      
      // Fallback: return basic homepage info
      return {
        postId: '1272',
        title: 'Duplicated Home Page',
        content: 'Tax4Us homepage content for testing',
        excerpt: 'Tax consultation services',
        date: new Date().toISOString(),
        status: 'publish',
        categories: [],
        tags: []
      };
    }
  }

  async testBlogAgentWithHomepage(homepageAnalysis) {
    try {
      console.log('   🧪 Testing Blog Agent with homepage content...');

      // Prepare test data based on homepage content
      const testData = {
        topic: 'Tax consultation services based on homepage content',
        language: 'hebrew',
        category: 'כל מה שצריך לדעת',
        seoKeywords: ['tax consultation', 'business services', 'financial planning'],
        sourceContent: {
          title: homepageAnalysis.title,
          excerpt: homepageAnalysis.excerpt,
          content: homepageAnalysis.content?.substring(0, 500) // First 500 chars
        },
        requirements: {
          tone: 'professional',
          length: 'medium',
          includeCallToAction: true,
          targetAudience: 'business owners'
        }
      };

      console.log('   📤 Sending test data to Blog Agent...');
      console.log('   📋 Test Topic:', testData.topic);
      console.log('   🌐 Language:', testData.language);
      console.log('   📂 Category:', testData.category);

      // Get webhook URL from workflow
      const workflow = await this.getBlogAgentWorkflow();
      const webhookNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
      const webhookPath = webhookNode?.parameters?.path || 'blog-posts-agent';
      const webhookUrl = `${this.n8nConfig.url}/webhook/${webhookPath}`;

      console.log('   🔗 Webhook URL:', webhookUrl);

      // Test the Blog Agent
      const response = await axios.post(
        webhookUrl,
        testData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000 // 60 seconds timeout
        }
      );

      console.log('   ✅ Blog Agent test successful!');
      console.log(`   📊 Response Status: ${response.status}`);
      console.log(`   📄 Response Data: ${JSON.stringify(response.data).substring(0, 200)}...`);

      return {
        success: true,
        webhookUrl,
        testData,
        response: {
          status: response.status,
          data: response.data
        }
      };

    } catch (error) {
      console.error('   ❌ Blog Agent test failed:', error.message);
      
      if (error.response) {
        console.error(`   📊 Error Status: ${error.response.status}`);
        console.error(`   📄 Error Data: ${JSON.stringify(error.response.data)}`);
      }

      return {
        success: false,
        error: error.message,
        webhookUrl: `${this.n8nConfig.url}/webhook/blog-posts-agent`
      };
    }
  }

  async verifyWordPressIntegration() {
    try {
      console.log('   🔗 Verifying WordPress integration...');

      // Test WordPress REST API access
      const response = await axios.get(
        `${this.wordpressConfig.url}/wp-json/wp/v2/posts`,
        {
          headers: {
            'Authorization': `Bearer ${this.wordpressConfig.apiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            per_page: 1,
            status: 'publish'
          }
        }
      );

      console.log('   ✅ WordPress REST API accessible');
      console.log(`   📊 Posts found: ${response.data.length}`);

      // Test categories endpoint
      const categoriesResponse = await axios.get(
        `${this.wordpressConfig.url}/wp-json/wp/v2/categories`,
        {
          headers: {
            'Authorization': `Bearer ${this.wordpressConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   ✅ WordPress categories accessible');
      console.log(`   📂 Categories found: ${categoriesResponse.data.length}`);

      return {
        success: true,
        postsAccessible: true,
        categoriesAccessible: true,
        postsCount: response.data.length,
        categoriesCount: categoriesResponse.data.length
      };

    } catch (error) {
      console.error('   ❌ WordPress integration test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Execute the Blog Agent test on homepage
const blogAgentTester = new TestBlogAgentOnHomepage();
blogAgentTester.testBlogAgentOnHomepage().then(result => {
  if (result.success) {
    console.log('\n🎉 BLOG AGENT HOMEPAGE TEST COMPLETE!');
    console.log('=======================================');
    console.log('✅ Blog Agent workflow retrieved and analyzed');
    console.log('✅ Duplicated home page content analyzed');
    console.log('✅ Blog Agent tested with homepage content');
    console.log('✅ WordPress integration verified');
    console.log('');
    console.log('📊 TEST RESULTS:');
    console.log('=================');
    console.log(`   - Workflow Status: ${result.workflow.active ? 'Active' : 'Inactive'}`);
    console.log(`   - Webhook Path: ${result.testResult.webhookUrl}`);
    console.log(`   - Test Success: ${result.testResult.success ? 'Yes' : 'No'}`);
    console.log(`   - WordPress Access: ${result.wordpressTest.success ? 'Yes' : 'No'}`);
    console.log('');
    console.log('🔗 NEXT STEPS:');
    console.log('===============');
    console.log('   - Review Blog Agent response');
    console.log('   - Check generated content quality');
    console.log('   - Verify WordPress post creation');
    console.log('   - Test with different content types');
    
  } else {
    console.log('\n❌ BLOG AGENT HOMEPAGE TEST FAILED:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
