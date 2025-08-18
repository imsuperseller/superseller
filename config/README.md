# ⚙️ Configuration Directory

This directory contains all configuration files organized by service and type.

## 📁 Directory Structure

### 🐳 docker/
- `docker-compose.yml` - Main Docker Compose configuration
- `docker-compose.dev.yml` - Development environment configuration
- `docker-compose.prod.yml` - Production environment configuration

### 🔄 n8n/
- `.env` - n8n environment variables
- `workflows/` - n8n workflow configurations

### 🤖 mcp/
- `cursor-config.json` - Cursor MCP server configuration
- `claude-config.json` - Claude Desktop MCP configuration

### 🌍 environment/
- `.env.example` - Environment variables template
- `.env.local` - Local environment variables
- `.env.production` - Production environment variables

### ✏️ editor/
- `.prettierrc` - Prettier code formatting configuration
- `.editorconfig` - Editor configuration
- `.eslintrc.json` - ESLint configuration
- `.cursor` - Cursor editor configuration

## 🔧 Configuration Management

### Environment Variables
```bash
# Copy template
cp config/environment/.env.example .env

# Edit configuration
nano .env
```

### Docker Configuration
```bash
# Development
docker-compose -f config/docker/docker-compose.dev.yml up

# Production
docker-compose -f config/docker/docker-compose.prod.yml up
```

### MCP Configuration
```bash
# Start MCP servers
./scripts/setup/setup-mcp.sh
```

## 📊 Configuration Statistics

- **Docker Configs**: 3 files
- **n8n Configs**: 2 files
- **MCP Configs**: 2 files
- **Environment Configs**: 3 files
- **Editor Configs**: 4 files

## 🔒 Security

- Sensitive configuration files are in `.gitignore`
- Environment variables are encrypted
- API keys are stored securely
- Configuration files are validated
