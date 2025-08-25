# Tax4Us n8n Cloud Workflow Deployment Guide

This guide covers deploying the Tax4Us content automation workflows to the Tax4Us n8n Cloud instance.

## Prerequisites

- Access to Tax4Us n8n Cloud: `https://tax4usllc.app.n8n.cloud`
- Tax4Us n8n Cloud API key
- Node.js installed
- Task runner (optional, for easier management)

## ✅ Deployment Status

**Successfully Deployed to Tax4Us n8n Cloud:**
- **Spec → Draft Workflow**: `B0rkE9bGHUcfdFLv` ✅
- **Approve → Publish Workflow**: `vKrIhzCAO73mm2Dw` ✅  
- **Weekly Refresh Workflow**: `BxMOGYL2A16MGzoN` ✅
- **Asset Uploader Workflow**: `ejmEneSx3pklBVxM` ✅

**Note**: Cron workflows need manual activation in n8n UI due to trigger configurations.

## Quick Start

### 1. Install Dependencies

```bash
npm install undici
```

Or use the task runner:
```bash
task install
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` and set your Tax4Us n8n Cloud API key:
```bash
N8N_API_URL=https://tax4usllc.app.n8n.cloud
N8N_API_KEY=your-tax4us-n8n-cloud-api-key-here
```

### 3. Validate Workflows

Check that all workflow JSON files are valid:
```bash
node scripts/n8n/validate.mjs
```

Or use the task runner:
```bash
task validate
```

### 4. Deploy Workflows

Deploy all workflows to Tax4Us n8n Cloud:
```bash
node scripts/n8n/push.mjs
```

Or deploy and activate cron/approval workflows:
```bash
node scripts/n8n/push.mjs --activate
```

Using task runner:
```bash
task push-activate
```

## Workflow Overview

The system includes four main workflows:

### 1. T4US — Spec → Draft (WP + ACF)
- **Trigger**: Google Sheets polling for new content specs
- **Function**: Creates WordPress drafts with ACF fields
- **Status**: Drafted content ready for review

### 2. T4US — Approve → Publish (+ Polylang link, Social, Purge)
- **Trigger**: Email approval or Google Sheets status change
- **Function**: Publishes content, links translations, shares on social media
- **Status**: Content published and promoted

### 3. T4US — Weekly Refresh (Links + FAQ Plan)
- **Trigger**: Cron job (Monday 7:30 AM Chicago time)
- **Function**: Analyzes existing content for improvement opportunities
- **Status**: Weekly optimization report generated

### 4. T4US — Asset Uploader (Hero image)
- **Trigger**: Webhook for media brief requests
- **Function**: Generates AI images and uploads to WordPress
- **Status**: Hero images created and attached

## Required Credentials

After importing workflows, map these credentials in the n8n Cloud interface:

- **Wordpress account**: Tax4Us WordPress site access
- **OpenAi account**: OpenAI API access for content generation
- **Google Sheets account**: Access to `tax4us_content_specs` spreadsheet
- **Gmail OAuth2 API**: Email notifications
- **Facebook Graph account**: Social media sharing
- **LinkedIn account**: LinkedIn posting

## Google Sheets Structure

The system expects a Google Sheet named `tax4us_content_specs` with a `pages` tab containing:

| Column | Description |
|--------|-------------|
| id | Unique identifier |
| type | page/service/faq/glossary/case_study |
| title | Content title |
| slug_he | Hebrew slug |
| slug_en | English slug |
| language | he/en |
| persona | Target audience |
| keywords | SEO keywords |
| outline | Content outline |
| cta_text | Call-to-action text |
| target_url | Target URL |
| internal_targets | Internal linking targets |
| media_brief | Image generation brief |
| group_id | Translation group ID |
| status | New/Drafted/Needs_Approval/Approved/Published |
| wp_id | WordPress post ID |
| preview_url | Preview URL |
| acf_ready | ACF fields ready |
| published_at | Publication timestamp |

## WordPress Integration

The workflows integrate with Tax4Us WordPress site (`https://tax4us.co.il`) and support:

- **Polylang Pro**: Multilingual content management
- **ACF + ACF to REST API**: Custom fields
- **Rank Math SEO**: SEO optimization
- **LiteSpeed Cache**: Performance optimization

## Monitoring and Logs

- **n8n Cloud Interface**: View execution logs at `https://tax4usllc.app.n8n.cloud`
- **Email Notifications**: Review and approval emails
- **Google Sheets**: Status tracking and reporting

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Verify the API key has write permissions
   - Check that the key is for Tax4Us n8n Cloud, not Rensto

2. **Credential Mapping**
   - Ensure all credentials are properly mapped in n8n Cloud
   - Test each credential individually

3. **WordPress API Issues**
   - Verify WordPress REST API is enabled
   - Check ACF to REST API plugin is active
   - Ensure proper authentication

4. **Google Sheets Access**
   - Verify access to `tax4us_content_specs` spreadsheet
   - Check sheet structure matches expected format

### Getting Help

- Check n8n Cloud execution logs for detailed error messages
- Verify all API endpoints are accessible
- Test individual workflow nodes for connectivity

## Security Notes

- API keys are stored in environment variables, not in workflow files
- Credentials are mapped in n8n Cloud interface, not embedded in workflows
- All communication uses HTTPS
- Webhook endpoints are secured

## Maintenance

### Regular Tasks

1. **Monitor Workflow Executions**: Check n8n Cloud dashboard regularly
2. **Review Email Notifications**: Respond to approval requests
3. **Update Content Specs**: Maintain Google Sheets with new content
4. **Check Social Media**: Verify posts are being published correctly

### Updates

To update workflows:
1. Modify the JSON files in `workflows/n8n/`
2. Run `task validate` to check syntax
3. Run `task push` to deploy updates
4. Test the updated workflows

## Support

For technical support with Tax4Us n8n Cloud workflows:
- Check n8n Cloud documentation
- Review execution logs for error details
- Contact the development team for workflow-specific issues
