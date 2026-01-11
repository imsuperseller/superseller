# 🚀 RENSTO MASTER CONTEXT (2026)
**Date**: January 1, 2026
**Status**: Production / Scale

## 🏢 BUSINESS OVERVIEW
Rensto is a Universal Micro-SaaS Automation Platform. It provides AI-powered business operations via subscription or custom setup.

### Core Service Tiers
1. **Marketplace Templates** ($29 - $197): Pre-built n8n workflows for self-hosting or managed hosting.
2. **Full-Service Installation** ($797 - $3,500+): Done-for-you setup of complex automations.
3. **Monthly Subscriptions** ($299 - $1,499): Managed services like "Lead Machine" or "Autonomous Secretary".
4. **Ready Solutions** ($890 - $2,990): Niche-specific packages (e.g., Real Estate, Insurance).
5. **Custom Solutions** ($297+ consultation): Tailored automation for unique enterprise needs.

## 🛠️ TECH STACK (2026)
- **Frontend**: Next.js (Vercel)
- **Database**: Firestore (Primary Source of Truth)
- **Automation**: n8n (Community Edition v1.122.5) on RackNerd VPS (`172.245.56.50:5678`)
- **Knowledge Base**: LightRAG (GraphRAG) + Google Gemini File Search Fallback
- **Integrations**: Firebase/Firestore (Infrastructure metadata & Product tracking), Stripe (Payments)

## 📊 WORKFLOW ECOSYSTEM
As of Dec 2025, there are **126 mapped workflows** across several categories:
- **WhatsApp Agents** (18): Including `Rensto Support Agent`, `Tax4Us Agent`, and `Liza AI (Kitchen Design)`.
- **Lead Generation** (15): Using Apollo, LinkedIn, and Google Maps scraping.
- **Content/Marketing** (16): Including `Celebrity Selfie Video Generator` and `Meta Ad Library Analyzer`.
- **Voice AI** (3): Integrated with ElevenLabs and specialized consultation bots.
- **Internal Ops** (25): Managing server health, payments, and data sync.

## 🎯 2026 ROADMAP SUMMARY
- **Focus**: Measurement Systems (Stripe -> QuickBooks -> Airtable sync) and Customer Lifecycle Tracking.
- **Goal**: Realign 2025 goals to current reality and achieve scale beyond North America.
- **Active Products**: "Lead Machine", "Sora Video Generator", "WhatsApp RAG Agents".

## 🤖 KNOWLEDGE BASE GUIDELINES
- **Primary Source**: Query LightRAG at `http://172.245.56.50:8020/query`.
- **Fallback**: Google Gemini File Search.
- **Safety**: Do not perform KB search if image analysis is already provided in the prompt.
- **Translation**: Supports Hebrew to English normalization for core business questions.
