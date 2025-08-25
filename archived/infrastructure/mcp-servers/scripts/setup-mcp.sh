#!/bin/bash

# Setup MCP Servers for n8n Workflow Creation
# This script installs and configures the MCP servers for AI-powered workflow generation

set -e

echo "=========================================="
echo "🤖 Setting up MCP Workflow Creation System"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${BLUE}[SUCCESS]${NC} $1"
}

# Check if Node.js is installed
log_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

log_success "Node.js $(node --version) is installed"

# Check if npm is installed
log_info "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed. Please install npm first."
    exit 1
fi

log_success "npm $(npm --version) is installed"

# Create MCP servers directory if it doesn't exist
MCP_DIR="mcp-servers"
if [ ! -d "$MCP_DIR" ]; then
    log_info "Creating MCP servers directory..."
    mkdir -p "$MCP_DIR"
fi

# Setup n8n MCP Server
log_info "Setting up n8n MCP Server..."
cd "$MCP_DIR/n8n-mcp-server"

if [ ! -f "package.json" ]; then
    log_error "n8n MCP Server package.json not found. Please ensure the server files are present."
    exit 1
fi

log_info "Installing n8n MCP Server dependencies..."
npm install

# Create environment file
log_info "Creating environment configuration..."
cat > .env << EOF
N8N_URL=http://173.254.201.134:5678
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE
N8N_LICENSE_KEY=d21cb1e4-4b41-4b09-8e86-c0021884b446
EOF

log_success "n8n MCP Server configured"

# Setup AI Workflow Generator
log_info "Setting up AI Workflow Generator..."
cd "../ai-workflow-generator"

if [ ! -f "package.json" ]; then
    log_error "AI Workflow Generator package.json not found. Please ensure the server files are present."
    exit 1
fi

log_info "Installing AI Workflow Generator dependencies..."
npm install

# Create environment file
log_info "Creating environment configuration..."
cat > .env << EOF
N8N_URL=http://173.254.201.134:5678
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE
N8N_LICENSE_KEY=d21cb1e4-4b41-4b09-8e86-c0021884b446
EOF

log_success "AI Workflow Generator configured"

# Test n8n connectivity
log_info "Testing n8n connectivity..."
cd ../..

if curl -s -f "http://173.254.201.134:5678/healthz" > /dev/null; then
    log_success "n8n is accessible"
else
    log_warn "n8n is not accessible. Please ensure n8n is running."
fi

# Create Claude Desktop configuration example
log_info "Creating Claude Desktop configuration example..."
cat > claude-desktop-mcp-config.json << EOF
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "node",
      "args": ["$(pwd)/mcp-servers/n8n-mcp-server/server.js"],
      "env": {
        "N8N_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE"
      }
    },
    "ai-workflow-generator": {
      "command": "node",
      "args": ["$(pwd)/mcp-servers/ai-workflow-generator/server.js"],
      "env": {
        "N8N_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE"
      }
    }
  }
}
EOF

log_success "Claude Desktop configuration example created: claude-desktop-mcp-config.json"

# Create Cursor configuration example
log_info "Creating Cursor configuration example..."
cat > cursor-mcp-config.json << EOF
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "node",
      "args": ["$(pwd)/mcp-servers/n8n-mcp-server/server.js"],
      "env": {
        "N8N_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE"
      }
    },
    "ai-workflow-generator": {
      "command": "node",
      "args": ["$(pwd)/mcp-servers/ai-workflow-generator/server.js"],
      "env": {
        "N8N_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE"
      }
    }
  }
}
EOF

log_success "Cursor configuration example created: cursor-mcp-config.json"

# Create test script
log_info "Creating test script..."
cat > test-mcp-servers.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing MCP Servers..."

# Test n8n MCP Server
echo "Testing n8n MCP Server..."
cd mcp-servers/n8n-mcp-server
timeout 10s node server.js &
N8N_PID=$!
sleep 2
if kill -0 $N8N_PID 2>/dev/null; then
    echo "✅ n8n MCP Server is working"
    kill $N8N_PID
else
    echo "❌ n8n MCP Server failed to start"
fi

# Test AI Workflow Generator
echo "Testing AI Workflow Generator..."
cd ../ai-workflow-generator
timeout 10s node server.js &
AI_PID=$!
sleep 2
if kill -0 $AI_PID 2>/dev/null; then
    echo "✅ AI Workflow Generator is working"
    kill $AI_PID
else
    echo "❌ AI Workflow Generator failed to start"
fi

echo "🧪 MCP Server tests completed"
EOF

chmod +x test-mcp-servers.sh
log_success "Test script created: test-mcp-servers.sh"

# Summary
echo ""
log_info "=== MCP SERVERS SETUP COMPLETE ==="
log_success "✅ n8n MCP Server: Installed and configured"
log_success "✅ AI Workflow Generator: Installed and configured"
log_success "✅ Configuration files: Created"
log_success "✅ Test script: Created"

echo ""
log_info "=== NEXT STEPS ==="
echo "1. Copy the configuration from claude-desktop-mcp-config.json to Claude Desktop"
echo "2. Copy the configuration from cursor-mcp-config.json to Cursor"
echo "3. Restart your AI tools to load the MCP servers"
echo "4. Test the setup with: ./test-mcp-servers.sh"

echo ""
log_info "=== USAGE EXAMPLES ==="
echo "• Generate workflow: 'Create an email automation workflow'"
echo "• List templates: 'Show me available workflow templates'"
echo "• Check health: 'Check n8n system status'"

echo ""
log_success "🎉 MCP Workflow Creation System is ready to use!"
