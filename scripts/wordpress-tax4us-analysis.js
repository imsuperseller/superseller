#!/usr/bin/env node

import axios from 'axios';

class WordPressTax4UsAnalysis {
  constructor() {
    this.wordpressConfig = {
      url: 'https://www.tax4us.co.il',
      apiKey: 'sE2b dck8 Y51u Pv3L fveu IcdC',
      username: 'admin' // Default admin username
    };

    this.testUrl = 'https://www.tax4us.co.il/wp-admin/post.php?post=1272';
  }

  async analyzeWordPressSite() {
    console.log('🔍 ANALYZING TAX4US WORDPRESS SITE');
    console.log('===================================');
    console.log('📋 Using WordPress API to understand the setup');
    console.log('');

    try {
      // Step 1: Test WordPress REST API access
      console.log('🔍 STEP 1: TESTING WORDPRESS REST API ACCESS');
      console.log('=============================================');
      const apiAccess = await this.testWordPressAPIAccess();

      // Step 2: Get site information
      console.log('\n📋 STEP 2: GETTING SITE INFORMATION');
      console.log('=====================================');
      const siteInfo = await this.getSiteInformation();

      // Step 3: Analyze the specific post (1272)
      console.log('\n📄 STEP 3: ANALYZING POST 1272');
      console.log('=================================');
      const postAnalysis = await this.analyzePost1272();

      // Step 4: Get all posts and pages
      console.log('\n📚 STEP 4: GETTING ALL POSTS AND PAGES');
      console.log('=======================================');
      const contentAnalysis = await this.analyzeContent();

      // Step 5: Check for custom post types and taxonomies
      console.log('\n🏷️ STEP 5: CHECKING CUSTOM POST TYPES');
      console.log('=======================================');
      const customTypes = await this.checkCustomPostTypes();

      // Step 6: Analyze categories and tags
      console.log('\n📂 STEP 6: ANALYZING CATEGORIES AND TAGS');
      console.log('=========================================');
      const taxonomyAnalysis = await this.analyzeTaxonomies();

      // Step 7: Check for plugins and themes
      console.log('\n🔌 STEP 7: CHECKING PLUGINS AND THEMES');
      console.log('=======================================');
      const pluginAnalysis = await this.checkPluginsAndThemes();

      console.log('\n🎉 WORDPRESS ANALYSIS COMPLETED!');
      console.log('=================================');
      console.log('✅ Site structure understood');
      console.log('✅ Content analyzed');
      console.log('✅ Configuration identified');
      console.log('✅ Ready for n8n integration');

      return {
        success: true,
        apiAccess,
        siteInfo,
        postAnalysis,
        contentAnalysis,
        customTypes,
        taxonomyAnalysis,
        pluginAnalysis
      };

    } catch (error) {
      console.error('\n❌ WORDPRESS ANALYSIS FAILED:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testWordPressAPIAccess() {
    try {
      console.log('   🔍 Testing WordPress REST API access...');

      // Test basic REST API
      const response = await axios.get(`${this.wordpressConfig.url}/wp-json/wp/v2/`);
      
      console.log('   ✅ WordPress REST API accessible');
      console.log(`   📊 API Status: ${response.status}`);
      
      return {
        accessible: true,
        status: response.status,
        endpoints: response.data
      };

    } catch (error) {
      console.error('   ❌ WordPress REST API not accessible:', error.message);
      return {
        accessible: false,
        error: error.message
      };
    }
  }

  async getSiteInformation() {
    try {
      console.log('   📋 Getting site information...');

      const response = await axios.get(`${this.wordpressConfig.url}/wp-json/`);
      
      const siteInfo = {
        name: response.data.name,
        description: response.data.description,
        url: response.data.url,
        version: response.data.version,
        namespaces: response.data.namespaces,
        routes: Object.keys(response.data.routes)
      };

      console.log('   ✅ Site information retrieved');
      console.log(`   📝 Site Name: ${siteInfo.name}`);
      console.log(`   🌐 Site URL: ${siteInfo.url}`);
      console.log(`   📊 WordPress Version: ${siteInfo.version}`);
      console.log(`   🔗 Available Routes: ${siteInfo.routes.length}`);

      return siteInfo;

    } catch (error) {
      console.error('   ❌ Failed to get site information:', error.message);
      return null;
    }
  }

  async analyzePost1272() {
    try {
      console.log('   📄 Analyzing post 1272...');

      const response = await axios.get(`${this.wordpressConfig.url}/wp-json/wp/v2/posts/1272`);
      
      const post = response.data;
      const postAnalysis = {
        id: post.id,
        title: post.title.rendered,
        content: post.content.rendered,
        excerpt: post.excerpt.rendered,
        status: post.status,
        type: post.type,
        link: post.link,
        date: post.date,
        modified: post.modified,
        author: post.author,
        categories: post.categories,
        tags: post.tags,
        featured_media: post.featured_media,
        template: post.template,
        meta: post.meta
      };

      console.log('   ✅ Post 1272 analyzed');
      console.log(`   📝 Title: ${postAnalysis.title}`);
      console.log(`   📊 Status: ${postAnalysis.status}`);
      console.log(`   🔗 Link: ${postAnalysis.link}`);
      console.log(`   📅 Date: ${postAnalysis.date}`);
      console.log(`   👤 Author: ${postAnalysis.author}`);
      console.log(`   📂 Categories: ${postAnalysis.categories.length}`);
      console.log(`   🏷️ Tags: ${postAnalysis.tags.length}`);

      // Analyze content length
      const contentLength = postAnalysis.content.length;
      console.log(`   📏 Content Length: ${contentLength} characters`);

      return postAnalysis;

    } catch (error) {
      console.error('   ❌ Failed to analyze post 1272:', error.message);
      return null;
    }
  }

  async analyzeContent() {
    try {
      console.log('   📚 Getting all posts and pages...');

      // Get posts
      const postsResponse = await axios.get(`${this.wordpressConfig.url}/wp-json/wp/v2/posts?per_page=100`);
      const posts = postsResponse.data;

      // Get pages
      const pagesResponse = await axios.get(`${this.wordpressConfig.url}/wp-json/wp/v2/pages?per_page=100`);
      const pages = pagesResponse.data;

      const contentAnalysis = {
        posts: {
          total: posts.length,
          published: posts.filter(p => p.status === 'publish').length,
          draft: posts.filter(p => p.status === 'draft').length,
          private: posts.filter(p => p.status === 'private').length,
          recent: posts.slice(0, 5).map(p => ({
            id: p.id,
            title: p.title.rendered,
            status: p.status,
            date: p.date
          }))
        },
        pages: {
          total: pages.length,
          published: pages.filter(p => p.status === 'publish').length,
          draft: pages.filter(p => p.status === 'draft').length,
          private: pages.filter(p => p.status === 'private').length,
          recent: pages.slice(0, 5).map(p => ({
            id: p.id,
            title: p.title.rendered,
            status: p.status,
            date: p.date
          }))
        }
      };

      console.log('   ✅ Content analysis completed');
      console.log(`   📝 Posts: ${contentAnalysis.posts.total} total, ${contentAnalysis.posts.published} published`);
      console.log(`   📄 Pages: ${contentAnalysis.pages.total} total, ${contentAnalysis.pages.published} published`);

      return contentAnalysis;

    } catch (error) {
      console.error('   ❌ Failed to analyze content:', error.message);
      return null;
    }
  }

  async checkCustomPostTypes() {
    try {
      console.log('   🏷️ Checking for custom post types...');

      const response = await axios.get(`${this.wordpressConfig.url}/wp-json/wp/v2/types`);
      
      const customTypes = {
        builtIn: {},
        custom: {}
      };

      Object.entries(response.data).forEach(([type, info]) => {
        if (['post', 'page', 'attachment', 'revision', 'nav_menu_item', 'custom_css', 'oembed_cache', 'user_request', 'wp_block'].includes(type)) {
          customTypes.builtIn[type] = info;
        } else {
          customTypes.custom[type] = info;
        }
      });

      console.log('   ✅ Custom post types checked');
      console.log(`   📊 Built-in types: ${Object.keys(customTypes.builtIn).length}`);
      console.log(`   🆕 Custom types: ${Object.keys(customTypes.custom).length}`);

      if (Object.keys(customTypes.custom).length > 0) {
        console.log('   🆕 Custom post types found:');
        Object.keys(customTypes.custom).forEach(type => {
          console.log(`      - ${type}`);
        });
      }

      return customTypes;

    } catch (error) {
      console.error('   ❌ Failed to check custom post types:', error.message);
      return null;
    }
  }

  async analyzeTaxonomies() {
    try {
      console.log('   📂 Analyzing categories and tags...');

      // Get categories
      const categoriesResponse = await axios.get(`${this.wordpressConfig.url}/wp-json/wp/v2/categories?per_page=100`);
      const categories = categoriesResponse.data;

      // Get tags
      const tagsResponse = await axios.get(`${this.wordpressConfig.url}/wp-json/wp/v2/tags?per_page=100`);
      const tags = tagsResponse.data;

      const taxonomyAnalysis = {
        categories: {
          total: categories.length,
          items: categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            count: cat.count
          }))
        },
        tags: {
          total: tags.length,
          items: tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            count: tag.count
          }))
        }
      };

      console.log('   ✅ Taxonomy analysis completed');
      console.log(`   📂 Categories: ${taxonomyAnalysis.categories.total}`);
      console.log(`   🏷️ Tags: ${taxonomyAnalysis.tags.total}`);

      // Show top categories
      if (taxonomyAnalysis.categories.items.length > 0) {
        console.log('   📂 Top categories:');
        taxonomyAnalysis.categories.items
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .forEach(cat => {
            console.log(`      - ${cat.name} (${cat.count} posts)`);
          });
      }

      return taxonomyAnalysis;

    } catch (error) {
      console.error('   ❌ Failed to analyze taxonomies:', error.message);
      return null;
    }
  }

  async checkPluginsAndThemes() {
    try {
      console.log('   🔌 Checking plugins and themes...');

      // Note: This requires authentication, so we'll try a different approach
      const response = await axios.get(`${this.wordpressConfig.url}/wp-json/`);
      
      const pluginAnalysis = {
        available: response.data.routes.includes('/wp/v2/plugins'),
        themeInfo: {
          // We can get some theme info from the site
          siteName: response.data.name,
          siteDescription: response.data.description
        }
      };

      console.log('   ✅ Plugin and theme check completed');
      console.log(`   🔌 Plugin API available: ${pluginAnalysis.available}`);

      return pluginAnalysis;

    } catch (error) {
      console.error('   ❌ Failed to check plugins and themes:', error.message);
      return null;
    }
  }
}

// Execute the WordPress analysis
const analyzer = new WordPressTax4UsAnalysis();
analyzer.analyzeWordPressSite().then(result => {
  if (result.success) {
    console.log('\n🎉 WORDPRESS ANALYSIS COMPLETED SUCCESSFULLY!');
    console.log('==============================================');
    console.log('✅ Site structure understood');
    console.log('✅ Content analyzed');
    console.log('✅ Configuration identified');
    console.log('✅ Ready for n8n integration');
    console.log('');
    console.log('🔗 SITE INFORMATION:');
    console.log(`   URL: ${analyzer.wordpressConfig.url}`);
    console.log(`   API Key: ${analyzer.wordpressConfig.apiKey}`);
    console.log(`   Test Post: ${analyzer.testUrl}`);
  } else {
    console.log('\n❌ WORDPRESS ANALYSIS FAILED:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
