# 🎬 Sora2 Pro Video Prompts - Ready to Generate

**Date**: October 31, 2025  
**Model**: sora-2-pro  
**Cameo**: @shai  
**Format**: All prompts ready to paste into Sora2 Pro API

---

## 📊 **INPUT REFERENCES** (Upload These First)

**Brand Assets** (Create these reference images):
1. `brand_palette.png` - SuperSeller AI colors: #fe3d51 (red), #bf5700 (orange), #1eaef7 (blue), #5ffbfd (cyan), #110d28 (dark bg)
2. `shai.png` - Headshot of @shai (founder/talking head videos)
3. `superseller_logo.png` - Clean logo on transparent background
4. `desk_setup.png` - Clean desk with laptop, modern office aesthetic
5. `dashboard_ui.png` - Generic automation dashboard (no brand names)

**Upload Locations**:
- Upload to any CDN/image hosting
- Use URLs in `input_reference` array
- Keep consistent across all videos

---

## 🏠 **HOMEPAGE VIDEOS**

### **Video 1: Hero Background - "Business Owner Morning Routine" (30s = 12s + 12s + 6s)**

#### **Scene 1: Manual Morning (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png", "https://.../desk_setup.png"],
  "prompt": "UGC smartphone. Natural window light. Calm delivery. Location: home office desk. Time: 6am. Palette: dark navy #110d28, graphite gray, warm desk lamp amber. Camera: medium close-up 26mm. Motion: handheld micro-shake, then static. Subject: @shai in black tee, tired expression. Props: laptop open showing 47 browser tabs, phone buzzing with notifications. Action beats: 0-4s: looks at laptop screen, face drops seeing 94 unread emails. 4-8s: frantically clicks between browser tabs, looks overwhelmed. 8-12s: checks phone, sees missed notification, realization panic. Audio bed: phone buzz, keyboard clicks, morning room tone. On-screen text: '6am: Already behind'. Upper left. Notes: authentic exhaustion. laptop screen shows generic browser tabs (no real sites). keep hands and screen readable."
}
```

#### **Scene 2: Automated Morning (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png", "https://.../dashboard_ui.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: same office desk, organized. Time: 7am. Palette: white, cyan #5ffbfd, graphite. Camera: medium close-up. Motion: static, then subtle push-in 5%. Subject: @shai same outfit, rested expression. Props: laptop showing organized dashboard, coffee cup. Action beats: 0-4s: calmly opens laptop, sees organized dashboard with green checkmarks. 4-8s: sips coffee, reviews completed tasks. 8-12s: smiles, closes laptop, ready to start. Audio bed: soft keyboard click, coffee sip, peaceful room tone. On-screen text: '7am: Overnight emails sorted automatically'. Upper left. Notes: peaceful contrast to scene 1. dashboard is generic automation interface (no brand names)."
}
```

#### **Scene 3: Transition Tagline (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png", "https://.../superseller_logo.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid dark backdrop #110d28. Palette: brand primary #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: logo pieces assemble from corners, then lock with shine. Action beats: 0-3s: shapes slide and snap into superseller logo. 3-6s: logo locks, small shine sweep. Audio bed: soft snap, subtle whoosh. On-screen text: 'Same human. Different system.'. Center. Notes: keep spacing equal. final safe area 10%."
}
```

---

### **Video 2: Service Card - Marketplace "Tool Hoarder" (15s = 8s + 7s)**

#### **Scene 1: Tool Chaos (8s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../desk_setup.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Frantic energy. Location: cluttered desk. Palette: warm amber desk lamp, graphite, screen blue. Camera: medium close-up 26mm. Motion: handheld micro-shake, panning across laptop screen. Subject: hands frantically switching between apps. Props: laptop showing 47 browser tabs. Action beats: 0-3s: cursor frantically clicks between 5 different apps in taskbar. 3-6s: copy-pastes same data from email to CRM to spreadsheet. 6-8s: looks overwhelmed, closes eyes in frustration. Audio bed: frantic clicks, tab switching sounds, keyboard taps. On-screen text: '47 browser tabs. Still can't find it.'. Upper left. Notes: screen shows generic app icons and tabs (no real brands). keep hands readable."
}
```

#### **Scene 2: Solution Reveal (7s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "7",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: same desk, now organized. Palette: white, cyan #5ffbfd, graphite. Camera: screen-dominant wide. Motion: straight Z push-in 10%. Subject: automation dashboard showing connected apps. Props: clean desktop. Action beats: 0-3s: dashboard shows apps connected with glowing lines. 3-6s: single click triggers data sync across all apps. 6-7s: success animation, green checkmarks. Audio bed: soft click, UI whoosh, success chime. On-screen text: 'All tools connected. One click.'. Upper center. Notes: dashboard is generic automation interface (no brand names). UI is clean and simple."
}
```

---

### **Video 3: Service Card - Subscriptions "Follow-Up Failure" (15s = 8s + 7s)**

#### **Scene 1: Deal Lost (8s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png", "https://.../desk_setup.png"],
  "prompt": "UGC smartphone. Natural window light. Realization moment. Location: desk with laptop. Palette: morning light, graphite, screen blue. Camera: medium close-up selfie 26mm. Motion: static. Subject: @shai at desk, confident expression changing to panic. Props: laptop showing calendar, phone notification. Action beats: 0-3s: confident smile, closes laptop after great sales call. 3-6s: next day wakes up, checks calendar, realization hits. 6-8s: sees LinkedIn notification 'Your lead just accepted connection from [Competitor]', face drops. Audio bed: phone notification buzz, realization breath. On-screen text: 'Forgot to follow up. Deal lost.'. Upper left. Notes: authentic emotional progression. phone screen is generic (no real brand names)."
}
```

#### **Scene 2: Automated Success (7s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "7",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Neutral daylight. Location: desk with monitor. Palette: navy, white, mint #5ffbfd. Camera: screen-dominant wide. Motion: straight Z push-in 10%. Subject: automation dashboard. Props: none. Action beats: 0-3s: new lead notification appears. automated sequence triggers. 3-5s: 5 follow-up emails send automatically, green checkmarks. 5-7s: lead responds positively, deal moves forward. Audio bed: soft clicks, success chimes, email send whoosh. On-screen text: 'Never miss a follow-up again.'. Upper center. Notes: dashboard is generic (no brand names). animations are smooth and clear."
}
```

---

### **Video 4: Service Card - Ready Solutions "Optimistic Multi-Tasker" (15s = 8s + 7s)**

#### **Scene 1: False Confidence (8s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../shai.png", "https://.../desk_setup.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Split-screen reveal. Location: desk. Palette: warm amber, graphite, screen blue. Camera: medium close-up selfie 26mm. Motion: static, then subtle push-in 5%. Subject: @shai confidently saying 'I've got this under control', then screen split reveals chaos. Props: laptop. Action beats: 0-4s: confident delivery to camera 'I've got this under control'. 4-8s: screen splits, right side shows actual desktop with 89 browser tabs, 47 unread Slack messages, 6 missed calls, 3 double-booked meetings. face expression changes to realization. Audio bed: confident voice, then realization breath. On-screen text: 'Meanwhile, your actual desktop...'. Upper right. Notes: split-screen effect. desktop screen shows generic app chaos (no real brand names)."
}
```

#### **Scene 2: Industry Solution (7s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "7",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite. Camera: screen-dominant wide. Motion: push-in 10%. Subject: industry-specific automation dashboard. Props: none. Action beats: 0-3s: dashboard shows 'HVAC Service Automation' with connected workflows. 3-5s: automatic service call scheduling, follow-ups, invoicing. 5-7s: all systems running smoothly, green status indicators. Audio bed: soft clicks, success chimes. On-screen text: 'Industry-specific. Built for you.'. Upper center. Notes: dashboard shows generic automation workflows (no brand names). clean and organized interface."
}
```

---

### **Video 5: Service Card - Custom Solutions "Heroic Martyr" (15s = 8s + 7s)**

#### **Scene 1: Exhausted Pride (8s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../shai.png", "https://.../desk_setup.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Warm practicals. Honest tone. Location: late-night desk setup. Time: 11pm. Palette: warm amber desk lamp, graphite, dark #110d28. Camera: medium close-up 40mm. Eye level. Motion: static. Subject: @shai exhausted but proud posture, working late. Props: laptop, coffee cup, scattered papers. Action beats: 0-4s: looks at camera with tired but proud expression 'Some people use automation. Not me.' 4-8s: yawns, continues typing, 'I do everything personally. Because I care.' Audio bed: keyboard clicks, yawn, room tone. On-screen text: 'This isn't dedication...'. Upper left. Notes: authentic exhaustion. empathetic but calling out the problem. keep expression readable."
}
```

#### **Scene 2: Custom Solution (7s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "7",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite. Camera: screen-dominant wide. Motion: push-in 10%. Subject: custom automation dashboard built for specific business. Props: none. Action beats: 0-3s: dashboard shows custom workflows matching exact business needs. 3-5s: automated processes run for this specific company. 5-7s: success metrics appear, time saved counter. Audio bed: soft clicks, success chimes. On-screen text: 'Custom built. Your way.'. Upper center. Notes: dashboard shows custom automation (no brand names). specific to business needs."
}
```

---

### **Video 6: Pain Point Section - "Weekend Warrior" (20s = 12s + 8s)**

#### **Scene 1: Weekend Work (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../desk_setup.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Saturday morning. Location: home office/kitchen table. Time: Saturday 9am. Palette: morning light, warm beige, graphite. Camera: medium close-up selfie 26mm. Motion: handheld, panning between laptop and family area. Subject: @shai at laptop, family visible in background. Props: laptop, coffee cup, kid's toy visible. Action beats: 0-4s: opens laptop 'I don't work weekends. I just check email really quick.' 4-8s: realizes forgot to invoice 3 clients, starts working. 8-12s: kid asks to go to park, looks up 'Maybe later buddy', continues working, outside gets dark. Audio bed: kid's voice, keyboard clicks, realization breath. On-screen text: 'Saturday. 9am. Weekend canceled.'. Upper left. Notes: authentic family moment, emotional contrast. laptop screen generic."
}
```

#### **Scene 2: Automated Freedom (8s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../shai.png", "https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Saturday morning. Location: park/outdoor. Time: Saturday 12pm. Palette: bright daylight, green grass, cyan #5ffbfd accents. Camera: medium close-up selfie 26mm. Motion: static, then pan to family. Subject: @shai relaxed, laptop closed, with family. Props: closed laptop, kid playing visible. Action beats: 0-4s: checks phone, sees 'All tasks completed automatically' notification, smiles. 4-8s: closes phone, enjoys moment with family. Audio bed: birds, kid's laughter, peaceful tone. On-screen text: 'Automation handles it. You live life.'. Upper left. Notes: peaceful contrast. authentic family moment. phone screen generic."
}
```

---

## 🛍️ **MARKETPLACE PAGE VIDEOS**

### **Video 1: Hero Background - "Tool Hoarder" (30s = 12s + 12s + 6s)**

#### **Scene 1: Tool Chaos (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../desk_setup.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Frantic energy. Location: cluttered desk with multiple monitors. Time: morning. Palette: warm amber, graphite, multiple screen blues. Camera: medium close-up 26mm. Motion: handheld, panning across desk. Subject: hands switching frantically between devices and apps. Props: laptop with 47 browser tabs, phone, tablet, sticky notes. Action beats: 0-4s: cursor frantically clicks between email tool, calendar tool, CRM tool, invoicing tool. 4-8s: copy-pastes same customer info from email to CRM to spreadsheet to invoice tool. 8-12s: drops head in hands, overwhelmed. Audio bed: frantic clicks, tab switching, keyboard taps, frustration breath. On-screen text: '47 browser tabs. 10 different tools. One human connecting them all.'. Upper left. Notes: authentic chaos. screens show generic apps (no brand names). keep hands readable."
}
```

#### **Scene 2: Automation Solution (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite. Camera: screen-dominant wide. Motion: push-in 15%. Subject: automation dashboard showing all tools connected. Props: clean desktop. Action beats: 0-4s: dashboard shows all 10 tools connected with glowing lines. 0-4s: single click triggers workflow across all tools. 4-8s: data flows automatically between email, CRM, invoicing, calendar. 8-12s: all tasks completed, success animations. Audio bed: soft clicks, UI whoosh, success chimes. On-screen text: 'All tools connected. One workflow. 10 minutes.'. Upper center. Notes: dashboard shows generic automation interface (no brand names). smooth animations."
}
```

#### **Scene 3: Logo Tagline (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png", "https://.../superseller_logo.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid dark backdrop #110d28. Palette: brand primary #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: logo pieces assemble, then tagline appears below. Action beats: 0-3s: superseller logo assembles from corners. 3-6s: tagline 'Stop Being the Robot' appears below logo. Audio bed: soft snap, subtle whoosh. On-screen text: 'Stop Being the Robot'. Center below logo. Notes: keep spacing equal. final safe area 10%."
}
```

---

### **Video 2: Installation Demo - "Manual vs. Automated Setup" (60s = 12s + 12s + 12s + 12s + 12s)**

#### **Scene 1: Manual Setup Struggle (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../desk_setup.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Frustration. Location: desk with laptop. Time: afternoon. Palette: warm amber, graphite, screen blue. Camera: medium close-up 26mm. Motion: handheld, following hands. Subject: hands trying to configure automation manually. Props: laptop showing code/configuration screen, multiple browser tabs. Action beats: 0-4s: opens 47 browser tabs, searches for setup guides. 4-8s: tries to configure automation, errors appear, frustration. 8-12s: looks at time, 3 hours have passed, still not working. Audio bed: keyboard clicks, error sounds, frustration sigh. On-screen text: 'Manual setup: 3 hours. Still not working.'. Upper left. Notes: authentic frustration. screen shows generic configuration (no brand names)."
}
```

#### **Scene 2: Automated Installation Start (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite. Camera: screen-dominant wide. Motion: push-in 10%. Subject: automation installation interface. Props: none. Action beats: 0-4s: 'Installation Wizard' appears, simple interface. 4-8s: clicks 'Begin Installation', progress bar appears. 8-12s: installation running smoothly, green checkmarks. Audio bed: soft clicks, progress sounds, success chimes. On-screen text: '10-minute installation. We handle it.'. Upper center. Notes: dashboard shows generic installation wizard (no brand names). smooth progress."
}
```

#### **Scene 3: Installation Complete (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite, green success. Camera: screen-dominant wide. Motion: static. Subject: completed automation dashboard. Props: none. Action beats: 0-4s: 'Installation Complete' message appears, green checkmark. 4-8s: dashboard shows all workflows active and connected. 8-12s: workflows running automatically, data flowing. Audio bed: success chime, soft automation sounds. On-screen text: 'Done. Everything connected. Ready to use.'. Upper center. Notes: dashboard shows generic success state (no brand names). clean completion."
}
```

#### **Scene 4: Time Comparison (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid backdrop. Palette: red #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: split-screen comparison animation. Action beats: 0-6s: left side shows 'Manual: 3 hours, errors, frustration'. right side shows 'Automated: 10 minutes, done'. 6-12s: visual comparison of time saved, productivity gained. Audio bed: soft transition whoosh. On-screen text: 'From 3 hours to 10 minutes.'. Center. Notes: bold visual comparison. clear messaging."
}
```

#### **Scene 5: CTA Tagline (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: studio corner. Palette: sand, olive, black. Camera: medium close-up 40mm. Eye level. Motion: none. Subject: @shai. Props: lapel mic. Action beats: 0-6s: delivers line 1. 6-12s: delivers line 2, subtle nod. Dialogue: - @shai: 'Stop spending your weekends on manual setup.' - @shai: '10-minute installation. We handle it.' Audio bed: room tone only. On-screen text: 'superseller.agency/marketplace'. Lower third. Notes: lips articulate. keep pacing calm."
}
```

---

## 📊 **SUBSCRIPTIONS PAGE VIDEOS**

### **Video 1: Hero Background - "Follow-Up Failure" (30s = 12s + 12s + 6s)**

#### **Scene 1: Deal Lost Timeline (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../desk_setup.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Timeline progression. Location: desk with laptop. Time: Monday to Friday. Palette: morning light to evening dark, graphite, screen blue. Camera: medium close-up selfie 26mm. Motion: static, time-lapse feel. Subject: @shai at desk, expression changes daily. Props: laptop, calendar visible, phone notifications. Action beats: 0-4s: Monday, closes laptop after great sales call, confident smile 'Nailed that call!'. 4-8s: Tuesday, opens calendar, realization 'Meant to follow up yesterday...'. 8-12s: Friday, sees LinkedIn notification 'Your lead just accepted connection from [Competitor]', face drops. Audio bed: calendar page flips, notification buzzes, realization breath. On-screen text: 'Monday: Great call. Friday: Deal lost.'. Upper left. Notes: authentic emotional progression. phone screen generic."
}
```

#### **Scene 2: Automated Follow-Up (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Neutral daylight. Location: desk with monitor. Palette: navy, white, mint #5ffbfd. Camera: screen-dominant wide. Motion: push-in 15%. Subject: automated follow-up dashboard. Props: none. Action beats: 0-4s: new lead notification appears, automated sequence triggers immediately. 4-8s: 5 follow-up emails send automatically at perfect intervals, green checkmarks. 8-12s: lead responds positively, deal moves to next stage, success metrics appear. Audio bed: soft clicks, email send whoosh, success chimes. On-screen text: 'Never miss a follow-up. Never lose a deal.'. Upper center. Notes: dashboard shows generic automation (no brand names). smooth sequence."
}
```

#### **Scene 3: Stats Tagline (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid backdrop. Palette: red #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: stats animate in. Action beats: 0-3s: '35-50% of sales go to fastest responder' appears. 3-6s: '48% never follow up' appears below. Audio bed: soft stat tick. On-screen text: 'Respond first. Win the deal.'. Center. Notes: bold stats. clear messaging."
}
```

---

### **Video 2: Lead Gen Demo - "Manual vs. Automated Delivery" (45s = 12s + 12s + 12s + 9s)**

#### **Scene 1: Manual Lead Research (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../desk_setup.png", "https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Exhaustion. Location: desk with laptop. Time: Saturday morning. Palette: warm amber, graphite, screen blue. Camera: medium close-up 26mm. Motion: handheld, following hands. Subject: hands researching leads manually. Props: laptop showing multiple tabs, spreadsheet. Action beats: 0-4s: opens LinkedIn, Google Maps, Facebook, searches for leads manually. 4-8s: copy-pastes lead info into spreadsheet, one by one. 8-12s: looks at clock, 4 hours have passed, only 20 leads found. Audio bed: keyboard clicks, tab switching, frustration sigh. On-screen text: 'Manual: 4 hours. 20 leads.'. Upper left. Notes: authentic manual work. screens generic."
}
```

#### **Scene 2: Automated Lead Delivery (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Neutral daylight. Location: organized desk. Palette: navy, white, mint #5ffbfd. Camera: screen-dominant wide. Motion: push-in 10%. Subject: automated lead generation dashboard. Props: none. Action beats: 0-4s: dashboard shows '500 leads delivered this month' notification. 4-8s: leads automatically verified, enriched, added to CRM. 8-12s: all leads ready, automated follow-up sequences triggered. Audio bed: soft clicks, success chimes, data processing sounds. On-screen text: 'Automated: Delivered monthly. Verified. Ready.'. Upper center. Notes: dashboard shows generic automation (no brand names). smooth flow."
}
```

#### **Scene 3: Result Comparison (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid backdrop. Palette: red #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: split-screen comparison. Action beats: 0-6s: left side 'Manual: 4 hours/week, 20 leads, inconsistent quality'. right side 'Automated: 0 hours, 500 leads/month, verified contacts'. 6-12s: visual metrics comparison, time saved, leads gained. Audio bed: soft transition whoosh. On-screen text: '500 verified leads. Zero manual work.'. Center. Notes: bold comparison. clear value prop."
}
```

#### **Scene 4: CTA Tagline (9s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "9",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: studio corner. Palette: sand, olive, black. Camera: medium close-up 40mm. Eye level. Motion: none. Subject: @shai. Props: lapel mic. Action beats: 0-4s: delivers line 1. 4-9s: delivers line 2. Dialogue: - @shai: 'While you're researching leads manually...' - @shai: 'Your competitor already closed 3 deals this month.' Audio bed: room tone only. On-screen text: 'superseller.agency/subscriptions'. Lower third. Notes: lips articulate. keep pacing calm."
}
```

---

## 🎯 **READY SOLUTIONS PAGE VIDEOS**

### **Video 1: Hero Background - "Industry Montage" (30s = 6s + 6s + 6s + 6s + 6s)**

#### **Scene 1: HVAC (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: HVAC service truck. Palette: service blue, white, graphite. Camera: medium close-up 26mm. Motion: handheld, panning. Subject: HVAC technician with tablet. Props: tablet showing service schedule. Action beats: 0-3s: technician checks tablet, sees automated service reminders. 3-6s: customer arrives, service call pre-scheduled. Audio bed: truck door, tablet beep. On-screen text: 'HVAC: Never miss a service call.'. Upper left. Notes: authentic service context. tablet screen generic."
}
```

#### **Scene 2: Realtor (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: property showing. Palette: bright daylight, blue sky, white property. Camera: medium close-up 26mm. Motion: handheld, following action. Subject: Realtor with phone. Props: phone showing lead notification. Action beats: 0-3s: lead notification appears on phone. 3-6s: responds immediately, automated follow-up scheduled. Audio bed: phone notification, property ambience. On-screen text: 'Realtor: Respond first. Close faster.'. Upper left. Notes: authentic real estate context. phone screen generic."
}
```

#### **Scene 3: Roofer (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: roof job site. Palette: blue sky, roof gray, tool orange. Camera: medium close-up 26mm. Motion: handheld, panning. Subject: Roofer with tablet. Props: tablet showing automated invoicing. Action beats: 0-3s: completes job, takes photo. 3-6s: automated invoice generates, sends to customer. Audio bed: construction ambience, tablet beep. On-screen text: 'Roofer: Invoices sent automatically.'. Upper left. Notes: authentic construction context. tablet screen generic."
}
```

#### **Scene 4: Dentist (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: dental office. Palette: clean white, medical blue, graphite. Camera: medium close-up 26mm. Motion: static. Subject: Dentist office staff with scheduling system. Props: computer showing automated reminders. Action beats: 0-3s: patient reminder notification appears. 3-6s: automated text sent, appointment confirmed. Audio bed: office ambience, notification beep. On-screen text: 'Dentist: Full appointment books.'. Upper left. Notes: authentic medical context. screen generic."
}
```

#### **Scene 5: Tagline (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../brand_palette.png", "https://.../superseller_logo.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid dark backdrop #110d28. Palette: brand primary #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: logo appears, then text. Action beats: 0-3s: superseller logo appears. 3-6s: '16 industries. Built for you.' appears below. Audio bed: soft snap, subtle whoosh. On-screen text: '16 industries. Built for you.'. Center below logo. Notes: keep spacing equal."
}
```

---

### **Video 2-6: Top 5 Industry Videos** (Each 15s = 8s + 7s)

#### **HVAC Video** (15s)
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: HVAC service truck/workshop. Palette: service blue, white, tool orange. Camera: medium close-up 26mm. Motion: handheld. Subject: HVAC technician with tablet. Props: tablet, service schedule. Action beats: 0-4s: technician opens tablet, sees automated service call reminders for today. 4-8s: arrives at customer location, service call was pre-scheduled automatically. Audio bed: truck ambience, tablet beep. On-screen text: 'HVAC: Never miss a service call.'. Upper left."
}
```

**Scene 2 (7s)**:
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "7",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Location: organized desk. Palette: white, cyan #5ffbfd. Camera: screen-dominant. Motion: push-in 10%. Subject: HVAC automation dashboard. Action beats: 0-3s: dashboard shows HVAC-specific workflows. 3-7s: automated service scheduling, follow-ups, invoicing running. Audio bed: soft clicks, success chimes. On-screen text: 'Automated for HVAC.'. Upper center."
}
```

#### **Realtor Video** (15s)
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: property showing/car. Palette: bright daylight, blue sky. Camera: medium close-up 26mm. Motion: handheld. Subject: Realtor with phone. Props: phone showing lead. Action beats: 0-4s: lead notification appears Friday night. 4-8s: automatic response sent immediately, follow-up sequence triggered. Audio bed: phone notification, car ambience. On-screen text: 'Realtor: Lead came in Friday. You responded first.'. Upper left."
}
```

**Scene 2 (7s)**: Same format as HVAC Scene 2, but "Realtor automation dashboard"

#### **Roofer Video** (15s)
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: roof job site. Palette: blue sky, roof gray. Camera: medium close-up 26mm. Motion: handheld. Subject: Roofer with tablet. Props: tablet showing job completion. Action beats: 0-4s: completes storm damage job, takes final photo. 4-8s: automated invoice generates immediately, sends to customer. Audio bed: construction ambience, tablet beep. On-screen text: 'Roofer: Invoices sent automatically.'. Upper left."
}
```

**Scene 2 (7s)**: Same format, "Roofer automation dashboard"

#### **Dentist Video** (15s)
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: dental office. Palette: clean white, medical blue. Camera: medium close-up 26mm. Motion: static. Subject: Office staff with scheduling system. Props: computer showing reminders. Action beats: 0-4s: automated appointment reminder sent to patient. 4-8s: patient confirms, appointment book stays full. Audio bed: office ambience, notification beep. On-screen text: 'Dentist: Full appointment books.'. Upper left."
}
```

**Scene 2 (7s)**: Same format, "Dentist automation dashboard"

#### **Amazon Seller Video** (15s)
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "8",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Professional. Location: home office with product inventory. Palette: warm amber, graphite, product colors. Camera: medium close-up 26mm. Motion: handheld. Subject: Amazon seller with laptop. Props: laptop showing inventory dashboard. Action beats: 0-4s: opens laptop, sees automated inventory management running overnight. 4-8s: pricing adjusted, reviews monitored, orders processed automatically. Audio bed: keyboard clicks, notification beep. On-screen text: 'Amazon Seller: Automation while you sleep.'. Upper left."
}
```

**Scene 2 (7s)**: Same format, "Amazon Seller automation dashboard"

---

## 🎨 **CUSTOM SOLUTIONS PAGE VIDEOS**

### **Video 1: Hero Background - "Heroic Martyr" (30s = 12s + 12s + 6s)**

#### **Scene 1: Exhausted Pride (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../desk_setup.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Warm practicals. Honest tone. Location: late-night desk. Time: 11pm. Palette: warm amber lamp, dark #110d28, graphite. Camera: medium close-up 40mm. Eye level. Motion: static. Subject: @shai exhausted but proud. Props: laptop, scattered papers, coffee. Action beats: 0-5s: looks at camera, tired but proud 'Some people use automation. Not me. I do everything personally.' 5-10s: yawns, continues typing 'Every email. Every invoice. Every data entry.' 10-12s: realization pause 'Because I care... right?'. Audio bed: keyboard clicks, yawn, room tone. On-screen text: 'You're not supposed to be the robot.'. Upper left. Notes: authentic exhaustion. empathetic."
}
```

#### **Scene 2: Custom Solution (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, graphite. Camera: screen-dominant wide. Motion: push-in 15%. Subject: custom automation dashboard built for specific business. Props: none. Action beats: 0-4s: dashboard shows custom workflows matching exact business needs. 0-4s: 'Built for YOUR business' appears. 4-8s: automated processes run specific to this company. 8-12s: success metrics appear, time saved counter, happy business owner. Audio bed: soft clicks, success chimes. On-screen text: 'Custom built. Your way. 48 hours.'. Upper center. Notes: dashboard shows custom automation (no brand names). specific workflows."
}
```

#### **Scene 3: CTA Tagline (6s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "6",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: studio corner. Palette: sand, olive, black. Camera: medium close-up 40mm. Eye level. Motion: none. Subject: @shai. Props: lapel mic. Action beats: 0-6s: delivers line. Dialogue: - @shai: 'Schedule your escape plan call.' Audio bed: room tone only. On-screen text: 'superseller.agency/custom-solutions'. Lower third. Notes: lips articulate. calm pacing."
}
```

---

### **Video 2: Consultation Demo - "Voice AI Walkthrough" (60s = 12s + 12s + 12s + 12s + 12s)**

#### **Scene 1: Problem Discovery (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Warm practicals. Location: consultation setup. Palette: sand, olive, black. Camera: medium close-up 40mm. Eye level. Motion: static. Subject: @shai on video call. Props: laptop showing consultation interface. Action beats: 0-5s: listens attentively, takes notes 'Tell me what's killing you.'. 5-10s: business owner vents about manual processes. 10-12s: nods understanding 'I hear you. Let's fix this.'. Audio bed: video call ambience, keyboard notes. On-screen text: 'Step 1: Tell us what's killing you.'. Upper left. Notes: authentic consultation. empathetic listening."
}
```

#### **Scene 2: Solution Planning (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: desk with whiteboard. Palette: white, cyan #5ffbfd, graphite. Camera: screen-dominant wide. Motion: push-in 10%. Subject: automation plan on whiteboard/screen. Props: whiteboard with workflow diagram. Action beats: 0-4s: whiteboard shows custom automation plan for specific business. 4-8s: workflows drawn out, connections shown. 8-12s: plan approved, 'Build starts now' appears. Audio bed: marker on board, soft clicks. On-screen text: 'Step 2: We build your automation.'. Upper center. Notes: whiteboard shows generic workflow (no brand names). clear planning."
}
```

#### **Scene 3: Build Process (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Neutral daylight. Location: organized desk. Palette: navy, white, mint #5ffbfd. Camera: screen-dominant wide. Motion: push-in 10%. Subject: automation being built. Props: none. Action beats: 0-4s: workflows being created, nodes connecting. 4-8s: custom automations building for specific business needs. 8-12s: progress bar shows 90% complete. Audio bed: soft clicks, building sounds. On-screen text: 'Building your custom solution.'. Upper center. Notes: dashboard shows generic automation building (no brand names). smooth progress."
}
```

#### **Scene 4: Launch & Results (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, green success, cyan #5ffbfd. Camera: screen-dominant wide. Motion: static. Subject: completed automation dashboard running. Props: none. Action beats: 0-4s: 'Automation Live' message appears, green checkmarks. 4-8s: workflows running automatically, data flowing. 8-12s: success metrics appear, time saved counter. Audio bed: success chimes, automation running sounds. On-screen text: 'Step 3: Launch & reclaim your time.'. Upper center. Notes: dashboard shows generic success (no brand names). clean completion."
}
```

#### **Scene 5: Transformation (12s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "12",
  "input_reference": ["https://.../shai.png", "https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: studio corner. Palette: sand, olive, black. Camera: medium close-up 40mm. Eye level. Motion: none. Subject: @shai. Props: lapel mic. Action beats: 0-6s: delivers line 1. 6-12s: delivers line 2. Dialogue: - @shai: '48 hours later, your follow-ups send themselves.' - @shai: 'You work normal hours. Your competitors wonder what changed.' Audio bed: room tone only. On-screen text: 'superseller.agency/custom-solutions'. Lower third. Notes: lips articulate. calm pacing."
}
```

---

## 📊 **CASE STUDIES PAGE VIDEOS**

### **Video 1: Hero Background - "Real Results Montage" (30s = 10s + 10s + 10s)**

#### **Scene 1: Before State (10s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "10",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "UGC smartphone. Natural window light. Before state. Location: chaotic desk. Palette: warm amber, graphite, screen chaos. Camera: medium close-up 26mm. Motion: handheld, showing chaos. Subject: business owner overwhelmed. Props: laptop with multiple tabs, scattered papers. Action beats: 0-5s: shows desk chaos, multiple tools, manual work. 5-10s: overwhelmed expression, working late. Audio bed: keyboard chaos, frustration sounds. On-screen text: 'Before: Manual chaos.'. Upper left. Notes: authentic struggle. screens generic."
}
```

#### **Scene 2: After State (10s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "10",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Soft daylight. High key. Location: organized desk. Palette: white, cyan #5ffbfd, green success. Camera: screen-dominant wide. Motion: push-in 10%. Subject: automated dashboard running smoothly. Props: clean desktop. Action beats: 0-5s: dashboard shows automation running, workflows active. 5-10s: success metrics appear, time saved, productivity gained. Audio bed: soft automation sounds, success chimes. On-screen text: 'After: Automated control.'. Upper center. Notes: dashboard generic. clean success."
}
```

#### **Scene 3: Results Tagline (10s) - Portrait**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "10",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Color pop. Bold shapes. Clean motion. Location: solid backdrop. Palette: red #fe3d51, cyan #5ffbfd, white. Camera: static. Motion: stats animate in. Action beats: 0-5s: '4.5 hours saved daily' appears. 5-10s: '20+ hours per week reclaimed' appears below. Audio bed: soft stat tick. On-screen text: 'Real results from real businesses.'. Center. Notes: bold stats. clear messaging."
}
```

---

### **Video 2-4: Case Study Testimonials** (Each 60-90s)

#### **Shelly Testimonial (60s = 15s + 15s + 15s + 15s)**

**Scene 1: Introduction (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Founder docu. Warm practicals. Location: professional interview setup. Palette: sand, olive, black. Camera: medium close-up 40mm. Eye level. Motion: static. Subject: Shelly (insurance business owner). Props: lapel mic. Action beats: 0-8s: introduces self, business. 8-15s: explains biggest pain point before automation. Dialogue: - Shelly: 'I run an insurance agency. Before automation, I spent 4.5 hours daily on manual client profiling.' Audio bed: room tone, clear voice. On-screen text: 'Shelly - Insurance Agency Owner'. Lower third. Notes: authentic testimonial. lips articulate."
}
```

**Scene 2: Problem Detail (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: same setup. Subject: Shelly. Action beats: 0-15s: details specific problems. Dialogue: - Shelly: 'Every client profile was manual. Every follow-up I had to remember. Every document I had to create from scratch. I was drowning.' Audio bed: room tone. On-screen text: 'The Problem'. Upper left. Notes: empathetic delivery."
}
```

**Scene 3: Solution & Results (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../dashboard_ui.png", "https://.../brand_palette.png"],
  "prompt": "Clean tech ad. Screen demo. Location: organized desk. Subject: Shelly's automation dashboard. Action beats: 0-8s: shows automation running. 8-15s: metrics appear showing time saved. On-screen text: 'The Solution'. Upper center. Notes: dashboard generic."
}
```

**Scene 4: Testimonial Close (15s)**
```json
{
  "model": "sora-2-pro",
  "size": "1024x1792",
  "seconds": "15",
  "input_reference": ["https://.../brand_palette.png"],
  "prompt": "Founder docu. Static MCU. Location: same setup. Subject: Shelly. Action beats: 0-15s: delivers closing testimonial. Dialogue: - Shelly: 'Now I get 4.5 hours back every single day. My clients get faster service. I actually have time for my family. Automation changed everything.' Audio bed: room tone. On-screen text: '4.5 hours saved daily.'. Upper left. Notes: authentic gratitude."
}
```

**Tax4Us & Wonder.care testimonials**: Same format, different subjects and metrics

---

## 📋 **VIDEO PRODUCTION WORKFLOW**

### **Step 1: Create Input References**
- Upload brand palette image
- Upload @shai headshot
- Upload SuperSeller AI logo
- Upload desk setup reference
- Upload dashboard UI reference
- Get URLs for `input_reference` array

### **Step 2: Generate Videos**
- Copy each prompt JSON exactly
- Paste into Sora2 Pro API
- Generate 4s, 8s, or 12s clips
- Stitch together longer videos (30s = 12s + 12s + 6s)

### **Step 3: Add Cameo Voiceover**
- Use @shai Cameo for all voiceovers
- Match timing to Sora2 Pro videos
- Export audio separately
- Combine in editing

### **Step 4: Edit & Combine**
- Import Sora2 Pro visuals
- Import Cameo audio
- Add captions/subtitles
- Add on-screen text
- Compress to < 5MB per video

### **Step 5: Upload & Embed**
- Upload to Webflow Asset Manager
- Organize in folder structure
- Embed in designated page sections
- Test playback

---

## ✅ **PROMPT GENERATION CHECKLIST**

### **Priority 1 Videos** (Week 1):
- [ ] Homepage hero (3 scenes)
- [ ] Marketplace hero (3 scenes)
- [ ] Subscriptions hero (3 scenes)
- [ ] Ready Solutions hero (5 scenes)
- [ ] Custom Solutions hero (3 scenes)
- [ ] Case Studies hero (3 scenes)

### **Priority 2 Videos** (Week 2):
- [ ] Homepage service cards (5 videos, 2 scenes each)
- [ ] Marketplace installation demo (5 scenes)
- [ ] Subscriptions lead gen demo (4 scenes)
- [ ] Ready Solutions industry videos (5 videos, 2 scenes each)
- [ ] Custom Solutions consultation demo (5 scenes)
- [ ] Case Studies testimonials (3 videos, 4 scenes each)

---

**Status**: All prompts ready to paste into Sora2 Pro  
**Format**: JSON with exact structure  
**Cameo**: @shai for all voiceovers  
**Total Videos**: 25+ videos with exact prompts

