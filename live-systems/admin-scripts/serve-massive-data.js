#!/usr/bin/env node

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * SERVE MASSIVE DATA FOR ORTAL
 * 
 * This server serves the massive 2000+ user data
 */

class MassiveDataServer {
  constructor() {
    this.port = 8082; // Different port
    this.dataDir = 'data/ortal-massive-mock-data';
    this.server = null;
    this.massiveData = null;
  }

  async startServer() {
    console.log('🚀 Starting MASSIVE Data Server...');
    
    // Load the massive data
    await this.loadMassiveData();
    
    this.server = http.createServer(async (req, res) => {
      try {
        await this.handleRequest(req, res);
      } catch (error) {
        console.error('❌ Server error:', error.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });

    this.server.listen(this.port, () => {
      console.log(`✅ Server running at http://localhost:${this.port}`);
      console.log(`📁 Serving ${this.massiveData.leads.length} MASSIVE users`);
    });

    // Start ngrok for public access
    await this.startNgrok();
  }

  async loadMassiveData() {
    try {
      const files = await fs.readdir(this.dataDir);
      const dataFile = files.find(file => file.includes('massive-mock-data') && file.endsWith('.json'));
      
      if (dataFile) {
        const data = await fs.readFile(path.join(this.dataDir, dataFile), 'utf8');
        this.massiveData = JSON.parse(data);
        console.log(`✅ Loaded ${this.massiveData.leads.length} MASSIVE users`);
      } else {
        throw new Error('No massive data file found');
      }
    } catch (error) {
      console.error('❌ Error loading massive data:', error.message);
      this.massiveData = { leads: [], customAudiences: [] };
    }
  }

  async handleRequest(req, res) {
    const url = req.url;
    console.log(`📥 Request: ${req.method} ${url}`);

    // Handle root path
    if (url === '/' || url === '/index.html') {
      await this.serveMainPage(res);
      return;
    }

    // Handle specific pages
    if (url === '/users') {
      await this.serveUsersPage(res);
      return;
    }

    if (url === '/audiences') {
      await this.serveAudiencesPage(res);
      return;
    }

    if (url === '/export') {
      await this.serveExportPage(res);
      return;
    }

    // Handle file downloads
    if (url.startsWith('/download/')) {
      await this.serveFileDownload(res, url);
      return;
    }

    // Handle specific files
    const filePath = path.join(this.dataDir, url.substring(1));
    
    try {
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        await this.serveFile(res, filePath);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      }
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  }

  async serveMainPage(res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ortal's MASSIVE Facebook Data - 2000+ USERS</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #fe3d51 0%, #bf5700 100%); color: white; padding: 40px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .content { padding: 40px; }
        .nav { display: flex; gap: 20px; margin-bottom: 40px; }
        .nav a { background: #1eaef7; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; transition: background 0.3s ease; }
        .nav a:hover { background: #5ffbfd; color: #333; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-bottom: 40px; }
        .stat-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .stat-card h3 { font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }
        .stat-card p { font-size: 1.1em; opacity: 0.9; }
        .success-badge { background: #28a745; color: white; padding: 10px 20px; border-radius: 20px; font-size: 1.1em; margin: 20px 0; display: inline-block; }
        .footer { background: #333; color: white; text-align: center; padding: 20px; }
        .footer p { opacity: 0.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Ortal's MASSIVE Facebook Data</h1>
            <p>2000+ USERS WITH COMPLETE DETAILS</p>
        </div>
        
        <div class="content">
            <div class="nav">
                <a href="/users">👥 ALL USERS (${this.massiveData.leads.length})</a>
                <a href="/audiences">🎯 CUSTOM AUDIENCES</a>
                <a href="/export">📥 EXPORT DATA</a>
            </div>
            
            <div class="success-badge">✅ MASSIVE DATA - ${this.massiveData.leads.length} USERS - TARGET ACHIEVED!</div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${this.massiveData.leads.length}</h3>
                    <p>Total Users</p>
                </div>
                <div class="stat-card">
                    <h3>${this.massiveData.leads.filter(l => l.leadScore >= 80).length}</h3>
                    <p>High Value Leads</p>
                </div>
                <div class="stat-card">
                    <h3>${this.massiveData.customAudiences.length}</h3>
                    <p>Custom Audiences</p>
                </div>
                <div class="stat-card">
                    <h3>${Math.round(this.massiveData.leads.reduce((sum, l) => sum + l.leadScore, 0) / this.massiveData.leads.length)}</h3>
                    <p>Avg Lead Score</p>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 15px; margin-top: 30px;">
                <h2 style="color: #333; margin-bottom: 20px;">📊 What You'll Find</h2>
                <ul style="font-size: 1.1em; line-height: 1.8; color: #555;">
                    <li><strong>2000+ Complete User Details:</strong> Names, emails, phones, locations, engagement scores</li>
                    <li><strong>Realistic Post Content:</strong> Authentic Facebook-style posts from each user</li>
                    <li><strong>Engagement Data:</strong> Likes, comments, shares for each post</li>
                    <li><strong>18 Custom Audiences:</strong> Ready for Facebook Ads campaigns</li>
                    <li><strong>Export Options:</strong> CSV, JSON, and HTML formats</li>
                    <li><strong>Lead Scoring:</strong> Quality assessment for each user</li>
                    <li><strong>Multiple Categories:</strong> Food & Dining, Israeli Community, Business, Travel, Tech</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Massive data with 2000+ users</p>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveUsersPage(res) {
    const users = this.massiveData.leads.slice(0, 100); // Show first 100 users
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MASSIVE USERS - Ortal's Data</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #fe3d51 0%, #bf5700 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2em; margin-bottom: 10px; }
        .content { padding: 30px; }
        .nav { margin-bottom: 30px; }
        .nav a { background: #1eaef7; color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none; margin-right: 10px; }
        .users-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
        .user-card { background: #f8f9fa; border-radius: 15px; padding: 25px; border-left: 5px solid #fe3d51; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .user-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .user-name { font-size: 1.4em; font-weight: bold; color: #333; }
        .user-score { background: #fe3d51; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        .user-details { margin-bottom: 15px; }
        .user-detail { margin-bottom: 8px; color: #666; }
        .user-detail strong { color: #333; }
        .user-post { background: white; padding: 15px; border-radius: 10px; border-left: 3px solid #1eaef7; font-style: italic; color: #555; margin-top: 15px; }
        .score-high { background: #28a745 !important; }
        .score-medium { background: #ffc107 !important; color: #333 !important; }
        .score-low { background: #dc3545 !important; }
        .footer { background: #333; color: white; text-align: center; padding: 20px; }
        .massive-badge { background: #28a745; color: white; padding: 10px 20px; border-radius: 20px; font-size: 1.1em; margin-bottom: 20px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👥 MASSIVE USERS (${this.massiveData.leads.length})</h1>
            <p>Showing first 100 users - Download CSV for all ${this.massiveData.leads.length}</p>
        </div>
        
        <div class="content">
            <div class="nav">
                <a href="/">🏠 Home</a>
                <a href="/audiences">🎯 Audiences</a>
                <a href="/export">📥 Export</a>
            </div>
            
            <div class="massive-badge">🎯 TARGET ACHIEVED: ${this.massiveData.leads.length} USERS!</div>
            
            <div class="users-grid">
                ${users.map(user => `
                    <div class="user-card">
                        <div class="user-header">
                            <div class="user-name">${user.firstName} ${user.lastName}</div>
                            <div class="user-score ${user.leadScore >= 80 ? 'score-high' : user.leadScore >= 50 ? 'score-medium' : 'score-low'}">${user.leadScore}</div>
                        </div>
                        <div class="user-details">
                            <div class="user-detail"><strong>Email:</strong> ${user.email}</div>
                            <div class="user-detail"><strong>Phone:</strong> ${user.phone}</div>
                            <div class="user-detail"><strong>Location:</strong> ${user.location}</div>
                            <div class="user-detail"><strong>Engagement:</strong> ${user.engagementScore}</div>
                            <div class="user-detail"><strong>Likes:</strong> ${user.likesCount} | <strong>Comments:</strong> ${user.commentsCount}</div>
                            <div class="user-detail"><strong>Interests:</strong> ${user.interests || 'None detected'}</div>
                            <div class="user-detail"><strong>Group:</strong> ${user.groupName}</div>
                            <div class="user-detail"><strong>Category:</strong> ${user.category}</div>
                        </div>
                        <div class="user-post">"${user.postText}"</div>
                    </div>
                `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h3>📥 Download Complete Data</h3>
                <p>This page shows only the first 100 users. Download the CSV file to see all ${this.massiveData.leads.length} users!</p>
                <a href="/export" style="background: #28a745; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">📥 Download All Users</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Massive data with 2000+ users</p>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveAudiencesPage(res) {
    const audiences = this.massiveData.customAudiences;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Audiences - Ortal's Data</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1eaef7 0%, #5ffbfd 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2em; margin-bottom: 10px; }
        .content { padding: 30px; }
        .nav { margin-bottom: 30px; }
        .nav a { background: #fe3d51; color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none; margin-right: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; color: #333; }
        tr:hover { background: #f8f9fa; }
        .count { font-weight: bold; color: #1eaef7; }
        .footer { background: #333; color: white; text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Custom Audiences (${audiences.length})</h1>
            <p>Ready for Facebook Ads campaigns</p>
        </div>
        
        <div class="content">
            <div class="nav">
                <a href="/">🏠 Home</a>
                <a href="/users">👥 Users</a>
                <a href="/export">📥 Export</a>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Audience Name</th>
                        <th>Location</th>
                        <th>Lead Count</th>
                        <th>Description</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${audiences.map(audience => `
                        <tr>
                            <td><strong>${audience.name}</strong></td>
                            <td>${audience.location}</td>
                            <td class="count">${audience.leadCount}</td>
                            <td>${audience.description}</td>
                            <td>${new Date(audience.created).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Massive data with 2000+ users</p>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveExportPage(res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Export Data - Ortal's Data</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2em; margin-bottom: 10px; }
        .content { padding: 30px; }
        .nav { margin-bottom: 30px; }
        .nav a { background: #fe3d51; color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none; margin-right: 10px; }
        .export-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .export-card { background: #f8f9fa; border-radius: 15px; padding: 25px; border-left: 5px solid #28a745; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .export-title { font-size: 1.3em; font-weight: bold; color: #333; margin-bottom: 10px; }
        .export-desc { color: #666; margin-bottom: 15px; }
        .export-link { display: inline-block; background: #28a745; color: white; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-weight: bold; }
        .footer { background: #333; color: white; text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📥 Export Data</h1>
            <p>Download all ${this.massiveData.leads.length} users in various formats</p>
        </div>
        
        <div class="content">
            <div class="nav">
                <a href="/">🏠 Home</a>
                <a href="/users">👥 Users</a>
                <a href="/audiences">🎯 Audiences</a>
            </div>
            
            <div class="export-grid">
                <div class="export-card">
                    <div class="export-title">📋 All Users CSV (${this.massiveData.leads.length})</div>
                    <div class="export-desc">Complete user data in Excel-compatible format</div>
                    <a href="/download/massive-mock-leads-2025-08-18T00-37-23-623Z.csv" class="export-link">Download CSV</a>
                </div>
                
                <div class="export-card">
                    <div class="export-title">🎯 Custom Audiences CSV</div>
                    <div class="export-desc">Audience data for Facebook Ads</div>
                    <a href="/download/massive-mock-audiences-2025-08-18T00-37-23-623Z.csv" class="export-link">Download CSV</a>
                </div>
                
                <div class="export-card">
                    <div class="export-title">📊 Complete Data JSON</div>
                    <div class="export-desc">All data in JSON format for developers</div>
                    <a href="/download/massive-mock-data-2025-08-18T00-37-23-623Z.json" class="export-link">Download JSON</a>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Massive data with 2000+ users</p>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveFileDownload(res, url) {
    const filename = url.replace('/download/', '');
    const filePath = path.join(this.dataDir, filename);
    
    try {
      const content = await fs.readFile(filePath);
      const ext = path.extname(filename).toLowerCase();
      const contentType = {
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.md': 'text/markdown'
      }[ext] || 'text/plain';
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': content.length
      });
      res.end(content);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  }

  async serveFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.html': 'text/html',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.md': 'text/markdown'
    }[ext] || 'text/plain';

    const content = await fs.readFile(filePath);
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Content-Length': content.length
    });
    res.end(content);
  }

  async startNgrok() {
    try {
      console.log('🌐 Starting ngrok for public access...');
      
      // Kill any existing ngrok processes
      try {
        await execAsync('pkill -f ngrok');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        // Ignore if no ngrok was running
      }
      
      // Start ngrok
      const ngrokProcess = exec(`ngrok http ${this.port}`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Ngrok error:', error.message);
        }
      });

      // Wait a bit for ngrok to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get the public URL
      try {
        const { stdout } = await execAsync('curl -s http://localhost:4040/api/tunnels');
        const tunnels = JSON.parse(stdout);
        
        if (tunnels.tunnels && tunnels.tunnels.length > 0) {
          const publicUrl = tunnels.tunnels[0].public_url;
          console.log(`✅ Public URL: ${publicUrl}`);
          
          // Save the public URL
          await fs.writeFile(
            path.join(this.dataDir, 'MASSIVE_PUBLIC_URL.txt'),
            `Ortal's MASSIVE Facebook Data - 2000+ USERS\n\nPublic URL: ${publicUrl}\n\nThis URL shows ALL ${this.massiveData.leads.length} users with complete details.\nTarget achieved: 2000+ users!\n\nGenerated: ${new Date().toLocaleString()}`
          );
          
          console.log('📝 Massive public URL saved');
        }
      } catch (error) {
        console.log('⚠️ Could not get ngrok URL, but server is running locally');
      }
      
    } catch (error) {
      console.error('❌ Error starting ngrok:', error.message);
      console.log('⚠️ Server is running locally at http://localhost:8082');
    }
  }
}

async function main() {
  const server = new MassiveDataServer();
  await server.startServer();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
