#!/bin/bash

# QuickBooks MCP Server Deployment Script
# This script installs the CData QuickBooks MCP server on Racknerd VPS

echo "🚀 DEPLOYING QUICKBOOKS MCP SERVER TO RACKNERD VPS"

# Configuration
RACKNERD_IP="172.245.56.50"
RACKNERD_PASS="${VPS_PASSWORD}"
MCP_SERVERS_DIR="/opt/mcp-servers"

# QuickBooks credentials
QUICKBOOKS_APP_ID="ad9e9fe8-0977-4ece-a2d3-292ab583359f"
QUICKBOOKS_CLIENT_ID="${QB_CLIENT_ID}"
QUICKBOOKS_CLIENT_SECRET="${QB_CLIENT_SECRET}"
QUICKBOOKS_REALM_ID="9341454031329905"
QUICKBOOKS_ACCESS_TOKEN="eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..r_0S72OaED8qOuTsyfaprg.J-oQTAwkRmUMtB1Rsutjp1pC-a66-uwlkLo47nuBqo3snX5yBDbl8PsmcPELWcD8fDeTW9Z3MaM9gg-uvVNFF5xx3Llqw04mOHsYEOPfWTAU-SC8Ma07w28MiYkiSNQmBsIplzfkMSyTXW5FfzA7hCyqvz1834FPmxmikpnw2Ugxep4n3I3rXqEBN0M0eNZG2MDQ6_2y51H1WRgiEvpf-FpdQZwEqdDbHMTSMnSKY-WmO4VaDya0QDMm9AdjHF3CuXFO6eHkqOHjZrcgKmUvGM3pqtDdPJgHZTbcLSr1jBhgNTwfV7oQ5LngTQFHFrMcYKH6opIyINMssPfAKGGyebikV2u8rW6opfxqvO5qJoiSuz41ac6XvR2AkoHLEeTusUjQV65U52kQcqPzjv9Ag2dJg9lLsR_zJfoeg3beCu2FmJlC_8PGGdVo6OrItBvRHOH06Mzr72APxP4_FRg0pcJEPaK9Hkoikop_zGBf_FyFrXIQ-ygbiIfry1rX2pX1vZPRqNu-N4KkYrN17op09DcO6tanYVsn2VRYOhM8qI3Mq7KMX5SKC7wAdmKhOEgMq2i_2dHOxEuN2Fh7VWIAsNcienmGksyf8i-PHQl8P3g5nJzVCQU_YftOfEy_B30G.KaNRlBMwRJd92fCDzz1HEw"
QUICKBOOKS_REFRESH_TOKEN="${QB_REFRESH_TOKEN}"

echo "📋 Step 1: Creating deployment commands..."

# Create the deployment commands
cat > quickbooks-mcp-deploy.sh << 'EOF'
#!/bin/bash

echo "🔧 Installing QuickBooks MCP Server..."

# Create MCP servers directory
mkdir -p /opt/mcp-servers
cd /opt/mcp-servers

# Install Java if not present
if ! command -v java &> /dev/null; then
    echo "📦 Installing Java..."
    apt update
    apt install -y openjdk-11-jdk
fi

# Install Maven if not present
if ! command -v mvn &> /dev/null; then
    echo "📦 Installing Maven..."
    apt install -y maven
fi

# Clone QuickBooks MCP server
echo "📥 Cloning QuickBooks MCP server..."
git clone https://github.com/CDataSoftware/quickbooks-mcp-server-by-cdata.git
cd quickbooks-mcp-server-by-cdata

# Build the server
echo "🔨 Building QuickBooks MCP server..."
mvn clean install

# Create QuickBooks configuration
echo "⚙️ Creating QuickBooks configuration..."
cat > /opt/mcp-servers/quickbooks.prp << 'QB_CONFIG'
Prefix=quickbooks
ServerName=CDataQuickBooks
ServerVersion=1.0
DriverPath=/opt/mcp-servers/cdata.jdbc.quickbooks.jar
DriverClass=cdata.jdbc.quickbooks.QuickBooksDriver
JdbcUrl=jdbc:quickbooks:InitiateOAuth=GETANDREFRESH;AppId=ad9e9fe8-0977-4ece-a2d3-292ab583359f;ClientId=${QB_CLIENT_ID};ClientSecret=${QB_CLIENT_SECRET};RealmId=9341454031329905;AccessToken=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..r_0S72OaED8qOuTsyfaprg.J-oQTAwkRmUMtB1Rsutjp1pC-a66-uwlkLo47nuBqo3snX5yBDbl8PsmcPELWcD8fDeTW9Z3MaM9gg-uvVNFF5xx3Llqw04mOHsYEOPfWTAU-SC8Ma07w28MiYkiSNQmBsIplzfkMSyTXW5FfzA7hCyqvz1834FPmxmikpnw2Ugxep4n3I3rXqEBN0M0eNZG2MDQ6_2y51H1WRgiEvpf-FpdQZwEqdDbHMTSMnSKY-WmO4VaDya0QDMm9AdjHF3CuXFO6eHkqOHjZrcgKmUvGM3pqtDdPJgHZTbcLSr1jBhgNTwfV7oQ5LngTQFHFrMcYKH6opIyINMssPfAKGGyebikV2u8rW6opfxqvO5qJoiSuz41ac6XvR2AkoHLEeTusUjQV65U52kQcqPzjv9Ag2dJg9lLsR_zJfoeg3beCu2FmJlC_8PGGdVo6OrItBvRHOH06Mzr72APxP4_FRg0pcJEPaK9Hkoikop_zGBf_FyFrXIQ-ygbiIfry1rX2pX1vZPRqNu-N4KkYrN17op09DcO6tanYVsn2VRYOhM8qI3Mq7KMX5SKC7wAdmKhOEgMq2i_2dHOxEuN2Fh7VWIAsNcienmGksyf8i-PHQl8P3g5nJzVCQU_YftOfEy_B30G.KaNRlBMwRJd92fCDzz1HEw;RefreshToken=${QB_REFRESH_TOKEN};
Tables=
QB_CONFIG

# Update MCP server configuration
echo "🔧 Updating MCP server configuration..."
cat > /opt/mcp-servers/mcp-config.json << 'MCP_CONFIG'
{
  "mcpServers": {
    "quickbooks": {
      "command": "java",
      "args": [
        "-jar",
        "/opt/mcp-servers/quickbooks-mcp-server-by-cdata/target/CDataMCP-jar-with-dependencies.jar",
        "/opt/mcp-servers/quickbooks.prp"
      ]
    }
  }
}
MCP_CONFIG

echo "✅ QuickBooks MCP Server installation completed!"
echo "📊 Server location: /opt/mcp-servers/quickbooks-mcp-server-by-cdata"
echo "⚙️ Configuration: /opt/mcp-servers/quickbooks.prp"
echo "🔧 MCP Config: /opt/mcp-servers/mcp-config.json"

# Test the server
echo "🧪 Testing QuickBooks MCP server..."
cd /opt/mcp-servers/quickbooks-mcp-server-by-cdata
java -jar target/CDataMCP-jar-with-dependencies.jar /opt/mcp-servers/quickbooks.prp --test

echo "🎉 QuickBooks MCP Server deployment completed!"
EOF

echo "📋 Step 2: Creating deployment instructions..."

cat > DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# QuickBooks MCP Server Deployment Instructions

## Manual Deployment Steps

1. **SSH to Racknerd VPS:**
   ```bash
   ssh root@172.245.56.50
   # Password: ${VPS_PASSWORD}
   ```

2. **Run the deployment script:**
   ```bash
   chmod +x quickbooks-mcp-deploy.sh
   ./quickbooks-mcp-deploy.sh
   ```

3. **Verify installation:**
   ```bash
   ls -la /opt/mcp-servers/
   java -jar /opt/mcp-servers/quickbooks-mcp-server-by-cdata/target/CDataMCP-jar-with-dependencies.jar /opt/mcp-servers/quickbooks.prp --test
   ```

## Configuration Details

- **Server Location:** `/opt/mcp-servers/quickbooks-mcp-server-by-cdata`
- **Configuration File:** `/opt/mcp-servers/quickbooks.prp`
- **MCP Config:** `/opt/mcp-servers/mcp-config.json`

## QuickBooks Credentials Used

- **App ID:** ad9e9fe8-0977-4ece-a2d3-292ab583359f
- **Client ID:** ${QB_CLIENT_ID}
- **Realm ID:** 9341454031329905
- **Access Token:** [REDACTED]
- **Refresh Token:** ${QB_REFRESH_TOKEN}
EOF

echo "✅ QuickBooks MCP Server deployment script created!"
echo "📁 Files created:"
echo "  - quickbooks-mcp-deploy.sh (deployment script)"
echo "  - DEPLOYMENT_INSTRUCTIONS.md (manual instructions)"
echo ""
echo "🚀 Next steps:"
echo "1. SSH to Racknerd VPS: ssh root@172.245.56.50"
echo "2. Upload and run: ./quickbooks-mcp-deploy.sh"
echo "3. Verify installation and test connection"
