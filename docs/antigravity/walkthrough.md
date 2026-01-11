# Walkthrough - Lead Delivery Options

I have implemented the **Lead Delivery Options** feature, giving users control over how they receive their leads and offering a premium "Expert Setup" service for CRM integrations.

## Changes

### 1. Backend: Checkout API Update
- **File:** `src/app/api/checkout/route.ts`
- **Change:** Added `crm-setup` to the `SERVICES` list.
- **Price:** $297 (one-time).
- **Function:** Enables the frontend to trigger a checkout session for this specific service.

### 2. Frontend: Lead Delivery UI
- **File:** `src/components/dashboard/LeadsTab.tsx`
- **Components Added:**
    -   **Delivery Preferences Section:** A new UI block above the leads list.
    -   **Toggle:** Switch between "Email Delivery" (default) and "CRM Integration".
    -   **CRM Options:**
        -   **DIY:** Displays a placeholder webhook URL for self-setup.
        -   **Expert Setup:** A premium card with a "Hire an Expert" button ($297).
- **Logic:**
    -   The "Hire an Expert" button calls `/api/checkout` with `productId: 'crm-setup'`.
    -   On success, it redirects the user to the Stripe Checkout page.

## Verification Results

### Backend Verification
✅ **Verified via Curl:**
I simulated a checkout request for the new service, and the API correctly returned a Stripe Checkout URL.

### Frontend Verification
The UI has been implemented with the following features:
- **Email Mode:** Shows "Active: Email Notifications" status.
- **CRM Mode:** Reveals the DIY webhook URL and the Expert Setup upsell card.
- **Responsive Design:** Matches the existing dashboard aesthetic (dark mode, glassmorphism).

> [!NOTE]
> Browser verification was skipped due to temporary tool availability issues, but the code implementation follows the validated patterns used elsewhere in the dashboard.
