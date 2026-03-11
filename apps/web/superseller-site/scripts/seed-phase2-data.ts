/**
 * Phase 2 Seed Script — Admin Command Center
 * Seeds: AuditTemplates (SuperSeller + Rensto), Projects (all businesses), internal projects
 * Run: cd apps/web/superseller-site && npx tsx scripts/seed-phase2-data.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── SuperSeller New Business Audit (10 sections, 108 questions) ───
const SUPERSELLER_AUDIT = {
    name: 'SuperSeller New Business Audit',
    description: 'Comprehensive 10-section audit for onboarding new business clients. Covers fundamentals, org structure, systems, costs, data flow, CX, security, AI opportunities, quick wins, and deliverables.',
    version: '1.0',
    sections: [
        {
            title: 'Business Fundamentals', order: 1,
            items: [
                { question: 'What does the business do? (elevator pitch in their words)', order: 1 },
                { question: 'What are the primary revenue streams? Which is largest?', order: 2 },
                { question: 'Who is the ideal customer? How do they typically find this business?', order: 3 },
                { question: 'What is the average deal size / transaction value?', order: 4 },
                { question: 'What is the sales cycle length? (inquiry → closed deal)', order: 5 },
                { question: 'What is the monthly revenue? Monthly expenses? Margins?', order: 6 },
                { question: 'Are there seasonal peaks or slow periods?', order: 7 },
                { question: 'What does the owner consider their biggest bottleneck right now?', order: 8 },
                { question: 'What has the owner already tried to fix or automate that failed?', order: 9 },
                { question: 'What does success look like to the owner in 30 / 60 / 90 days?', order: 10 },
                { question: 'Are there any untouchable people, systems, or processes? (sacred cows)', order: 11 },
                { question: 'What is the budget allocated for AI/automation improvements?', order: 12 },
            ],
        },
        {
            title: 'Org Structure & People', order: 2,
            items: [
                { question: 'Who is the business owner and what is their day-to-day involvement?', order: 1 },
                { question: 'Get a full org chart — who reports to whom?', order: 2 },
                { question: 'Who handles leads / sales inquiries? What is their process?', order: 3 },
                { question: 'Who manages scheduling and dispatch?', order: 4 },
                { question: 'Who handles billing, invoicing, and collections?', order: 5 },
                { question: 'Who manages social media and marketing?', order: 6 },
                { question: "Who is the 'person who knows everything'? What happens if they leave?", order: 7 },
                { question: 'Are there contractors, VAs, or part-time staff? What do they handle?', order: 8 },
                { question: 'Who has authority to approve changes to systems and processes?', order: 9 },
                { question: 'What is team tech literacy? (scale: paper-based → cloud-native)', order: 10 },
                { question: 'Has anyone on the team used AI tools before? What was their experience?', order: 11 },
                { question: 'What communication tools does the team use internally? (text, Slack, email, WhatsApp)', order: 12 },
            ],
        },
        {
            title: 'Full Systems Inventory', order: 3,
            items: [
                { question: 'CRM — what system? (HubSpot, Jobber, ServiceTitan, spreadsheet, nothing?)', order: 1 },
                { question: 'Website — platform, hosting provider, domain registrar, who has access?', order: 2 },
                { question: 'Phone system — landline, VoIP, mobile? Call tracking in place?', order: 3 },
                { question: 'Email — provider, professional domain or Gmail/Yahoo?', order: 4 },
                { question: 'Scheduling/booking — Calendly, Acuity, CRM-built-in, manual?', order: 5 },
                { question: 'Payment processing — Stripe, Square, PayPal, invoicing software?', order: 6 },
                { question: 'Accounting — QuickBooks, FreshBooks, spreadsheet, accountant-managed?', order: 7 },
                { question: 'Social media — which platforms active? Who posts? What tools?', order: 8 },
                { question: 'Review management — any tool in place? Google, Yelp, Facebook reviews?', order: 9 },
                { question: 'Project management — Monday, Trello, Asana, nothing?', order: 10 },
                { question: 'Customer communication — email only? SMS? WhatsApp? Automated?', order: 11 },
                { question: 'File storage — Google Drive, Dropbox, local hard drives?', order: 12 },
                { question: 'Marketing/email campaigns — Mailchimp, Constant Contact, CRM-built-in?', order: 13 },
                { question: 'Advertising — Google Ads, Facebook Ads, LSA? Who manages?', order: 14 },
                { question: 'Industry-specific tools — field service, quoting, estimating, dispatch?', order: 15 },
                { question: 'Any existing automations or integrations? (Zapier, Make, n8n, custom)', order: 16 },
                { question: 'Any AI tools already in use? (ChatGPT, chatbots, AI phone answering?)', order: 17 },
            ],
        },
        {
            title: 'Cost & Contract Audit', order: 4,
            items: [
                { question: 'List every monthly software subscription with cost', order: 1 },
                { question: 'List every annual subscription or contract with renewal dates', order: 2 },
                { question: 'Identify tools with overlapping functionality', order: 3 },
                { question: 'Identify tools being paid for but not actively used', order: 4 },
                { question: 'Are there contracts with lock-in periods or cancellation penalties?', order: 5 },
                { question: 'What is the total monthly tech stack cost?', order: 6 },
                { question: 'Are there cheaper or AI-powered alternatives for any current tool?', order: 7 },
                { question: 'What does the business spend monthly on advertising?', order: 8 },
                { question: 'What does the business spend on outsourced marketing / agencies?', order: 9 },
                { question: 'Are there referral fees, lead gen services, or directory listings being paid?', order: 10 },
            ],
        },
        {
            title: 'Data Flow & Process Mapping', order: 5,
            items: [
                { question: 'Walk the full lead journey: where do leads come in? (forms, calls, walk-ins, referrals, ads)', order: 1 },
                { question: 'What happens immediately when a new lead arrives? Who gets notified? How fast?', order: 2 },
                { question: 'How does the lead get into the CRM? Automatically or manual entry?', order: 3 },
                { question: 'What is the follow-up process? Who does it? How many touches?', order: 4 },
                { question: 'How is a quote or estimate generated? How long does it take?', order: 5 },
                { question: 'How does a lead convert to a booked job or customer?', order: 6 },
                { question: 'How is the job/service scheduled and dispatched?', order: 7 },
                { question: 'How does the customer receive confirmation and reminders?', order: 8 },
                { question: 'How does the job status get updated during service delivery?', order: 9 },
                { question: 'How and when does invoicing happen?', order: 10 },
                { question: 'How are payments collected? What is the average days-to-pay?', order: 11 },
                { question: 'Is there a post-service follow-up? Review request? Feedback survey?', order: 12 },
                { question: 'How are repeat customers or referrals tracked and nurtured?', order: 13 },
                { question: 'Where are the biggest manual bottlenecks in this entire flow?', order: 14 },
                { question: 'Where does data fall through the cracks between systems?', order: 15 },
                { question: 'What reports does the owner look at? How are they generated?', order: 16 },
            ],
        },
        {
            title: 'Customer Experience Audit', order: 6,
            items: [
                { question: 'Google the business — what shows up? Reviews, listings, competitors?', order: 1 },
                { question: 'Visit the website on mobile — does it load fast? Is the CTA clear?', order: 2 },
                { question: 'Fill out the contact form — what happens? How fast is the response?', order: 3 },
                { question: 'Call the business number — who answers? What is the experience?', order: 4 },
                { question: 'Send a message via social media — does anyone respond? How fast?', order: 5 },
                { question: 'Check Google Business Profile — is it complete, accurate, optimized?', order: 6 },
                { question: 'Read the last 20 reviews — what patterns emerge? (good and bad)', order: 7 },
                { question: "Check competitors — what are they doing that this business isn't?", order: 8 },
                { question: 'What is the booking/scheduling experience like for a customer?', order: 9 },
                { question: 'What does the customer receive between booking and service delivery?', order: 10 },
                { question: 'How does the customer experience the actual service?', order: 11 },
                { question: 'What happens after the service? (follow-up, review request, next steps)', order: 12 },
            ],
        },
        {
            title: 'Security & Access Audit', order: 7,
            items: [
                { question: 'Collect admin credentials for every system (use a password manager)', order: 1 },
                { question: 'Are there ex-employees or old contractors with active access?', order: 2 },
                { question: 'Is 2FA enabled on critical accounts? (email, banking, CRM, hosting)', order: 3 },
                { question: 'Where are passwords currently stored? (sticky notes = red flag)', order: 4 },
                { question: 'Who has access to the bank accounts and payment processors?', order: 5 },
                { question: 'Who owns the domain? Website hosting? Google Business Profile?', order: 6 },
                { question: "Are there API keys or integrations using someone's personal account?", order: 7 },
                { question: 'Is customer data backed up? Where? How often?', order: 8 },
                { question: 'Any compliance requirements? (HIPAA, PCI, state licensing, etc.)', order: 9 },
                { question: 'Is there a business email or is everything going through personal Gmail?', order: 10 },
            ],
        },
        {
            title: 'AI Automation Opportunity Map', order: 8,
            items: [
                { question: 'Lead response — can an AI agent handle instant replies via SMS/WhatsApp/web chat?', order: 1 },
                { question: 'Phone answering — is there call volume to justify an AI voice agent?', order: 2 },
                { question: 'Appointment scheduling — can this be fully automated end-to-end?', order: 3 },
                { question: 'Follow-up sequences — can AI handle lead nurture drip campaigns?', order: 4 },
                { question: 'Review generation — can AI trigger and manage post-service review requests?', order: 5 },
                { question: 'Social media content — can AI generate and schedule posts from job photos/updates?', order: 6 },
                { question: 'Video production — can AI create service showcase / testimonial / promo videos?', order: 7 },
                { question: 'Quoting/estimating — can any part of the quoting process be AI-assisted?', order: 8 },
                { question: 'Customer communication — can AI handle routine questions, status updates, reminders?', order: 9 },
                { question: 'Data entry — can AI eliminate manual data transfer between systems?', order: 10 },
                { question: "Reporting — can AI auto-generate the owner's key reports and dashboards?", order: 11 },
                { question: 'Reputation monitoring — can AI alert and draft responses to new reviews?', order: 12 },
                { question: 'Competitor monitoring — can AI track competitor pricing, reviews, and activity?', order: 13 },
            ],
        },
        {
            title: 'Quick Wins vs. Long-Term Projects', order: 9,
            items: [
                { question: 'List 3–5 quick wins (high impact, low effort, deliverable in week 1–2)', order: 1 },
                { question: 'List 3–5 medium-term improvements (month 1–2, moderate effort)', order: 2 },
                { question: 'List any system migrations or major overhauls needed (month 2–6)', order: 3 },
                { question: "Identify any 'do nothing' items — things that are fine as-is", order: 4 },
                { question: 'Create a recommended AI crew member package with pricing', order: 5 },
                { question: 'Draft a 30-60-90 day roadmap for the client', order: 6 },
                { question: 'Estimate monthly credit usage for proposed AI solutions', order: 7 },
                { question: 'Identify upsell opportunities for additional AI crew members over time', order: 8 },
            ],
        },
        {
            title: 'Documentation Deliverables', order: 10,
            items: [
                { question: 'Master systems inventory document (tool, login, cost, owner, status)', order: 1 },
                { question: 'Process flow maps for lead-to-customer journey', order: 2 },
                { question: 'Org chart with responsibilities and system access', order: 3 },
                { question: 'Vendor and contract summary with renewal dates', order: 4 },
                { question: 'AI automation implementation plan with timeline', order: 5 },
                { question: 'SOPs for each AI crew member / automation deployed', order: 6 },
                { question: 'Client-facing dashboard or reporting setup', order: 7 },
                { question: 'Handoff documentation if the engagement ends', order: 8 },
            ],
        },
    ],
};

// ─── Rensto Operations Playbook (11 sections, 135 questions) ───
const RENSTO_PLAYBOOK = {
    name: 'Rensto Operations Playbook',
    description: 'Comprehensive 11-section operations playbook for the Rensto contractor directory business. Covers revenue model, tech stack, supply/demand sides, city launches, operations, security, competition, automation, quick wins, and deliverables.',
    version: '1.0',
    sections: [
        {
            title: 'Directory Business Model & Revenue', order: 1,
            items: [
                { question: 'What is the current revenue model? (free listings + premium, pay-per-lead, subscriptions, ads?)', order: 1 },
                { question: 'What are the pricing tiers for contractors? What does each tier include?', order: 2 },
                { question: 'How many paying contractors vs. free listings currently?', order: 3 },
                { question: 'What is the average revenue per paying contractor per month?', order: 4 },
                { question: 'What is the contractor churn rate? Why do they cancel?', order: 5 },
                { question: 'How many unique monthly visitors does the directory get?', order: 6 },
                { question: 'What percentage of traffic converts to a lead or inquiry?', order: 7 },
                { question: 'What is the cost of acquiring a new contractor listing? A new paying contractor?', order: 8 },
                { question: 'What is the current city expansion strategy? Which cities are live? Which are next?', order: 9 },
                { question: 'What is the monthly burn rate and runway?', order: 10 },
                { question: 'Are there additional revenue streams? (featured listings, banner ads, sponsored content?)', order: 11 },
                { question: 'What is the competitive landscape in each city? (Angi, Thumbtack, Houzz, Yelp, local directories)', order: 12 },
            ],
        },
        {
            title: 'Platform & Tech Stack Inventory', order: 2,
            items: [
                { question: 'Website platform — what CMS or framework? (WordPress, custom, headless?)', order: 1 },
                { question: 'Hosting — provider, plan, cost, performance? CDN in place?', order: 2 },
                { question: 'Domain registrar — who controls rensto.com? Any city-specific subdomains/domains?', order: 3 },
                { question: 'Database — what stores contractor listings, reviews, categories?', order: 4 },
                { question: 'Search functionality — how do users search? Built-in, Algolia, ElasticSearch, custom?', order: 5 },
                { question: 'User accounts — can contractors log in and manage their listings?', order: 6 },
                { question: 'Payment/billing — how are premium listings billed? Stripe, PayPal, manual invoicing?', order: 7 },
                { question: 'Email system — transactional (SendGrid, SES?) and marketing (Mailchimp, etc.?)', order: 8 },
                { question: 'CRM — how are contractor relationships tracked? (HubSpot, Airtable, spreadsheet?)', order: 9 },
                { question: 'Analytics — Google Analytics, Search Console, Hotjar, Mixpanel? What is tracked?', order: 10 },
                { question: 'SEO tools — Ahrefs, SEMrush, Moz? What is the current SEO strategy?', order: 11 },
                { question: 'Automation — any n8n workflows, Zapier, or custom integrations running?', order: 12 },
                { question: 'Social media — accounts, platforms, posting tools, frequency?', order: 13 },
                { question: 'Ad accounts — Google Ads, Facebook Ads? Who manages? What budget?', order: 14 },
                { question: 'Internal communication — Slack, email, project management tool?', order: 15 },
                { question: 'Contractor outreach tools — email sequences, cold calling tools, LinkedIn automation?', order: 16 },
                { question: 'API integrations — pulling contractor data from anywhere? (BBB, state licensing boards?)', order: 17 },
                { question: 'Review system — native reviews, pulling from Google/Yelp, or third-party widget?', order: 18 },
            ],
        },
        {
            title: 'Contractor Supply Side (Listings)', order: 3,
            items: [
                { question: 'How many total contractor listings across all cities?', order: 1 },
                { question: 'Breakdown by city — which cities have good coverage vs. gaps?', order: 2 },
                { question: 'Breakdown by trade category — which trades are well-represented vs. thin?', order: 3 },
                { question: 'How are new contractors added? (self-signup, manual scraping, outreach, partnerships?)', order: 4 },
                { question: 'What is the listing creation process? How complete is the average profile?', order: 5 },
                { question: 'Is there a verification process for contractors? (license check, insurance, reviews?)', order: 6 },
                { question: 'What information is captured per listing? (name, phone, email, license, photos, services, areas served?)', order: 7 },
                { question: 'How are duplicate listings handled?', order: 8 },
                { question: 'How are inactive or out-of-business contractors identified and removed?', order: 9 },
                { question: 'What is the contractor onboarding experience like? Easy self-service or manual?', order: 10 },
                { question: 'What is the conversion rate from free listing to paid upgrade?', order: 11 },
                { question: 'What is the current outreach process for recruiting new contractors?', order: 12 },
                { question: 'Are there partnerships with trade associations, supply houses, or licensing boards?', order: 13 },
                { question: 'What data can be scraped or imported to bootstrap a new city launch?', order: 14 },
            ],
        },
        {
            title: 'Homeowner / Search Demand Side', order: 4,
            items: [
                { question: 'What are the primary traffic sources? (organic, paid, direct, referral, social?)', order: 1 },
                { question: 'Monthly organic traffic — overall and by city?', order: 2 },
                { question: 'What are the top-performing pages and keywords?', order: 3 },
                { question: 'What is the domain authority? Backlink profile health?', order: 4 },
                { question: 'Is there a city-specific SEO strategy? (local landing pages, city + trade keyword targeting?)', order: 5 },
                { question: 'What is the Google Business Profile strategy for the directory itself?', order: 6 },
                { question: 'What paid acquisition is running? Cost per click? Cost per lead?', order: 7 },
                { question: 'How does a user submit an inquiry or contact a contractor?', order: 8 },
                { question: 'Is there a lead form, click-to-call, or direct contact info shown?', order: 9 },
                { question: 'What is the conversion rate from visitor to inquiry/lead?', order: 10 },
                { question: 'How are leads distributed to contractors? (all leads to all, matched, bidding?)', order: 11 },
                { question: 'Is there a content strategy? (blog, city guides, how-to articles, cost guides?)', order: 12 },
                { question: 'What is the social media strategy for driving homeowner traffic?', order: 13 },
                { question: 'Are there any partnerships driving referral traffic? (real estate agents, lenders?)', order: 14 },
                { question: 'Mobile experience — responsive design, page speed, mobile conversion rate?', order: 15 },
            ],
        },
        {
            title: 'New City Launch Playbook', order: 5,
            items: [
                { question: 'City selection criteria — population, construction activity, competition level, demand signals?', order: 1 },
                { question: 'Market research — how many active contractors in target city? Which trades are in demand?', order: 2 },
                { question: 'Create city-specific landing pages targeting [city] + [trade] keywords', order: 3 },
                { question: 'Build initial contractor database — scrape licensing boards, Google Maps, BBB, Yelp', order: 4 },
                { question: 'Seed the directory with at least [X] verified listings before going live', order: 5 },
                { question: 'Local SEO setup — city-specific schema markup, Google Business Profiles, local citations', order: 6 },
                { question: 'Outreach campaign — email/call/LinkedIn sequences to local contractors', order: 7 },
                { question: 'Partnership outreach — local trade associations, supply houses, chambers of commerce', order: 8 },
                { question: 'Content creation — city-specific guides (cost of renovation in [city], top contractors in [city])', order: 9 },
                { question: 'Paid launch campaign — Google Ads for high-intent [city] + [trade] queries', order: 10 },
                { question: 'Social media launch — Facebook groups, Nextdoor, local community platforms', order: 11 },
                { question: 'Set success metrics — target listing count, traffic, leads, and paid conversions by month 3', order: 12 },
                { question: 'Build local presence — attend trade shows, sponsor events, create referral programs', order: 13 },
                { question: 'Monitor and adjust — weekly review of listings growth, traffic, and lead volume per city', order: 14 },
            ],
        },
        {
            title: 'Data Flow & Operations', order: 6,
            items: [
                { question: 'When a contractor signs up, what happens? (auto-published, review queue, manual approval?)', order: 1 },
                { question: 'How does listing data get into the database? (form submission, API, manual entry?)', order: 2 },
                { question: 'How are categories and service areas assigned to listings?', order: 3 },
                { question: 'When a homeowner submits an inquiry, how is it routed to the contractor?', order: 4 },
                { question: 'How fast does the contractor receive the lead? (instant, batched, manual?)', order: 5 },
                { question: 'Is there lead tracking — can you see if the contractor responded to the lead?', order: 6 },
                { question: 'How is contractor performance tracked? (response rate, reviews, lead conversion?)', order: 7 },
                { question: 'How are payments processed for premium listings? Is billing automated?', order: 8 },
                { question: 'What reports exist? Revenue by city, traffic by city, listing growth, churn?', order: 9 },
                { question: 'How is the content pipeline managed? (who writes, who publishes, what schedule?)', order: 10 },
                { question: 'How are reviews collected, moderated, and published?', order: 11 },
                { question: 'What manual processes exist that should be automated?', order: 12 },
                { question: 'What data exports or imports happen regularly?', order: 13 },
                { question: 'Are there any scheduled jobs, cron tasks, or automated workflows running?', order: 14 },
            ],
        },
        {
            title: 'Security & Access Audit', order: 7,
            items: [
                { question: 'Collect admin credentials for all systems (hosting, CMS, database, analytics, ad accounts)', order: 1 },
                { question: 'Who has admin access to the website backend?', order: 2 },
                { question: 'Are there ex-contractors or old team members with active accounts?', order: 3 },
                { question: 'Is 2FA enabled on all critical accounts?', order: 4 },
                { question: 'How is contractor data protected? SSL, database encryption?', order: 5 },
                { question: 'Is there a privacy policy and terms of service? Are they current?', order: 6 },
                { question: 'How is payment data handled? PCI compliance?', order: 7 },
                { question: 'Are there regular backups of the database and website?', order: 8 },
                { question: 'Who owns the domain, hosting, and DNS records?', order: 9 },
                { question: 'Are there API keys or third-party integrations using personal accounts?', order: 10 },
            ],
        },
        {
            title: 'Competitive Analysis', order: 8,
            items: [
                { question: 'Who are the top 5 competitors nationally? (Angi, Thumbtack, Houzz, HomeAdvisor/AHLSM, Yelp)', order: 1 },
                { question: 'Who are local competitors in each target city?', order: 2 },
                { question: 'What do competitors charge contractors? What do they offer for that price?', order: 3 },
                { question: 'How do competitor listings compare in quality and completeness?', order: 4 },
                { question: 'What is the competitor SEO landscape? Who ranks for key terms in target cities?', order: 5 },
                { question: "What is Rensto's unique differentiator vs. these competitors?", order: 6 },
                { question: 'What do contractors complain about most with existing directories?', order: 7 },
                { question: "What are the gaps competitors don't serve? (niche trades, specific city coverage?)", order: 8 },
                { question: "What features do competitors have that Rensto doesn't? (instant quoting, financing, etc.?)", order: 9 },
                { question: 'What is the pricing sensitivity in this market? Race to the bottom or premium positioning?', order: 10 },
            ],
        },
        {
            title: 'Automation & Growth Opportunities', order: 9,
            items: [
                { question: 'Contractor acquisition — can AI scrape and enrich leads from licensing databases?', order: 1 },
                { question: 'Listing enrichment — can AI auto-complete profiles from web data, social, and reviews?', order: 2 },
                { question: 'Content generation — can AI create city-specific landing pages and blog content at scale?', order: 3 },
                { question: 'Review aggregation — can AI pull and consolidate reviews from Google, Yelp, BBB?', order: 4 },
                { question: 'Lead matching — can AI improve contractor-homeowner matching based on project type?', order: 5 },
                { question: 'Chatbot — can an AI chat assistant help homeowners find the right contractor?', order: 6 },
                { question: 'Outreach automation — can AI handle contractor recruitment email/SMS sequences?', order: 7 },
                { question: 'SEO automation — can AI monitor rankings and suggest content updates per city?', order: 8 },
                { question: 'Churn prediction — can AI flag at-risk paying contractors before they cancel?', order: 9 },
                { question: 'Competitor monitoring — can AI track competitor pricing, features, and new city launches?', order: 10 },
                { question: 'Reporting — can AI auto-generate city-level performance dashboards?', order: 11 },
                { question: 'Quality control — can AI flag incomplete, duplicate, or suspicious listings?', order: 12 },
            ],
        },
        {
            title: 'Quick Wins vs. Long-Term Projects', order: 10,
            items: [
                { question: 'List 3–5 quick wins for the next 1–2 weeks', order: 1 },
                { question: 'List 3–5 medium-term improvements for month 1–2', order: 2 },
                { question: 'List major platform or strategy changes for month 2–6', order: 3 },
                { question: 'Identify the next 3 cities to launch and timeline for each', order: 4 },
                { question: 'Create a monthly KPI dashboard: listings, traffic, leads, revenue by city', order: 5 },
                { question: 'Draft a 30-60-90 day operational roadmap', order: 6 },
                { question: 'Define the repeatable city launch playbook (templatize section 5)', order: 7 },
                { question: 'Estimate automation ROI — hours saved × frequency × cost', order: 8 },
            ],
        },
        {
            title: 'Documentation Deliverables', order: 11,
            items: [
                { question: 'Master tech stack inventory (tool, login, cost, owner, status)', order: 1 },
                { question: 'City-by-city status dashboard (listings, traffic, revenue, growth rate)', order: 2 },
                { question: 'Contractor acquisition SOP (outreach scripts, email sequences, follow-up cadence)', order: 3 },
                { question: 'New city launch checklist (templatized from section 5)', order: 4 },
                { question: 'Content calendar and SEO keyword map by city', order: 5 },
                { question: 'Listing quality standards and verification process documentation', order: 6 },
                { question: 'Financial model — unit economics per city (CAC, LTV, payback period)', order: 7 },
                { question: 'Competitive intelligence file — updated quarterly', order: 8 },
            ],
        },
    ],
};

// ─── Projects (Customer + Internal) ───
const PROJECTS = [
    // Customer projects
    {
        name: 'UAD (David)',
        description: 'FB Marketplace bot + lead gen. Profit split on converted leads. Active bot running on Antigravity.',
        type: 'customer',
        status: 'in_progress',
        progress: 60,
        pillar: 'FB Marketplace Bot',
        owner: 'David',
        githubRepo: 'imsuperseller/superseller',
        metadata: { revenueModel: 'profit_split', sensitivity: 'none' },
    },
    {
        name: 'MissParty (Michal)',
        description: 'Free FB Marketplace bot. Keep running, don\'t invest more.',
        type: 'customer',
        status: 'in_progress',
        progress: 40,
        pillar: 'FB Marketplace Bot',
        owner: 'Michal',
        githubRepo: 'imsuperseller/superseller',
        metadata: { revenueModel: 'free', sensitivity: 'low_priority' },
    },
    {
        name: 'Elite Pro (Saar)',
        description: '$2K/mo signed contract. NOT started yet. Delicate — wife teaches his kids.',
        type: 'customer',
        status: 'planning',
        progress: 0,
        pillar: 'Full AI Package',
        owner: 'Saar',
        metadata: { revenueModel: '$2000/mo', sensitivity: 'high_personal_relationship' },
    },
    {
        name: 'Yoram (Father)',
        description: 'Will be a paying customer if we get him life insurance leads. Personal relationship.',
        type: 'customer',
        status: 'planning',
        progress: 0,
        pillar: 'Lead Generation',
        owner: 'Yoram',
        metadata: { revenueModel: 'per_lead', sensitivity: 'family' },
    },
    {
        name: 'Yossi (Mivnim)',
        description: 'Winner Studio / avatar video. Lowest priority. War in Israel. Next milestone: Pesach.',
        type: 'customer',
        status: 'blocked',
        progress: 20,
        pillar: 'Winner Studio',
        owner: 'Yossi',
        metadata: { revenueModel: 'per_video', sensitivity: 'low_priority_war' },
    },
    // Business entities
    {
        name: 'SuperSeller AI',
        description: 'Main SaaS platform. superseller.agency, admin.superseller.agency. All products.',
        type: 'internal',
        status: 'in_progress',
        progress: 45,
        pillar: 'Platform',
        owner: 'Shai',
        githubRepo: 'imsuperseller/superseller',
        vercelProjectId: 'rensto-site',
    },
    {
        name: 'Rensto',
        description: 'Contractor directory at rensto.com. Separate business, separate codebase.',
        type: 'external',
        status: 'in_progress',
        progress: 30,
        pillar: 'Directory',
        owner: 'Shai',
        githubRepo: 'renstollc/rensto-app',
    },
    {
        name: 'Iron Dome OS',
        description: 'Shai\'s personal brand project. iron-dome-os repo on personal GitHub.',
        type: 'external',
        status: 'planning',
        progress: 10,
        pillar: 'Personal Brand',
        owner: 'Shai',
        githubRepo: '1shaifriedman-create/iron-dome-os',
    },
    // Infrastructure projects
    {
        name: 'Admin Command Center',
        description: 'Making admin.superseller.agency the single pane of glass for all projects, audits, CI, alerts.',
        type: 'infrastructure',
        status: 'in_progress',
        progress: 25,
        pillar: 'Admin Portal',
        owner: 'Shai',
        githubRepo: 'imsuperseller/superseller',
    },
    {
        name: 'CI Pipeline',
        description: 'Automated CI — every push runs tests, results land on admin.',
        type: 'infrastructure',
        status: 'planning',
        progress: 0,
        pillar: 'DevOps',
        owner: 'Shai',
        githubRepo: 'imsuperseller/superseller',
    },
    {
        name: 'Unified Alert Engine',
        description: 'Merge WhatsApp + email + GitHub alerting into one system with project-linked history.',
        type: 'infrastructure',
        status: 'planning',
        progress: 0,
        pillar: 'Monitoring',
        owner: 'Shai',
    },
];

async function seedTemplate(data: typeof SUPERSELLER_AUDIT) {
    // Check if template already exists
    const existing = await prisma.auditTemplate.findFirst({ where: { name: data.name } });
    if (existing) {
        console.log(`  Template "${data.name}" already exists (id: ${existing.id}), skipping.`);
        return existing;
    }

    const template = await prisma.auditTemplate.create({
        data: {
            name: data.name,
            description: data.description,
            version: data.version,
            sections: {
                create: data.sections.map(section => ({
                    title: section.title,
                    order: section.order,
                    items: {
                        create: section.items.map(item => ({
                            question: item.question,
                            hint: null,
                            order: item.order,
                        })),
                    },
                })),
            },
        },
    });

    const totalItems = data.sections.reduce((sum, s) => sum + s.items.length, 0);
    console.log(`  Created template "${data.name}" (id: ${template.id}) — ${data.sections.length} sections, ${totalItems} items`);
    return template;
}

async function seedProjects() {
    let created = 0;
    let skipped = 0;

    for (const proj of PROJECTS) {
        const existing = await prisma.project.findFirst({ where: { name: proj.name } });
        if (existing) {
            console.log(`  Project "${proj.name}" already exists (id: ${existing.id}), skipping.`);
            skipped++;
            continue;
        }

        const project = await prisma.project.create({ data: proj as any });
        console.log(`  Created project "${proj.name}" (id: ${project.id}) — ${proj.type}/${proj.status}`);
        created++;
    }

    return { created, skipped };
}

async function createAuditInstances(templateName: string, projectNames: string[]) {
    const template = await prisma.auditTemplate.findFirst({ where: { name: templateName } });
    if (!template) {
        console.log(`  Template "${templateName}" not found, skipping instances.`);
        return;
    }

    for (const projName of projectNames) {
        const project = await prisma.project.findFirst({ where: { name: projName } });
        if (!project) continue;

        const existing = await prisma.auditInstance.findFirst({
            where: { templateId: template.id, projectId: project.id },
        });
        if (existing) {
            console.log(`  Audit instance for "${projName}" + "${templateName}" already exists, skipping.`);
            continue;
        }

        const instance = await prisma.auditInstance.create({
            data: {
                templateId: template.id,
                projectId: project.id,
                label: `${projName} — ${templateName}`,
            },
        });
        console.log(`  Created audit instance (id: ${instance.id}) for "${projName}"`);
    }
}

async function main() {
    console.log('=== Phase 2: Seeding Admin Command Center Data ===\n');

    // 1. Seed audit templates
    console.log('1. Seeding SuperSeller New Business Audit template...');
    await seedTemplate(SUPERSELLER_AUDIT);

    console.log('\n2. Seeding Rensto Operations Playbook template...');
    await seedTemplate(RENSTO_PLAYBOOK);

    // 2. Seed projects
    console.log('\n3. Seeding projects (customer + internal + infrastructure)...');
    const { created, skipped } = await seedProjects();
    console.log(`   Done: ${created} created, ${skipped} skipped (already exist)`);

    // 3. Create audit instances linking templates to customer projects
    console.log('\n4. Creating audit instances for customer projects...');
    const customerProjects = ['UAD (David)', 'MissParty (Michal)', 'Elite Pro (Saar)', 'Yoram (Father)', 'Yossi (Mivnim)'];
    await createAuditInstances('SuperSeller New Business Audit', customerProjects);

    // Rensto gets its own playbook instance
    console.log('\n5. Creating Rensto playbook instance...');
    await createAuditInstances('Rensto Operations Playbook', ['Rensto']);

    console.log('\n=== Phase 2 Seeding Complete ===');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
