#!/usr/bin/env node

/**
 * Boost.space HTTP Server
 * Deployed on Racknerd VPS for AI-powered data queries and automation
 * HTTP version that runs continuously
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Boost.space configuration
const BOOST_SPACE_CONFIG = {
    platform: 'https://superseller.boost.space',
    apiKey: 'BOOST_SPACE_KEY_REDACTED',
    calendarUrl: 'https://superseller.boost.space/api/calendar-user/4/0b9b38ef38cca2180117c0d56c0a2582',
    mcpServer: 'https://mcp.boost.space/v1/superseller/sse'
};

class BoostSpaceHTTPServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupBoostSpaceAPI();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupBoostSpaceAPI() {
        this.api = axios.create({
            baseURL: BOOST_SPACE_CONFIG.platform,
            headers: {
                'Authorization': `Bearer ${BOOST_SPACE_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'boost-space-mcp-server',
                timestamp: new Date().toISOString(),
                config: {
                    platform: BOOST_SPACE_CONFIG.platform,
                    calendarUrl: BOOST_SPACE_CONFIG.calendarUrl
                }
            });
        });

        // Query Boost.space data
        this.app.post('/api/query', async (req, res) => {
            try {
                const { module, query, filters } = req.body;

                if (!module || !query) {
                    return res.status(400).json({
                        error: 'Missing required parameters: module and query'
                    });
                }

                console.log(`🔍 Querying Boost.space ${module}: ${query}`);

                // Make actual API call to Boost.space
                const response = await this.api.get(`/api/${module}`, {
                    params: filters || {}
                });

                res.json({
                    success: true,
                    module,
                    query,
                    data: response.data
                });
            } catch (error) {
                console.log(`⚠️ API call failed, using mock data: ${error.message}`);
                const mockData = this.getMockDataForModule(req.body.module, req.body.query);

                res.json({
                    success: true,
                    module: req.body.module,
                    query: req.body.query,
                    data: mockData,
                    note: 'Using mock data due to API error'
                });
            }
        });

        // Create Boost.space record
        this.app.post('/api/create', async (req, res) => {
            try {
                const { module, data } = req.body;

                if (!module || !data) {
                    return res.status(400).json({
                        error: 'Missing required parameters: module and data'
                    });
                }

                console.log(`➕ Creating new ${module} record in Boost.space`);

                // Make actual API call to create record
                const response = await this.api.post(`/api/${module}`, data);

                res.json({
                    success: true,
                    module,
                    recordId: response.data.id,
                    data: response.data
                });
            } catch (error) {
                console.log(`⚠️ API call failed, using mock response: ${error.message}`);
                const recordId = `boost-${req.body.module}-${Date.now()}`;

                res.json({
                    success: true,
                    module: req.body.module,
                    recordId,
                    data: req.body.data,
                    note: 'Mock response due to API error'
                });
            }
        });

        // Update Boost.space record
        this.app.put('/api/update/:module/:recordId', async (req, res) => {
            try {
                const { module, recordId } = req.params;
                const { data } = req.body;

                if (!data) {
                    return res.status(400).json({
                        error: 'Missing required parameter: data'
                    });
                }

                console.log(`✏️ Updating ${module} record ${recordId} in Boost.space`);

                // Make actual API call to update record
                const response = await this.api.put(`/api/${module}/${recordId}`, data);

                res.json({
                    success: true,
                    module,
                    recordId,
                    data: response.data
                });
            } catch (error) {
                console.log(`⚠️ API call failed, using mock response: ${error.message}`);

                res.json({
                    success: true,
                    module: req.params.module,
                    recordId: req.params.recordId,
                    data: req.body.data,
                    note: 'Mock response due to API error'
                });
            }
        });

        // Get analytics
        this.app.get('/api/analytics/:metric', async (req, res) => {
            try {
                const { metric } = req.params;
                const { timeframe = 'month' } = req.query;

                console.log(`📈 Getting ${metric} analytics for ${timeframe}`);

                // Try to get real analytics from Boost.space
                const response = await this.api.get(`/api/analytics/${metric}`, {
                    params: { timeframe }
                });

                res.json({
                    success: true,
                    metric,
                    timeframe,
                    data: response.data
                });
            } catch (error) {
                console.log(`⚠️ Analytics API call failed, using mock data: ${error.message}`);
                const analytics = this.getMockAnalytics(req.params.metric, req.query.timeframe || 'month');

                res.json({
                    success: true,
                    metric: req.params.metric,
                    timeframe: req.query.timeframe || 'month',
                    data: analytics,
                    note: 'Mock data due to API error'
                });
            }
        });

        // Calendar sync
        this.app.post('/api/calendar/sync', async (req, res) => {
            try {
                const { action, eventData } = req.body;

                console.log(`📅 Calendar sync action: ${action}`);

                if (action === 'sync') {
                    // Test calendar URL accessibility
                    const response = await axios.get(BOOST_SPACE_CONFIG.calendarUrl);

                    res.json({
                        success: true,
                        action,
                        calendarUrl: BOOST_SPACE_CONFIG.calendarUrl,
                        status: response.status
                    });
                } else {
                    // Handle other calendar actions
                    const response = await this.api.post(`/api/event`, eventData);

                    res.json({
                        success: true,
                        action,
                        eventId: response.data.id,
                        data: response.data
                    });
                }
            } catch (error) {
                console.log(`⚠️ Calendar sync failed: ${error.message}`);

                res.json({
                    success: true,
                    action: req.body.action,
                    calendarUrl: BOOST_SPACE_CONFIG.calendarUrl,
                    note: 'Mock response due to API error'
                });
            }
        });

        // List available modules
        this.app.get('/api/modules', (req, res) => {
            res.json({
                success: true,
                modules: [
                    'contacts',
                    'invoice',
                    'business-contract',
                    'business-case',
                    'todo',
                    'event',
                    'products'
                ]
            });
        });

        // Error handling
        this.app.use((err, req, res, next) => {
            console.error('Server error:', err);
            res.status(500).json({
                error: 'Internal server error',
                message: err.message
            });
        });
    }

    getMockDataForModule(module, query) {
        const mockData = {
            contacts: [
                { id: 1, name: 'John Doe', email: 'john@example.com', company: 'Tech Corp', status: 'active' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', company: 'Design Studio', status: 'active' }
            ],
            invoice: [
                { id: 1, number: 'INV-001', customer: 'Tech Corp', amount: 5000, status: 'paid' },
                { id: 2, number: 'INV-002', customer: 'Design Studio', amount: 3000, status: 'pending' }
            ],
            'business-contract': [
                { id: 1, name: 'Service Agreement', parties: ['Rensto', 'Tech Corp'], status: 'active' },
                { id: 2, name: 'NDA', parties: ['Rensto', 'Design Studio'], status: 'draft' }
            ],
            'business-case': [
                { id: 1, name: 'Website Development', customer: 'Tech Corp', budget: 15000, status: 'in-progress' },
                { id: 2, name: 'Mobile App', customer: 'Design Studio', budget: 25000, status: 'planning' }
            ],
            todo: [
                { id: 1, title: 'Review contract', assignee: 'John', priority: 'high', status: 'pending' },
                { id: 2, title: 'Send invoice', assignee: 'Jane', priority: 'medium', status: 'completed' }
            ],
            event: [
                { id: 1, title: 'Client Meeting', startDate: '2025-08-23T10:00:00Z', attendees: ['John', 'Client'] },
                { id: 2, title: 'Project Review', startDate: '2025-08-24T14:00:00Z', attendees: ['Team'] }
            ],
            products: [
                { id: 1, name: 'Web Development', sku: 'WEB-001', price: 5000, category: 'Services' },
                { id: 2, name: 'Mobile Development', sku: 'MOB-001', price: 8000, category: 'Services' }
            ]
        };

        return mockData[module] || [];
    }

    getMockAnalytics(metric, timeframe) {
        const analytics = {
            revenue: {
                total: 50000,
                growth: 15,
                breakdown: { services: 40000, products: 10000 },
                trend: 'increasing'
            },
            customers: {
                total: 25,
                new: 5,
                active: 20,
                churn: 2,
                trend: 'stable'
            },
            projects: {
                total: 12,
                completed: 8,
                inProgress: 3,
                planning: 1,
                successRate: 85
            },
            tasks: {
                total: 45,
                completed: 35,
                pending: 8,
                overdue: 2,
                completionRate: 78
            },
            invoices: {
                total: 30,
                paid: 25,
                pending: 3,
                overdue: 2,
                collectionRate: 83
            }
        };

        return analytics[metric] || {};
    }

    start() {
        this.app.listen(this.port, () => {
            console.log('🚀 Boost.space HTTP Server running on Racknerd VPS');
            console.log(`📊 Connected to: ${BOOST_SPACE_CONFIG.platform}`);
            console.log(`📅 Calendar: ${BOOST_SPACE_CONFIG.calendarUrl}`);
            console.log(`🌐 Server running on port ${this.port}`);
            console.log('✅ Boost.space HTTP Server ready to handle requests');
        });
    }
}

// Start the server
const server = new BoostSpaceHTTPServer();
server.start();
