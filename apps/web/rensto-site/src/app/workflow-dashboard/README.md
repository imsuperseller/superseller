# Workflow Dashboard

Real-time dashboard for viewing Rensto's workflow templates, clients, and analytics from Firestore.

## URL

Local: http://localhost:3000/workflow-dashboard
Production: https://rensto.com/workflow-dashboard

## Setup

### 1. Install Firebase dependency

```bash
cd apps/web/rensto-site
npm install firebase
```

### 2. Add Firebase environment variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rensto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rensto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rensto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Get these values from Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project "rensto"
3. Click the gear icon → Project settings
4. Scroll down to "Your apps" → Web app
5. Copy the config values

### 3. Run the app

```bash
npm run dev
```

Visit http://localhost:3000/workflow-dashboard

## Features

### Overview Tab
- Total templates count with active status
- Total clients with breakdown (active/prospects)
- Total revenue from all clients
- Total nodes across all workflows
- Templates by category bar chart
- Clients by industry breakdown
- Active clients cards

### Templates Tab
- Filter by category
- Grid view of all templates
- Shows: name, category, tier, status, node count, pricing
- Color-coded status badges

### Clients Tab
- Stats cards (Active, Prospects, Lead Gen Tests)
- Full table view with:
  - Name, Contact, Industry, Status, Tier, Revenue

## Data Sources

All data comes from Firebase Firestore collections:
- `/templates` - 121 workflow templates
- `/clients` - 14 clients/prospects
- `/analytics` - Weekly aggregated analytics

## Styling

Uses Rensto brand colors:
- Primary Red: #fe3d51
- Primary Blue: #1eaef7
- Accent Orange: #bf5700
- Accent Cyan: #5ffbfd
- Background: #110d28
- Card Background: #1a1438
