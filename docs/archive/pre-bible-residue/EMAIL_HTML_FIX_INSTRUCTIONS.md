# Fix for Email HTML Expression Issue

## Problem
The `Send email` node's HTML field is not evaluating `{{ }}` expressions correctly when using `=` prefix. The email shows raw template expressions instead of the actual content.

## Solution
Add a **Set node** before the `Send email` node to prepare the HTML using n8n expressions, then reference that field in the email node.

## Steps to Fix

### 1. Add Set Node
- **Node Name**: `Set - Prepare Email HTML`
- **Node Type**: Set
- **Position**: Between `Airtable - Create1`/`Airtable - Update1` and `Send email` (around position [-352, 1824])

### 2. Configure Set Node Assignments
Add three assignments:

**Assignment 1: emailBody**
- Name: `emailBody`
- Value: `={{ $json.fields['Reply Email Body'] || $json.replyEmailBody }}`

**Assignment 2: bookingLink**
- Name: `bookingLink`
- Value: `={{ $json.fields['Booking Link'] || $json.bookingLink || 'https://tidycal.com/rensto/discovery' }}`

**Assignment 3: emailHtml**
- Name: `emailHtml`
- Value: `={{ '<p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">' + $json.emailBody + '</p>\n\n<p style="margin-top: 24px; font-family: Arial, sans-serif; font-size: 16px;"><strong>Book a call:</strong> <a href="' + $json.bookingLink + '" style="color: #1eaef7; text-decoration: none; font-weight: 600;">' + $json.bookingLink + '</a></p>' }}`

### 3. Update Connections
- **Remove**: `Airtable - Create1` → `Send email`
- **Remove**: `Airtable - Update1` → `Send email`
- **Add**: `Airtable - Create1` → `Set - Prepare Email HTML`
- **Add**: `Airtable - Update1` → `Set - Prepare Email HTML`
- **Add**: `Set - Prepare Email HTML` → `Send email`

### 4. Update Send Email Node
- **HTML Field**: Change from complex expression to: `={{ $json.emailHtml }}`

## Why This Works
The Set node evaluates n8n expressions properly and outputs a simple string field. The email node can then reference this field directly without needing to evaluate complex expressions in the HTML field.

## Testing
After making these changes, test the workflow with a webhook trigger to verify:
1. The Set node correctly extracts emailBody and bookingLink
2. The emailHtml field contains properly formatted HTML
3. The email is sent with the correct content (not raw expressions)
