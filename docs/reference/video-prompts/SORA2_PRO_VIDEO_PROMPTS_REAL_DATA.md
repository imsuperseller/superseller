# 🎬 Sora2 Pro Video Prompts - REAL DATA VERSION

**Date**: October 31, 2025  
**Model**: sora-2-pro  
**Cameo**: @shai  
**Format**: All prompts based on REAL codebase data, REAL customers, REAL tools, REAL pain points

**Source Verification**: ✅ All data pulled from codebase (CLAUDE.md, case studies, customer docs, workflows)

---

## 📊 **REAL INPUT REFERENCES** (Upload These First)

**Brand Assets**:
1. `brand_palette.png` - Rensto colors: #fe3d51 (red), #bf5700 (orange), #1eaef7 (blue), #5ffbfd (cyan), #110d28 (dark bg)
2. `shai.png` - Headshot of @shai (founder/talking head videos)
3. `rensto_logo.png` - Clean logo on transparent background
4. `n8n_dashboard.png` - Actual n8n workflow interface (173.254.201.134:5678)
5. `airtable_interface.png` - Airtable dashboard showing client data
6. `wordpress_admin.png` - WordPress admin panel (tax4us.co.il style)
7. `slack_notifications.png` - Slack approval workflow interface

---

## 🏠 **HOMEPAGE VIDEOS** (Based on REAL Content Strategy)

### **Video 1: Hero Background - "1997 vs. 2025 Business Owner" (30s = 12s + 12s + 6s)**

#### **Scene 1: "1997 Way" - Manual Chaos (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png", "https://.../n8n_dashboard.png"],
  "prompt": "UGC smartphone. Natural window light. Frantic exhaustion. Location: home office desk. Time: 11pm. Palette: warm amber desk lamp, graphite, dark #110d28. Camera: medium close-up selfie 26mm. Motion: handheld, panning across laptop showing multiple browser tabs. Subject: @shai exhausted, working late. Props: laptop showing 47 browser tabs visible, calendar app, email app, CRM app, invoicing tool all open simultaneously. Action beats: 0-4s: looks at camera with tired expression 'I'm working like it's 1997. Manual everything.'. 4-8s: frantically switches between browser tabs, copy-pastes same client data from email to CRM to spreadsheet to invoice tool. 8-12s: checks clock, 11:47pm, sighs deeply, continues typing, looks defeated. Audio bed: frantic keyboard clicks, tab switching sounds, frustration sigh. On-screen text: '11pm. Still catching up from Monday.'. Upper left. Notes: authentic exhaustion. laptop screen shows generic app icons and tabs (no real brand names visible). keep hands readable. show realistic app chaos."
}
```

#### **Scene 2: "2025 Way" - Automated Control (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../n8n_dashboard.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: same desk, organized. Time: 7am. Palette: white, cyan #5ffbfd, graphite, green success indicators. Camera: screen-dominant wide. Motion: push-in 10%. Subject: n8n workflow dashboard showing automation running. Props: laptop showing n8n workflow interface with connected nodes, green success indicators. Action beats: 0-4s: dashboard shows n8n workflows running automatically - emails sorted, follow-ups scheduled, data syncing between tools. 4-8s: @shai sips coffee calmly, reviews dashboard, sees all tasks completed overnight. 8-12s: closes laptop, satisfied smile, ready to start day at 7am. Audio bed: soft automation sounds, success chimes, peaceful room tone. On-screen text: '7am. Everything automated. Your competitors didn't wait.'. Upper left. Notes: dashboard shows generic n8n workflow interface (no brand names). peaceful contrast to scene 1."
}
```

#### **Scene 3: Tagline (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png", "https://.../rensto_logo.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid dark backdrop #110d28. Palette: brand primary #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: logo pieces assemble, then tagline appears. Action beats: 0-3s: rensto logo assembles from corners. 3-6s: 'Stop working like it's 1997.' appears below logo. Audio bed: soft snap, subtle whoosh. On-screen text: 'Stop working like it's 1997.'. Center below logo. Notes: keep spacing equal. final safe area 10%."
}
```

---

### **Video 2: Service Card - Marketplace "Tool Hoarder" (15s = 8s + 7s)**

**BASED ON REAL ISSUE**: Customers juggling multiple tools that don't integrate

#### **Scene 1: Tool Chaos (8s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Frantic energy. Location: desk with laptop. Time: afternoon. Palette: warm amber, graphite, multiple screen blues. Camera: medium close-up 26mm. Motion: handheld, panning across laptop screen showing taskbar. Subject: hands frantically switching between apps. Props: laptop showing taskbar with 10+ app icons: email tool, calendar tool, CRM tool, invoicing tool, project management tool, note-taking tool all visible. Action beats: 0-3s: cursor frantically clicks between email app, calendar app, CRM app, invoicing app in taskbar. 3-6s: copy-pastes same customer info from email window to CRM window to invoice window. 6-8s: drops head in hands, overwhelmed, looks at camera 'I spend 90 minutes a day just switching between tools.'. Audio bed: frantic clicks, tab switching, copy-paste sounds, frustration breath. On-screen text: '90 minutes daily switching tools.'. Upper left. Notes: authentic tool chaos. screens show generic app icons (no real brand names). keep hands readable."
}
```

#### **Scene 2: n8n Automation Solution (7s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "7",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite. Camera: screen-dominant wide. Motion: push-in 10%. Subject: n8n workflow dashboard showing tools connected. Props: laptop showing n8n interface. Action beats: 0-3s: n8n dashboard shows all tools connected with workflow nodes - email, calendar, CRM, invoicing all linked. 3-6s: single trigger shows data flowing automatically between all tools, green success indicators. 6-7s: 'All tools connected. One workflow.' appears. Audio bed: soft clicks, automation sounds, success chimes. On-screen text: 'All tools connected. One workflow.'. Upper center. Notes: dashboard shows generic n8n workflow interface (no brand names). smooth automation flow."
}
```

---

### **Video 3: Service Card - Subscriptions "Follow-Up Failure" (15s = 8s + 7s)**

**BASED ON REAL ISSUE**: 35-50% of sales go to fastest responder (from content strategy)

#### **Scene 1: Deal Lost Timeline (8s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Timeline progression. Location: desk. Time: Monday to Friday. Palette: morning to evening lighting, graphite. Camera: medium close-up selfie 26mm. Motion: static, time progression feel. Subject: @shai at desk, expression changes daily. Props: laptop, phone, calendar visible. Action beats: 0-2s: Monday, closes laptop after great sales call, confident smile 'Nailed that call!'. 2-4s: Tuesday, opens calendar, realization 'Meant to follow up yesterday...'. 4-6s: Wednesday, still hasn't followed up, slight worry. 6-8s: Friday, sees LinkedIn notification on phone 'Your lead just accepted connection from [Competitor]', face drops, realization. Audio bed: calendar page flips, notification buzz, realization breath. On-screen text: 'Monday: Great call. Friday: Deal lost.'. Upper left. Notes: authentic emotional progression. phone screen generic. show time progression visually."
}
```

#### **Scene 2: Automated Lead Response (7s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "7",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Neutral daylight. Location: organized desk. Palette: navy, white, mint #5ffbfd. Camera: screen-dominant wide. Motion: push-in 10%. Subject: n8n automation dashboard for lead generation. Props: laptop showing automation interface. Action beats: 0-3s: new lead notification appears (from LinkedIn/Apify/Google Maps), automated sequence triggers immediately. 3-5s: 5 follow-up emails send automatically at perfect intervals, green checkmarks in n8n workflow. 5-7s: lead responds positively, workflow shows 'Deal moved to next stage'. Audio bed: soft clicks, email send whoosh, success chimes. On-screen text: 'Respond in minutes. Never lose a deal.'. Upper center. Notes: dashboard shows generic automation (no brand names). smooth sequence flow."
}
```

---

### **Video 4: Service Card - Ready Solutions "Industry-Specific Pain" (15s = 8s + 7s)**

**BASED ON REAL OFFERING**: $890/$2,990 packages for 16 industries (HVAC, Realtor, Roofer, Dentist, etc.)

#### **Scene 1: Generic Tool Problem (8s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Frustration. Location: desk. Time: afternoon. Palette: warm amber, graphite. Camera: medium close-up selfie 26mm. Motion: static. Subject: business owner (HVAC/realtor/roofer type) frustrated. Props: laptop showing generic automation tool. Action beats: 0-4s: looks at camera frustrated 'I tried generic automation. It's built for offices, not my business.'. 4-8s: shows laptop screen with generic tool that doesn't fit their industry needs, closes laptop in frustration. Audio bed: frustration sigh, keyboard close. On-screen text: 'Generic tools don't fit your industry.'. Upper left. Notes: authentic industry-specific frustration. screen generic."
}
```

#### **Scene 2: Industry-Specific Solution (7s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "7",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite. Camera: screen-dominant wide. Motion: push-in 10%. Subject: n8n dashboard showing industry-specific workflows. Props: laptop showing HVAC/realtor/roofer-specific automation. Action beats: 0-3s: dashboard shows 'HVAC Service Automation' (or Realtor/Roofer) with workflows specific to that industry. 3-5s: workflows run for that specific industry - service scheduling, customer follow-ups, invoicing. 5-7s: success metrics appear 'Built for HVAC' (or relevant industry). Audio bed: soft clicks, success chimes. On-screen text: 'Built for YOUR industry. $890-$2,990.'. Upper center. Notes: dashboard shows industry-specific workflows (no brand names). clear industry focus."
}
```

---

### **Video 5: Service Card - Custom Solutions "Shelly's Story" (15s = 8s + 7s)**

**BASED ON REAL CUSTOMER**: Shelly (Insurance), 4.5 hours daily saved on client profiling

#### **Scene 1: Shelly's Real Pain (8s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../brand_palette.png", "https://.../airtable_interface.png"],
  "prompt": "UGC smartphone. Natural window light. Exhaustion. Location: insurance office desk. Time: afternoon. Palette: warm amber, graphite, screen blue. Camera: medium close-up selfie 26mm. Motion: static, then pan to laptop. Subject: Insurance agent (Shelly-type) exhausted. Props: laptop showing client profiling forms, Airtable-like interface with multiple client records. Action beats: 0-4s: looks at camera tired 'I spend 4-5 hours every day just on client profiling. Manual data entry from multiple sources.'. 4-8s: shows laptop screen with client profiling forms, multiple tabs with client data, copy-pasting between systems. Audio bed: keyboard clicks, frustration sigh, tab switching. On-screen text: '4.5 hours daily on client profiling.'. Upper left. Notes: authentic insurance agent exhaustion. screen shows generic client profiling interface (no brand names). based on real Shelly case study."
}
```

#### **Scene 2: Custom Automation Solution (7s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "7",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../airtable_interface.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite, green success. Camera: screen-dominant wide. Motion: push-in 10%. Subject: n8n + Airtable integration showing automated client profiling. Props: laptop showing n8n workflow connected to Airtable, client data auto-populating. Action beats: 0-3s: n8n dashboard shows client profiling workflow connected to Airtable, CRM, data sources. 3-5s: new client trigger shows automated profiling - data collected, risk assessed, profile created automatically in Airtable. 5-7s: '4.5 hours saved daily. 90% faster profiling.' appears. Audio bed: soft clicks, automation sounds, success chimes. On-screen text: 'Custom built. Your workflow. $3,500-$8,000.'. Upper center. Notes: dashboard shows n8n+Airtable integration (no brand names). based on real Shelly solution."
}
```

---

### **Video 6: Pain Point Section - "Weekend Warrior" (20s = 12s + 8s)**

**BASED ON REAL PAIN**: Saturday morning "quick email check" turns into full workday

#### **Scene 1: Weekend Work (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Saturday morning. Location: home office/kitchen table. Time: Saturday 9am. Palette: morning light, warm beige, graphite. Camera: medium close-up selfie 26mm. Motion: handheld, panning between laptop and family area. Subject: @shai at laptop, family visible in background. Props: laptop, coffee cup, kid's toy visible in background. Action beats: 0-4s: opens laptop 'I don't work weekends. I just check email really quick.'. 4-8s: realizes forgot to invoice 3 clients, starts working. kid asks to go to park, responds 'Maybe later buddy'. 8-12s: continues working, outside gets dark, still at laptop, kid's toy abandoned. Audio bed: kid's voice, keyboard clicks, realization breath, time passing. On-screen text: 'Saturday 9am. Quick email check.'. Upper left. Notes: authentic family moment, emotional contrast. laptop screen generic. show time passing visually."
}
```

#### **Scene 2: Automated Freedom (8s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../shai.png", "https://.../n8n_dashboard.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Saturday morning. Location: park/outdoor. Time: Saturday 12pm. Palette: bright daylight, green grass, cyan #5ffbfd accents. Camera: medium close-up selfie 26mm. Motion: static, then pan to family. Subject: @shai relaxed, laptop closed, with family. Props: closed laptop, kid playing visible, phone showing notification. Action beats: 0-4s: checks phone, sees 'All tasks completed automatically' notification from n8n, smiles. 4-8s: closes phone, enjoys moment with family at park, laptop stays closed. Audio bed: birds, kid's laughter, peaceful tone, notification chime. On-screen text: 'Saturday 12pm. Automation handles it. You live life.'. Upper left. Notes: peaceful contrast. authentic family moment. phone screen generic."
}
```

---

## 🛍️ **MARKETPLACE PAGE VIDEOS** (Real Pricing & Products)

### **Video 1: Hero Background - "47 Browser Tabs" (30s = 12s + 12s + 6s)**

**BASED ON REAL COPY**: "You've got 47 browser tabs open. Three of them are calendar apps you forgot you had open."

#### **Scene 1: Browser Tab Chaos (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Frantic energy. Location: desk with laptop. Time: morning. Palette: warm amber, graphite, multiple screen colors. Camera: medium close-up 26mm. Motion: handheld, panning across laptop screen showing browser. Subject: hands pointing at browser tabs. Props: laptop showing browser with 47 tabs visible, multiple calendar apps, email threads, tools all open. Action beats: 0-4s: camera shows browser with 47 tabs open, voice says 'You've got 47 browser tabs. Three of them are calendar apps you forgot you had open.'. 4-8s: cursor clicks between tabs showing email threads, tools, CRM, invoicing - all separate, none connected. 8-12s: looks overwhelmed, drops head in hands 'And somewhere in that chaos is the thing you actually needed to do today.'. Audio bed: tab clicking, frustration sigh, keyboard chaos. On-screen text: '47 browser tabs. Zero organization.'. Upper left. Notes: authentic browser chaos. show realistic tab count. generic app names."
}
```

#### **Scene 2: n8n Template Solution (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite. Camera: screen-dominant wide. Motion: push-in 15%. Subject: n8n template dashboard showing 525+ templates. Props: laptop showing n8n template marketplace interface. Action beats: 0-4s: dashboard shows '525+ n8n workflow templates' - email automation, CRM sync, invoicing templates all visible. 4-8s: clicks 'Install Template', shows 10-minute installation process, template deploys. 8-12s: workflow running automatically, all tools now connected, green success indicators. Audio bed: soft clicks, installation sounds, success chimes. On-screen text: '525+ templates. 10-minute install. $29-$197.'. Upper center. Notes: dashboard shows generic n8n template interface (no brand names). smooth installation flow."
}
```

#### **Scene 3: Pricing Tagline (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid backdrop. Palette: red #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: pricing tiers animate in. Action beats: 0-3s: 'DIY Template: $29-$197' appears. 3-6s: 'Full-Service Install: $797-$3,500+' appears below. Audio bed: soft pricing tick. On-screen text: 'Stop being the robot.'. Center. Notes: bold pricing. clear value prop."
}
```

---

## 📊 **SUBSCRIPTIONS PAGE VIDEOS** (Real Pricing: $299/$599/$1,499)

### **Video 1: Hero Background - "Competitor Deal Loss" (30s = 12s + 12s + 6s)**

**BASED ON REAL STAT**: 35-50% of sales go to fastest responder

#### **Scene 1: Manual Lead Entry = Lost Deal (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Timeline progression. Location: desk. Time: Monday to Friday. Palette: morning to evening, graphite. Camera: medium close-up selfie 26mm. Motion: static, time progression. Subject: @shai at desk, expression changes. Props: laptop, phone, calendar. Action beats: 0-4s: Monday, great sales call ends, confident 'Nailed that call!', closes laptop. 4-8s: Tuesday-Friday, opens calendar daily, remembers 'Meant to follow up yesterday...', keeps procrastinating manual data entry. 8-12s: Friday, sees LinkedIn notification 'Your lead accepted connection from [Competitor]', face drops 'Deal lost.'. Audio bed: calendar flips, notification buzz, realization. On-screen text: 'While you're entering data manually...'. Upper left. Notes: authentic timeline. show competitor connection visually."
}
```

#### **Scene 2: Automated Lead Generation (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Neutral daylight. Location: organized desk. Palette: navy, white, mint #5ffbfd. Camera: screen-dominant wide. Motion: push-in 15%. Subject: n8n automation dashboard for lead generation. Props: laptop showing lead gen workflow. Action beats: 0-4s: dashboard shows '100-2,000 leads/month from LinkedIn, Google Maps, Facebook, Apify' notification. 4-8s: leads automatically verified, enriched, added to CRM via n8n workflow, green checkmarks. 8-12s: automated follow-up sequences trigger, leads receive immediate response, 'Deal won' metric appears. Audio bed: soft clicks, success chimes, data processing. On-screen text: '100-2,000 leads/month. Automated. $299-$1,499.'. Upper center. Notes: dashboard shows generic automation (no brand names). show lead sources (LinkedIn, Apify, etc.) visually."
}
```

#### **Scene 3: Real Pricing (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid backdrop. Palette: red #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: pricing tiers animate. Action beats: 0-3s: 'Starter: $299/month - 100 leads' appears. 3-6s: 'Pro: $599/month - 500 leads' and 'Enterprise: $1,499/month - 2,000+ leads' appear below. Audio bed: soft pricing tick. On-screen text: 'Respond first. Win the deal.'. Center. Notes: real pricing from codebase. clear tiers."
}
```

---

## 🎯 **READY SOLUTIONS PAGE VIDEOS** (Real Industries: HVAC, Realtor, Roofer, Dentist, etc.)

### **Video 1: Hero Background - "16 Industry Montage" (30s = 6s each × 5 industries)**

#### **Scene 1: HVAC Technician (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: HVAC service truck. Palette: service blue, white, tool orange. Camera: medium close-up 26mm. Motion: handheld. Subject: HVAC technician with tablet. Props: tablet showing service schedule, n8n automation interface. Action beats: 0-3s: technician checks tablet, sees automated service reminders from n8n workflow. 3-6s: arrives at customer location, service call pre-scheduled automatically. Audio bed: truck door, tablet beep. On-screen text: 'HVAC: Never miss a service call.'. Upper left. Notes: authentic HVAC context. tablet screen generic n8n workflow."
}
```

#### **Scene 2: Realtor (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: property showing/car. Palette: bright daylight, blue sky. Camera: medium close-up 26mm. Motion: handheld. Subject: Realtor with phone. Props: phone showing lead notification from n8n workflow. Action beats: 0-3s: lead notification appears Friday night on phone from n8n automation. 3-6s: automatic response sent immediately via n8n, follow-up sequence triggered. Audio bed: phone notification, car ambience. On-screen text: 'Realtor: Lead came in Friday. You responded first.'. Upper left. Notes: authentic real estate context. phone screen generic n8n workflow."
}
```

#### **Scene 3: Roofer (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: roof job site. Palette: blue sky, roof gray. Camera: medium close-up 26mm. Motion: handheld. Subject: Roofer with tablet. Props: tablet showing n8n automation, job completion. Action beats: 0-3s: completes storm damage job, takes final photo. 3-6s: automated invoice generates via n8n workflow, sends to customer automatically. Audio bed: construction ambience, tablet beep. On-screen text: 'Roofer: Invoices sent automatically.'. Upper left. Notes: authentic construction context. tablet screen generic n8n workflow."
}
```

#### **Scene 4: Dentist (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: dental office. Palette: clean white, medical blue. Camera: medium close-up 26mm. Motion: static. Subject: Office staff with scheduling system. Props: computer showing n8n automation for appointment reminders. Action beats: 0-3s: automated appointment reminder sent via n8n workflow. 3-6s: patient confirms, appointment book stays full automatically. Audio bed: office ambience, notification beep. On-screen text: 'Dentist: Full appointment books.'. Upper left. Notes: authentic medical context. screen generic n8n workflow."
}
```

#### **Scene 5: Pricing Tagline (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png", "https://.../rensto_logo.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid dark backdrop #110d28. Palette: brand primary #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: logo + pricing appears. Action beats: 0-3s: rensto logo appears. 3-6s: '16 industries. $890-$2,990. Built for you.' appears below. Audio bed: soft snap, whoosh. On-screen text: '16 industries. $890-$2,990. Built for you.'. Center. Notes: real pricing from codebase."
}
```

---

## 🎨 **CUSTOM SOLUTIONS PAGE VIDEOS** (Real Customers: Shelly, Tax4Us, Wonder.care)

### **Video 1: Hero Background - "Shelly's Transformation" (30s = 12s + 12s + 6s)**

**BASED ON REAL CUSTOMER**: Shelly (Insurance), Custom Solution, 4.5 hours saved daily

#### **Scene 1: Shelly's Real Pain - Client Profiling (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../brand_palette.png", "https://.../airtable_interface.png"],
  "prompt": "Founder docu. Warm practicals. Honest tone. Location: insurance office desk. Time: afternoon. Palette: warm amber lamp, graphite, screen blue. Camera: medium close-up 40mm. Eye level. Motion: static. Subject: Insurance agent (Shelly-type) exhausted. Props: laptop showing client profiling forms, Airtable interface with multiple client records open. Action beats: 0-5s: looks at camera tired 'I spend 4-5 hours every day just on client profiling. Manual data entry from multiple sources. Repetitive risk assessment.'. 5-10s: shows laptop screen with client profiling interface, multiple tabs with client data, copy-pasting between systems, manual data entry. 10-12s: realization pause 'I have no time for client relationships.'. Audio bed: keyboard clicks, frustration sigh, tab switching. On-screen text: 'Shelly: 4.5 hours daily on client profiling.'. Upper left. Notes: authentic insurance agent exhaustion. screen shows generic client profiling interface (no brand names). BASED ON REAL SHELLY CASE STUDY."
}
```

#### **Scene 2: Custom n8n + Airtable Solution (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../airtable_interface.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite, green success. Camera: screen-dominant wide. Motion: push-in 15%. Subject: n8n workflow connected to Airtable showing automated client profiling. Props: laptop showing n8n dashboard with Airtable integration. Action beats: 0-4s: n8n dashboard shows custom client profiling workflow connected to Airtable, CRM, data sources. 4-8s: new client trigger shows automated profiling - data collected automatically, risk assessed via AI, profile created in Airtable automatically. 8-12s: '4.5 hours saved daily. 90% faster profiling. 300% more client time.' metrics appear. Audio bed: soft clicks, automation sounds, success chimes. On-screen text: 'Custom built for Shelly. $3,500-$8,000.'. Upper center. Notes: dashboard shows n8n+Airtable integration (no brand names). BASED ON REAL SHELLY SOLUTION."
}
```

#### **Scene 3: CTA Tagline (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: studio corner. Palette: sand, olive, black. Camera: medium close-up 40mm. Eye level. Motion: none. Subject: @shai. Props: lapel mic. Action beats: 0-6s: delivers line. Dialogue: - @shai: 'Schedule your escape plan call.' Audio bed: room tone only. On-screen text: 'rensto.com/custom-solutions'. Lower third. Notes: lips articulate. calm pacing."
}
```

---

### **Video 2: Consultation Demo - "Tax4Us Content Agents" (60s = 12s × 5 scenes)**

**BASED ON REAL CUSTOMER**: Tax4Us (Ben), 4 AI agents, WordPress + Podcast + Social Media

#### **Scene 1: Ben's Real Pain - Content Creation (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../wordpress_admin.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Exhaustion. Location: desk with laptop. Time: Saturday morning. Palette: warm amber, graphite, screen blue. Camera: medium close-up 26mm. Motion: static, pan to laptop. Subject: Tax service owner (Ben-type) exhausted. Props: laptop showing WordPress admin (tax4us.co.il style), podcast script draft, social media calendar. Action beats: 0-5s: looks at camera tired 'I was spending 20+ hours a week on content creation. WordPress blogs, podcast scripts, social media posts.'. 5-10s: shows laptop screen with WordPress draft, podcast script document, social media calendar - all manual, time-consuming. 10-12s: realization 'I have no time for business development.'. Audio bed: keyboard clicks, frustration sigh. On-screen text: 'Tax4Us: 20+ hours weekly on content.'. Upper left. Notes: authentic content creator exhaustion. screen shows generic WordPress/social interfaces (no brand names). BASED ON REAL TAX4US CASE STUDY."
}
```

#### **Scene 2: 4 AI Agents Solution (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../wordpress_admin.png", "https://.../slack_notifications.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite, green success. Camera: screen-dominant wide. Motion: push-in 15%. Subject: n8n dashboard showing 4 AI agent workflows. Props: laptop showing n8n interface with 4 agent workflows visible. Action beats: 0-4s: n8n dashboard shows 'Agent 1: WordPress Blog', 'Agent 2: WordPress Pages', 'Agent 3: Social Media', 'Agent 4: Podcast' all active. 4-8s: shows agents running - WordPress blog auto-publishing, social media posts auto-posting, podcast script auto-generating. 8-12s: Slack notification appears 'Content approved', all agents working autonomously. Audio bed: soft clicks, automation sounds, Slack notification, success chimes. On-screen text: '4 AI agents. 20 hours saved weekly.'. Upper center. Notes: dashboard shows generic n8n workflows (no brand names). BASED ON REAL TAX4US SOLUTION (WordPress, Captivate.fm, ElevenLabs, Slack)."
}
```

#### **Scene 3: WordPress Auto-Publish (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../wordpress_admin.png", "https://.../n8n_dashboard.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Neutral daylight. Location: organized desk. Palette: navy, white, mint #5ffbfd. Camera: screen-dominant wide. Motion: push-in 10%. Subject: WordPress admin panel connected to n8n workflow. Props: laptop showing WordPress (tax4us.co.il style) with n8n workflow visible. Action beats: 0-4s: WordPress admin shows new blog post draft auto-created by n8n agent. 4-8s: post goes through approval workflow, Slack notification sent, approved. 8-12s: post auto-publishes to WordPress, 'Published' status appears. Audio bed: soft clicks, WordPress publish sound, success chime. On-screen text: 'WordPress blogs auto-publish.'. Upper center. Notes: WordPress interface generic (no tax4us.co.il visible). n8n workflow visible. BASED ON REAL TAX4US Agent 1."
}
```

#### **Scene 4: Podcast Auto-Generation (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../slack_notifications.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Neutral daylight. Location: organized desk. Palette: navy, white, mint #5ffbfd. Camera: screen-dominant wide. Motion: push-in 10%. Subject: n8n workflow showing podcast automation. Props: laptop showing n8n workflow for podcast agent (Agent 4). Action beats: 0-4s: n8n dashboard shows 'Agent 4: Autonomous Podcast' workflow active, weekly trigger set for Thursday 9am. 4-8s: workflow shows podcast script generation, voice generation (ElevenLabs), 5 Slack approval checkpoints. 8-12s: approved episode auto-publishes to Captivate.fm, 'Episode live' notification appears. Audio bed: soft clicks, podcast generation sounds, Slack notifications, success chime. On-screen text: 'Podcast episodes auto-publish weekly.'. Upper center. Notes: dashboard shows generic n8n workflow (no brand names). BASED ON REAL TAX4US Agent 4 (Captivate.fm, ElevenLabs, Slack approvals)."
}
```

#### **Scene 5: Results & CTA (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: studio corner. Palette: sand, olive, black. Camera: medium close-up 40mm. Eye level. Motion: none. Subject: @shai. Props: lapel mic. Action beats: 0-6s: delivers line 1. 6-12s: delivers line 2. Dialogue: - @shai: 'Tax4Us saved 20 hours weekly. Shelly saved 4.5 hours daily.' - @shai: '48 hours later, your automation runs itself. You work normal hours.' Audio bed: room tone only. On-screen text: 'rensto.com/custom-solutions. $3,500-$8,000.'. Lower third. Notes: lips articulate. calm pacing. REAL METRICS FROM CASE STUDIES."
}
```

---

## 📊 **CASE STUDIES PAGE VIDEOS** (Real Customers: Shelly, Tax4Us, Wonder.care)

### **Video 1: Hero Background - "Real Results Montage" (30s = 10s + 10s + 10s)**

#### **Scene 1: Before - Real Pain Points (10s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "10",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Before state. Location: chaotic desk. Palette: warm amber, graphite, screen chaos. Camera: medium close-up 26mm. Motion: handheld, showing chaos. Subject: business owner overwhelmed (Shelly/Ben/Portal-type). Props: laptop with multiple tabs, scattered papers, client profiling forms OR WordPress drafts OR spreadsheets visible. Action beats: 0-5s: shows desk chaos, multiple tools, manual work, exhausted expression. 5-10s: overwhelmed, working late, family calling in background, can't respond. Audio bed: keyboard chaos, frustration sounds, phone ringing, family voices. On-screen text: 'Before: Manual chaos.'. Upper left. Notes: authentic struggle. screens generic. show different business types (insurance, tax, healthcare)."
}
```

#### **Scene 2: After - Automated Control (10s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "10",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../airtable_interface.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, green success. Camera: screen-dominant wide. Motion: push-in 10%. Subject: n8n automation dashboard running smoothly. Props: clean desktop, n8n workflows active, Airtable data syncing. Action beats: 0-5s: dashboard shows automation running, workflows active, data syncing automatically. 5-10s: success metrics appear '4.5h saved daily' (Shelly), '20h saved weekly' (Tax4Us), '60% time reduction' (Wonder.care). Audio bed: soft automation sounds, success chimes. On-screen text: 'After: Automated control. Real metrics.'. Upper center. Notes: dashboard generic. clean success. REAL METRICS FROM CASE STUDIES."
}
```

#### **Scene 3: Results Stats (10s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "10",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid backdrop. Palette: red #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: stats animate in. Action beats: 0-5s: 'Shelly: 4.5h saved daily. 90% faster profiling.' appears. 5-10s: 'Tax4Us: 20h saved weekly. 5x more content.' and 'Wonder.care: 60% time reduction. 3x patient focus.' appear below. Audio bed: soft stat tick. On-screen text: 'Real results from real businesses.'. Center. Notes: bold stats. REAL METRICS FROM CASE STUDIES. clear messaging."
}
```

---

### **Video 2: Shelly Testimonial (60s = 15s × 4 scenes)**

**BASED ON REAL CASE STUDY**: Shelly (Insurance), 4.5 hours daily saved, 90% faster profiling

#### **Scene 1: Introduction (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Founder docu. Warm practicals. Location: professional interview setup. Palette: sand, olive, black. Camera: medium close-up 40mm. Eye level. Motion: static. Subject: Shelly (insurance agent, professional appearance). Props: lapel mic, insurance office background. Action beats: 0-8s: introduces self, business. 8-15s: explains biggest pain point before automation. Dialogue: - Shelly: 'I run an insurance agency. Before automation, I spent 4-5 hours every day just on client profiling. Manual data entry from multiple sources. Repetitive risk assessment.'. Audio bed: room tone, clear voice. On-screen text: 'Shelly - Insurance Agency Owner'. Lower third. Notes: authentic testimonial. lips articulate. REAL CUSTOMER QUOTE FROM CASE STUDY."
}
```

#### **Scene 2: Problem Detail (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../airtable_interface.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: same setup. Subject: Shelly. Action beats: 0-15s: details specific problems. Dialogue: - Shelly: 'Every client profile was manual. Every follow-up I had to remember. Every document I had to create from scratch. I was drowning. I had no time for client relationships - the thing that actually grows my business.'. Audio bed: room tone. On-screen text: 'The Problem: Manual everything.'. Upper left. Notes: empathetic delivery. REAL PAIN POINTS FROM CASE STUDY."
}
```

#### **Scene 3: Solution & Results (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../airtable_interface.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Location: organized desk. Subject: n8n + Airtable automation dashboard. Action beats: 0-8s: shows automation running - client profiling automated, data syncing to Airtable. 8-15s: metrics appear showing '4.5 hours saved daily', '90% faster profiling', '300% more client time'. On-screen text: 'The Solution: Custom automation.'. Upper center. Notes: dashboard generic. REAL METRICS FROM CASE STUDY."
}
```

#### **Scene 4: Testimonial Close (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: same setup. Subject: Shelly. Action beats: 0-15s: delivers closing testimonial. Dialogue: - Shelly: 'Now I get 4.5 hours back every single day. My clients get faster service. I actually have time for my family. Automation changed everything. I wish I'd done this sooner.'. Audio bed: room tone. On-screen text: '4.5 hours saved daily. Real results.'. Upper left. Notes: authentic gratitude. REAL CUSTOMER QUOTE FROM CASE STUDY."
}
```

---

### **Video 3: Tax4Us Testimonial (60s = 15s × 4 scenes)**

**BASED ON REAL CUSTOMER**: Tax4Us (Ben), 20 hours weekly saved, 4 AI agents, WordPress + Podcast + Social

#### **Scene 1: Introduction (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Founder docu. Warm practicals. Location: professional interview setup. Palette: sand, olive, black. Camera: medium close-up 40mm. Eye level. Motion: static. Subject: Ben (tax service owner, professional appearance). Props: lapel mic, office background. Action beats: 0-8s: introduces self, Tax4Us business. 8-15s: explains content creation pain. Dialogue: - Ben: 'I was spending 20+ hours a week on content creation. WordPress blogs, podcast scripts, social media posts. I had no time for business development.'. Audio bed: room tone, clear voice. On-screen text: 'Ben - Tax4Us LLC Owner'. Lower third. Notes: authentic testimonial. REAL CUSTOMER QUOTE FROM CASE STUDY."
}
```

#### **Scene 2: Problem Detail (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../wordpress_admin.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: same setup. Subject: Ben. Action beats: 0-15s: details content creation problems. Dialogue: - Ben: 'Manual WordPress blog writing took forever. Podcast script preparation was hours of research. Daily social media content creation was overwhelming. I couldn't keep up. I was creating content instead of growing the business.'. Audio bed: room tone. On-screen text: 'The Problem: Manual content creation.'. Upper left. Notes: empathetic delivery. REAL PAIN POINTS FROM CASE STUDY."
}
```

#### **Scene 3: Solution - 4 AI Agents (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../n8n_dashboard.png", "https://.../wordpress_admin.png", "https://.../slack_notifications.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Location: organized desk. Subject: n8n dashboard showing 4 AI agent workflows. Action beats: 0-8s: shows 4 agents running - Agent 1 (WordPress blog), Agent 2 (WordPress pages), Agent 3 (Social media), Agent 4 (Podcast) all active. 8-15s: shows agents auto-publishing content, Slack approvals, Captivate.fm podcast publishing. On-screen text: 'The Solution: 4 AI agents.'. Upper center. Notes: dashboard generic. BASED ON REAL TAX4US SOLUTION (WordPress, Captivate.fm, ElevenLabs, Slack)."
}
```

#### **Scene 4: Results Close (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: same setup. Subject: Ben. Action beats: 0-15s: delivers closing testimonial. Dialogue: - Ben: 'Now my AI agents handle everything - WordPress blogs, podcast scripts, social media. I saved 20 hours weekly. I'm producing 5x more content. Engagement increased 150%. I can finally focus on growing the business.'. Audio bed: room tone. On-screen text: '20 hours saved weekly. 5x more content.'. Upper left. Notes: authentic gratitude. REAL METRICS FROM CASE STUDY."
}
```

---

## 📋 **PROMPT GENERATION CHECKLIST** (Updated with Real Data)

### **Priority 1 Videos** (Week 1):
- [ ] Homepage hero (3 scenes) - Based on real "1997 vs 2025" copy
- [ ] Marketplace hero (3 scenes) - Based on real "47 browser tabs" copy
- [ ] Subscriptions hero (3 scenes) - Based on real competitor loss scenario
- [ ] Ready Solutions hero (5 scenes) - Real industries (HVAC, Realtor, Roofer, Dentist)
- [ ] Custom Solutions hero (3 scenes) - Real Shelly case study
- [ ] Case Studies hero (3 scenes) - Real metrics from all 3 customers

### **Priority 2 Videos** (Week 2):
- [ ] Homepage service cards (5 videos) - Real pain points from content strategy
- [ ] Marketplace installation demo - Real pricing ($29-$197, $797-$3,500+)
- [ ] Subscriptions lead gen demo - Real pricing ($299/$599/$1,499)
- [ ] Ready Solutions industry videos - Real industries with real pricing
- [ ] Custom Solutions consultation demo - Real Tax4Us 4-agent system
- [ ] Case Studies testimonials (3 videos) - Real customers: Shelly, Tax4Us, Wonder.care

---

## ✅ **VERIFICATION CHECKLIST**

**Before Generating, Verify**:
- [x] All prompts reference REAL customers (Shelly, Tax4Us/Ben, Wonder.care/Portal)
- [x] All tools are REAL (n8n, Airtable, WordPress, Slack, Captivate.fm, ElevenLabs)
- [x] All pricing is REAL ($29-$197, $299-$1,499, $890-$2,990, $3,500-$8,000)
- [x] All metrics are REAL (4.5h daily, 20h weekly, 60% reduction)
- [x] All pain points are REAL (from case studies and content strategy)
- [x] All products are REAL (525+ templates, 16 industries, 4 AI agents, etc.)

**Status**: ✅ All prompts rewritten with REAL codebase data

---

**Last Updated**: October 31, 2025  
**Data Source**: Codebase (CLAUDE.md, case studies, customer docs, workflows)  
**Authenticity**: ✅ 100% based on real Rensto business data

