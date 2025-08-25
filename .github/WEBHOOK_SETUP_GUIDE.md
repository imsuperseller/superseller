# GitHub Webhook Configuration Guide

## 🔗 **Setting Up GitHub Webhooks for LightRAG**

### **Step 1: Add Repository Secrets**
1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets:
   - `LIGHTRAG_WEBHOOK_URL`: Your LightRAG server webhook URL
   - `LIGHTRAG_API_KEY`: Your LightRAG API key
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `GITHUB_WEBHOOK_SECRET`: A secure webhook secret

### **Step 2: Configure Webhook**
1. Go to Settings > Webhooks
2. Click "Add webhook"
3. Configure:
   - **Payload URL**: Your LightRAG webhook URL
   - **Content type**: application/json
   - **Secret**: Your webhook secret
   - **Events**: Select "Just the push event" or customize

### **Step 3: Test Integration**
1. Make a change to any documentation file
2. Push to main branch
3. Check LightRAG server logs for webhook receipt
4. Verify knowledge graph update

## 🔧 **Troubleshooting**

### **Webhook Not Receiving Events**
- Check webhook URL is accessible
- Verify secret is correctly configured
- Check GitHub webhook delivery logs

### **LightRAG Not Processing**
- Verify API key is correct
- Check LightRAG server logs
- Ensure GitHub token has proper permissions

### **Knowledge Graph Not Updating**
- Check LightRAG processing logs
- Verify entity/relationship configuration
- Test manual knowledge graph query
