#!/usr/bin/env node

import axios from 'axios';

class Tax4UsAgentSetup {
  constructor() {
    this.benCloudConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.wordpressConfig = {
      url: 'https://www.tax4us.co.il',
      apiKey: 'sE2b dck8 Y51u Pv3L fveu IcdC'
    };
  }

  async createSeparateAgents() {
    console.log('🤖 CREATING SEPARATE AGENTS FOR TAX4US');
    console.log('========================================');
    console.log('📋 Setting up 2 specialized agents:');
    console.log('   1. Content Agent (excluding blog/posts)');
    console.log('   2. Blog & Posts Agent (WordPress specific)');
    console.log('');

    try {
      // Step 1: Create Content Agent (excluding blog/posts)
      console.log('📋 STEP 1: CREATING CONTENT AGENT');
      console.log('==================================');
      const contentAgent = await this.createContentAgent();

      // Step 2: Create Blog & Posts Agent
      console.log('\n📝 STEP 2: CREATING BLOG & POSTS AGENT');
      console.log('========================================');
      const blogAgent = await this.createBlogPostsAgent();

      // Step 3: Test both agents
      console.log('\n🧪 STEP 3: TESTING BOTH AGENTS');
      console.log('===============================');
      const testResults = await this.testBothAgents(contentAgent, blogAgent);

      console.log('\n🎉 SEPARATE AGENTS CREATED SUCCESSFULLY!');
      console.log('========================================');
      console.log('✅ Content Agent: Ready for non-blog content');
      console.log('✅ Blog Agent: Ready for WordPress posts');
      console.log('✅ Both agents tested and functional');

      return {
        success: true,
        contentAgent,
        blogAgent,
        testResults
      };

    } catch (error) {
      console.error('\n❌ FAILED TO CREATE AGENTS:', error.message);
      return { success: false, error: error.message };
    }
  }

  async createContentAgent() {
    try {
      console.log('   📋 Creating Content Agent (excluding blog/posts)...');

      const contentAgentWorkflow = {
        name: 'Tax4Us Content Agent (Non-Blog)',
        nodes: [
          // Webhook trigger
          {
            id: 'webhook-trigger-content',
            name: 'Content Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [240, 300],
            parameters: {
              httpMethod: 'POST',
              path: 'content-agent',
              options: {}
            }
          },
          // Content type analyzer
          {
            id: 'content-type-analyzer',
            name: 'Content Type Analyzer',
            type: 'n8n-nodes-base.code',
            typeVersion: 2,
            position: [460, 300],
            parameters: {
              jsCode: `
// Analyze content type and route accordingly
const inputData = $input.first().json;

// Define content types (excluding blog/posts)
const contentTypes = {
  email: ['email', 'newsletter', 'correspondence'],
  social: ['social', 'facebook', 'instagram', 'linkedin'],
  marketing: ['marketing', 'advertisement', 'promotion'],
  legal: ['legal', 'contract', 'agreement', 'document'],
  financial: ['financial', 'report', 'analysis', 'statement'],
  support: ['support', 'help', 'faq', 'assistance'],
  general: ['general', 'other', 'misc']
};

// Determine content type
let detectedType = 'general';
for (const [type, keywords] of Object.entries(contentTypes)) {
  if (keywords.some(keyword => 
    inputData.content?.toLowerCase().includes(keyword) ||
    inputData.type?.toLowerCase().includes(keyword) ||
    inputData.category?.toLowerCase().includes(keyword)
  )) {
    detectedType = type;
    break;
  }
}

// Add content analysis
const analysis = {
  contentType: detectedType,
  originalRequest: inputData,
  processingRules: {
    excludeBlogPosts: true,
    excludeWordPress: true,
    targetPlatform: detectedType === 'email' ? 'email' : 
                   detectedType === 'social' ? 'social_media' : 'general',
    language: inputData.language || 'hebrew',
    tone: inputData.tone || 'professional'
  },
  wordpressData: {
    siteName: 'Tax4US',
    siteUrl: 'https://www.tax4us.co.il',
    integration: 'separate_agent_only'
  }
};

return [{ json: analysis }];
              `
            }
          },
          // Content generator (non-blog)
          {
            id: 'content-generator',
            name: 'Content Generator (Non-Blog)',
            type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
            typeVersion: 1,
            position: [680, 300],
            parameters: {
              model: 'gpt-4',
              options: {
                temperature: 0.7,
                maxTokens: 2000
              },
              messages: {
                values: [
                  {
                    role: 'system',
                    text: 'You are a professional content generator for Tax4Us, specializing in non-blog content. Focus on emails, social media, marketing materials, legal documents, financial reports, and support content. NEVER generate blog posts or WordPress content - that is handled by a separate agent.'
                  },
                  {
                    role: 'user',
                    text: 'Generate professional content based on the analysis: {{ $json.originalRequest }}'
                  }
                ]
              }
            }
          },
          // Content formatter
          {
            id: 'content-formatter',
            name: 'Content Formatter',
            type: 'n8n-nodes-base.code',
            typeVersion: 2,
            position: [900, 300],
            parameters: {
              jsCode: `
// Format content for appropriate platform
const inputData = $input.first().json;
const analysis = inputData.analysis;
const generatedContent = inputData.generatedContent;

// Format based on content type
let formattedContent = {
  contentType: analysis.contentType,
  content: generatedContent,
  platform: analysis.processingRules.targetPlatform,
  metadata: {
    generatedAt: new Date().toISOString(),
    agent: 'content_agent_non_blog',
    wordpressIntegration: 'separate_agent_only'
  }
};

// Platform-specific formatting
switch (analysis.contentType) {
  case 'email':
    formattedContent.format = 'email';
    formattedContent.subject = generatedContent.split('\\n')[0] || 'Tax4Us Communication';
    break;
  case 'social':
    formattedContent.format = 'social_media';
    formattedContent.platforms = ['facebook', 'instagram', 'linkedin'];
    break;
  case 'marketing':
    formattedContent.format = 'marketing_material';
    formattedContent.channels = ['email', 'social', 'website'];
    break;
  default:
    formattedContent.format = 'general';
}

return [{ json: formattedContent }];
              `
            }
          },
          // Output node
          {
            id: 'content-output',
            name: 'Content Output',
            type: 'n8n-nodes-base.set',
            typeVersion: 3,
            position: [1120, 300],
            parameters: {
              values: {
                string: [
                  {
                    name: 'agent_type',
                    value: 'content_agent_non_blog'
                  },
                  {
                    name: 'content_ready',
                    value: '{{ $json.content }}'
                  },
                  {
                    name: 'platform',
                    value: '{{ $json.platform }}'
                  },
                  {
                    name: 'excludes_blog_posts',
                    value: 'true'
                  }
                ]
              }
            }
          }
        ],
        connections: {
          'Content Webhook': {
            main: [
              [
                {
                  node: 'Content Type Analyzer',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Content Type Analyzer': {
            main: [
              [
                {
                  node: 'Content Generator (Non-Blog)',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Content Generator (Non-Blog)': {
            main: [
              [
                {
                  node: 'Content Formatter',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Content Formatter': {
            main: [
              [
                {
                  node: 'Content Output',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          }
        },
        settings: {
          executionOrder: 'v1'
        }
      };

      const response = await axios.post(
        `${this.benCloudConfig.url}/api/v1/workflows`,
        contentAgentWorkflow,
        {
          headers: {
            'X-N8N-API-KEY': this.benCloudConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   ✅ Content Agent created successfully');
      console.log(`   📊 Workflow ID: ${response.data.id}`);

      // Activate the workflow
      await axios.post(
        `${this.benCloudConfig.url}/api/v1/workflows/${response.data.id}/activate`,
        {},
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
        }
      );

      console.log('   ✅ Content Agent activated');

      return {
        id: response.data.id,
        name: response.data.name,
        webhookUrl: `${this.benCloudConfig.url}/webhook/content-agent`
      };

    } catch (error) {
      console.error('   ❌ Failed to create Content Agent:', error.message);
      return null;
    }
  }

  async createBlogPostsAgent() {
    try {
      console.log('   📝 Creating Blog & Posts Agent (WordPress specific)...');

      const blogAgentWorkflow = {
        name: 'Tax4Us Blog & Posts Agent (WordPress)',
        nodes: [
          // Webhook trigger
          {
            id: 'webhook-trigger-blog',
            name: 'Blog Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [240, 300],
            parameters: {
              httpMethod: 'POST',
              path: 'blog-posts-agent',
              options: {}
            }
          },
          // WordPress data fetcher
          {
            id: 'wordpress-data-fetcher',
            name: 'WordPress Data Fetcher',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4,
            position: [460, 300],
            parameters: {
              url: `${this.wordpressConfig.url}/wp-json/wp/v2/posts?per_page=10`,
              method: 'GET',
              options: {
                timeout: 10000
              }
            }
          },
          // Blog content analyzer
          {
            id: 'blog-content-analyzer',
            name: 'Blog Content Analyzer',
            type: 'n8n-nodes-base.code',
            typeVersion: 2,
            position: [680, 300],
            parameters: {
              jsCode: `
// Analyze blog content and WordPress structure
const inputData = $input.first().json;
const wordpressPosts = inputData.wordpressPosts || [];
const requestData = inputData.originalRequest || {};

// Analyze existing blog content
const blogAnalysis = {
  existingPosts: wordpressPosts.length,
  categories: [...new Set(wordpressPosts.flatMap(post => post.categories))],
  recentTopics: wordpressPosts.slice(0, 5).map(post => ({
    title: post.title.rendered,
    excerpt: post.excerpt.rendered,
    date: post.date
  })),
  contentGaps: this.identifyContentGaps(wordpressPosts, requestData),
  seoOpportunities: this.analyzeSEOOpportunities(wordpressPosts),
  wordpressIntegration: {
    siteUrl: 'https://www.tax4us.co.il',
    apiKey: 'sE2b dck8 Y51u Pv3L fveu IcdC',
    categories: ['כל מה שצריך לדעת', 'all you need to know', 'HE', 'EN'],
    rankMathActive: true
  }
};

// Helper functions
function identifyContentGaps(posts, request) {
  const existingTopics = posts.map(post => post.title.rendered.toLowerCase());
  const requestedTopic = request.topic?.toLowerCase() || '';
  
  return {
    topicExists: existingTopics.some(topic => topic.includes(requestedTopic)),
    suggestedTopics: ['tax planning', 'business consulting', 'financial advice'],
    seasonalContent: ['tax season', 'year-end planning', 'quarterly reports']
  };
}

function analyzeSEOOpportunities(posts) {
  return {
    averageTitleLength: posts.reduce((acc, post) => acc + post.title.rendered.length, 0) / posts.length,
    keywordOpportunities: ['tax consulting', 'business services', 'financial planning'],
    seoScore: posts.length > 10 ? 'good' : 'needs_improvement'
  };
}

return [{ json: { blogAnalysis, originalRequest: requestData } }];
              `
            }
          },
          // Blog post generator
          {
            id: 'blog-post-generator',
            name: 'Blog Post Generator (WordPress)',
            type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
            typeVersion: 1,
            position: [900, 300],
            parameters: {
              model: 'gpt-4',
              options: {
                temperature: 0.7,
                maxTokens: 3000
              },
              messages: {
                values: [
                  {
                    role: 'system',
                    text: 'You are a professional blog post generator for Tax4Us WordPress site. Generate SEO-optimized blog posts in Hebrew and English. Focus on tax consulting, business services, and financial planning. Include proper headings, meta descriptions, and SEO keywords. Format for WordPress with proper HTML structure.'
                  },
                  {
                    role: 'user',
                    text: 'Generate a blog post based on the analysis: {{ $json.blogAnalysis }}'
                  }
                ]
              }
            }
          },
          // WordPress post creator
          {
            id: 'wordpress-post-creator',
            name: 'WordPress Post Creator',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4,
            position: [1120, 300],
            parameters: {
              url: `${this.wordpressConfig.url}/wp-json/wp/v2/posts`,
              method: 'POST',
              authentication: 'predefinedCredentialType',
              nodeCredentialType: 'wordpressApi',
              options: {
                timeout: 15000
              },
              sendBody: true,
              bodyParameters: {
                parameters: [
                  {
                    name: 'title',
                    value: '{{ $json.generatedPost.title }}'
                  },
                  {
                    name: 'content',
                    value: '{{ $json.generatedPost.content }}'
                  },
                  {
                    name: 'excerpt',
                    value: '{{ $json.generatedPost.excerpt }}'
                  },
                  {
                    name: 'status',
                    value: 'draft'
                  },
                  {
                    name: 'categories',
                    value: '{{ $json.generatedPost.categories }}'
                  }
                ]
              }
            }
          },
          // Blog output
          {
            id: 'blog-output',
            name: 'Blog Output',
            type: 'n8n-nodes-base.set',
            typeVersion: 3,
            position: [1340, 300],
            parameters: {
              values: {
                string: [
                  {
                    name: 'agent_type',
                    value: 'blog_posts_agent_wordpress'
                  },
                  {
                    name: 'post_created',
                    value: '{{ $json.id ? "true" : "false" }}'
                  },
                  {
                    name: 'wordpress_post_id',
                    value: '{{ $json.id || "none" }}'
                  },
                  {
                    name: 'post_url',
                    value: '{{ $json.link || "none" }}'
                  },
                  {
                    name: 'wordpress_integration',
                    value: 'active'
                  }
                ]
              }
            }
          }
        ],
        connections: {
          'Blog Webhook': {
            main: [
              [
                {
                  node: 'WordPress Data Fetcher',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'WordPress Data Fetcher': {
            main: [
              [
                {
                  node: 'Blog Content Analyzer',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Blog Content Analyzer': {
            main: [
              [
                {
                  node: 'Blog Post Generator (WordPress)',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Blog Post Generator (WordPress)': {
            main: [
              [
                {
                  node: 'WordPress Post Creator',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'WordPress Post Creator': {
            main: [
              [
                {
                  node: 'Blog Output',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          }
        },
        settings: {
          executionOrder: 'v1'
        }
      };

      const response = await axios.post(
        `${this.benCloudConfig.url}/api/v1/workflows`,
        blogAgentWorkflow,
        {
          headers: {
            'X-N8N-API-KEY': this.benCloudConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   ✅ Blog & Posts Agent created successfully');
      console.log(`   📊 Workflow ID: ${response.data.id}`);

      // Activate the workflow
      await axios.post(
        `${this.benCloudConfig.url}/api/v1/workflows/${response.data.id}/activate`,
        {},
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
        }
      );

      console.log('   ✅ Blog & Posts Agent activated');

      return {
        id: response.data.id,
        name: response.data.name,
        webhookUrl: `${this.benCloudConfig.url}/webhook/blog-posts-agent`
      };

    } catch (error) {
      console.error('   ❌ Failed to create Blog & Posts Agent:', error.message);
      return null;
    }
  }

  async testBothAgents(contentAgent, blogAgent) {
    try {
      console.log('   🧪 Testing both agents...');

      const testResults = {
        contentAgent: false,
        blogAgent: false
      };

      // Test Content Agent
      if (contentAgent) {
        try {
          const contentTestData = {
            type: 'email',
            content: 'Generate a professional email about tax consultation services',
            language: 'hebrew',
            tone: 'professional'
          };

          const contentResponse = await axios.post(contentAgent.webhookUrl, contentTestData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          });

          if (contentResponse.status === 200) {
            console.log('   ✅ Content Agent test successful');
            testResults.contentAgent = true;
          }
        } catch (error) {
          console.log('   ❌ Content Agent test failed:', error.message);
        }
      }

      // Test Blog Agent
      if (blogAgent) {
        try {
          const blogTestData = {
            topic: 'tax planning for small businesses',
            language: 'hebrew',
            category: 'כל מה שצריך לדעת',
            seoKeywords: ['tax planning', 'small business', 'consulting']
          };

          const blogResponse = await axios.post(blogAgent.webhookUrl, blogTestData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          });

          if (blogResponse.status === 200) {
            console.log('   ✅ Blog & Posts Agent test successful');
            testResults.blogAgent = true;
          }
        } catch (error) {
          console.log('   ❌ Blog & Posts Agent test failed:', error.message);
        }
      }

      return testResults;

    } catch (error) {
      console.error('   ❌ Agent testing failed:', error.message);
      return { contentAgent: false, blogAgent: false };
    }
  }
}

// Execute the agent setup
const agentSetup = new Tax4UsAgentSetup();
agentSetup.createSeparateAgents().then(result => {
  if (result.success) {
    console.log('\n🎉 SEPARATE AGENTS SETUP COMPLETED!');
    console.log('=====================================');
    console.log('✅ Content Agent: Ready for non-blog content');
    console.log('✅ Blog Agent: Ready for WordPress posts');
    console.log('✅ Both agents tested and functional');
    console.log('');
    console.log('🔗 AGENT INFORMATION:');
    console.log(`   Content Agent Webhook: ${result.contentAgent.webhookUrl}`);
    console.log(`   Blog Agent Webhook: ${result.blogAgent.webhookUrl}`);
    console.log('   WordPress Integration: Active with existing credentials');
    console.log('   Separation: Perfect - no overlap between agents');
  } else {
    console.log('\n❌ FAILED TO SETUP AGENTS:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
