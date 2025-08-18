#!/usr/bin/env node

import axios from 'axios';

class DuplicateWordPressPostForTesting {
  constructor() {
    this.wordpressConfig = {
      url: 'https://www.tax4us.co.il',
      apiKey: 'sE2b dck8 Y51u Pv3L fveu IcdC'
    };
  }

  async duplicateWordPressPostForTesting() {
    console.log('📋 DUPLICATING WORDPRESS POST FOR TESTING');
    console.log('==========================================');
    console.log('🔍 Finding existing posts and duplicating one for Blog Agent testing');
    console.log('');

    try {
      // Step 1: Get all existing posts
      console.log('📋 STEP 1: GETTING EXISTING POSTS');
      console.log('==================================');
      const posts = await this.getExistingPosts();

      // Step 2: Select the best post to duplicate
      console.log('\n📋 STEP 2: SELECTING POST TO DUPLICATE');
      console.log('========================================');
      const selectedPost = await this.selectPostToDuplicate(posts);

      // Step 3: Duplicate the selected post
      console.log('\n📋 STEP 3: DUPLICATING SELECTED POST');
      console.log('======================================');
      const duplicatedPost = await this.duplicatePost(selectedPost);

      // Step 4: Verify the duplicated post
      console.log('\n📋 STEP 4: VERIFYING DUPLICATED POST');
      console.log('=====================================');
      const verification = await this.verifyDuplicatedPost(duplicatedPost);

      console.log('\n🎉 POST DUPLICATION COMPLETE!');
      console.log('==============================');
      console.log('✅ Existing posts retrieved');
      console.log('✅ Post selected for duplication');
      console.log('✅ Post duplicated successfully');
      console.log('✅ Duplicated post verified');

      return {
        success: true,
        originalPost: selectedPost,
        duplicatedPost,
        verification
      };

    } catch (error) {
      console.error('\n❌ POST DUPLICATION FAILED:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getExistingPosts() {
    try {
      console.log('   🔍 Getting all existing posts...');

      const response = await axios.get(
        `${this.wordpressConfig.url}/wp-json/wp/v2/posts`,
        {
          headers: {
            'Authorization': `Bearer ${this.wordpressConfig.apiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            per_page: 20,
            status: 'publish',
            orderby: 'date',
            order: 'desc'
          }
        }
      );

      const posts = response.data;
      console.log(`   ✅ Found ${posts.length} existing posts`);

      // Display post details
      posts.forEach((post, index) => {
        console.log(`   📝 Post ${index + 1}:`);
        console.log(`      ID: ${post.id}`);
        console.log(`      Title: ${post.title?.rendered || 'No title'}`);
        console.log(`      Date: ${post.date}`);
        console.log(`      Status: ${post.status}`);
        console.log(`      Categories: ${post.categories?.length || 0}`);
        console.log(`      Content Length: ${post.content?.rendered?.length || 0} chars`);
        console.log('');
      });

      return posts;

    } catch (error) {
      console.error('   ❌ Failed to get existing posts:', error.message);
      throw error;
    }
  }

  async selectPostToDuplicate(posts) {
    try {
      console.log('   🎯 Selecting the best post to duplicate...');

      // Find a post with substantial content and good structure
      let bestPost = null;
      let bestScore = 0;

      for (const post of posts) {
        let score = 0;
        
        // Score based on content length
        const contentLength = post.content?.rendered?.length || 0;
        if (contentLength > 500) score += 3;
        if (contentLength > 1000) score += 2;
        
        // Score based on title quality
        const title = post.title?.rendered || '';
        if (title.length > 10) score += 2;
        
        // Score based on categories
        if (post.categories?.length > 0) score += 1;
        
        // Score based on recent date
        const postDate = new Date(post.date);
        const daysSincePost = (new Date() - postDate) / (1000 * 60 * 60 * 24);
        if (daysSincePost < 30) score += 1;
        
        if (score > bestScore) {
          bestScore = score;
          bestPost = post;
        }
      }

      if (!bestPost) {
        // Fallback to first post
        bestPost = posts[0];
      }

      console.log('   ✅ Selected post for duplication:');
      console.log(`      ID: ${bestPost.id}`);
      console.log(`      Title: ${bestPost.title?.rendered || 'No title'}`);
      console.log(`      Content Length: ${bestPost.content?.rendered?.length || 0} characters`);
      console.log(`      Categories: ${bestPost.categories?.length || 0}`);
      console.log(`      Score: ${bestScore}`);

      return bestPost;

    } catch (error) {
      console.error('   ❌ Failed to select post:', error.message);
      throw error;
    }
  }

  async duplicatePost(originalPost) {
    try {
      console.log('   📋 Creating duplicate post...');

      // Prepare the duplicated post data
      const duplicatedPostData = {
        title: `[TEST] ${originalPost.title?.rendered || 'Test Post'}`,
        content: originalPost.content?.rendered || '',
        excerpt: originalPost.excerpt?.rendered || '',
        status: 'draft', // Create as draft for safety
        categories: originalPost.categories || [],
        tags: originalPost.tags || [],
        meta: {
          _test_post: true,
          _original_post_id: originalPost.id,
          _duplicated_for_testing: true
        }
      };

      console.log('   📤 Creating post with data:');
      console.log(`      Title: ${duplicatedPostData.title}`);
      console.log(`      Status: ${duplicatedPostData.status}`);
      console.log(`      Categories: ${duplicatedPostData.categories.length}`);

      // Create the duplicated post
      const response = await axios.post(
        `${this.wordpressConfig.url}/wp-json/wp/v2/posts`,
        duplicatedPostData,
        {
          headers: {
            'Authorization': `Bearer ${this.wordpressConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const duplicatedPost = response.data;
      console.log('   ✅ Post duplicated successfully!');
      console.log(`   📝 New Post ID: ${duplicatedPost.id}`);
      console.log(`   🔗 Post URL: ${duplicatedPost.link}`);
      console.log(`   📅 Created: ${duplicatedPost.date}`);

      return duplicatedPost;

    } catch (error) {
      console.error('   ❌ Failed to duplicate post:', error.message);
      if (error.response) {
        console.error(`   📊 Error Status: ${error.response.status}`);
        console.error(`   📄 Error Data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async verifyDuplicatedPost(duplicatedPost) {
    try {
      console.log('   🔍 Verifying duplicated post...');

      // Get the duplicated post to verify it was created correctly
      const response = await axios.get(
        `${this.wordpressConfig.url}/wp-json/wp/v2/posts/${duplicatedPost.id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.wordpressConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const verifiedPost = response.data;
      console.log('   ✅ Duplicated post verified!');
      console.log(`   📝 Post ID: ${verifiedPost.id}`);
      console.log(`   📋 Title: ${verifiedPost.title?.rendered || 'No title'}`);
      console.log(`   📄 Content Length: ${verifiedPost.content?.rendered?.length || 0} characters`);
      console.log(`   🏷️ Status: ${verifiedPost.status}`);
      console.log(`   🔗 Link: ${verifiedPost.link}`);

      return {
        success: true,
        post: verifiedPost,
        adminUrl: `${this.wordpressConfig.url}/wp-admin/post.php?post=${verifiedPost.id}`
      };

    } catch (error) {
      console.error('   ❌ Failed to verify duplicated post:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Execute the post duplication for testing
const postDuplicator = new DuplicateWordPressPostForTesting();
postDuplicator.duplicateWordPressPostForTesting().then(result => {
  if (result.success) {
    console.log('\n🎉 WORDPRESS POST DUPLICATION COMPLETE!');
    console.log('=========================================');
    console.log('✅ Existing posts analyzed');
    console.log('✅ Best post selected for duplication');
    console.log('✅ Post duplicated successfully');
    console.log('✅ Duplicated post verified');
    console.log('');
    console.log('📊 DUPLICATION RESULTS:');
    console.log('========================');
    console.log(`   - Original Post ID: ${result.originalPost.id}`);
    console.log(`   - Duplicated Post ID: ${result.duplicatedPost.id}`);
    console.log(`   - Duplicated Post Title: ${result.duplicatedPost.title?.rendered}`);
    console.log(`   - Admin URL: ${result.verification.adminUrl}`);
    console.log(`   - Public URL: ${result.duplicatedPost.link}`);
    console.log('');
    console.log('🧪 READY FOR BLOG AGENT TESTING!');
    console.log('=================================');
    console.log('   - Use duplicated post ID for testing');
    console.log('   - Blog Agent can now work with real content');
    console.log('   - WordPress integration verified');
    console.log('   - Post is in draft status for safety');
    console.log('');
    console.log('🔗 NEXT STEPS:');
    console.log('===============');
    console.log('   1. Test Blog Agent with duplicated post');
    console.log('   2. Verify content generation quality');
    console.log('   3. Check WordPress post creation');
    console.log('   4. Clean up test post when done');
    
  } else {
    console.log('\n❌ POST DUPLICATION FAILED:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
