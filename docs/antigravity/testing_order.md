# Rensto Operational Testing Protocol 🧪

Follow this order to ensure the entire "Machine" is working from lead-to-fulfillment.

## 1. The "Money" Test (Stripe -> Instance)
- [ ] **Action**: Create a Stripe Checkout session using one of the new Price IDs (e.g. Lead Machine `price_1SnYffDE8rt1dEs1oFKGGkQx`).
- [ ] **Verification**: 
  - Check Firestore `service_instances` collection.
  - Does a new document appear with `status: "pending_setup"`?
  - Does the `productId` match the template ID?

## 2. The "Handshake" Test (Success Page -> Form)
- [ ] **Action**: Navigate to the `/success` page with the `session_id` and `product_id` from step 1.
- [ ] **Verification**:
  - Does the specific form for that product load (e.g. "YouTube URL" for the cloner)?
  - Submit the form.
  - Does the Firestore record update with the `configuration` data?

## 3. The "Cloner" Test (Master Controller -> n8n)
- [ ] **Action**: Check n8n execution history for the `Rensto Master Controller`.
- [ ] **Verification**:
  - Did it trigger upon form submission?
  - Did it successfully fetch the "Master" template and "create" a new workflow for the client?

## 4. The "Nexus" Test (Admin Dashboard)
- [ ] **Action**: Open the **Admin Dashboard** -> **Projects** tab.
- [ ] **Verification**:
  - Does the new implementation appear in the "Active Missions" table?
  - Try toggling a status to "Active" and see if the Customer Dashboard reflects it.

## 5. The "BI" Test (Metrics Snapshot)
- [ ] **Action**: Manually trigger the `METRICS-COLLECTOR` workflow in n8n.
- [ ] **Verification**:
  - Does a record appear in `metrics_snapshots` collection?
  - Open Looker Studio and refresh the data source to see the new point.
