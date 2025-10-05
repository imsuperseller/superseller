#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * WAIT FOR MASSIVE SCRAPING COMPLETION
 * 
 * This script waits for the massive Facebook scraping to complete
 * and then automatically serves the results
 */

class MassiveScrapingMonitor {
  constructor() {
    this.massiveDataDir = 'data/ortal-massive-data';
    this.checkInterval = 30000; // Check every 30 seconds
    this.maxWaitTime = 3600000; // Max 1 hour wait
    this.startTime = Date.now();
  }

  async waitForCompletion() {
    console.log('🔄 WAITING FOR MASSIVE SCRAPING TO COMPLETE...');
    console.log('⏳ This will wait until we have 2000+ real users');
    console.log('📊 Checking progress every 30 seconds...\n');
    
    while (Date.now() - this.startTime < this.maxWaitTime) {
      try {
        // Check if massive scraping process is still running
        const isRunning = await this.checkIfScrapingRunning();
        
        if (!isRunning) {
          console.log('✅ Massive scraping process has finished');
          break;
        }
        
        // Check for results files
        const results = await this.checkForResults();
        
        if (results.hasData && results.userCount >= 2000) {
          console.log(`🎉 MASSIVE SCRAPING COMPLETE! Found ${results.userCount} users`);
          break;
        }
        
        console.log(`⏳ Still waiting... Current progress: ${results.userCount} users`);
        console.log(`⏰ Elapsed time: ${Math.round((Date.now() - this.startTime) / 1000 / 60)} minutes`);
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, this.checkInterval));
        
      } catch (error) {
        console.log(`⚠️ Error checking progress: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, this.checkInterval));
      }
    }
    
    // Check final results
    const finalResults = await this.checkForResults();
    
    if (finalResults.hasData && finalResults.userCount >= 2000) {
      console.log('\n🎉 MASSIVE SCRAPING SUCCESSFUL!');
      console.log(`📊 Total users: ${finalResults.userCount}`);
      console.log('🚀 Starting server with massive data...');
      
      // Start the server with massive data
      await this.startMassiveDataServer();
      
    } else {
      console.log('\n❌ MASSIVE SCRAPING DID NOT COMPLETE SUCCESSFULLY');
      console.log(`📊 Final user count: ${finalResults.userCount}`);
      console.log('⚠️ Starting server with available data...');
      
      // Start server with whatever data we have
      await this.startAvailableDataServer();
    }
  }

  async checkIfScrapingRunning() {
    try {
      const { stdout } = await execAsync('ps aux | grep "massive-facebook-scraping" | grep -v grep');
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  async checkForResults() {
    try {
      const files = await fs.readdir(this.massiveDataDir);
      
      // Look for result files
      const resultFiles = files.filter(file => 
        file.includes('massive-facebook-data') && file.endsWith('.json')
      );
      
      if (resultFiles.length === 0) {
        return { hasData: false, userCount: 0 };
      }
      
      // Read the latest result file
      const latestFile = resultFiles.sort().pop();
      const data = await fs.readFile(path.join(this.massiveDataDir, latestFile), 'utf8');
      const jsonData = JSON.parse(data);
      
      return {
        hasData: true,
        userCount: jsonData.leads ? jsonData.leads.length : 0,
        file: latestFile,
        data: jsonData
      };
      
    } catch (error) {
      return { hasData: false, userCount: 0, error: error.message };
    }
  }

  async startMassiveDataServer() {
    try {
      console.log('🚀 Starting server with MASSIVE data...');
      
      // Start the massive data server
      const serverProcess = exec('node scripts/serve-massive-data.js', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Server error:', error.message);
        }
      });
      
      // Wait a bit for server to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Get the public URL
      try {
        const { stdout } = await execAsync('curl -s http://localhost:4040/api/tunnels');
        const tunnels = JSON.parse(stdout);
        
        if (tunnels.tunnels && tunnels.tunnels.length > 0) {
          const publicUrl = tunnels.tunnels[0].public_url;
          console.log(`✅ MASSIVE DATA SERVER READY!`);
          console.log(`🌐 Public URL: ${publicUrl}`);
          console.log(`📊 Serving 2000+ REAL users`);
          
          // Save the URL
          await fs.writeFile(
            path.join(this.massiveDataDir, 'MASSIVE_COMPLETE_URL.txt'),
            `🎉 MASSIVE SCRAPING COMPLETE!\n\nPublic URL: ${publicUrl}\n\n2000+ REAL users from Facebook scraping\n\nGenerated: ${new Date().toLocaleString()}`
          );
          
          console.log('\n🎯 ORTAL CAN NOW ACCESS:');
          console.log(`🌐 ${publicUrl}`);
          console.log('📊 2000+ REAL Facebook users');
          console.log('✅ Complete with all details and export options');
          
        }
      } catch (error) {
        console.log('⚠️ Could not get public URL, but server is running');
      }
      
    } catch (error) {
      console.error('❌ Error starting massive data server:', error.message);
    }
  }

  async startAvailableDataServer() {
    try {
      console.log('🚀 Starting server with available data...');
      
      // Check what data we have
      const results = await this.checkForResults();
      
      if (results.hasData) {
        console.log(`📊 Starting server with ${results.userCount} users`);
        
        // Start the real data server
        const serverProcess = exec('node scripts/serve-real-ortal-data.js', (error, stdout, stderr) => {
          if (error) {
            console.error('❌ Server error:', error.message);
          }
        });
        
        // Wait a bit for server to start
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Get the public URL
        try {
          const { stdout } = await execAsync('curl -s http://localhost:4040/api/tunnels');
          const tunnels = JSON.parse(stdout);
          
          if (tunnels.tunnels && tunnels.tunnels.length > 0) {
            const publicUrl = tunnels.tunnels[0].public_url;
            console.log(`✅ AVAILABLE DATA SERVER READY!`);
            console.log(`🌐 Public URL: ${publicUrl}`);
            console.log(`📊 Serving ${results.userCount} users`);
            
            console.log('\n🎯 ORTAL CAN NOW ACCESS:');
            console.log(`🌐 ${publicUrl}`);
            console.log(`📊 ${results.userCount} REAL Facebook users`);
            console.log('⚠️ Note: This is available data, not the full 2000+ users');
            
          }
        } catch (error) {
          console.log('⚠️ Could not get public URL, but server is running');
        }
        
      } else {
        console.log('❌ No data available to serve');
      }
      
    } catch (error) {
      console.error('❌ Error starting available data server:', error.message);
    }
  }
}

async function main() {
  const monitor = new MassiveScrapingMonitor();
  await monitor.waitForCompletion();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
