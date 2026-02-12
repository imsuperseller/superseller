# TourReel — UI/UX Wireframes as Text

**Version:** 1.0
**Date:** February 10, 2026
**Purpose:** Every screen, component, layout, interaction, empty state, loading state, and error state described in precise detail. An AI coding agent should be able to build the complete Next.js frontend from this document alone — no Figma required.

---

## TABLE OF CONTENTS

1. [Design System &amp; Tokens](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#1-design-system)
2. [Global Layout &amp; Navigation](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#2-global-layout)
3. [Landing Page (Public)](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#3-landing-page)
4. [Pricing Page (Public)](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#4-pricing-page)
5. [Auth Pages](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#5-auth-pages)
6. [Dashboard Home](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#6-dashboard-home)
7. [New Tour Wizard (5 Steps)](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#7-new-tour-wizard)
8. [Job Detail Page](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#8-job-detail-page)
9. [My Listings Page](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#9-my-listings-page)
10. [Settings Page](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#10-settings-page)
11. [Shared Component Specs](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#11-shared-components)
12. [Responsive Behavior](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#12-responsive)
13. [Animation &amp; Micro-Interactions](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#13-animations)
14. [Accessibility Requirements](https://claude.ai/chat/b9b9aa9e-01cf-4376-b234-2b8e209705f2#14-accessibility)

---

## 1. Design System & Tokens

### 1A. Color Palette

```
Brand:
  primary:        #1E3A5F     (deep navy — trustworthy, professional)
  primary-light:  #2D5F8A     (hover states)
  primary-dark:   #0F1F33     (text on light backgrounds)
  accent:         #D4A853     (warm gold — luxury real estate feel)
  accent-light:   #E8C97A     (hover states)

Neutrals:
  white:          #FFFFFF
  gray-50:        #F9FAFB     (page backgrounds)
  gray-100:       #F3F4F6     (card backgrounds, input backgrounds)
  gray-200:       #E5E7EB     (borders, dividers)
  gray-300:       #D1D5DB     (disabled text)
  gray-400:       #9CA3AF     (placeholder text)
  gray-500:       #6B7280     (secondary text)
  gray-700:       #374151     (primary text)
  gray-900:       #111827     (headings)

Status:
  success:        #059669     (complete, approved)
  success-light:  #D1FAE5     (success background)
  warning:        #D97706     (processing, attention)
  warning-light:  #FEF3C7     (warning background)
  error:          #DC2626     (failed, rejected)
  error-light:    #FEE2E2     (error background)
  info:           #2563EB     (informational)
  info-light:     #DBEAFE     (info background)

Gradient (hero sections):
  hero-gradient:  linear-gradient(135deg, #1E3A5F 0%, #2D5F8A 50%, #1E3A5F 100%)
```

### 1B. Typography

```
Font Family:     Inter (Google Fonts) — clean, modern, great readability
Fallback:        system-ui, -apple-system, sans-serif

Scale:
  display:       48px / 56px line-height / 700 weight   (hero headline)
  h1:            36px / 44px / 700                       (page titles)
  h2:            28px / 36px / 600                       (section headings)
  h3:            22px / 30px / 600                       (card titles)
  h4:            18px / 26px / 600                       (subsections)
  body-lg:       18px / 28px / 400                       (hero body text)
  body:          16px / 24px / 400                       (default body)
  body-sm:       14px / 20px / 400                       (secondary info, captions)
  caption:       12px / 16px / 500                       (labels, badges, timestamps)
  mono:          14px / 20px / 400 / JetBrains Mono      (code, IDs, technical)
```

### 1C. Spacing Scale

```
Tailwind default scale:
  0.5 = 2px     1 = 4px      2 = 8px      3 = 12px
  4 = 16px      5 = 20px     6 = 24px     8 = 32px
  10 = 40px     12 = 48px    16 = 64px    20 = 80px
  24 = 96px

Page padding:     px-4 (mobile) / px-8 (tablet) / px-16 (desktop)
Card padding:     p-6
Section spacing:  py-16 (mobile) / py-24 (desktop)
Component gap:    gap-4 (tight) / gap-6 (default) / gap-8 (loose)
```

### 1D. Border Radius

```
  sm:    4px    (badges, small elements)
  md:    8px    (buttons, inputs)
  lg:    12px   (cards)
  xl:    16px   (modals, large cards)
  full:  9999px (avatars, pills)
```

### 1E. Shadow Scale

```
  sm:    0 1px 2px rgba(0,0,0,0.05)                       (subtle lift)
  md:    0 4px 6px -1px rgba(0,0,0,0.1)                   (cards)
  lg:    0 10px 15px -3px rgba(0,0,0,0.1)                 (dropdowns, modals)
  xl:    0 20px 25px -5px rgba(0,0,0,0.1)                 (hero elements)
```

### 1F. Tailwind Config Extensions

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1E3A5F',
          'navy-light': '#2D5F8A',
          'navy-dark': '#0F1F33',
          gold: '#D4A853',
          'gold-light': '#E8C97A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

---

## 2. Global Layout & Navigation

### 2A. Public Layout (Landing, Pricing, Auth)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (sticky top, white bg, shadow-sm, h-16, z-50)          │
│  ┌──────────┬──────────────────────────────┬──────────────────┐ │
│  │ LOGO     │       NAV LINKS              │  AUTH BUTTONS    │ │
│  │ TourReel │  Features  Pricing  Demo     │ Sign In | Get    │ │
│  │ (icon +  │  (gray-500 text, hover navy) │ Started (gold    │ │
│  │  text)   │                              │  button)         │ │
│  └──────────┴──────────────────────────────┴──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    PAGE CONTENT                                 │
│                    (full width, no sidebar)                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER (gray-50 bg, py-12)                                    │
│  ┌──────────────┬───────────┬───────────┬────────────────────┐ │
│  │ LOGO +       │ Product   │ Company   │ Legal              │ │
│  │ tagline      │ Features  │ About     │ Privacy Policy     │ │
│  │ "AI-powered  │ Pricing   │ Blog      │ Terms of Service   │ │
│  │  property    │ Demo      │ Contact   │ AI Disclosure      │ │
│  │  tours"      │ API Docs  │ Careers   │                    │ │
│  └──────────────┴───────────┴───────────┴────────────────────┘ │
│  ─────────────────────────── divider ──────────────────────────│
│  © 2026 TourReel. All rights reserved.        Twitter  LinkedIn│
└─────────────────────────────────────────────────────────────────┘
```

### 2B. Dashboard Layout (Authenticated)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (sticky, white bg, shadow-sm, h-16, z-50)              │
│  ┌──────┬──────────────────────────────────┬──────────────────┐ │
│  │ LOGO │          (spacer)                │ Usage Badge |    │ │
│  │      │                                  │ Avatar+Name ▼   │ │
│  │      │                                  │ (dropdown menu)  │ │
│  └──────┴──────────────────────────────────┴──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────────────────────────────────────┐   │
│ │  SIDEBAR    │  MAIN CONTENT                               │   │
│ │  (w-64,     │  (flex-1, p-8, bg-gray-50, overflow-auto)   │   │
│ │  bg-white,  │                                             │   │
│ │  border-r,  │                                             │   │
│ │  fixed)     │                                             │   │
│ │             │                                             │   │
│ │  ┌────────┐ │                                             │   │
│ │  │ + New  │ │                                             │   │
│ │  │ Tour   │ │                                             │   │
│ │  │(gold   │ │                                             │   │
│ │  │button, │ │                                             │   │
│ │  │w-full) │ │                                             │   │
│ │  └────────┘ │                                             │   │
│ │             │                                             │   │
│ │  NAV ITEMS: │                                             │   │
│ │  ▸ Dashboard│                                             │   │
│ │  ▸ My Tours │                                             │   │
│ │  ▸ Listings │                                             │   │
│ │  ▸ Settings │                                             │   │
│ │             │                                             │   │
│ │  ─ divider  │                                             │   │
│ │             │                                             │   │
│ │  USAGE:     │                                             │   │
│ │  3/15 videos│                                             │   │
│ │  [████░░░░] │                                             │   │
│ │  this month │                                             │   │
│ │             │                                             │   │
│ │  Plan: Pro  │                                             │   │
│ │  Upgrade ↗  │                                             │   │
│ └─────────────┴─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Sidebar Nav Items — Active State:**

* Active: `bg-brand-navy/10 text-brand-navy font-semibold border-l-3 border-brand-navy`
* Inactive: `text-gray-500 hover:bg-gray-100 hover:text-gray-700`
* Icons: Lucide icons, 20px, left of text

**Avatar Dropdown Menu:**

```
┌─────────────────────┐
│ John Smith           │
│ john@email.com       │
│ ─────────────────── │
│ ⚙ Settings           │
│ 💳 Billing            │
│ 📊 Usage             │
│ ─────────────────── │
│ ↪ Sign Out           │
└─────────────────────┘
```

### 2C. Mobile Layout (< 768px)

```
HEADER:
  - Logo left, hamburger menu right
  - Hamburger opens full-screen slide-in sidebar from left
  - Sidebar overlays content with dark backdrop (bg-black/50)

SIDEBAR (mobile):
  - Full height, w-80, bg-white
  - Same content as desktop sidebar
  - Close button (X) top-right
  - Clicking backdrop closes sidebar

CONTENT:
  - Full width, no sidebar offset
  - Reduced padding: p-4
```

---

## 3. Landing Page (Public)

### 3A. Hero Section

```
┌─────────────────────────────────────────────────────────────────┐
│  HERO (hero-gradient background, py-24, text-white)             │
│                                                                 │
│         (centered, max-w-3xl)                                   │
│                                                                 │
│                AI Property Tours                                │
│              That Sell Homes Faster                              │
│         (display size, font-bold, text-white)                   │
│                                                                 │
│     Upload your listing photos. Get a cinematic                 │
│     walkthrough video in minutes — not days.                    │
│         (body-lg, text-white/80, mt-6)                          │
│                                                                 │
│     ┌─────────────────┐  ┌──────────────────┐                  │
│     │  Start Free ▸   │  │  Watch Demo ▶    │                  │
│     │ (gold bg, navy  │  │ (white border,   │                  │
│     │  text, px-8,    │  │  transparent bg,  │                  │
│     │  py-4, text-lg, │  │  white text)      │                  │
│     │  rounded-lg)    │  │                   │                  │
│     └─────────────────┘  └──────────────────┘                  │
│              (flex, gap-4, justify-center, mt-10)               │
│                                                                 │
│     ┌─────────────────────────────────────────┐                │
│     │                                         │                │
│     │      HERO VIDEO/SCREENSHOT              │                │
│     │      (rounded-xl, shadow-xl,            │                │
│     │       max-w-4xl, mx-auto, mt-16)        │                │
│     │                                         │                │
│     │      Show: dashboard with a video       │                │
│     │      playing, or a before/after         │                │
│     │      (photos → video) comparison        │                │
│     │                                         │                │
│     └─────────────────────────────────────────┘                │
│                                                                 │
│  "Trusted by 500+ realtors" + row of 5 avatar circles          │
│  (mt-12, text-sm, text-white/60)                                │
└─────────────────────────────────────────────────────────────────┘
```

### 3B. "How It Works" Section

```
┌─────────────────────────────────────────────────────────────────┐
│  HOW IT WORKS (bg-white, py-24)                                 │
│                                                                 │
│  "How It Works" (h2, centered)                                  │
│  "Three steps. Five minutes. Professional results."             │
│  (body, text-gray-500, centered, mt-2)                          │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │   ①            │  │   ②            │  │   ③            │      │
│  │   Upload       │  │   Customize    │  │   Download     │      │
│  │                │  │                │  │                │      │
│  │ [icon: Upload] │  │ [icon: Sliders]│  │ [icon: Play]   │      │
│  │                │  │                │  │                │      │
│  │ Upload listing │  │ Reorder rooms, │  │ Get your HD    │      │
│  │ photos and     │  │ choose music,  │  │ video in 16:9, │      │
│  │ floorplan.     │  │ pick style.    │  │ 9:16, and 1:1. │      │
│  │ AI analyzes    │  │ Our AI handles │  │ Share anywhere  │      │
│  │ the layout.    │  │ the rest.      │  │ instantly.      │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│  (grid grid-cols-3, gap-12, mt-16)                              │
│                                                                 │
│  Each card: p-8, text-center                                    │
│  Number: w-10 h-10 rounded-full bg-brand-gold text-white       │
│  Icon: 48px, text-brand-navy, mt-6                              │
│  Title: h4, mt-4                                                │
│  Description: body-sm, text-gray-500, mt-2                      │
└─────────────────────────────────────────────────────────────────┘
```

### 3C. Demo Video Section

```
┌─────────────────────────────────────────────────────────────────┐
│  DEMO (bg-gray-50, py-24)                                       │
│                                                                 │
│  "See It In Action" (h2, centered)                              │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │                                              │              │
│  │     EMBEDDED VIDEO PLAYER                    │              │
│  │     (16:9, max-w-4xl, mx-auto, rounded-xl,   │              │
│  │      shadow-lg)                               │              │
│  │                                              │              │
│  │     Show a real demo tour video.              │              │
│  │     Native HTML5 <video> with controls.       │              │
│  │     Poster frame shows a beautiful property.  │              │
│  │                                              │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  "This 50-second tour was generated in 4 minutes               │
│   from 8 listing photos and a floorplan."                       │
│  (body-sm, text-gray-500, text-center, mt-4)                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3D. Features Section

```
┌─────────────────────────────────────────────────────────────────┐
│  FEATURES (bg-white, py-24)                                     │
│                                                                 │
│  "Everything You Need" (h2, centered)                           │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ 🎬 AI Video Gen   │  │ 🎵 Background     │                    │
│  │                   │  │   Music           │                    │
│  │ Cinematic room-   │  │                   │                    │
│  │ to-room trans-    │  │ Professional      │                    │
│  │ itions using      │  │ instrumental      │                    │
│  │ Kling 3.0 AI.     │  │ tracks auto-      │                    │
│  │                   │  │ matched to your   │                    │
│  │                   │  │ property style.   │                    │
│  └──────────────────┘  └──────────────────┘                    │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ 📐 Smart Layout   │  │ 📱 Multi-Format   │                    │
│  │   Analysis        │  │   Export          │                    │
│  │                   │  │                   │                    │
│  │ Upload a floor-   │  │ Get 16:9 for MLS, │                    │
│  │ plan and AI maps  │  │ 9:16 for Reels,   │                    │
│  │ the perfect       │  │ 1:1 for Instagram, │                    │
│  │ walking tour.     │  │ 4:5 for Facebook.  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ ✨ Smooth Trans-   │  │ ⚡ Minutes, Not   │                    │
│  │   itions          │  │   Days            │                    │
│  │                   │  │                   │                    │
│  │ Hollywood-style   │  │ Most tours ready  │                    │
│  │ crossfade between │  │ in 5-10 minutes.  │                    │
│  │ rooms. 8 trans-   │  │ No videographer,  │                    │
│  │ ition styles.     │  │ no editing, no    │                    │
│  │                   │  │ waiting.          │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  (grid grid-cols-2, gap-8, max-w-4xl, mx-auto)                 │
│  Each card: bg-gray-50, p-6, rounded-xl                         │
│  Icon: text-2xl, mb-3                                           │
│  Title: h4, mb-2                                                │
│  Description: body-sm, text-gray-500                            │
└─────────────────────────────────────────────────────────────────┘
```

### 3E. Testimonials Section

```
┌─────────────────────────────────────────────────────────────────┐
│  TESTIMONIALS (bg-gray-50, py-24)                               │
│                                                                 │
│  "Realtors Love TourReel" (h2, centered)                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ ★★★★★        │  │ ★★★★★        │  │ ★★★★★        │         │
│  │              │  │              │  │              │         │
│  │ "I used to   │  │ "My listings │  │ "The AI gets │         │
│  │ spend $300   │  │ with video   │  │ the room     │         │
│  │ per listing  │  │ tours sell   │  │ flow right   │         │
│  │ on video.    │  │ 30% faster.  │  │ every time." │         │
│  │ Now it's     │  │ TourReel is  │  │              │         │
│  │ under $30."  │  │ a game       │  │ — Maria G.   │         │
│  │              │  │ changer."    │  │   RE/MAX      │         │
│  │ — Sarah K.   │  │              │  │   Miami       │         │
│  │   Keller     │  │ — David R.   │  │              │         │
│  │   Williams   │  │   Coldwell   │  │              │         │
│  │              │  │   Banker     │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  (grid grid-cols-3, gap-8)                                      │
│  Each card: bg-white, p-8, rounded-xl, shadow-md                │
│  Stars: text-brand-gold                                         │
│  Quote: body, italic, text-gray-700                             │
│  Name: body-sm, font-semibold, mt-6                             │
│  Company: caption, text-gray-500                                │
│                                                                 │
│  NOTE: Use placeholder testimonials for MVP.                    │
│  Replace with real ones after beta.                             │
└─────────────────────────────────────────────────────────────────┘
```

### 3F. CTA Section (Bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│  CTA (hero-gradient bg, py-20, text-white, text-center)         │
│                                                                 │
│     Ready to Transform Your Listings?                           │
│     (h2, text-white)                                            │
│                                                                 │
│     Start creating AI property tours today.                     │
│     No credit card required for your first video.               │
│     (body, text-white/80, mt-4)                                 │
│                                                                 │
│     ┌──────────────────────┐                                   │
│     │  Get Started Free ▸  │                                   │
│     │ (gold bg, navy text, │                                   │
│     │  px-10, py-4, text-lg)                                   │
│     └──────────────────────┘                                   │
│     (mt-8)                                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Pricing Page (Public)

```
┌─────────────────────────────────────────────────────────────────┐
│  PRICING PAGE (bg-white, py-24)                                 │
│                                                                 │
│  "Simple, Transparent Pricing" (h1, centered)                   │
│  "No hidden fees. Cancel anytime." (body, gray-500, centered)   │
│                                                                 │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────┐        │
│  │   STARTER   │  │    PRO           │  │    TEAM     │        │
│  │             │  │  ⭐ MOST POPULAR  │  │             │        │
│  │   $79/mo    │  │                  │  │   $299/mo   │        │
│  │             │  │   $149/mo        │  │             │        │
│  │   5 videos  │  │                  │  │   50 videos │        │
│  │   per month │  │   15 videos      │  │   per month │        │
│  │             │  │   per month      │  │             │        │
│  │  ✓ Standard │  │                  │  │  ✓ All Pro  │        │
│  │    AI model │  │  ✓ Standard +    │  │    features │        │
│  │  ✓ 16:9     │  │    Premium AI    │  │  ✓ Premium  │        │
│  │    format   │  │  ✓ All 4 video   │  │    AI model │        │
│  │  ✓ 10 clips │  │    formats       │  │  ✓ Priority │        │
│  │    per tour │  │  ✓ 15 clips      │  │    queue    │        │
│  │             │  │    per tour      │  │  ✓ Custom   │        │
│  │             │  │  ✓ Custom music  │  │    music    │        │
│  │             │  │    selection     │  │  ✓ API      │        │
│  │             │  │                  │  │    access   │        │
│  │  ┌────────┐ │  │  ┌────────────┐  │  │  ┌────────┐ │        │
│  │  │ Start  │ │  │  │ Start Free │  │  │  │ Start  │ │        │
│  │  │ Free   │ │  │  │ Trial ▸    │  │  │  │ Free   │ │        │
│  │  │ Trial  │ │  │  │(gold bg,   │  │  │  │ Trial  │ │        │
│  │  │(outline│ │  │  │ navy text) │  │  │  │(outline│ │        │
│  │  │ button)│ │  │  └────────────┘  │  │  │ button)│ │        │
│  │  └────────┘ │  │                  │  │  └────────┘ │        │
│  └─────────────┘  └─────────────────┘  └─────────────┘        │
│                                                                 │
│  Cards: equal height via flex. PRO card: border-2 border-gold,  │
│  ring-1 ring-gold/20, scale-105, relative (badge at top).       │
│  Other cards: border border-gray-200.                           │
│  All cards: bg-white, rounded-xl, shadow-md, p-8.              │
│  Checkmarks: text-success.                                      │
│  (grid grid-cols-3, gap-8, items-start, max-w-5xl, mx-auto)    │
│                                                                 │
│  ─── Below cards ───                                            │
│                                                                 │
│  "Need more? Pay-per-video available at $29/video."             │
│  "Enterprise? Contact us for custom pricing."                   │
│  (body-sm, text-gray-500, text-center, mt-8)                    │
│                                                                 │
│  ─── FAQ Section ───                                            │
│                                                                 │
│  "Frequently Asked Questions" (h2, mt-24)                       │
│                                                                 │
│  Accordion items (max-w-3xl, mx-auto):                          │
│  ▸ What AI models do you use?                                   │
│  ▸ How long does it take to generate a video?                   │
│  ▸ Can I use the videos commercially?                           │
│  ▸ What if I don't have a floorplan?                            │
│  ▸ Do you offer refunds for bad quality?                        │
│  ▸ Is there an API for MLS integration?                         │
│                                                                 │
│  Each: border-b border-gray-200, py-5                           │
│  Question: font-medium, cursor-pointer, flex justify-between    │
│  Answer: text-gray-500, mt-3, body-sm (hidden until expanded)   │
│  Chevron: rotate-180 when open, transition-transform 200ms      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Auth Pages

### 5A. Sign In

```
┌─────────────────────────────────────────────────────────────────┐
│  SIGN IN PAGE (bg-gray-50, min-h-screen, flex items-center)     │
│                                                                 │
│     ┌────────────────────────────────┐                         │
│     │  LOGO (centered, mb-8)         │                         │
│     │                                │                         │
│     │  ┌──────────────────────────┐  │                         │
│     │  │                          │  │                         │
│     │  │  CLERK <SignIn />        │  │                         │
│     │  │  COMPONENT               │  │                         │
│     │  │  (Clerk's pre-built UI)  │  │                         │
│     │  │                          │  │                         │
│     │  └──────────────────────────┘  │                         │
│     │                                │                         │
│     │  Don't have an account?        │                         │
│     │  Sign up → (link to /sign-up)  │                         │
│     └────────────────────────────────┘                         │
│     (max-w-md, mx-auto, bg-white, rounded-xl, shadow-lg, p-8)  │
└─────────────────────────────────────────────────────────────────┘

Clerk customization (via Clerk Dashboard → Appearance):
  - Primary color: #1E3A5F (brand navy)
  - Font: Inter
  - Border radius: 8px
  - Social providers: Google only (for MVP)
```

### 5B. Sign Up (identical layout, `<SignUp />` component)

---

## 6. Dashboard Home

### 6A. Default State (Has Jobs)

```
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD (within dashboard layout — sidebar + content area)    │
│                                                                 │
│  PAGE HEADER:                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Welcome back, Sarah                                     │   │
│  │  (h1, text-gray-900)                                     │   │
│  │                                                          │   │
│  │  You've used 3 of 15 videos this month.                  │   │
│  │  (body-sm, text-gray-500)                                │   │
│  │                                         ┌──────────────┐ │   │
│  │                                         │ + New Tour    │ │   │
│  │                                         │ (gold btn)    │ │   │
│  │                                         └──────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  USAGE STATS ROW:                                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ 3           │ │ 12          │ │ $43.27      │ │ 2           │  │
│  │ Videos      │ │ Videos      │ │ API Cost    │ │ In Progress │  │
│  │ This Month  │ │ All Time    │ │ This Month  │ │             │  │
│  │ (of 15)     │ │             │ │             │ │             │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│  (grid grid-cols-4, gap-4)                                      │
│  Each: bg-white, rounded-lg, p-5, border border-gray-200        │
│  Number: text-2xl, font-bold, text-gray-900                     │
│  Label: caption, text-gray-500, mt-1                            │
│  Sublabel: caption, text-gray-400                               │
│                                                                 │
│  RECENT TOURS:                                                  │
│  "Recent Tours" (h3, mt-8, mb-4)                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ┌────┐  123 Main St, Austin TX         Complete    3m ago│   │
│  │ │thumb│  Modern Farmhouse · 10 clips    ✅          │   │
│  │ │    │  Model: Kling 3.0               [View] [⋯]  │   │
│  │ └────┘                                              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ ┌────┐  456 Oak Ave, Dallas TX      Generating Clips    │   │
│  │ │thumb│  Colonial · 8 clips           ⏳ 65%       │   │
│  │ │    │  Model: Kling 3.0              [View] [⋯]  │   │
│  │ └────┘                                              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ ┌────┐  789 Pine Dr, San Antonio TX    Failed           │   │
│  │ │thumb│  Condo · 6 clips               ❌ Clip 4    │   │
│  │ │    │  Model: Kling 3.0               [Retry] [⋯] │   │
│  │ └────┘                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Job rows: bg-white, border border-gray-200, rounded-lg         │
│  Hover: shadow-sm transition-shadow                             │
│  Thumbnail: w-16 h-16 rounded-md object-cover bg-gray-200      │
│  Address: font-medium text-gray-900                             │
│  Details: caption text-gray-500                                 │
│  Status badge:                                                  │
│    complete:    bg-success-light text-success                   │
│    generating:  bg-warning-light text-warning + spinner         │
│    failed:      bg-error-light text-error                       │
│    pending:     bg-gray-100 text-gray-500                       │
│  Progress bar (if in-progress): h-1.5 bg-gray-200 rounded-full │
│    Fill: bg-brand-gold w-[65%] transition-all                   │
│  [...] menu: View | Download | Duplicate | Delete               │
│  Entire row is clickable → navigates to /dashboard/jobs/[id]    │
│                                                                 │
│  PAGINATION:                                                    │
│  ← Previous    Page 1 of 3    Next →                            │
│  (flex justify-between, mt-6)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6B. Empty State (No Jobs Yet)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│         (centered, max-w-md, py-24)                          │
│                                                              │
│         [illustration: house + play button icon]             │
│         (64px icon, text-gray-300)                           │
│                                                              │
│         Create Your First Tour                               │
│         (h3, mt-6)                                           │
│                                                              │
│         Upload listing photos and a floorplan               │
│         to generate your first AI property tour.             │
│         (body-sm, text-gray-500, mt-2, text-center)          │
│                                                              │
│         ┌───────────────────┐                                │
│         │  + Create Tour ▸  │                                │
│         │  (gold button)    │                                │
│         └───────────────────┘                                │
│         (mt-6)                                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. New Tour Wizard (5 Steps)

### 7A. Wizard Shell

```
┌─────────────────────────────────────────────────────────────────┐
│  WIZARD PAGE (within dashboard layout)                          │
│                                                                 │
│  PAGE HEADER:                                                   │
│  "Create New Tour" (h1)                                         │
│  ← Back to Dashboard (link, text-gray-500, above h1)            │
│                                                                 │
│  PROGRESS STEPPER:                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ① Listing ──── ② Floorplan ──── ③ Sequence ────        │   │
│  │                                                          │   │
│  │  ──── ④ Style ──── ⑤ Review                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Steps:                                                         │
│  - Complete: gold circle, checkmark, gold line to next          │
│  - Current: gold circle with number, pulsing ring               │
│  - Upcoming: gray-300 circle with number, gray-300 dashed line  │
│  - Text below each: step name, caption size                     │
│  (flex items-center justify-between, max-w-2xl, mx-auto, mb-10)│
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  STEP CONTENT (bg-white, rounded-xl, shadow-md, p-8)     │   │
│  │  (changes per step — see below)                           │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  STEP NAVIGATION:                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌──────────┐                          ┌──────────────┐  │   │
│  │  │ ← Back   │                          │ Continue ▸   │  │   │
│  │  │(outline) │                          │ (gold, solid)│  │   │
│  │  └──────────┘                          └──────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  (flex justify-between, mt-6)                                   │
│  Step 1: no Back button                                         │
│  Step 5: "Continue" becomes "Generate Tour ▸"                   │
└─────────────────────────────────────────────────────────────────┘
```

### 7B. Step 1: Listing Details

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: LISTING DETAILS                                     │
│                                                              │
│  "Property Information" (h3)                                 │
│  "Tell us about the listing." (body-sm, gray-500)            │
│                                                              │
│  ── OPTION A: Select Existing Listing ──                     │
│                                                              │
│  "Select a saved listing or create a new one" (body-sm)      │
│                                                              │
│  ┌────────────────────────────────────────────────┐          │
│  │ 🔍 Search listings...                          │          │
│  ├────────────────────────────────────────────────┤          │
│  │ ⊙ 123 Main St, Austin TX — Modern Farmhouse   │          │
│  │ ○ 456 Oak Ave, Dallas TX — Colonial            │          │
│  │ ○ 789 Pine Dr, San Antonio TX — Condo          │          │
│  ├────────────────────────────────────────────────┤          │
│  │ + Create New Listing                           │          │
│  └────────────────────────────────────────────────┘          │
│  (border, rounded-lg, divide-y)                              │
│  Radio buttons for selection.                                │
│  Selected: bg-brand-navy/5, border-l-3 border-brand-navy     │
│                                                              │
│  ── OPTION B: New Listing Form (expanded when clicked) ──    │
│                                                              │
│  Address *         [________________________]                │
│  City              [____________]                            │
│  State             [____] ▼      Zip [_______]              │
│                                                              │
│  Property Type     [House ▼]                                 │
│  Bedrooms          [4 ▼]     Bathrooms [3 ▼]                │
│  Sq Ft             [________] Listing Price [$________]      │
│  MLS #             [________]                                │
│                                                              │
│  Listing Photos *                                            │
│  ┌──────────────────────────────────────────────┐            │
│  │                                              │            │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌─────────────┐   │            │
│  │  │ 📷│ │ 📷│ │ 📷│ │ 📷│ │  + Add More  │   │            │
│  │  │   │ │   │ │   │ │   │ │  (dashed     │   │            │
│  │  │   │ │   │ │   │ │   │ │   border)    │   │            │
│  │  │ ✕ │ │ ✕ │ │ ✕ │ │ ✕ │ │             │   │            │
│  │  └───┘ └───┘ └───┘ └───┘ └─────────────┘   │            │
│  │                                              │            │
│  │  Drag & drop or click to upload.             │            │
│  │  JPG, PNG up to 10MB each. Max 20 photos.    │            │
│  └──────────────────────────────────────────────┘            │
│  (border-2 border-dashed border-gray-300 rounded-lg p-6)     │
│  Drag active: border-brand-gold bg-brand-gold/5              │
│  Thumbnails: w-20 h-20 rounded-md object-cover               │
│  X button: absolute top-right of each thumbnail              │
│  Upload progress: thin gold bar below each uploading thumb   │
│                                                              │
│  Exterior Photo (optional)                                   │
│  [same upload component, single file]                        │
│  "Best photo of the front of the property."                  │
│                                                              │
│  ── Validation ──                                            │
│  * Address required                                          │
│  * At least 3 listing photos required                        │
│  * Errors shown inline below each field: text-error, body-sm │
└──────────────────────────────────────────────────────────────┘
```

### 7C. Step 2: Floorplan

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: FLOORPLAN                                           │
│                                                              │
│  "Upload Floorplan" (h3)                                     │
│  "Our AI will analyze the layout to plan the perfect         │
│   walking tour." (body-sm, gray-500)                         │
│                                                              │
│  ┌──────────────────────────────────────────────┐            │
│  │                                              │            │
│  │        [Floorplan icon, 48px, gray-400]      │            │
│  │                                              │            │
│  │        Drop your floorplan here              │            │
│  │        or click to browse                    │            │
│  │                                              │            │
│  │        JPG, PNG, or PDF up to 20MB           │            │
│  │                                              │            │
│  └──────────────────────────────────────────────┘            │
│  (same dropzone styling as Step 1)                           │
│                                                              │
│  ── After upload, show: ──                                   │
│                                                              │
│  ┌──────────────────────────────────────────────┐            │
│  │                                              │            │
│  │   [Floorplan image preview, max-h-96,        │            │
│  │    object-contain, rounded-lg]               │            │
│  │                                              │            │
│  └──────────────────────────────────────────────┘            │
│  [Change floorplan] (text link, below image)                 │
│                                                              │
│  ┌──────────────────────────────────────────────┐            │
│  │  🔄 Analyzing floorplan...                    │            │
│  │  [████████░░░░░░░░░░░░]                      │            │
│  │  Identifying rooms and connections            │            │
│  └──────────────────────────────────────────────┘            │
│  (bg-info-light, text-info, rounded-lg, p-4, mt-4)          │
│  Shows while LLM analyzes. Spinner + progress text.          │
│                                                              │
│  ── After analysis, show results: ──                         │
│                                                              │
│  ┌──────────────────────────────────────────────┐            │
│  │  ✅ Analysis Complete                         │            │
│  │                                              │            │
│  │  Found 9 rooms across 2 floors               │            │
│  │  Style: Modern Farmhouse                     │            │
│  │  Confidence: 85%                             │            │
│  │                                              │            │
│  │  Rooms detected:                             │            │
│  │  Living Room · Kitchen · Dining Room ·       │            │
│  │  Master Bedroom · Master Bathroom ·          │            │
│  │  Bedroom 2 · Bedroom 3 · Bathroom 2 ·       │            │
│  │  Office                                      │            │
│  └──────────────────────────────────────────────┘            │
│  (bg-success-light, rounded-lg, p-4)                         │
│  Room names as pill badges: bg-white rounded-full px-3 py-1  │
│                                                              │
│  ── OR: Skip floorplan ──                                    │
│                                                              │
│  "Don't have a floorplan?"                                   │
│  [Skip — I'll arrange rooms manually ▸]                      │
│  (text link, text-gray-500, mt-4)                            │
│  Skipping generates a default sequence based on property type │
└──────────────────────────────────────────────────────────────┘
```

### 7D. Step 3: Tour Sequence

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: TOUR SEQUENCE                                       │
│                                                              │
│  "Arrange Your Tour" (h3)                                    │
│  "Drag rooms to reorder. The camera will follow this         │
│   path through the property." (body-sm, gray-500)            │
│                                                              │
│  ┌──────────────────────────────────────────────┐            │
│  │ DRAG-AND-DROP ROOM SEQUENCER                 │            │
│  │                                              │            │
│  │  ┌────────────────────────────────────────┐  │            │
│  │  │ ⠿ 1. Exterior Front → Front Door       │  │            │
│  │  │      🚶 enter                          │  │            │
│  │  └────────────────────────────────────────┘  │            │
│  │  ┌────────────────────────────────────────┐  │            │
│  │  │ ⠿ 2. Front Door → Foyer               │  │            │
│  │  │      🚶 enter                          │  │            │
│  │  └────────────────────────────────────────┘  │            │
│  │  ┌────────────────────────────────────────┐  │            │
│  │  │ ⠿ 3. Foyer → Living Room              │  │            │
│  │  │      🚶 walk                           │  │            │
│  │  └────────────────────────────────────────┘  │            │
│  │  ┌────────────────────────────────────────┐  │            │
│  │  │ ⠿ 4. Living Room → Kitchen             │  │            │
│  │  │      🚶 walk                           │  │            │
│  │  └────────────────────────────────────────┘  │            │
│  │  ┌────────────────────────────────────────┐  │            │
│  │  │ ⠿ 5. Kitchen → Dining Room             │  │            │
│  │  │      🚶 walk                           │  │            │
│  │  └────────────────────────────────────────┘  │            │
│  │         ... (more items) ...                  │            │
│  │  ┌────────────────────────────────────────┐  │            │
│  │  │ ⠿ 10. Bedroom 3 → Backyard             │  │            │
│  │  │       🚪 exit                           │  │            │
│  │  └────────────────────────────────────────┘  │            │
│  │                                              │            │
│  │  ┌──────────────────┐                        │            │
│  │  │ + Add Room       │                        │            │
│  │  │ (outline button) │                        │            │
│  │  └──────────────────┘                        │            │
│  └──────────────────────────────────────────────┘            │
│                                                              │
│  Each drag item:                                             │
│    - bg-white, border border-gray-200, rounded-lg, p-4       │
│    - Left: drag handle (⠿ icon, text-gray-400, cursor-grab)  │
│    - Number: w-7 h-7 rounded-full bg-brand-navy text-white   │
│    - From → To: font-medium text-gray-900                    │
│    - Transition type: caption pill badge                      │
│    - Right edge: × remove button (text-gray-400 hover:red)   │
│    - Dragging: shadow-lg, ring-2 ring-brand-gold, opacity-95 │
│    - Drop target: h-1 bg-brand-gold/30 my-1 rounded          │
│                                                              │
│  OPTIONS (below list):                                       │
│                                                              │
│  ☑ Include exterior approach (first clip)                    │
│  ☑ Include backyard/outdoor (last clip)                      │
│  (checkboxes, body-sm)                                       │
│                                                              │
│  Info box:                                                   │
│  "💡 Tip: Keep the sequence between 8-12 transitions for     │
│   the best viewing experience. Currently: 10 clips           │
│   (~50 seconds of video)."                                   │
│  (bg-info-light, text-info, p-4, rounded-lg, mt-4)           │
│                                                              │
│  "+ Add Room" opens a dropdown:                              │
│  ┌─────────────────────────┐                                 │
│  │ Available rooms:         │                                 │
│  │ ○ Office                 │                                 │
│  │ ○ Laundry Room           │                                 │
│  │ ○ Garage                 │                                 │
│  │ ── Custom ──             │                                 │
│  │ [Type room name... ]     │                                 │
│  │ [Add ▸]                  │                                 │
│  └─────────────────────────┘                                 │
│  Shows rooms from floorplan analysis NOT in current sequence  │
└──────────────────────────────────────────────────────────────┘
```

### 7E. Step 4: Style & Music

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: STYLE & MUSIC                                       │
│                                                              │
│  "Customize Your Tour" (h3)                                  │
│  "Choose music, transitions, and video quality." (body-sm)   │
│                                                              │
│  ── AI MODEL ──                                              │
│                                                              │
│  "Video Quality"                                             │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │ ⊙ Standard       │  │ ○ Premium HD     │                  │
│  │   Kling 3.0      │                                  │
│  │                  │  │                  │                  │
│  │   Good quality,  │  │   Best quality,  │                  │
│  │   fast generation│  │   slower gen     │                  │
│  │                  │  │                  │                  │
│  │   ~5 min         │  │   ~10 min        │                  │
│  │   Included ✓     │  │   Pro plan+ ✓    │                  │
│  └──────────────────┘  └──────────────────┘                  │
│  (grid grid-cols-2, gap-4)                                   │
│  Selected: border-2 border-brand-navy bg-brand-navy/5        │
│  Unselected: border border-gray-200                          │
│  Locked (wrong tier): opacity-50, lock icon, "Upgrade" link  │
│                                                              │
│  ── TRANSITION STYLE ──                                      │
│                                                              │
│  "Transition Effect"                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  ⊙ Fade  │ │ ○Dissolve│ │ ○ Wipe   │ │ ○ Circle │       │
│  │  (soft   │ │ (smooth  │ │ (left-to-│ │ (iris    │       │
│  │  blend)  │ │  overlap)│ │  right)  │ │  open)   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  (grid grid-cols-4, gap-3)                                   │
│  Each: p-3, rounded-lg, border, text-center, cursor-pointer  │
│  Selected: border-brand-navy bg-brand-navy/5                 │
│  Name: body-sm font-medium                                   │
│  Description: caption text-gray-400                          │
│                                                              │
│  ── MUSIC ──                                                 │
│                                                              │
│  "Background Music"                                          │
│  ┌──────────────────────────────────────────────┐            │
│  │  Style: [Elegant ▼]                          │            │
│  │                                              │            │
│  │  Preview tracks:                             │            │
│  │                                              │            │
│  │  ┌───┐  Golden Hour Tour        1:32  ▶ ■   │            │
│  │  │ ♫ │  Warm piano + strings                 │            │
│  │  │ ⊙ │  ─────●───────────── 0:15             │            │
│  │  └───┘                                       │            │
│  │  ┌───┐  Modern Showcase          1:28  ▶     │            │
│  │  │ ♫ │  Ambient electronic                   │            │
│  │  │ ○ │                                       │            │
│  │  └───┘                                       │            │
│  │  ┌───┐  Estate Grandeur          1:45  ▶     │            │
│  │  │ ♫ │  Orchestral, sweeping                 │            │
│  │  │ ○ │                                       │            │
│  │  └───┘                                       │            │
│  │                                              │            │
│  │  🔀 Auto-match music to property style        │            │
│  └──────────────────────────────────────────────┘            │
│                                                              │
│  Music list: radio select, only one active at a time         │
│  Play button: inline audio player (HTML5 audio)              │
│  Progress bar: h-1 bg-gray-200, fill bg-brand-gold           │
│  Auto-match toggle: checked by default (uses music matching) │
│  Style dropdown filters the track list                       │
└──────────────────────────────────────────────────────────────┘
```

### 7F. Step 5: Review & Generate

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 5: REVIEW & GENERATE                                   │
│                                                              │
│  "Review Your Tour" (h3)                                     │
│  "Confirm the details below, then generate." (body-sm)       │
│                                                              │
│  ┌──────────────────────────────────────────────┐            │
│  │  SUMMARY CARD                                │            │
│  │                                              │            │
│  │  Property: 123 Main St, Austin TX            │            │
│  │  Type: Modern Farmhouse · 4 bed / 3 bath     │            │
│  │                                              │            │
│  │  Tour: 10 clips (~50 seconds)                │            │
│  │  1. Exterior Front → Front Door              │            │
│  │  2. Front Door → Foyer                       │            │
│  │  3. Foyer → Living Room                      │            │
│  │  ... (collapsed, "Show all 10" toggle)       │            │
│  │  10. Bedroom 3 → Backyard                    │            │
│  │                                              │            │
│  │  Model: Kling 3.0 (Premium HD)               │            │
│  │  Transition: Fade                            │            │
│  │  Music: "Golden Hour Tour" (Elegant)         │            │
│  │  Formats: 16:9, 9:16, 1:1, 4:5              │            │
│  │                                              │            │
│  │  ─── Estimated ───                           │            │
│  │  Generation time: ~8-12 minutes              │            │
│  │  Est. cost: $11.19 (included in your plan)   │            │
│  └──────────────────────────────────────────────┘            │
│  (bg-white, border border-gray-200, rounded-xl, p-6)         │
│  Each section divided by border-b border-gray-100             │
│  Labels: body-sm text-gray-500                                │
│  Values: body font-medium text-gray-900                       │
│  Editable sections have [Edit] link → returns to that step    │
│                                                              │
│  USAGE NOTE:                                                 │
│  "This will use 1 of your 12 remaining videos this month."  │
│  (bg-info-light, text-info, p-3, rounded-lg, mt-4)           │
│                                                              │
│  AI DISCLOSURE:                                              │
│  "⚠ This video will be generated by AI. Per NAR guidelines,  │
│   AI-generated content must be disclosed in listing           │
│   materials. Learn more →"                                   │
│  (bg-warning-light, text-warning, p-3, rounded-lg, mt-3)     │
│                                                              │
│  ┌──────────────────────────────────────┐                    │
│  │  🚀 Generate Tour                     │                    │
│  │  (gold bg, navy text, w-full, py-4,   │                    │
│  │   text-lg, font-semibold, rounded-lg)  │                    │
│  └──────────────────────────────────────┘                    │
│  (mt-6)                                                      │
│                                                              │
│  Button states:                                              │
│  - Default: gold bg, hover gold-light                        │
│  - Loading: spinner + "Submitting..." + disabled             │
│  - After click: redirect to /dashboard/jobs/[id]             │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Job Detail Page

### 8A. In-Progress State

```
┌─────────────────────────────────────────────────────────────────┐
│  JOB DETAIL (dashboard layout)                                  │
│                                                                 │
│  ← Back to Dashboard  (text link, above title)                  │
│  "123 Main St, Austin TX" (h1)                                  │
│  "Modern Farmhouse · 4 bed / 3 bath" (body-sm, gray-500)       │
│                                                                 │
│  STATUS HEADER:                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ⏳ Generating Clips                    65% Complete      │   │
│  │  [████████████████████████░░░░░░░░░░]                    │   │
│  │  Clip 7 of 10 · Estimated 4 min remaining               │   │
│  │  (progress-bar: h-3, rounded-full, bg-gray-200)          │   │
│  │  (fill: bg-brand-gold, transition-all duration-500)      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  (bg-white, rounded-xl, p-6, border border-gray-200)            │
│                                                                 │
│  PIPELINE STEPS:                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ✅ Analyzing floorplan               0:12               │   │
│  │  ✅ Generating prompts                0:08               │   │
│  │  ⏳ Generating clips (7/10)           3:42               │   │
│  │  ○  Stitching video                   —                  │   │
│  │  ○  Adding music                      —                  │   │
│  │  ○  Exporting formats                 —                  │   │
│  │  ○  Uploading to CDN                  —                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  (list, divide-y)                                               │
│  ✅ = text-success, bold                                        │
│  ⏳ = text-warning, spinner, bold                               │
│  ○  = text-gray-300                                             │
│  Time: mono, text-gray-400, right-aligned                       │
│                                                                 │
│  CLIP GRID (visible once clips start generating):               │
│  "Generated Clips" (h3, mt-8)                                   │
│                                                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │  ✅ 1  │ │  ✅ 2  │ │  ✅ 3  │ │  ✅ 4  │ │  ✅ 5  │      │
│  │ [thumb]│ │ [thumb]│ │ [thumb]│ │ [thumb]│ │ [thumb]│      │
│  │ Ext→   │ │ Door→  │ │ Foyer→ │ │ Liv→   │ │ Kit→   │      │
│  │ Door   │ │ Foyer  │ │ Living │ │ Kit    │ │ Dining │      │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │  ✅ 6  │ │  ⏳ 7  │ │  ○  8  │ │  ○  9  │ │  ○ 10  │      │
│  │ [thumb]│ │[spinner]│ │ [gray] │ │ [gray] │ │ [gray] │      │
│  │ Din→   │ │ Stair→ │ │ MBed→  │ │ MBath→ │ │ Bed3→  │      │
│  │ Stairs │ │ MBed   │ │ MBath  │ │ Bed3   │ │ Yard   │      │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │
│                                                                 │
│  (grid grid-cols-5, gap-3)                                      │
│  Each clip card: w-full aspect-video rounded-lg overflow-hidden │
│  Complete: thumbnail from first frame, green badge              │
│  Generating: pulsing gray bg, spinner overlay                   │
│  Pending: bg-gray-100, dashed border, gray text                 │
│  Failed: bg-error-light, red badge, [Retry] button              │
│  Click on complete clip → opens preview modal                   │
│                                                                 │
│  ── Clip preview modal ──                                       │
│  ┌──────────────────────────────────────────────┐              │
│  │  Clip 3: Foyer → Living Room         [Close]│              │
│  │                                              │              │
│  │  ┌──────────────────────────────────────┐    │              │
│  │  │                                      │    │              │
│  │  │     VIDEO PLAYER                     │    │              │
│  │  │     (16:9, controls, autoplay)       │    │              │
│  │  │                                      │    │              │
│  │  └──────────────────────────────────────┘    │              │
│  │                                              │              │
│  │  Duration: 5.2s · Model: Kling 3.0           │              │
│  │  Cost: $0.87                                 │              │
│  │                                              │              │
│  │  Prompt used:                                │              │
│  │  "Smooth steadicam forward dolly from..."    │              │
│  │  (collapsed, expandable, mono, text-sm)      │              │
│  └──────────────────────────────────────────────┘              │
│  (modal: bg-white, rounded-xl, max-w-2xl, shadow-xl,           │
│   backdrop: bg-black/50)                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 8B. Complete State

```
┌─────────────────────────────────────────────────────────────────┐
│  JOB DETAIL — COMPLETE                                          │
│                                                                 │
│  STATUS HEADER:                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ✅ Tour Complete!                      8m 42s total     │   │
│  │  [████████████████████████████████████]  100%            │   │
│  │  10 clips · 52 seconds · $11.19 API cost                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  MAIN VIDEO PLAYER:                                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │            FULL VIDEO PLAYER                             │   │
│  │            (16:9, native controls, poster frame)          │   │
│  │            (max-w-4xl, mx-auto, rounded-xl, shadow-lg)    │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  DOWNLOAD PANEL:                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  "Download Your Tour" (h3)                               │   │
│  │                                                          │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │   │
│  │  │ 📺 Landscape  │ │ 📱 Vertical  │ │ ◻ Square     │     │   │
│  │  │ 16:9         │ │ 9:16         │ │ 1:1          │     │   │
│  │  │ 1920×1080    │ │ 1080×1920    │ │ 1080×1080    │     │   │
│  │  │ MLS, YouTube │ │ Reels, TikTok│ │ Instagram    │     │   │
│  │  │ [Download ↓] │ │ [Download ↓] │ │ [Download ↓] │     │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘     │   │
│  │  ┌──────────────┐ ┌──────────────┐                       │   │
│  │  │ 📐 Portrait   │ │ 🖼 Thumbnail  │                       │   │
│  │  │ 4:5          │ │ JPG          │                       │   │
│  │  │ 1080×1350    │ │ 1920×1080    │                       │   │
│  │  │ Facebook     │ │ Cover image  │                       │   │
│  │  │ [Download ↓] │ │ [Download ↓] │                       │   │
│  │  └──────────────┘ └──────────────┘                       │   │
│  │                                                          │   │
│  │  [Download All (ZIP) ↓]                                  │   │
│  │  (outline button, full width, mt-4)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Download cards: bg-white border rounded-lg p-4                 │
│  Format icon + label: top                                       │
│  Resolution + use case: caption text-gray-500                   │
│  Button: sm outline button, w-full                              │
│  Locked formats (wrong tier): grayed + "Upgrade to Pro" link    │
│                                                                 │
│  SHARE SECTION:                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  "Share" (h3)                                            │   │
│  │                                                          │   │
│  │  Direct link:                                            │   │
│  │  [https://videos.tourreel.com/abc123/master.mp4   📋]    │   │
│  │  (input readonly + copy button)                          │   │
│  │                                                          │   │
│  │  Embed code:                                             │   │
│  │  [<video src="https://videos.t...   📋]                  │   │
│  │  (input readonly + copy button)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│  Copy button: "Copied!" toast on click (2s duration)            │
│                                                                 │
│  CLIP GRID (same as in-progress but all complete, all clickable)│
│                                                                 │
│  METADATA:                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Created: Feb 10, 2026 at 3:42 PM                       │   │
│  │  Duration: 52 seconds                                    │   │
│  │  Clips: 10                                               │   │
│  │  Model: Kling 3.0 (Standard)                             │   │
│  │  Music: "Golden Hour Tour"                               │   │
│  │  Transition: Fade                                        │   │
│  │  API Cost: $11.19                                        │   │
│  │  Job ID: 8f3a2b1c-4d5e-6f7a-8b9c-0d1e2f3a4b5c          │   │
│  └──────────────────────────────────────────────────────────┘   │
│  (collapsible, default collapsed, "Show details" toggle)        │
│  (bg-gray-50, p-4, rounded-lg, body-sm)                         │
│  (key-value pairs: key text-gray-500, value text-gray-700)      │
└─────────────────────────────────────────────────────────────────┘
```

### 8C. Failed State

```
┌──────────────────────────────────────────────────────────────┐
│  STATUS HEADER:                                              │
│  ┌──────────────────────────────────────────────────┐        │
│  │  ❌ Generation Failed                   5m 12s   │        │
│  │  [████████████████░░░░░░░░░░░░░░░░░]   45%      │        │
│  │  Error: Clip 5 failed after 3 retries            │        │
│  │  "kie.ai returned 503 — service temporarily     │        │
│  │   unavailable"                                   │        │
│  │                                                  │        │
│  │  ┌──────────────┐  ┌────────────────────┐        │        │
│  │  │ 🔄 Retry Tour │  │ Try Different Model│        │        │
│  │  │ (gold button) │  │ (outline button)   │        │        │
│  │  └──────────────┘  └────────────────────┘        │        │
│  └──────────────────────────────────────────────────┘        │
│  (bg-error-light, border border-error/20)                    │
│                                                              │
│  CLIP GRID shows which clips succeeded and which failed:     │
│  Failed clips: red border, ❌ badge, error message tooltip   │
│  Successful clips still visible and playable                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. My Listings Page

```
┌──────────────────────────────────────────────────────────────┐
│  MY LISTINGS (dashboard layout)                              │
│                                                              │
│  "My Listings" (h1)                                          │
│  "Manage your saved property listings." (body-sm, gray-500)  │
│                                                              │
│  ┌──────────────────┐                                        │
│  │ + Add Listing     │  🔍 [Search listings...]              │
│  └──────────────────┘                                        │
│  (flex justify-between, mb-6)                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ ┌────┐  123 Main St, Austin TX                       │    │
│  │ │ 📷 │  Modern Farmhouse · 4 bed / 3 bath · 2,400sf │    │
│  │ │    │  $450,000 · MLS# TX123456                    │    │
│  │ │    │  2 tours generated                           │    │
│  │ └────┘                              [Edit] [⋯]     │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ ┌────┐  456 Oak Ave, Dallas TX                       │    │
│  │ │ 📷 │  Colonial · 3 bed / 2 bath · 1,800sf        │    │
│  │ │    │  $325,000 · MLS# TX789012                    │    │
│  │ │    │  1 tour generated                            │    │
│  │ └────┘                              [Edit] [⋯]     │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  Each row: clickable, navigates to listing detail (future)   │
│  Photo: w-20 h-20, rounded-md, object-cover (exterior photo) │
│  [...] menu: Create Tour | Edit | Delete                     │
│  "Create Tour" in menu → wizard Step 1 with listing selected │
│                                                              │
│  ── Empty state ──                                           │
│  Same pattern as dashboard empty state but                   │
│  "Add your first listing to get started."                    │
│  [+ Add Listing] button                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Settings Page

```
┌──────────────────────────────────────────────────────────────┐
│  SETTINGS (dashboard layout)                                 │
│                                                              │
│  "Settings" (h1)                                             │
│                                                              │
│  TAB BAR:                                                    │
│  [Profile]  [Subscription]  [Billing History]                │
│  (inline tabs, border-b, active tab: border-b-2 navy)        │
│                                                              │
│  ── TAB: Profile ──                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Profile Information                                 │    │
│  │                                                      │    │
│  │  ┌──────┐  Full Name *  [Sarah Johnson_______]       │    │
│  │  │Avatar│  Email        john@email.com (from Clerk)  │    │
│  │  │      │  Phone        [_______________]            │    │
│  │  └──────┘  Company      [Keller Williams___]         │    │
│  │            License #    [TX-123456________]           │    │
│  │                                                      │    │
│  │            ┌──────────┐                              │    │
│  │            │ Save     │                              │    │
│  │            └──────────┘                              │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ── TAB: Subscription ──                                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Current Plan                                        │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────┐      │    │
│  │  │  PRO PLAN                   $149/month     │      │    │
│  │  │  15 videos/month · All formats · Premium AI│      │    │
│  │  │                                            │      │    │
│  │  │  Current period: Feb 1 - Feb 28, 2026      │      │    │
│  │  │  Usage: 3 of 15 videos used                │      │    │
│  │  │  [████░░░░░░░░░░░] 20%                    │      │    │
│  │  │                                            │      │    │
│  │  │  [Manage Subscription]  [Cancel Plan]      │      │    │
│  │  │  (outline button)       (text link, red)   │      │    │
│  │  └────────────────────────────────────────────┘      │    │
│  │                                                      │    │
│  │  "Manage Subscription" → Stripe Customer Portal      │    │
│  │  "Cancel Plan" → confirmation dialog first           │    │
│  │                                                      │    │
│  │  ── Upgrade options (if not on Team) ──              │    │
│  │  Pricing cards for higher tiers (same as pricing pg) │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ── TAB: Billing History ──                                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Date         Description          Amount    Status  │    │
│  │  Feb 1, 2026  Pro plan - Monthly    $149.00  Paid    │    │
│  │  Jan 1, 2026  Pro plan - Monthly    $149.00  Paid    │    │
│  │  Dec 1, 2025  Starter - Monthly     $79.00   Paid    │    │
│  └──────────────────────────────────────────────────────┘    │
│  (table: full width, divide-y, body-sm)                      │
│  Status badges: Paid = success, Failed = error               │
│  "Powered by Stripe" small text at bottom                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Shared Component Specs

### 11A. Button Variants

```
PRIMARY (gold):
  bg-brand-gold text-brand-navy-dark font-semibold
  hover:bg-brand-gold-light
  active:bg-brand-gold/90
  disabled:opacity-50 cursor-not-allowed
  rounded-lg px-5 py-2.5

SECONDARY (navy outline):
  bg-transparent border-2 border-brand-navy text-brand-navy font-semibold
  hover:bg-brand-navy/5
  rounded-lg px-5 py-2.5

GHOST:
  bg-transparent text-gray-500
  hover:bg-gray-100 hover:text-gray-700
  rounded-lg px-4 py-2

DANGER:
  bg-error text-white
  hover:bg-error/90
  rounded-lg px-5 py-2.5

Sizes:
  sm: text-sm px-3 py-1.5
  md: (default above)
  lg: text-lg px-8 py-3.5

Loading state (all buttons):
  Add spinner (animate-spin w-4 h-4) left of text
  Text changes to action verb ("Saving..." / "Generating...")
  Pointer-events: none
```

### 11B. Form Inputs

```
TEXT INPUT:
  w-full px-4 py-2.5 border border-gray-300 rounded-lg
  bg-white text-gray-900 placeholder:text-gray-400
  focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy
  disabled:bg-gray-100 disabled:text-gray-400

  Error state:
    border-error focus:ring-error/20 focus:border-error
    + error message below: text-error text-sm mt-1

LABEL:
  block text-sm font-medium text-gray-700 mb-1.5

SELECT:
  Same as text input + appearance-none + custom chevron bg-image

TEXTAREA:
  Same as text input + min-h-[120px] resize-y

FILE UPLOAD DROPZONE:
  border-2 border-dashed border-gray-300 rounded-xl p-8
  bg-gray-50 text-center cursor-pointer
  hover:border-brand-navy hover:bg-brand-navy/5
  drag-active: border-brand-gold bg-brand-gold/5
  transition-colors duration-200
```

### 11C. Toast Notifications

```
Position: fixed bottom-right (bottom-6 right-6)
Stack: newest on top, max 3 visible, older ones fade out

SUCCESS:
  bg-success-light border-l-4 border-success p-4 rounded-lg shadow-lg
  Icon: ✅ (CheckCircle from Lucide)
  Auto-dismiss: 4 seconds

ERROR:
  bg-error-light border-l-4 border-error p-4 rounded-lg shadow-lg
  Icon: ❌ (XCircle from Lucide)
  Auto-dismiss: 8 seconds (errors persist longer)

INFO:
  bg-info-light border-l-4 border-info
  Auto-dismiss: 4 seconds

All toasts:
  Enter: slide-in from right + fade-in (200ms)
  Exit: fade-out + slide-right (200ms)
  Close button (X) top-right of each toast
  Use `sonner` library for implementation
```

### 11D. Status Badges

```
COMPLETE:   bg-success-light text-success text-xs font-medium px-2.5 py-0.5 rounded-full
PROCESSING: bg-warning-light text-warning text-xs font-medium px-2.5 py-0.5 rounded-full
              + spinner (animate-spin w-3 h-3 mr-1)
FAILED:     bg-error-light text-error text-xs font-medium px-2.5 py-0.5 rounded-full
PENDING:    bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full
CANCELLED:  bg-gray-100 text-gray-400 text-xs font-medium px-2.5 py-0.5 rounded-full line-through
```

### 11E. Loading Skeletons

```
Use for any data that loads async:

SKELETON LINE:
  h-4 bg-gray-200 rounded animate-pulse

SKELETON BLOCK:
  aspect-video bg-gray-200 rounded-lg animate-pulse

SKELETON CARD:
  bg-white rounded-lg p-6 border border-gray-200
  Inside: 3-4 skeleton lines of varying widths (w-3/4, w-1/2, w-full)
  Staggered: each line offset slightly for natural feel

Dashboard loading: show 4 stat skeleton blocks + 3 job skeleton rows
Job detail loading: show skeleton video player + skeleton clip grid
```

---

## 12. Responsive Behavior

### Breakpoints (Tailwind defaults)

```
sm:  640px   (large phones landscape)
md:  768px   (tablets)
lg:  1024px  (small laptops)
xl:  1280px  (desktops)
2xl: 1536px  (large screens)
```

### Key Responsive Rules

```
SIDEBAR:
  < md:  Hidden. Hamburger menu in header opens slide-in overlay.
  >= md: Fixed sidebar visible.

GRID LAYOUTS:
  Stat cards:    grid-cols-2 (mobile) → grid-cols-4 (desktop)
  Feature cards: grid-cols-1 (mobile) → grid-cols-2 (desktop)
  Clip grid:     grid-cols-2 (mobile) → grid-cols-3 (tablet) → grid-cols-5 (desktop)
  Pricing cards: grid-cols-1 stacked (mobile) → grid-cols-3 (desktop)
  Download panel: grid-cols-2 (mobile) → grid-cols-3 → grid-cols-5 (desktop)

WIZARD:
  Progress stepper: horizontal (desktop) → vertical left-aligned (mobile)
  Step content: full width on all sizes, reduced padding on mobile

TEXT:
  display:  text-3xl (mobile) → text-5xl (desktop)
  h1:       text-2xl (mobile) → text-4xl (desktop)
  h2:       text-xl (mobile)  → text-3xl (desktop)

MODALS:
  < md:  Full-screen (inset-0, rounded-none)
  >= md: Centered card (max-w-2xl, rounded-xl)

VIDEO PLAYER:
  Always 16:9 aspect ratio
  max-w-4xl on desktop, full-width on mobile

JOB LIST:
  < md:  Card layout (stacked, no table)
  >= md: Row layout (as wireframed above)
```

---

## 13. Animation & Micro-Interactions

```
PAGE TRANSITIONS:
  None. Standard Next.js page loads. No fancy page transitions for MVP.

HOVER EFFECTS:
  Buttons:      transition-colors duration-150
  Cards:        transition-shadow duration-200 hover:shadow-md
  Links:        transition-colors duration-150 hover:text-brand-navy

LOADING STATES:
  Skeleton:     animate-pulse (Tailwind built-in)
  Spinner:      animate-spin (Tailwind built-in), w-5 h-5 border-2 border-brand-navy
                border-t-transparent rounded-full
  Progress bar: transition-all duration-500 ease-out (smooth width changes)

TOAST ENTER/EXIT:
  Handled by sonner library defaults.

DRAG AND DROP (Room Sequencer):
  Picked up item:  shadow-lg, scale-102, ring-2 ring-brand-gold/50
  Drop indicator:  h-1 bg-brand-gold/30 rounded, animate-pulse
  Settling:        transition-transform duration-200

WIZARD STEP TRANSITION:
  Current step slides in from right (translateX 20px → 0, opacity 0→1)
  Duration: 200ms ease-out

MODAL:
  Backdrop: opacity 0→1 (150ms)
  Content: scale-95→100 + opacity 0→1 (200ms ease-out)
  Close: reverse (150ms)

CLIP COMPLETION (in job detail):
  When a clip status changes from generating to complete:
  Brief green flash (ring-2 ring-success for 1s then fade)
  Thumbnail fades in (opacity 0→1, 300ms)
```

---

## 14. Accessibility Requirements

```
KEYBOARD NAVIGATION:
  All interactive elements focusable via Tab
  Focus ring: ring-2 ring-brand-navy/30 ring-offset-2
  Enter/Space activates buttons and links
  Escape closes modals and dropdowns
  Arrow keys navigate within dropdown menus and radio groups

SCREEN READER:
  All images have alt text
  Form inputs have associated labels (htmlFor)
  Status badges have aria-label (e.g., aria-label="Status: Complete")
  Progress bar: role="progressbar" aria-valuenow={65} aria-valuemin={0} aria-valuemax={100}
  Toast notifications: role="alert" aria-live="polite"
  Modal: role="dialog" aria-modal="true" aria-labelledby={titleId}
  Drag-and-drop: aria-grabbed, aria-dropeffect, plus keyboard alternatives
    (provide Up/Down buttons alongside drag handles for keyboard users)

COLOR CONTRAST:
  All text meets WCAG 2.1 AA (4.5:1 for body, 3:1 for large text)
  Gray-500 on white = 4.6:1 ✓ (barely passes — use gray-600 if in doubt)
  Brand navy on white = 8.3:1 ✓
  Brand gold on navy = 5.2:1 ✓
  Error red on error-light = 5.8:1 ✓

MOTION:
  Respect prefers-reduced-motion:
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }

TOUCH TARGETS:
  Minimum 44×44px for all interactive elements on mobile
  Drag handles: minimum 48×48px touch area
```

---

*End of UI/UX Wireframes. This document describes every screen, every state, every component, and every interaction in the TourReel frontend. Combined with the Implementation Spec (file paths + API contracts) and the Prompt Playbook (creative content), an AI coding agent has everything needed to build the complete application.*
