#!/usr/bin/env node

import axios from 'axios';

class TestBlogAgentWithExistingPost {
  constructor() {
    this.n8nConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.wordpressConfig = {
      url: 'https://www.tax4us.co.il',
      apiKey: 'sE2b dck8 Y51u Pv3L fveu IcdC'
    };

    this.blogAgentId = '2LRWPm2F913LrXFy';
    this.testPostId = '1235'; // Federal Reserve interest rate and U.S. taxpayers
  }

  async testBlogAgentWithExistingPost() {
    console.log('🧪 TESTING BLOG AGENT WITH EXISTING POST');
    console.log('=========================================');
    console.log('📝 Testing Blog Agent with existing WordPress post content');
    console.log(`🌐 Test Post ID: ${this.testPostId}`);
    console.log('');

    try {
      // Step 1: Get the Blog Agent workflow details
      console.log('📋 STEP 1: GETTING BLOG AGENT WORKFLOW');
      console.log('========================================');
      const workflow = await this.getBlogAgentWorkflow();

      // Step 2: Get the existing post content
      console.log('\n📄 STEP 2: GETTING EXISTING POST CONTENT');
      console.log('=========================================');
      const postContent = await this.getExistingPostContent();

      // Step 3: Test Blog Agent with post content
      console.log('\n🧪 STEP 3: TESTING BLOG AGENT WITH POST CONTENT');
      console.log('================================================');
      const testResult = await this.testBlogAgentWithPostContent(postContent);

      // Step 4: Analyze Blog Agent response
      console.log('\n📊 STEP 4: ANALYZING BLOG AGENT RESPONSE');
      console.log('=========================================');
      const analysis = await this.analyzeBlogAgentResponse(testResult);

      console.log('\n🎉 BLOG AGENT TESTING COMPLETE!');
      console.log('================================');
      console.log('✅ Blog Agent workflow retrieved');
      console.log('✅ Existing post content retrieved');
      console.log('✅ Blog Agent test executed');
      console.log('✅ Response analyzed');

      return {
        success: true,
        workflow,
        postContent,
        testResult,
        analysis
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

  async getExistingPostContent() {
    try {
      console.log(`   📄 Getting content from post ID ${this.testPostId}...`);

      const response = await axios.get(
        `${this.wordpressConfig.url}/wp-json/wp/v2/posts/${this.testPostId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.wordpressConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const post = response.data;
      console.log('   ✅ Post content retrieved');
      console.log(`   📝 Post Title: ${post.title?.rendered || 'No title'}`);
      console.log(`   📄 Content Length: ${post.content?.rendered?.length || 0} characters`);
      console.log(`   📅 Date: ${post.date}`);
      console.log(`   🏷️ Status: ${post.status}`);
      console.log(`   📂 Categories: ${post.categories?.length || 0}`);

      return {
        postId: this.testPostId,
        title: post.title?.rendered,
        content: post.content?.rendered,
        excerpt: post.excerpt?.rendered,
        date: post.date,
        status: post.status,
        categories: post.categories,
        tags: post.tags,
        link: post.link
      };

    } catch (error) {
      console.error('   ❌ Failed to get post content:', error.message);
      throw error;
    }
  }

  async testBlogAgentWithPostContent(postContent) {
    try {
      console.log('   🧪 Testing Blog Agent with post content...');

      // Prepare test data based on the existing post
      const testData = {
        topic: `Create a new blog post about tax planning based on: ${postContent.title}`,
        language: 'english', // The original post is in English
        category: 'Tax Planning', // Based on the original post
        seoKeywords: ['tax planning', 'federal reserve', 'interest rates', 'taxpayers'],
        sourceContent: {
          title: postContent.title,
          excerpt: postContent.excerpt,
          content: postContent.content?.substring(0, 1000) // First 1000 chars for context
        },
        requirements: {
          tone: 'professional',
          length: 'medium',
          includeCallToAction: true,
          targetAudience: 'U.S. taxpayers',
          style: 'informative and educational'
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
          timeout: 120000 // 2 minutes timeout for AI processing
        }
      );

      console.log('   ✅ Blog Agent test successful!');
      console.log(`   📊 Response Status: ${response.status}`);
      console.log(`   📄 Response Data Length: ${JSON.stringify(response.data).length} characters`);

      return {
        success: true,
        webhookUrl,
        testData,
        response: {
          status: response.status,
          data: response.data,
          headers: response.headers
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

  async analyzeBlogAgentResponse(testResult) {
    try {
      console.log('   📊 Analyzing Blog Agent response...');

      if (!testResult.success) {
        console.log('   ❌ Test was not successful, skipping analysis');
        return {
          success: false,
          error: testResult.error
        };
      }

      const responseData = testResult.response.data;
      console.log('   ✅ Response analysis completed');

      // Analyze the response structure
      const analysis = {
        success: true,
        responseType: typeof responseData,
        responseLength: JSON.stringify(responseData).length,
        hasContent: false,
        hasTitle: false,
        hasExcerpt: false,
        hasCategories: false,
        isWordPressReady: false
      };

      // Check if response contains expected fields
      if (responseData && typeof responseData === 'object') {
        analysis.hasContent = !!responseData.content || !!responseData.post_content;
        analysis.hasTitle = !!responseData.title || !!responseData.post_title;
        analysis.hasExcerpt = !!responseData.excerpt || !!responseData.post_excerpt;
        analysis.hasCategories = !!responseData.categories || !!responseData.post_categories;
        
        // Check if it's ready for WordPress
        analysis.isWordPressReady = analysis.hasTitle && analysis.hasContent;
      }

      console.log('   📊 Analysis Results:');
      console.log(`      Response Type: ${analysis.responseType}`);
      console.log(`      Response Length: ${analysis.responseLength} characters`);
      console.log(`      Has Title: ${analysis.hasTitle ? '✅' : '❌'}`);
      console.log(`      Has Content: ${analysis.hasContent ? '✅' : '❌'}`);
      console.log(`      Has Excerpt: ${analysis.hasExcerpt ? '✅' : '❌'}`);
      console.log(`      Has Categories: ${analysis.hasCategories ? '✅' : '❌'}`);
      console.log(`      WordPress Ready: ${analysis.isWordPressReady ? '✅' : '❌'}`);

      return analysis;

    } catch (error) {
      console.error('   ❌ Failed to analyze response:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Execute the Blog Agent test with existing post
const blogAgentTester = new TestBlogAgentWithExistingPost();
blogAgentTester.testBlogAgentWithExistingPost().then(result => {
  if (result.success) {
    console.log('\n🎉 BLOG AGENT EXISTING POST TEST COMPLETE!');
    console.log('===========================================');
    console.log('✅ Blog Agent workflow retrieved and analyzed');
    console.log('✅ Existing post content retrieved');
    console.log('✅ Blog Agent tested with real content');
    console.log('✅ Response analyzed');
    console.log('');
    console.log('📊 TEST RESULTS:');
    console.log('=================');
    console.log(`   - Workflow Status: ${result.workflow.active ? 'Active' : 'Inactive'}`);
    console.log(`   - Test Post ID: ${result.postContent.postId}`);
    console.log(`   - Test Post Title: ${result.postContent.title}`);
    console.log(`   - Test Success: ${result.testResult.success ? 'Yes' : 'No'}`);
    console.log(`   - WordPress Ready: ${result.analysis.isWordPressReady ? 'Yes' : 'No'}`);
    console.log('');
    console.log('🔗 TEST POST DETAILS:');
    console.log('======================');
    console.log(`   - Post ID: ${result.postContent.postId}`);
    console.log(`   - Title: ${result.postContent.title}`);
    console.log(`   - Content Length: ${result.postContent.content?.length || 0} characters`);
    console.log(`   - Categories: ${result.postContent.categories?.length || 0}`);
    console.log(`   - Link: ${result.postContent.link}`);
    console.log('');
    console.log('🧪 BLOG AGENT PERFORMANCE:');
    console.log('==========================');
    console.log(`   - Response Status: ${result.testResult.response.status}`);
    console.log(`   - Response Length: ${result.analysis.responseLength} characters`);
    console.log(`   - Has Title: ${result.analysis.hasTitle ? '✅' : '❌'}`);
    console.log(`   - Has Content: ${result.analysis.hasContent ? '✅' : '❌'}`);
    console.log(`   - Has Excerpt: ${result.analysis.hasExcerpt ? '✅' : '❌'}`);
    console.log(`   - WordPress Ready: ${result.analysis.isWordPressReady ? '✅' : '❌'}`);
    
  } else {
    console.log('\n❌ BLOG AGENT EXISTING POST TEST FAILED:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
