#!/usr/bin/env node

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * SERVE 5,548 ORTAL LEADS WITH RENSTO DESIGN SYSTEM
 * 
 * This server serves the ACTUAL 5,548 leads with authentic Rensto branding
 */

class Ortal5548Server {
  constructor() {
    this.port = 8084;
    this.dataDir = 'data/ortal-facebook-agent-results';
    this.server = null;
    this.leadsData = null;
    this.customAudiences = null;
  }

  async startServer() {
    console.log('🚀 Starting Ortal 5,548 Leads Server with Rensto Design...');
    
    // Load the actual leads data
    await this.loadLeadsData();
    
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
      console.log(`📁 Serving ${this.leadsData.length} ACTUAL Facebook leads with Rensto branding`);
    });

    // Start ngrok for public access
    await this.startNgrok();
  }

  async loadLeadsData() {
    try {
      // Load the actual leads
      const leadsFile = 'ortal-leads-2025-08-17T20-25-28-621Z.json';
      const leadsData = await fs.readFile(path.join(this.dataDir, leadsFile), 'utf8');
      this.leadsData = JSON.parse(leadsData);
      
      // Load custom audiences
      const audiencesFile = 'ortal-custom-audiences-2025-08-17T20-25-28-621Z.json';
      const audiencesData = await fs.readFile(path.join(this.dataDir, audiencesFile), 'utf8');
      this.customAudiences = JSON.parse(audiencesData);
      
      console.log(`✅ Loaded ${this.leadsData.length} ACTUAL Facebook leads`);
      console.log(`✅ Loaded ${this.customAudiences.length} custom audiences`);
    } catch (error) {
      console.error('❌ Error loading data:', error.message);
      this.leadsData = [];
      this.customAudiences = [];
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

    // Handle logo
    if (url === '/logo') {
      await this.serveLogo(res);
      return;
    }

    // Handle specific pages
    if (url.startsWith('/leads')) {
      await this.serveLeadsPage(req, res);
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
        const content = await fs.readFile(filePath);
        const ext = path.extname(filePath);
        
        let contentType = 'text/plain';
        if (ext === '.json') contentType = 'application/json';
        else if (ext === '.csv') contentType = 'text/csv';
        else if (ext === '.html') contentType = 'text/html';
        else if (ext === '.md') contentType = 'text/markdown';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      }
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  }

  async serveLogo(res) {
    try {
      const logoPath = path.join(process.cwd(), 'Rensto Logo.png');
      const logoBuffer = await fs.readFile(logoPath);
      
      res.writeHead(200, { 
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000'
      });
      res.end(logoBuffer);
    } catch (error) {
      console.error('❌ Error serving logo:', error.message);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Logo not found');
    }
  }

  async serveMainPage(res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ortal's Facebook Agent Results - 5,548 LEADS | Rensto</title>
    <style>
        :root {
            --rensto-red: #fe3d51;
            --rensto-orange: #bf5700;
            --rensto-blue: #1eaef7;
            --rensto-cyan: #5ffbfd;
            --rensto-bg-primary: #110d28;
            --rensto-bg-secondary: #1a1a2e;
            --rensto-bg-card: #16213e;
            --rensto-text-primary: #ffffff;
            --rensto-text-secondary: #a0a0a0;
            --rensto-gradient-primary: linear-gradient(135deg, var(--rensto-red) 0%, var(--rensto-orange) 100%);
            --rensto-gradient-secondary: linear-gradient(135deg, var(--rensto-blue) 0%, var(--rensto-cyan) 100%);
            --rensto-gradient-accent: linear-gradient(135deg, var(--rensto-cyan) 0%, var(--rensto-blue) 100%);
            --rensto-glow-primary: 0 0 20px rgba(254, 61, 81, 0.5);
            --rensto-glow-secondary: 0 0 20px rgba(30, 174, 247, 0.5);
            --rensto-glow-accent: 0 0 20px rgba(95, 251, 253, 0.5);
        }

        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: var(--rensto-bg-primary);
            color: var(--rensto-text-primary);
            min-height: 100vh; 
            padding: 20px; 
            position: relative;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(254, 61, 81, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(30, 174, 247, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(95, 251, 253, 0.05) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
        }
        
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
            background: var(--rensto-bg-secondary);
            border-radius: 20px; 
            box-shadow: var(--rensto-glow-primary);
            overflow: hidden; 
            border: 1px solid rgba(254, 61, 81, 0.3);
            position: relative;
        }

        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--rensto-gradient-primary);
            box-shadow: var(--rensto-glow-primary);
        }
        
        .header { 
            background: var(--rensto-gradient-secondary);
            color: var(--rensto-text-primary); 
            padding: 40px; 
            text-align: center; 
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(95, 251, 253, 0.1) 0%, transparent 70%);
            animation: rensto-pulse 4s ease-in-out infinite;
        }
        
        .header h1 { 
            font-size: 2.5em; 
            margin-bottom: 10px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 15px; 
            position: relative;
            z-index: 1;
            text-shadow: 0 0 10px rgba(30, 174, 247, 0.5);
        }
        
        .header p { 
            font-size: 1.2em; 
            opacity: 0.9; 
            position: relative;
            z-index: 1;
        }
        
        .actions { 
            padding: 30px; 
            display: flex; 
            gap: 20px; 
            justify-content: center; 
            flex-wrap: wrap; 
            background: var(--rensto-bg-card);
        }
        
        .btn { 
            background: var(--rensto-gradient-primary);
            color: var(--rensto-text-primary); 
            padding: 15px 30px; 
            border: none; 
            border-radius: 10px; 
            font-size: 1.1em; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-flex; 
            align-items: center; 
            gap: 10px; 
            transition: all 0.3s ease;
            box-shadow: var(--rensto-glow-primary);
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 10px 25px rgba(254, 61, 81, 0.4);
        }

        .btn:hover::before {
            left: 100%;
        }
        
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            padding: 30px; 
            background: var(--rensto-bg-secondary);
        }
        
        .stat-card { 
            background: var(--rensto-bg-card);
            color: var(--rensto-text-primary); 
            padding: 30px; 
            border-radius: 15px; 
            text-align: center; 
            border: 1px solid rgba(30, 174, 247, 0.3);
            box-shadow: var(--rensto-glow-secondary);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--rensto-gradient-accent);
            box-shadow: var(--rensto-glow-accent);
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(30, 174, 247, 0.3);
        }
        
        .stat-number { 
            font-size: 3em; 
            font-weight: bold; 
            margin-bottom: 10px; 
            background: var(--rensto-gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 20px rgba(254, 61, 81, 0.5);
        }
        
        .stat-label { 
            font-size: 1.1em; 
            opacity: 0.9; 
            color: var(--rensto-text-secondary);
        }
        
        .info-section { 
            padding: 30px; 
            background: var(--rensto-bg-card);
        }
        
        .info-card { 
            background: var(--rensto-bg-secondary);
            border: 2px solid var(--rensto-red);
            border-radius: 15px; 
            padding: 25px; 
            margin-bottom: 20px; 
            box-shadow: var(--rensto-glow-primary);
            position: relative;
            overflow: hidden;
        }

        .info-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at top right, rgba(254, 61, 81, 0.1), transparent);
            pointer-events: none;
        }
        
        .info-card h3 { 
            color: var(--rensto-red);
            margin-bottom: 15px; 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            position: relative;
            z-index: 1;
        }
        
        .badge { 
            background: var(--rensto-gradient-primary);
            color: var(--rensto-text-primary); 
            padding: 8px 20px; 
            border-radius: 25px; 
            font-size: 0.9em; 
            margin: 10px 0; 
            display: inline-block; 
            box-shadow: var(--rensto-glow-primary);
            animation: rensto-pulse 2s ease-in-out infinite;
        }
        
        .warning-badge { 
            background: var(--rensto-gradient-accent);
            color: var(--rensto-text-primary); 
            padding: 8px 20px; 
            border-radius: 25px; 
            font-size: 0.9em; 
            margin: 10px 0; 
            display: inline-block; 
            box-shadow: var(--rensto-glow-accent);
        }

        .rensto-logo {
            font-size: 1.2em;
            font-weight: bold;
            background: var(--rensto-gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 10px rgba(254, 61, 81, 0.5);
        }

        .rensto-logo-img {
            width: 120px;
            height: 120px;
            margin-right: 20px;
            filter: drop-shadow(0 0 15px rgba(254, 61, 81, 0.6));
            border-radius: 15px;
            object-fit: contain;
        }

        .rensto-logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }

        @keyframes rensto-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        @keyframes rensto-shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .rensto-shimmer {
            position: relative;
            overflow: hidden;
        }

        .rensto-shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            animation: rensto-shimmer 2s infinite;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <div class="rensto-logo-container">
                    <img src="/logo" alt="Rensto" class="rensto-logo-img">
                </div>
                Facebook Agent Results
            </h1>
            <p>5,548 QUALIFIED LEADS FROM FACEBOOK GROUPS</p>
        </div>
        
        <div class="actions">
            <a href="/leads" class="btn rensto-shimmer">👥 VIEW ALL LEADS (5,548)</a>
            <a href="/audiences" class="btn rensto-shimmer">🎯 CUSTOM AUDIENCES (10)</a>
            <a href="/export" class="btn rensto-shimmer">📥 EXPORT DATA</a>
        </div>
        
        <div class="badge" style="margin: 0 30px;">✅ ACTUAL DATA - 5,548 REAL LEADS FROM FACEBOOK AGENT</div>
        <div class="warning-badge" style="margin: 10px 30px;">⚠️ This is the COMPLETE agent run data, not the 8-lead sample!</div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">5,548</div>
                <div class="stat-label">Total Leads</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">1,153</div>
                <div class="stat-label">High Value Leads (80+)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">10</div>
                <div class="stat-label">Facebook Groups</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">10</div>
                <div class="stat-label">Custom Audiences</div>
            </div>
        </div>
        
        <div class="info-section">
            <div class="info-card">
                <h3>📊 Data Source Information:</h3>
                <p><strong>Source:</strong> Facebook Group Scraper Agent</p>
                <p><strong>Execution Date:</strong> August 17, 2025 at 20:25 UTC</p>
                <p><strong>Groups Processed:</strong> 10 Facebook Groups</p>
                <p><strong>Scraping Method:</strong> Automated Agent with Apify Integration</p>
                <p><strong>Lead Quality:</strong> Average Score: 51, High-Value: 1,153 leads</p>
            </div>
            
            <div class="info-card">
                <h3>🎯 Top Performing Groups:</h3>
                <p><strong>1.</strong> great kosher restaurants foodies (1,000 leads)</p>
                <p><strong>2.</strong> Jewish Food x What Jew Wanna Eat (815 leads)</p>
                <p><strong>3.</strong> ישראלים במיאמי / דרום פלורידה (675 leads)</p>
                <p><strong>4.</strong> Israelis in Los Angeles ישראלים בלוס אנג'לס (520 leads)</p>
                <p><strong>5.</strong> רילוקיישן הצעות עבודה בחול (487 leads)</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveLeadsPage(req, res) {
    const page = parseInt(new URL(req.url, 'http://localhost').searchParams.get('page')) || 1;
    const sortBy = new URL(req.url, 'http://localhost').searchParams.get('sort') || 'leadScore';
    const sortOrder = new URL(req.url, 'http://localhost').searchParams.get('order') || 'desc';
    const pageSize = 20;
    
    // Sort the leads
    console.log(`🔍 Sorting by: ${sortBy}, Order: ${sortOrder}`);
    console.log(`📊 Sample data:`, this.leadsData.slice(0, 3).map(l => ({ name: `${l.firstName} ${l.lastName}`, score: l.leadScore })));
    
    const sortedLeads = [...this.leadsData].sort((a, b) => {
      let aVal = a[sortBy] || 0;
      let bVal = b[sortBy] || 0;
      
      if (sortBy === 'firstName') {
        aVal = `${a.firstName} ${a.lastName}`;
        bVal = `${b.firstName} ${b.lastName}`;
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    console.log(`📊 Top 3 sorted:`, sortedLeads.slice(0, 3).map(l => ({ name: `${l.firstName} ${l.lastName}`, score: l.leadScore })));
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLeads = sortedLeads.slice(startIndex, endIndex);
    const totalPages = Math.ceil(this.leadsData.length / pageSize);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ortal's Leads - Page ${page} of ${totalPages} | Rensto</title>
    <style>
        :root {
            --rensto-red: #fe3d51;
            --rensto-orange: #bf5700;
            --rensto-blue: #1eaef7;
            --rensto-cyan: #5ffbfd;
            --rensto-bg-primary: #110d28;
            --rensto-bg-secondary: #1a1a2e;
            --rensto-bg-card: #16213e;
            --rensto-text-primary: #ffffff;
            --rensto-text-secondary: #a0a0a0;
            --rensto-gradient-primary: linear-gradient(135deg, var(--rensto-red) 0%, var(--rensto-orange) 100%);
            --rensto-gradient-secondary: linear-gradient(135deg, var(--rensto-blue) 0%, var(--rensto-cyan) 100%);
            --rensto-gradient-accent: linear-gradient(135deg, var(--rensto-cyan) 0%, var(--rensto-blue) 100%);
            --rensto-glow-primary: 0 0 20px rgba(254, 61, 81, 0.5);
            --rensto-glow-secondary: 0 0 20px rgba(30, 174, 247, 0.5);
            --rensto-glow-accent: 0 0 20px rgba(95, 251, 253, 0.5);
        }

        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: var(--rensto-bg-primary);
            color: var(--rensto-text-primary);
            min-height: 100vh; 
            padding: 20px; 
            position: relative;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(254, 61, 81, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(30, 174, 247, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(95, 251, 253, 0.05) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
        }
        
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
            background: var(--rensto-bg-secondary);
            border-radius: 20px; 
            box-shadow: var(--rensto-glow-primary);
            overflow: hidden; 
            border: 1px solid rgba(254, 61, 81, 0.3);
            position: relative;
        }

        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--rensto-gradient-primary);
            box-shadow: var(--rensto-glow-primary);
        }
        
        .header { 
            background: var(--rensto-gradient-secondary);
            color: var(--rensto-text-primary); 
            padding: 30px; 
            text-align: center; 
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(95, 251, 253, 0.1) 0%, transparent 70%);
            animation: rensto-pulse 4s ease-in-out infinite;
        }
        
        .header h1 { 
            font-size: 2em; 
            margin-bottom: 10px; 
            position: relative;
            z-index: 1;
            text-shadow: 0 0 10px rgba(30, 174, 247, 0.5);
        }
        
        .header p { 
            font-size: 1.1em; 
            opacity: 0.9; 
            position: relative;
            z-index: 1;
        }
        
        .back-btn { 
            background: var(--rensto-gradient-primary);
            color: var(--rensto-text-primary); 
            padding: 10px 20px; 
            border: none; 
            border-radius: 5px; 
            text-decoration: none; 
            display: inline-block; 
            margin: 20px; 
            box-shadow: var(--rensto-glow-primary);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .back-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(254, 61, 81, 0.4);
        }

        .back-btn:hover::before {
            left: 100%;
        }

        .controls {
            padding: 20px;
            background: var(--rensto-bg-card);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .sort-controls {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .sort-btn {
            background: var(--rensto-gradient-accent);
            color: var(--rensto-text-primary);
            padding: 8px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9em;
            position: relative;
        }

        .sort-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--rensto-glow-accent);
        }

        .sort-btn.active {
            background: var(--rensto-gradient-primary);
            box-shadow: var(--rensto-glow-primary);
        }

        .pagination {
            display: flex;
            gap: 5px;
            align-items: center;
        }

        .page-btn {
            background: var(--rensto-bg-secondary);
            color: var(--rensto-text-primary);
            padding: 8px 12px;
            border: 1px solid rgba(30, 174, 247, 0.3);
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
        }

        .page-btn:hover {
            background: var(--rensto-gradient-secondary);
            box-shadow: var(--rensto-glow-secondary);
        }

        .page-btn.active {
            background: var(--rensto-gradient-primary);
            box-shadow: var(--rensto-glow-primary);
        }
        
        .leads-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            background: var(--rensto-bg-card);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: var(--rensto-glow-secondary);
        }
        
        .leads-table th, .leads-table td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid rgba(30, 174, 247, 0.2); 
        }
        
        .leads-table th { 
            background: var(--rensto-gradient-secondary);
            font-weight: bold;
            color: var(--rensto-text-primary);
            text-shadow: 0 0 5px rgba(30, 174, 247, 0.5);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        .leads-table th:hover {
            background: var(--rensto-gradient-primary);
            box-shadow: var(--rensto-glow-primary);
        }

        .leads-table th::after {
            content: '↕';
            position: absolute;
            right: 8px;
            opacity: 0.5;
        }
        
        .leads-table tr:hover { 
            background: rgba(30, 174, 247, 0.1); 
            transform: scale(1.01);
            transition: all 0.2s ease;
        }
        
        .score-high { 
            background: var(--rensto-gradient-primary);
            color: var(--rensto-text-primary); 
            padding: 6px 12px; 
            border-radius: 6px; 
            box-shadow: var(--rensto-glow-primary);
            font-weight: bold;
            animation: rensto-pulse 2s ease-in-out infinite;
        }
        
        .score-medium { 
            background: var(--rensto-gradient-accent);
            color: var(--rensto-text-primary); 
            padding: 6px 12px; 
            border-radius: 6px; 
            box-shadow: var(--rensto-glow-accent);
            font-weight: bold;
        }
        
        .score-low { 
            background: rgba(254, 61, 81, 0.2);
            color: var(--rensto-red); 
            padding: 6px 12px; 
            border-radius: 6px; 
            border: 1px solid var(--rensto-red);
            font-weight: bold;
        }

        .lead-name {
            font-weight: bold;
            color: var(--rensto-cyan);
            text-shadow: 0 0 5px rgba(95, 251, 253, 0.3);
        }

        .lead-location {
            color: var(--rensto-text-secondary);
            font-style: italic;
        }

        .lead-group {
            color: var(--rensto-blue);
            font-weight: 500;
        }

        .lead-engagement {
            color: var(--rensto-orange);
            font-weight: 500;
        }

        .tooltip {
            position: relative;
            cursor: help;
        }

        .tooltip::before {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            background: var(--rensto-bg-primary);
            color: var(--rensto-text-primary);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8em;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            border: 1px solid var(--rensto-red);
            box-shadow: var(--rensto-glow-primary);
        }

        .tooltip:hover::before {
            opacity: 1;
            visibility: visible;
        }

        .info-bar {
            padding: 15px 20px;
            background: var(--rensto-bg-card);
            border-top: 1px solid rgba(30, 174, 247, 0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9em;
            color: var(--rensto-text-secondary);
        }

        @keyframes rensto-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .rensto-shimmer {
            position: relative;
            overflow: hidden;
        }

        .rensto-shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            animation: rensto-shimmer 2s infinite;
        }

        @keyframes rensto-shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .rensto-logo-svg {
            width: 40px;
            height: 40px;
            margin-right: 10px;
            filter: drop-shadow(0 0 10px rgba(254, 61, 81, 0.5));
        }

        .rensto-logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .rensto-logo {
            font-size: 1.2em;
            font-weight: bold;
            background: var(--rensto-gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 10px rgba(254, 61, 81, 0.5);
        }

        .rensto-logo-img {
            width: 120px;
            height: 120px;
            margin-right: 20px;
            filter: drop-shadow(0 0 15px rgba(254, 61, 81, 0.6));
            border-radius: 15px;
            object-fit: contain;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <div class="rensto-logo-container">
                    <img src="/logo" alt="Rensto" class="rensto-logo-img">
                </div>
                Facebook Leads
            </h1>
            <p>Page ${page} of ${totalPages} - Showing ${paginatedLeads.length} of ${this.leadsData.length} Total Leads</p>
        </div>
        
        <a href="/" class="back-btn rensto-shimmer">← Back to Dashboard</a>
        
        <div class="controls">
            <div class="sort-controls">
                <span>Sort by:</span>
                <a href="?sort=firstName&order=${sortBy === 'firstName' && sortOrder === 'asc' ? 'desc' : 'asc'}&page=${page}" class="sort-btn ${sortBy === 'firstName' ? 'active' : ''}">Name</a>
                <a href="?sort=leadScore&order=${sortBy === 'leadScore' && sortOrder === 'desc' ? 'asc' : 'desc'}&page=${page}" class="sort-btn ${sortBy === 'leadScore' ? 'active' : ''}">Score</a>
                <a href="?sort=engagementScore&order=${sortBy === 'engagementScore' && sortOrder === 'desc' ? 'asc' : 'desc'}&page=${page}" class="sort-btn ${sortBy === 'engagementScore' ? 'active' : ''}">Engagement</a>
                <a href="?sort=groupName&order=${sortBy === 'groupName' && sortOrder === 'asc' ? 'desc' : 'asc'}&page=${page}" class="sort-btn ${sortBy === 'groupName' ? 'active' : ''}">Group</a>
            </div>
            
            <div class="pagination">
                ${page > 1 ? `<a href="?sort=${sortBy}&order=${sortOrder}&page=${page-1}" class="page-btn">← Prev</a>` : ''}
                ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return `<a href="?sort=${sortBy}&order=${sortOrder}&page=${pageNum}" class="page-btn ${pageNum === page ? 'active' : ''}">${pageNum}</a>`;
                }).join('')}
                ${page < totalPages ? `<a href="?sort=${sortBy}&order=${sortOrder}&page=${page+1}" class="page-btn">Next →</a>` : ''}
            </div>
        </div>
        
        <div style="padding: 20px;">
            <table class="leads-table">
                <thead>
                    <tr>
                        <th><a href="?sort=firstName&order=${sortBy === 'firstName' && sortOrder === 'asc' ? 'desc' : 'asc'}&page=${page}" style="color: inherit; text-decoration: none;">Name ↕</a></th>
                        <th>Location</th>
                        <th><a href="?sort=groupName&order=${sortBy === 'groupName' && sortOrder === 'asc' ? 'desc' : 'asc'}&page=${page}" style="color: inherit; text-decoration: none;">Group ↕</a></th>
                        <th class="tooltip" data-tooltip="Lead Score: 0-100 rating based on engagement, activity, and potential value. Higher scores indicate better prospects."><a href="?sort=leadScore&order=${sortBy === 'leadScore' && sortOrder === 'desc' ? 'asc' : 'desc'}&page=${page}" style="color: inherit; text-decoration: none;">Score ↕</a></th>
                        <th class="tooltip" data-tooltip="Engagement Score: 0-100 rating of how active and engaged this person is in Facebook groups. Higher engagement = better lead."><a href="?sort=engagementScore&order=${sortBy === 'engagementScore' && sortOrder === 'desc' ? 'asc' : 'desc'}&page=${page}" style="color: inherit; text-decoration: none;">Engagement ↕</a></th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedLeads.map(lead => `
                        <tr>
                            <td class="lead-name">${lead.firstName} ${lead.lastName}</td>
                            <td class="lead-location">${lead.location || 'N/A'}</td>
                            <td class="lead-group">${lead.groupName || 'N/A'}</td>
                            <td>
                                <span class="score-${lead.leadScore >= 80 ? 'high' : lead.leadScore >= 50 ? 'medium' : 'low'}">
                                    ${lead.leadScore || 0}
                                </span>
                            </td>
                            <td class="lead-engagement">${lead.engagementScore || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="info-bar">
            <span>Showing ${startIndex + 1}-${Math.min(endIndex, this.leadsData.length)} of ${this.leadsData.length} leads</span>
            <span>Sorted by: ${sortBy === 'firstName' ? 'Name' : sortBy === 'leadScore' ? 'Score' : sortBy === 'engagementScore' ? 'Engagement' : 'Group'} (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})</span>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveAudiencesPage(res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ortal's Custom Audiences | Rensto</title>
    <style>
        :root {
            --rensto-red: #fe3d51;
            --rensto-orange: #bf5700;
            --rensto-blue: #1eaef7;
            --rensto-cyan: #5ffbfd;
            --rensto-bg-primary: #110d28;
            --rensto-bg-secondary: #1a1a2e;
            --rensto-bg-card: #16213e;
            --rensto-text-primary: #ffffff;
            --rensto-text-secondary: #a0a0a0;
            --rensto-gradient-primary: linear-gradient(135deg, var(--rensto-red) 0%, var(--rensto-orange) 100%);
            --rensto-gradient-secondary: linear-gradient(135deg, var(--rensto-blue) 0%, var(--rensto-cyan) 100%);
            --rensto-gradient-accent: linear-gradient(135deg, var(--rensto-cyan) 0%, var(--rensto-blue) 100%);
            --rensto-glow-primary: 0 0 20px rgba(254, 61, 81, 0.5);
            --rensto-glow-secondary: 0 0 20px rgba(30, 174, 247, 0.5);
            --rensto-glow-accent: 0 0 20px rgba(95, 251, 253, 0.5);
        }

        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: var(--rensto-bg-primary);
            color: var(--rensto-text-primary);
            min-height: 100vh; 
            padding: 20px; 
        }
        
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
            background: var(--rensto-bg-secondary);
            border-radius: 20px; 
            box-shadow: var(--rensto-glow-primary);
            overflow: hidden; 
            border: 1px solid rgba(254, 61, 81, 0.3);
        }
        
        .header { 
            background: var(--rensto-gradient-primary);
            color: var(--rensto-text-primary); 
            padding: 30px; 
            text-align: center; 
        }
        
        .header h1 { 
            font-size: 2em; 
            margin-bottom: 10px; 
        }
        
        .back-btn { 
            background: var(--rensto-gradient-secondary);
            color: var(--rensto-text-primary); 
            padding: 10px 20px; 
            border: none; 
            border-radius: 5px; 
            text-decoration: none; 
            display: inline-block; 
            margin: 20px; 
            box-shadow: var(--rensto-glow-secondary);
            transition: all 0.3s ease;
        }

        .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(30, 174, 247, 0.4);
        }
        
        .audience-card { 
            background: var(--rensto-bg-card);
            border: 1px solid rgba(30, 174, 247, 0.3);
            border-radius: 10px; 
            padding: 20px; 
            margin: 20px; 
            box-shadow: var(--rensto-glow-secondary);
            transition: all 0.3s ease;
        }

        .audience-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(30, 174, 247, 0.3);
        }
        
        .audience-card h3 { 
            color: var(--rensto-blue);
            margin-bottom: 10px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <div class="rensto-logo-container">
                    <svg class="rensto-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="renstoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#fe3d51;stop-opacity:1" />
                                <stop offset="50%" style="stop-color:#bf5700;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#1eaef7;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <!-- Proper Rensto "R" logo -->
                        <path d="M25 20 L25 80 L45 80 C55 80 65 70 65 60 C65 50 55 40 45 40 L35 40 L35 20 Z M35 50 L45 50 C50 50 55 55 55 60 C55 65 50 70 45 70 L35 70 Z" fill="url(#renstoGradient)" stroke="none"/>
                    </svg>
                    <span class="rensto-logo">RENSTO</span>
                </div>
                Custom Audiences
            </h1>
            <p>10 Facebook Custom Audiences Created</p>
        </div>
        
        <a href="/" class="back-btn">← Back to Dashboard</a>
        
        <div style="padding: 20px;">
            ${this.customAudiences.map(audience => `
                <div class="audience-card">
                    <h3>${audience.name}</h3>
                    <p><strong>Size:</strong> ${audience.size} users</p>
                    <p><strong>Source Group:</strong> ${audience.sourceGroup}</p>
                    <p><strong>Category:</strong> ${audience.category}</p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveExportPage(res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Export Ortal's Data | Rensto</title>
    <style>
        :root {
            --rensto-red: #fe3d51;
            --rensto-orange: #bf5700;
            --rensto-blue: #1eaef7;
            --rensto-cyan: #5ffbfd;
            --rensto-bg-primary: #110d28;
            --rensto-bg-secondary: #1a1a2e;
            --rensto-bg-card: #16213e;
            --rensto-text-primary: #ffffff;
            --rensto-text-secondary: #a0a0a0;
            --rensto-gradient-primary: linear-gradient(135deg, var(--rensto-red) 0%, var(--rensto-orange) 100%);
            --rensto-gradient-secondary: linear-gradient(135deg, var(--rensto-blue) 0%, var(--rensto-cyan) 100%);
            --rensto-gradient-accent: linear-gradient(135deg, var(--rensto-cyan) 0%, var(--rensto-blue) 100%);
            --rensto-glow-primary: 0 0 20px rgba(254, 61, 81, 0.5);
            --rensto-glow-secondary: 0 0 20px rgba(30, 174, 247, 0.5);
            --rensto-glow-accent: 0 0 20px rgba(95, 251, 253, 0.5);
        }

        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: var(--rensto-bg-primary);
            color: var(--rensto-text-primary);
            min-height: 100vh; 
            padding: 20px; 
        }
        
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: var(--rensto-bg-secondary);
            border-radius: 20px; 
            box-shadow: var(--rensto-glow-primary);
            overflow: hidden; 
            border: 1px solid rgba(254, 61, 81, 0.3);
        }
        
        .header { 
            background: var(--rensto-gradient-primary);
            color: var(--rensto-text-primary); 
            padding: 30px; 
            text-align: center; 
        }
        
        .header h1 { 
            font-size: 2em; 
            margin-bottom: 10px; 
        }
        
        .back-btn { 
            background: var(--rensto-gradient-secondary);
            color: var(--rensto-text-primary); 
            padding: 10px 20px; 
            border: none; 
            border-radius: 5px; 
            text-decoration: none; 
            display: inline-block; 
            margin: 20px; 
            box-shadow: var(--rensto-glow-secondary);
            transition: all 0.3s ease;
        }

        .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(30, 174, 247, 0.4);
        }
        
        .export-card { 
            background: var(--rensto-bg-card);
            border: 1px solid rgba(30, 174, 247, 0.3);
            border-radius: 10px; 
            padding: 20px; 
            margin: 20px; 
            text-align: center; 
            box-shadow: var(--rensto-glow-secondary);
            transition: all 0.3s ease;
        }

        .export-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(30, 174, 247, 0.3);
        }
        
        .export-btn { 
            background: var(--rensto-gradient-primary);
            color: var(--rensto-text-primary); 
            padding: 15px 30px; 
            border: none; 
            border-radius: 5px; 
            text-decoration: none; 
            display: inline-block; 
            margin: 10px; 
            font-size: 1.1em; 
            box-shadow: var(--rensto-glow-primary);
            transition: all 0.3s ease;
        }

        .export-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(254, 61, 81, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <div class="rensto-logo-container">
                    <svg class="rensto-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="renstoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#fe3d51;stop-opacity:1" />
                                <stop offset="50%" style="stop-color:#bf5700;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#1eaef7;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <!-- Proper Rensto "R" logo -->
                        <path d="M25 20 L25 80 L45 80 C55 80 65 70 65 60 C65 50 55 40 45 40 L35 40 L35 20 Z M35 50 L45 50 C50 50 55 55 55 60 C55 65 50 70 45 70 L35 70 Z" fill="url(#renstoGradient)" stroke="none"/>
                    </svg>
                    <span class="rensto-logo">RENSTO</span>
                </div>
                Export Data
            </h1>
            <p>Download Ortal's Facebook Data</p>
        </div>
        
        <a href="/" class="back-btn">← Back to Dashboard</a>
        
        <div class="export-card">
            <h3>📊 All Leads (5,548)</h3>
            <p>Complete leads data in JSON format</p>
            <a href="/download/ortal-leads-2025-08-17T20-25-28-621Z.json" class="export-btn">Download JSON</a>
        </div>
        
        <div class="export-card">
            <h3>📋 Custom Audiences (10)</h3>
            <p>Custom audiences data in JSON format</p>
            <a href="/download/ortal-custom-audiences-2025-08-17T20-25-28-621Z.json" class="export-btn">Download JSON</a>
        </div>
        
        <div class="export-card">
            <h3>📋 Summary Report</h3>
            <p>Complete execution summary</p>
            <a href="/download/ortal-summary-report-2025-08-17T20-25-28-621Z.json" class="export-btn">Download JSON</a>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveFileDownload(res, url) {
    const fileName = url.replace('/download/', '');
    const filePath = path.join(this.dataDir, fileName);
    
    try {
      const content = await fs.readFile(filePath);
      const ext = path.extname(filePath);
      
      let contentType = 'application/octet-stream';
      if (ext === '.json') contentType = 'application/json';
      else if (ext === '.csv') contentType = 'text/csv';
      
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`
      });
      res.end(content);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  }

  async startNgrok() {
    try {
      console.log('🌐 Starting ngrok for public access...');
      
      // Kill any existing ngrok processes
      await execAsync('pkill -f ngrok || true');
      
      // Start ngrok
      const ngrokProcess = exec(`ngrok http ${this.port}`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Ngrok error:', error.message);
        }
      });
      
      // Wait for ngrok to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get the public URL
      try {
        const { stdout } = await execAsync('curl -s http://localhost:4040/api/tunnels | jq -r ".tunnels[0].public_url"');
        const publicUrl = stdout.trim();
        
        if (publicUrl && publicUrl !== 'null') {
          console.log(`✅ Public URL: ${publicUrl}`);
          
          // Save the URL
          await fs.writeFile('data/ortal-deliverables/CURRENT_PUBLIC_URL.txt', publicUrl);
          console.log('📝 Public URL saved');
        } else {
          console.log('⚠️ Ngrok URL not available yet');
        }
      } catch (error) {
        console.log('⚠️ Could not get ngrok URL:', error.message);
      }
      
    } catch (error) {
      console.error('❌ Error starting ngrok:', error.message);
    }
  }
}

// Start the server
const server = new Ortal5548Server();
server.startServer().catch(console.error);
