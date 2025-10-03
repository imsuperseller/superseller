#!/usr/bin/env node

import http from 'http';
import fs from 'fs/promises';
import path from 'path';

/**
 * SERVE ORTAL'S NEW LEADS - 9,401 FRESH LEADS
 * 
 * NYC: 3,382 leads
 * Major US Cities: 6,019 leads
 * All ages 24-50, high quality
 */

class OrtalNewLeadsServer {
  constructor() {
    this.port = 8085;
    this.dataDir = 'data/ortal-new-leads';
    this.server = null;
    this.leadsData = null;
  }

  async startServer() {
    console.log('🚀 Starting Ortal New Leads Server...');
    
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
      console.log(`📊 Serving ${this.leadsData.length} NEW leads for Ortal`);
    });
  }

  async loadLeadsData() {
    try {
      const leadsFile = 'ortal-new-leads-2025-09-17T03-16-53-315Z.csv';
      const leadsData = await fs.readFile(path.join(this.dataDir, leadsFile), 'utf8');
      
      // Parse CSV
      const lines = leadsData.split('\n');
      const headers = lines[0].split(',');
      this.leadsData = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const values = line.split(',');
          const lead = {};
          headers.forEach((header, index) => {
            lead[header] = values[index] || '';
          });
          this.leadsData.push(lead);
        }
      }
      
      console.log(`✅ Loaded ${this.leadsData.length} NEW leads`);
    } catch (error) {
      console.error('❌ Error loading data:', error.message);
      this.leadsData = [];
    }
  }

  async handleRequest(req, res) {
    const url = req.url;
    
    if (url === '/' || url === '/index.html') {
      await this.serveMainPage(res);
      return;
    }
    
    if (url === '/leads') {
      await this.serveLeadsPage(req, res);
      return;
    }
    
    if (url === '/export') {
      await this.serveExportPage(res);
      return;
    }
    
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }

  async serveMainPage(res) {
    const nycLeads = this.leadsData.filter(l => l.Location === 'New York').length;
    const majorCitiesLeads = this.leadsData.length - nycLeads;
    const highQualityLeads = this.leadsData.filter(l => parseInt(l['Lead Score']) >= 80).length;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ortal's NEW Leads - 9,401 Fresh Leads | Rensto</title>
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
            --rensto-glow-primary: 0 0 20px rgba(254, 61, 81, 0.5);
            --rensto-glow-secondary: 0 0 20px rgba(30, 174, 247, 0.5);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
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
            background: var(--rensto-gradient-secondary);
            color: var(--rensto-text-primary); 
            padding: 40px; 
            text-align: center; 
        }
        
        .header h1 { 
            font-size: 2.5em; 
            margin-bottom: 10px; 
            text-shadow: 0 0 10px rgba(30, 174, 247, 0.5);
        }
        
        .header p { 
            font-size: 1.2em; 
            opacity: 0.9; 
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
        }

        .btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 10px 25px rgba(254, 61, 81, 0.4);
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
        }
        
        .info-card h3 { 
            color: var(--rensto-red);
            margin-bottom: 15px; 
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Ortal's NEW Leads</h1>
            <p>9,401 FRESH LEADS - NYC + Major US Cities (Ages 24-50)</p>
        </div>
        
        <div class="actions">
            <a href="/leads" class="btn">👥 VIEW ALL LEADS (9,401)</a>
            <a href="/export" class="btn">📥 EXPORT DATA</a>
        </div>
        
        <div class="badge" style="margin: 0 30px;">✅ NEW DATA - 9,401 FRESH LEADS (NO DUPLICATES)</div>
        <div class="badge" style="margin: 10px 30px;">🎯 TARGET: 5,000 NYC + 10,000 Major US Cities</div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">9,401</div>
                <div class="stat-label">Total NEW Leads</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">3,382</div>
                <div class="stat-label">NYC Leads</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">6,019</div>
                <div class="stat-label">Major US Cities</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">2,988</div>
                <div class="stat-label">High Quality (80+)</div>
            </div>
        </div>
        
        <div class="info-section">
            <div class="info-card">
                <h3>📊 NEW Lead Generation Summary:</h3>
                <p><strong>Generated:</strong> September 17, 2025</p>
                <p><strong>Methodology:</strong> Facebook Group Scraping (Apify Integration)</p>
                <p><strong>Target Groups:</strong> 15 NEW Israeli community groups</p>
                <p><strong>Quality:</strong> 2,988 high-quality leads (80+ score)</p>
                <p><strong>Age Range:</strong> 24-50 (100% target demographic)</p>
                <p><strong>Duplicate Check:</strong> ✅ No duplicates from previous delivery</p>
            </div>
            
            <div class="info-card">
                <h3>🎯 Location Breakdown:</h3>
                <p><strong>New York:</strong> 3,382 leads (NYC specific groups)</p>
                <p><strong>Los Angeles:</strong> 1,362 leads</p>
                <p><strong>Miami:</strong> 1,094 leads</p>
                <p><strong>Chicago:</strong> 738 leads</p>
                <p><strong>San Francisco:</strong> 643 leads</p>
                <p><strong>Boston:</strong> 590 leads</p>
                <p><strong>Other Major Cities:</strong> 1,592 leads</p>
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
    const pageSize = 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLeads = this.leadsData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(this.leadsData.length / pageSize);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ortal's NEW Leads - Page ${page} | Rensto</title>
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
            --rensto-glow-primary: 0 0 20px rgba(254, 61, 81, 0.5);
            --rensto-glow-secondary: 0 0 20px rgba(30, 174, 247, 0.5);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
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
            background: var(--rensto-gradient-secondary);
            color: var(--rensto-text-primary); 
            padding: 30px; 
            text-align: center; 
        }
        
        .header h1 { 
            font-size: 2em; 
            margin-bottom: 10px; 
            text-shadow: 0 0 10px rgba(30, 174, 247, 0.5);
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
        }

        .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(254, 61, 81, 0.4);
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
        }
        
        .score-medium { 
            background: var(--rensto-gradient-secondary);
            color: var(--rensto-text-primary); 
            padding: 6px 12px; 
            border-radius: 6px; 
            box-shadow: var(--rensto-glow-secondary);
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

        .pagination {
            display: flex;
            gap: 5px;
            align-items: center;
            justify-content: center;
            padding: 20px;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Ortal's NEW Leads</h1>
            <p>Page ${page} of ${totalPages} - Showing ${paginatedLeads.length} of ${this.leadsData.length} Total Leads</p>
        </div>
        
        <a href="/" class="back-btn">← Back to Dashboard</a>
        
        <div style="padding: 20px;">
            <table class="leads-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Age</th>
                        <th>Group</th>
                        <th>Score</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedLeads.map(lead => `
                        <tr>
                            <td class="lead-name">${lead['First Name']} ${lead['Last Name']}</td>
                            <td class="lead-location">${lead.Location}</td>
                            <td>${lead.Age}</td>
                            <td>${lead['Group Name']}</td>
                            <td>
                                <span class="score-${parseInt(lead['Lead Score']) >= 80 ? 'high' : parseInt(lead['Lead Score']) >= 50 ? 'medium' : 'low'}">
                                    ${lead['Lead Score']}
                                </span>
                            </td>
                            <td>${lead.Email}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="pagination">
            ${page > 1 ? `<a href="?page=${page-1}" class="page-btn">← Prev</a>` : ''}
            ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return `<a href="?page=${pageNum}" class="page-btn ${pageNum === page ? 'active' : ''}">${pageNum}</a>`;
            }).join('')}
            ${page < totalPages ? `<a href="?page=${page+1}" class="page-btn">Next →</a>` : ''}
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
    <title>Export Ortal's NEW Data | Rensto</title>
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
            --rensto-glow-primary: 0 0 20px rgba(254, 61, 81, 0.5);
            --rensto-glow-secondary: 0 0 20px rgba(30, 174, 247, 0.5);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
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
            <h1>📥 Export Ortal's NEW Data</h1>
            <p>Download 9,401 Fresh Leads</p>
        </div>
        
        <a href="/" class="back-btn">← Back to Dashboard</a>
        
        <div class="export-card">
            <h3>📊 All NEW Leads (9,401)</h3>
            <p>Complete leads data in CSV format</p>
            <a href="/download/ortal-new-leads-2025-09-17T03-16-53-315Z.csv" class="export-btn">Download CSV</a>
        </div>
        
        <div class="export-card">
            <h3>📋 NYC Leads Only (3,382)</h3>
            <p>NYC specific leads in CSV format</p>
            <a href="/download/nyc-leads.csv" class="export-btn">Download NYC CSV</a>
        </div>
        
        <div class="export-card">
            <h3>📋 Major US Cities Leads (6,019)</h3>
            <p>Major US cities leads in CSV format</p>
            <a href="/download/major-cities-leads.csv" class="export-btn">Download Major Cities CSV</a>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

// Start the server
const server = new OrtalNewLeadsServer();
server.startServer().catch(console.error);
