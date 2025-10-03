#!/usr/bin/env node

import { DesignerAPI } from '@webflow/designer-api';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

class WebflowDesignerExtension {
    constructor() {
        this.app = express();
        this.designerAPI = new DesignerAPI();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    setupRoutes() {
        // OAuth callback
        this.app.get('/auth/webflow/callback', async (req, res) => {
            try {
                const { code, state } = req.query;
                
                console.log('OAuth callback received:', { code, state });
                
                // Exchange code for tokens using Webflow OAuth
                const tokenResponse = await axios.post('https://api.webflow.com/oauth/access_token', {
                    client_id: process.env.WEBFLOW_CLIENT_ID,
                    client_secret: process.env.WEBFLOW_CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: 'https://68df6e8d3098a65fadc8f111.webflow-ext.com/auth/webflow/callback'
                });
                
                console.log('Token response:', tokenResponse.data);
                
                // Store tokens securely
                this.storeTokens(tokenResponse.data);
                
                res.json({ 
                    success: true, 
                    message: 'Webflow Designer API authorized successfully',
                    tokens: tokenResponse.data
                });
            } catch (error) {
                console.error('OAuth callback error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        // Designer API endpoints
        this.app.post('/api/designer/create-element', async (req, res) => {
            try {
                const { pageId, elementType, content, styles } = req.body;
                const element = await this.designerAPI.createElement({
                    pageId,
                    elementType,
                    content,
                    styles
                });
                
                res.json({ success: true, element });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        this.app.put('/api/designer/update-element', async (req, res) => {
            try {
                const { elementId, content, styles } = req.body;
                const element = await this.designerAPI.updateElement({
                    elementId,
                    content,
                    styles
                });
                
                res.json({ success: true, element });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        this.app.post('/api/designer/apply-styles', async (req, res) => {
            try {
                const { elementId, styles } = req.body;
                const result = await this.designerAPI.applyStyles({
                    elementId,
                    styles
                });
                
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        this.app.get('/api/designer/page-content/:pageId', async (req, res) => {
            try {
                const { pageId } = req.params;
                const content = await this.designerAPI.getPageContent(pageId);
                
                res.json({ success: true, content });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        this.app.put('/api/designer/page-content/:pageId', async (req, res) => {
            try {
                const { pageId } = req.params;
                const { content } = req.body;
                const result = await this.designerAPI.updatePageContent(pageId, content);
                
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        this.app.get('/api/designer/components', async (req, res) => {
            try {
                const components = await this.designerAPI.getComponents();
                res.json({ success: true, components });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        this.app.put('/api/designer/component/:componentId', async (req, res) => {
            try {
                const { componentId } = req.params;
                const { content, styles } = req.body;
                const component = await this.designerAPI.updateComponent({
                    componentId,
                    content,
                    styles
                });
                
                res.json({ success: true, component });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                service: 'Webflow Designer Extension'
            });
        });
    }

    storeTokens(tokens) {
        // Store tokens securely (implement proper storage)
        process.env.WEBFLOW_ACCESS_TOKEN = tokens.access_token;
        process.env.WEBFLOW_REFRESH_TOKEN = tokens.refresh_token;
        process.env.WEBFLOW_TOKEN_EXPIRES_AT = tokens.expires_at;
    }

    async start() {
        const port = process.env.PORT || 3000;
        this.app.listen(port, () => {
            console.log(`Webflow Designer Extension running on port ${port}`);
            console.log(`OAuth callback URL: http://localhost:${port}/auth/webflow/callback`);
        });
    }
}

// Start the extension
const extension = new WebflowDesignerExtension();
extension.start().catch(console.error);
