# SuperSeller AI — Full Business Audit Questions

> **Purpose**: Every question I have about every system. Answer these → I integrate answers into all docs and fix everything.
> **Created**: March 8, 2026
> **Instructions for Shai**: Answer every section. Mark "N/A" if truly not applicable. Don't skip anything.
> After your answers, I will: (1) update all docs, (2) identify what's actually broken vs. assumed-working, (3) build a prioritized fix list.

---

## SECTION 1: CUSTOMERS — WHAT'S ACTUALLY REAL

### 1.1 Elite Pro Remodeling

1. Has Saar verbally committed to $2,000/mo? Or is it still "in discussion"?
2. Has he seen the V12 demo video? What was his reaction?
3. Do you have a date when you expect him to pay / sign?
4. Does he know there's a WhatsApp AI agent in his group? Has he used it or seen it respond?
5. Does he have a Facebook Developer App already (for IG API access)? Or does he need to create one?
6. What is his actual Instagram account ID (not SuperSeller's — his company's)?
7. Does Mor Dayan actually manage the WhatsApp group? Or is she just a contact?
8. Has anyone tested calling (800) 476-7608? Is that a real line that reaches them?
9. What is Saar's WhatsApp number? What is Mor's WhatsApp number?
10. The eSignatures contract — is the template text correct? Have you read it? Does it reflect the $2,000/mo deal accurately?
11. Are you expecting to do ONLY Instagram, or also Facebook? The current build only targets IG.
12. The Python agents create content and store it in Aitable. Have you looked at what's being generated? Is it good quality?
13. Are the 63 scraped competitor ads still relevant/current? When were they scraped?

### 1.2 UAD (David Szender — Garage Doors)

14. How do you get your cut of revenue? Do you have a formal agreement or is it a verbal deal?
15. Where do voice call leads from Telnyx actually end up? Is Workiz CRM set up and active?
16. Does David log into Workiz and see leads? Is he satisfied with lead quality?
17. Has David ever complained about the bot getting accounts banned?
18. Is the GoLogin account paid up? When does it renew?
19. Do you have David's personal WhatsApp number? Do you communicate with him regularly?
20. The revenue split — what percentage do you get? Is this documented anywhere?

### 1.3 Miss Party (Michal Kacher Szender)

21. Does Michal know/appreciate the service? Is she actively selling from the leads?
22. Where do her Telnyx voice call leads go? Email? Who monitors it?
23. Has Michal mentioned wanting to pay? Or is it indefinitely free?
24. Is Michal's GoLogin profile separate from David's (her husband)?

### 1.4 Yoram Friedman (Insurance)

25. Does Yoram know the site is live at yoramfriedman.co.il? Has he seen it?
26. Where do form submissions from the site go right now? Is anyone receiving them?
27. Is "Lihi pays when Yoram recommends" a real arrangement? Who is Lihi?
28. Has the site gotten any actual visitors or leads yet?
29. Is Yoram's Apify account (0 actors, 0 tasks) something you want to set up? For what — competitor scraping, lead prospecting?
30. Does yoramfriedman.co.il actually resolve correctly? (domain → Vercel → site)

### 1.5 Wonder.care (Ortal Flanary)

31. Have you followed up on the $900-$6,450 proposal (sent December 18)? It's been 3 months.
32. Is their n8n pipeline (on VPS 192.227.249.73) still running? Does anyone monitor it?
33. Is the Google Sheets → Monday.com pipeline actually being used by Wonder.care?
34. Is there a service agreement for the ongoing n8n maintenance?

### 1.6 AC&C HVAC (Neitha Parkey)

35. Has Neitha seen the website? Was she happy with it?
36. Does she know it's behind a password gate?
37. Has she paid for the website delivery? Or is this pro-bono?
38. What's the plan — take down the password and go live? Or is she not interested anymore?
39. Who is Neitha's contact (phone, WhatsApp, email)?

### 1.7 Kedem Developments (Daniel Arbel)

40. Did Daniel actually use/share the 6847 Lakeshore Drive TourReel video?
41. Was he happy with it? Did it generate any interest in ongoing service?
42. Does he have other listings right now that could get TourReel videos?
43. Is the TourReel web app built for Kedem (`kedem developments/tourreel-app/`) still relevant? (Audited as "broken shell")

### 1.8 Yossi (Mivnim — Winner Studio)

44. Is the "war in Israel / no parties" still the reason he's not using Winner Studio?
45. Is Pesach 2026 (April) a realistic window to reactivate?
46. Has he paid anything? Or is he on a free trial basis?
47. Does he log into studio.superseller.agency? Can he actually create a video if he tried right now?

### 1.9 Ortal Pilates (Saar's wife)

48. Has Ortal seen the placeholder site? Does she want a real site?
49. Is this something she'd pay for, or is it purely a relationship gesture with Saar?

---

## SECTION 2: PRODUCTS — WHAT'S ACTUALLY WORKING VS. ASSUMED-WORKING

### 2.1 TourReel

50. If a new customer goes to superseller.agency/video/create RIGHT NOW, what exactly happens? Walk me through it step by step.
51. Can they actually pay with PayPal and get credits? Or is billing not wired?
52. When the video finishes generating, how does the customer get it? Email? Dashboard? Download link? WhatsApp?
53. Has ANY external customer (not Shai, not Kedem) successfully used TourReel end-to-end with their own Zillow listing?
54. The Remotion path (photo composition) — has it ever generated a complete video for a real listing?
55. When a job fails, does anything notify Shai? Or does it just fail silently?
56. Are there any customers with active TourReel subscriptions (Starter/Pro/Team) in the PayPal system?

### 2.2 FB Marketplace Bot (UAD + Miss Party)

57. When posting fails on a cycle (exit non-0), does anyone get notified?
58. Are posts actually reaching customers/buyers? Or are they getting into marketplace but getting no traction?
59. Has a GoLogin profile ever gotten banned? If yes, how was it handled?
60. The image variation pool — is it actually generating varied images per listing, or same image repeated?
61. The "cookie monitor" PM2 process — what does it actually do? Is it working?
62. Do you ever manually check that posts look good (correct city, correct phone overlay, correct price)?

### 2.3 ClaudeClaw (WhatsApp AI)

63. Personal mode: have YOU sent a message to 14695885133 from your own WhatsApp and gotten a Claude response?
64. Business mode: has the `superseller-whatsapp` number (12144362102) ever received a message and responded via Claude?
65. The health monitor — does it actually send WhatsApp alerts to you when something goes down? Which phone does it alert?
66. The approval system (`/approvals`) — has it ever been used in production for a real approval?
67. The RAG (`/rag [query]`) — if you type `/rag video pipeline`, does it return relevant results?
68. The scheduler runs 5 jobs. Are they actually running? Do they succeed or fail silently?

### 2.4 SocialHub / Buzz

69. The "7 posts live" — on which platform exactly? Facebook Page only? IG? What does "live" mean?
70. Can you go to SuperSeller AI's Facebook page (294290977372290) and see actual posts created through the system?
71. The WhatsApp approval workflow for SocialHub — is it the same WhatsApp number as ClaudeClaw? How does it work in practice?
72. Has any customer ever used SocialHub to publish content for their own page? Or only for SuperSeller's page?
73. When a post is published via SocialHub, does anyone get notified? What happens in Aitable?

### 2.5 Winner Studio

74. If Yossi (or any user) logs into studio.superseller.agency right now, what happens? Does the login work?
75. The video generation pipeline — if triggered today, does it reach Kie.ai `avatar-pro` correctly?
76. When a Winner Studio video is done, how is it delivered to the customer? WhatsApp? Email? Dashboard download?
77. Are there any credits/billing for Winner Studio, or is it completely unwired?

### 2.6 FrontDesk Voice AI

78. If someone calls +14699299314 RIGHT NOW, what happens? Who answers? What does the AI say?
79. Does the AI successfully handle a typical "I need HVAC service" type inquiry?
80. Where do call summaries/transcripts go after a call? Does Shai see them anywhere?
81. The webhook migration from n8n to worker — is this on the backlog or is the n8n webhook actively handling calls?
82. Has any real customer used FrontDesk for their business?

### 2.7 Lead Landing Pages

83. If someone submits a form on yoramfriedman.co.il right now, where does the data go? Who gets notified?
84. Is there a generic /lp/[slug] page live for any customer other than Yoram?
85. When a lead comes in from a landing page, does Shai get a WhatsApp notification? An email? Nothing?

### 2.8 AgentForge

86. Is there ANY code started for AgentForge, or is it truly just a spec in PRODUCT_BIBLE?
87. Is this something you actually want to build, or is it lower priority than the 5+ other products?

---

## SECTION 3: NOTIFICATIONS & TRIGGERS — WHAT FIRES WHEN

88. **New lead from FB Bot**: When someone messages UAD's listing, does David get notified immediately? How?
89. **New lead from Telnyx voice call**: After a call ends, how long until David/Michal sees the lead? What format?
90. **TourReel video complete**: Customer gets... what exactly? Automatic email? Manual WhatsApp from you?
91. **TourReel job failed**: Who finds out? How?
92. **PayPal subscription activated**: Customer gets what? Automatic welcome email? Manual onboarding?
93. **PayPal payment failed**: Customer gets what? Do they get locked out of credits immediately?
94. **Worker goes down (PM2 crash)**: Who gets notified? Does the health monitor alert fire?
95. **WAHA session disconnects**: Who gets notified? ClaudeClaw stops working silently?
96. **Ollama goes down**: RAG returns empty results silently — any alert?
97. **Elite Pro group message**: If someone types "@superseller what should we post today?" — does Claude respond? Within how long?
98. **Disk space > 80% on RackNerd**: Any alert? Or silent disk-full crash?
99. **n8n workflow fails (UAD/MissParty voice pipeline)**: Who sees it? How?
100. **Yoram insurance form submitted**: Yoram gets an email? WhatsApp? Does Shai get a copy?

---

## SECTION 4: INFRASTRUCTURE & HOSTING — WHAT'S WHERE

### 4.1 RackNerd VPS

101. PM2 currently shows 3 processes: `tourreel-worker`, `webhook-server`, `fb-scheduler`. Are `image-pool` and `cookie-monitor` gone? When were they removed?
102. Disk usage — what's the current state? You freed 12GB in March 5 cleanup. Is it stable?
103. Is there a backup system for the PostgreSQL database? When was the last backup?
104. The WAHA Docker container — does it auto-restart if it crashes? What's the restart policy?
105. n8n Docker container — is it still running? Do you use the n8n.superseller.agency UI regularly?
106. Is Ollama reliably running? Has it crashed and stayed down without you knowing?

### 4.2 Databases

107. Aitable — what is still on Aitable that HAS NOT been migrated to PostgreSQL?
108. Firestore — only FB Bot uses it (for posting schedule). Is there a migration plan and timeline?
109. The `ai_models` table (34 curated + 118 auto-discovered) — is the daily sync actually running and updating? When did it last run?
110. Are there any orphaned/stale tables in PostgreSQL from old systems that were retired?

### 4.3 Vercel Projects

111. How many Vercel projects are you paying for? List them: superseller-site, superseller-admin, elite-pro-landing, yoram-landing... others?
112. Are any Vercel projects over their free tier limits? Is there a monthly cost?
113. The `superseller-site` auto-deploy — when you push to main, does it successfully deploy every time?

### 4.4 MCP Servers

114. The MCP configuration has tools for Postgres, GitHub, Gmail, Google Calendar, Cloudflare, Vercel, etc. — are all of these actually connected and working?
115. The Postgres MCP failed authentication in this session. What credentials is it configured with?

---

## SECTION 5: ADMIN DASHBOARD — WHAT'S REAL

116. When you log into admin.superseller.agency today, what do you actually see?
117. **CRM tab**: Does it show real customer records? How many? Are they accurate?
118. **Treasury tab**: Does it show actual PayPal revenue? Or mock data?
119. **System Monitor tab**: Does it show real health check results for all 8 services?
120. **AI Agents tab**: Does it show ClaudeClaw status, session count, group agents?
121. **Workflows tab**: Does it show active n8n workflows? Can you trigger them?
122. **Analytics tab**: Real data or mock?
123. Has any admin tab ever shown wrong/stale data that you only discovered later?
124. Do other people (team members, VAs) have access to the admin dashboard? Who?

---

## SECTION 6: BILLING & PAYMENTS — WHAT'S REAL

125. Have any customers ACTUALLY subscribed to a plan through PayPal on superseller.agency? If yes, how many? What plans?
126. Are the PayPal plan IDs (Starter/Pro/Team) active in PayPal's live environment? Or did you create them in sandbox and forget to recreate in live?
127. Does the PayPal webhook actually fire to the worker? Has it ever been tested in production?
128. Elite Pro's $2,000/mo — when/how do you invoice them? PayPal invoice? Wire? Cash?
129. UAD revenue split — have you actually received any money from UAD? How does the money flow?
130. Are there any outstanding payments owed to you from any customer?

---

## SECTION 7: SECURITY & CREDENTIALS

131. The RackNerd password (`hW1anVAB20Bzv6l7C4`) is stored in a task output file in plaintext. Is this a concern?
132. The PostgreSQL password is in MEMORY.md in this Claude memory directory. Is this acceptable?
133. Are API keys (KIE_API_KEY, ANTHROPIC_API_KEY, PAYPAL secrets) rotated on any schedule?
134. The WAHA API key — if someone had it, could they read/send WhatsApp messages on your behalf?
135. Is two-factor authentication enabled on: Vercel, Cloudflare, PayPal, RackNerd control panel, GitHub?

---

## SECTION 8: WHAT YOU ACTUALLY WANT (DECISION QUESTIONS)

136. **ClaudeClaw pricing**: Should it be a standalone product ($X/month per group)? Or bundled with custom retainer deals like Elite Pro?
137. **Iron Dome OS**: Do you want to rebuild this? Is your personal brand a serious business priority or back-burner?
138. **TourReel test job**: Approve ~$2 spend to run a full end-to-end test?
139. **Wonder.care follow-up**: Do you want to follow up on the 3-month-old proposal? How?
140. **AC&C HVAC**: Is Neitha still a real lead or should we mark this as dormant?
141. **Rensto**: Actively building this as a second business, or maintaining as-is?
142. **AgentForge**: Real priority or parking lot?
143. **Ortal Pilates**: Free gift to Saar's wife, or potential paying customer?
144. **Winner Studio billing**: Should Yossi be charged for future videos? What's the price?
145. **FrontDesk Voice AI**: Is this a product you want to actively sell? To whom?

---

## SECTION 9: DOCUMENTATION & SYNC

146. Is the PRODUCT_STATUS.md you read daily? Or is it another doc you actually check?
147. Are there docs you actually use vs. docs that exist just to say they exist?
148. The 36 NotebookLM notebooks — do you actually query them? Or is it overhead?
149. Aitable dashboards — do you actually log into Aitable and look at data? Which dashboards?
150. Is there anything I've put in docs that is just WRONG — things you know are off but haven't corrected me on?

---

**Please answer all 150 questions. Even "I don't know" or "haven't checked" is valid — that itself is a finding.**

After you answer, I will:
1. Update every affected doc (PRODUCT_STATUS.md, BUSINESS_COVERAGE_INDEX.md, PROJECTS.md, all customer project folders)
2. Fix any contradictions found
3. Mark anything as BROKEN/UNVALIDATED that is assumed-working without proof
4. Build a prioritized fix list with estimated effort
5. Tell you exactly what is safe to launch vs. what will disappoint customers
