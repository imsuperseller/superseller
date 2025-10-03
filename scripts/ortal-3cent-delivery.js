#!/usr/bin/env node

import http from 'http';
import fs from 'fs/promises';
import path from 'path';

/**
 * ORTAL'S 3-CENT PER LEAD DELIVERY SYSTEM
 * 
 * Pricing: $0.03 per lead (vs $0.08 market rate)
 * Total: 9,401 leads = $282.03
 * Strategy: Maintain quality while optimizing for repeat business
 */

class Ortal3CentDelivery {
  constructor() {
    this.port = 8087;
    this.dataDir = 'data/ortal-new-leads';
    this.leadsData = null;
    this.pricing = {
      pricePerLead: 0.03,
      totalLeads: 9401,
      totalPrice: 282.03,
      marketRate: 0.08,
      savings: 470.05
    };
  }

  async startServer() {
    console.log('🚀 Starting Ortal\'s 3-Cent Delivery System...');
    console.log(`💰 Total Price: $${this.pricing.totalPrice} (${this.pricing.totalLeads} leads)`);
    console.log(`💵 Savings vs Market: $${this.pricing.savings}`);
    
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
      console.log(`✅ 3-Cent Delivery System running at http://localhost:${this.port}`);
      console.log('🎯 Ortal gets premium quality at 3-cent pricing!');
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
      
      console.log(`✅ Loaded ${this.leadsData.length} leads for 3-cent delivery`);
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
    
    if (url === '/invoice') {
      await this.serveInvoice(res);
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
    <title>Ortal's 3-Cent Leads - Premium Quality, Market-Beating Price | Rensto</title>
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
        
        .pricing-highlight {
            background: var(--rensto-gradient-primary);
            color: var(--rensto-text-primary);
            padding: 20px;
            text-align: center;
            font-size: 1.3em;
            font-weight: bold;
            box-shadow: var(--rensto-glow-primary);
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

        .savings-highlight {
            background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Ortal's 3-Cent Leads</h1>
            <p>Premium Quality Israeli Leads at Market-Beating Price</p>
        </div>
        
        <div class="pricing-highlight">
            💰 SPECIAL PRICING: $0.03 per lead (Market Rate: $0.08) - You Save $470.05!
        </div>
        
        <div class="savings-highlight">
            🎉 TOTAL PRICE: $282.03 for 9,401 Premium Israeli Leads
        </div>
        
        <div class="actions">
            <a href="/leads" class="btn">👥 VIEW ALL LEADS (9,401)</a>
            <a href="/export" class="btn">📥 EXPORT DATA</a>
            <a href="/invoice" class="btn">🧾 VIEW INVOICE</a>
        </div>
        
        <div class="badge" style="margin: 0 30px;">✅ PREMIUM QUALITY - Same high-quality leads you loved last time</div>
        <div class="badge" style="margin: 10px 30px;">📞 PHONE NUMBERS INCLUDED - Email + Phone for every lead</div>
        <div class="badge" style="margin: 10px 30px;">🎯 3-CENT PRICING - 62% below market rate for repeat business</div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">9,401</div>
                <div class="stat-label">Total Premium Leads</div>
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
                <h3>💰 Pricing Breakdown:</h3>
                <p><strong>Your Price:</strong> $0.03 per lead</p>
                <p><strong>Market Rate:</strong> $0.08 per lead</p>
                <p><strong>Your Savings:</strong> $470.05 (62% discount)</p>
                <p><strong>Total Cost:</strong> $282.03 for 9,401 leads</p>
                <p><strong>Quality:</strong> Same premium quality you loved last time</p>
            </div>
            
            <div class="info-card">
                <h3>🔄 Repeat Business Benefits:</h3>
                <p><strong>Monthly 10K leads:</strong> $300 (vs $800 market rate)</p>
                <p><strong>Monthly 15K leads:</strong> $450 (vs $1,200 market rate)</p>
                <p><strong>Monthly 20K leads:</strong> $600 (vs $1,600 market rate)</p>
                <p><strong>Annual Savings:</strong> $5,000+ with regular orders</p>
            </div>
            
            <div class="info-card">
                <h3>📊 Lead Quality Metrics:</h3>
                <p><strong>High Quality (80+ score):</strong> 2,988 leads (32%)</p>
                <p><strong>Medium Quality (50-79):</strong> 2,856 leads (30%)</p>
                <p><strong>Target Age Range:</strong> 24-50 (100% coverage)</p>
                <p><strong>Geographic Coverage:</strong> NYC + 10 major US cities</p>
                <p><strong>Contact Data:</strong> Email + Phone numbers included</p>
                <p><strong>Data Freshness:</strong> Generated September 17, 2025</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveInvoice(res) {
    const invoiceData = {
      invoiceNumber: 'ORTAL-2025-001',
      date: new Date().toISOString().split('T')[0],
      customer: 'Ortal - local-il.com',
      items: [
        {
          description: 'Premium Israeli Leads (NYC + Major US Cities)',
          quantity: this.pricing.totalLeads,
          unitPrice: this.pricing.pricePerLead,
          total: this.pricing.totalPrice
        }
      ],
      subtotal: this.pricing.totalPrice,
      tax: 0,
      total: this.pricing.totalPrice,
      paymentTerms: 'Net 30',
      notes: 'Special 3-cent pricing for repeat business. Market rate: $0.08 per lead.'
    };

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Ortal's 3-Cent Leads | Rensto</title>
    <style>
        :root {
            --rensto-red: #fe3d51;
            --rensto-blue: #1eaef7;
            --rensto-bg-primary: #110d28;
            --rensto-bg-secondary: #1a1a2e;
            --rensto-text-primary: #ffffff;
            --rensto-text-secondary: #a0a0a0;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: var(--rensto-bg-primary);
            color: var(--rensto-text-primary);
            padding: 40px 20px; 
        }
        
        .invoice-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: var(--rensto-bg-secondary);
            border-radius: 20px; 
            padding: 40px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--rensto-red);
        }
        
        .invoice-title {
            font-size: 2.5em;
            color: var(--rensto-red);
            font-weight: bold;
        }
        
        .invoice-number {
            font-size: 1.2em;
            color: var(--rensto-text-secondary);
        }
        
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .detail-section h3 {
            color: var(--rensto-blue);
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .detail-section p {
            margin-bottom: 8px;
            color: var(--rensto-text-secondary);
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            background: var(--rensto-bg-primary);
            border-radius: 10px;
            overflow: hidden;
        }
        
        .items-table th,
        .items-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(30, 174, 247, 0.2);
        }
        
        .items-table th {
            background: var(--rensto-blue);
            color: var(--rensto-text-primary);
            font-weight: bold;
        }
        
        .items-table tr:hover {
            background: rgba(30, 174, 247, 0.1);
        }
        
        .total-section {
            margin-top: 30px;
            padding: 20px;
            background: var(--rensto-bg-primary);
            border-radius: 10px;
            border: 2px solid var(--rensto-red);
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .total-row.final {
            font-size: 1.5em;
            font-weight: bold;
            color: var(--rensto-red);
            border-top: 2px solid var(--rensto-red);
            padding-top: 15px;
            margin-top: 15px;
        }
        
        .back-btn {
            background: var(--rensto-red);
            color: var(--rensto-text-primary);
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            margin-top: 30px;
            transition: all 0.3s ease;
        }
        
        .back-btn:hover {
            background: #d63447;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div>
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${invoiceData.invoiceNumber}</div>
            </div>
            <div>
                <div style="font-size: 1.5em; color: var(--rensto-blue); font-weight: bold;">Rensto</div>
                <div style="color: var(--rensto-text-secondary);">AI Automation Solutions</div>
            </div>
        </div>
        
        <div class="invoice-details">
            <div class="detail-section">
                <h3>Bill To:</h3>
                <p><strong>${invoiceData.customer}</strong></p>
                <p>Israeli Lead Generation Services</p>
            </div>
            <div class="detail-section">
                <h3>Invoice Details:</h3>
                <p><strong>Date:</strong> ${invoiceData.date}</p>
                <p><strong>Payment Terms:</strong> ${invoiceData.paymentTerms}</p>
                <p><strong>Special Pricing:</strong> 3¢ per lead (62% below market)</p>
            </div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceData.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity.toLocaleString()}</td>
                        <td>$${item.unitPrice.toFixed(2)}</td>
                        <td>$${item.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="total-section">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>$${invoiceData.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Tax:</span>
                <span>$${invoiceData.tax.toFixed(2)}</span>
            </div>
            <div class="total-row final">
                <span>TOTAL:</span>
                <span>$${invoiceData.total.toFixed(2)}</span>
            </div>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: rgba(0, 255, 136, 0.1); border-radius: 10px; border: 1px solid #00ff88;">
            <h3 style="color: #00ff88; margin-bottom: 10px;">💡 Special Pricing Note:</h3>
            <p style="color: var(--rensto-text-secondary);">${invoiceData.notes}</p>
            <p style="color: var(--rensto-text-secondary); margin-top: 10px;">
                <strong>Your savings vs market rate: $470.05</strong>
            </p>
        </div>
        
        <a href="/" class="back-btn">← Back to Dashboard</a>
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
    <title>Ortal's 3-Cent Leads - Page ${page} | Rensto</title>
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
            <h1>🎯 Ortal's 3-Cent Leads</h1>
            <p>Page ${page} of ${totalPages} - Showing ${paginatedLeads.length} of ${this.leadsData.length} Total Leads</p>
            <p style="color: #00ff88; font-weight: bold;">💰 Special Price: $0.03 per lead (Market: $0.08)</p>
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
                        <th>Phone</th>
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
                            <td style="color: var(--rensto-cyan); font-weight: bold;">${lead.Phone}</td>
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
    <title>Export Ortal's 3-Cent Data | Rensto</title>
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
            <h1>📥 Export Ortal's 3-Cent Data</h1>
            <p>Download 9,401 Premium Leads at $0.03 each</p>
        </div>
        
        <a href="/" class="back-btn">← Back to Dashboard</a>
        
        <div class="export-card">
            <h3>📊 All Premium Leads (9,401)</h3>
            <p>Complete leads data in CSV format</p>
            <p><strong>Includes:</strong> Email + Phone numbers + LinkedIn profiles</p>
            <p><strong>Price:</strong> $282.03 (3¢ per lead)</p>
            <a href="/download/ortal-3cent-leads.csv" class="export-btn">Download CSV</a>
        </div>
        
        <div class="export-card">
            <h3>📋 NYC Leads Only (3,382)</h3>
            <p>NYC specific leads in CSV format</p>
            <p><strong>Includes:</strong> Email + Phone numbers + LinkedIn profiles</p>
            <p><strong>Price:</strong> $101.46 (3¢ per lead)</p>
            <a href="/download/nyc-3cent-leads.csv" class="export-btn">Download NYC CSV</a>
        </div>
        
        <div class="export-card">
            <h3>📋 Major US Cities Leads (6,019)</h3>
            <p>Major US cities leads in CSV format</p>
            <p><strong>Includes:</strong> Email + Phone numbers + LinkedIn profiles</p>
            <p><strong>Price:</strong> $180.57 (3¢ per lead)</p>
            <a href="/download/major-cities-3cent-leads.csv" class="export-btn">Download Major Cities CSV</a>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

// Start the server
const server = new Ortal3CentDelivery();
server.startServer().catch(console.error);
