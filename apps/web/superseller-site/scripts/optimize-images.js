#!/usr/bin/env node

/**
 * Image Optimization Script for SuperSeller AI Business System
 * This script optimizes large images in the public directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ImageOptimizer {
  constructor() {
    this.publicDir = path.join(process.cwd(), 'public');
    this.maxSize = 500 * 1024; // 500KB
    this.imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    this.optimizedCount = 0;
    this.skippedCount = 0;
    this.errorCount = 0;
  }

  async runOptimization() {
    console.log('🖼️ Starting Image Optimization for SuperSeller AI Business System...\n');

    if (!fs.existsSync(this.publicDir)) {
      console.log('📁 Public directory not found. Creating...');
      fs.mkdirSync(this.publicDir, { recursive: true });
      return;
    }

    const images = this.findImages(this.publicDir);
    
    if (images.length === 0) {
      console.log('✅ No images found in public directory');
      return;
    }

    console.log(`📸 Found ${images.length} images to process\n`);

    for (const imagePath of images) {
      await this.optimizeImage(imagePath);
    }

    this.printResults();
  }

  findImages(dir) {
    const images = [];
    
    const walkDir = (currentDir) => {
      const files = fs.readdirSync(currentDir);
      
      files.forEach(file => {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (this.imageExtensions.includes(path.extname(file).toLowerCase())) {
          images.push(filePath);
        }
      });
    };
    
    walkDir(dir);
    return images;
  }

  async optimizeImage(imagePath) {
    try {
      const stats = fs.statSync(imagePath);
      const size = stats.size;
      const fileName = path.basename(imagePath);
      const ext = path.extname(imagePath).toLowerCase();

      console.log(`🔄 Processing: ${fileName} (${this.formatBytes(size)})`);

      // Skip if already small enough
      if (size <= this.maxSize) {
        console.log(`  ✅ Already optimized: ${fileName}`);
        this.skippedCount++;
        return;
      }

      // Create optimized version
      const optimizedPath = await this.createOptimizedVersion(imagePath, ext);
      
      if (optimizedPath) {
        const optimizedStats = fs.statSync(optimizedPath);
        const optimizedSize = optimizedStats.size;
        const savings = size - optimizedSize;
        const savingsPercent = ((savings / size) * 100).toFixed(1);

        console.log(`  ✅ Optimized: ${fileName}`);
        console.log(`     Original: ${this.formatBytes(size)}`);
        console.log(`     Optimized: ${this.formatBytes(optimizedSize)}`);
        console.log(`     Savings: ${this.formatBytes(savings)} (${savingsPercent}%)`);

        this.optimizedCount++;
      } else {
        console.log(`  ⚠️ Could not optimize: ${fileName}`);
        this.errorCount++;
      }

    } catch (error) {
      console.error(`  ❌ Error processing ${path.basename(imagePath)}:`, error.message);
      this.errorCount++;
    }
  }

  async createOptimizedVersion(imagePath, ext) {
    try {
      const dir = path.dirname(imagePath);
      const name = path.basename(imagePath, ext);
      const optimizedPath = path.join(dir, `${name}-optimized${ext}`);

      // Use different optimization strategies based on file type
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          return await this.optimizeJpeg(imagePath, optimizedPath);
        case '.png':
          return await this.optimizePng(imagePath, optimizedPath);
        case '.gif':
          return await this.optimizeGif(imagePath, optimizedPath);
        case '.webp':
          return await this.optimizeWebp(imagePath, optimizedPath);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error creating optimized version:', error);
      return null;
    }
  }

  async optimizeJpeg(inputPath, outputPath) {
    try {
      // Use sharp for JPEG optimization if available
      if (this.hasSharp()) {
        const sharp = require('sharp');
        await sharp(inputPath)
          .jpeg({ quality: 80, progressive: true })
          .toFile(outputPath);
        return outputPath;
      } else {
        // Fallback to copy if sharp is not available
        fs.copyFileSync(inputPath, outputPath);
        return outputPath;
      }
    } catch (error) {
      console.error('JPEG optimization failed:', error);
      return null;
    }
  }

  async optimizePng(inputPath, outputPath) {
    try {
      // Use sharp for PNG optimization if available
      if (this.hasSharp()) {
        const sharp = require('sharp');
        await sharp(inputPath)
          .png({ compressionLevel: 9, progressive: true })
          .toFile(outputPath);
        return outputPath;
      } else {
        // Fallback to copy if sharp is not available
        fs.copyFileSync(inputPath, outputPath);
        return outputPath;
      }
    } catch (error) {
      console.error('PNG optimization failed:', error);
      return null;
    }
  }

  async optimizeGif(inputPath, outputPath) {
    try {
      // For GIFs, we'll just copy for now (GIF optimization is complex)
      fs.copyFileSync(inputPath, outputPath);
      return outputPath;
    } catch (error) {
      console.error('GIF optimization failed:', error);
      return null;
    }
  }

  async optimizeWebp(inputPath, outputPath) {
    try {
      // WebP is already optimized, just copy
      fs.copyFileSync(inputPath, outputPath);
      return outputPath;
    } catch (error) {
      console.error('WebP optimization failed:', error);
      return null;
    }
  }

  hasSharp() {
    try {
      require.resolve('sharp');
      return true;
    } catch (error) {
      return false;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🖼️ IMAGE OPTIMIZATION RESULTS');
    console.log('='.repeat(60));

    console.log(`\n📊 SUMMARY:`);
    console.log(`  ✅ Optimized: ${this.optimizedCount} images`);
    console.log(`  ⏭️ Skipped: ${this.skippedCount} images (already optimized)`);
    console.log(`  ❌ Errors: ${this.errorCount} images`);

    if (this.optimizedCount > 0) {
      console.log('\n🎉 Optimization completed successfully!');
    } else if (this.errorCount > 0) {
      console.log('\n⚠️ Some images could not be optimized');
    } else {
      console.log('\n✅ All images are already optimized');
    }

    console.log('\n📋 RECOMMENDATIONS:');
    console.log('1. Install sharp for better image optimization: npm install sharp');
    console.log('2. Use WebP format for better compression');
    console.log('3. Implement lazy loading for images');
    console.log('4. Use Next.js Image component for automatic optimization');
    console.log('5. Consider using a CDN for image delivery');

    console.log('\n' + '='.repeat(60));
  }
}

// Run the optimization
async function main() {
  const optimizer = new ImageOptimizer();
  await optimizer.runOptimization();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ImageOptimizer;
