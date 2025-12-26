#!/bin/bash
###############################################################################
# n8n Community Edition - Automated Installation Script
# Customer: Wonder.Care (Ortal Flanary)
# Server: RackNerd VPS (192.227.249.73)
# OS: Ubuntu 24.04
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server details
SERVER_IP="192.227.249.73"
N8N_PORT="5678"
INSTALL_DIR="/home/ubuntu/n8n"

###############################################################################
# Helper Functions
###############################################################################

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_header() {
    echo ""
    echo "======================================================================"
    echo "$1"
    echo "======================================================================"
    echo ""
}

check_root() {
    if [ "$EUID" -eq 0 ]; then 
        print_error "Please do not run this script as root. Run as ubuntu user with sudo privileges."
        exit 1
    fi
}

###############################################################################
# Installation Steps
###############################################################################

step1_system_update() {
    print_header "STEP 1: Updating System"
    
    sudo apt update
    sudo apt upgrade -y
    
    print_success "System updated successfully"
}

step2_install_dependencies() {
    print_header "STEP 2: Installing Dependencies"
    
    sudo apt install -y curl wget git ufw
    
    print_success "Dependencies installed"
}

step3_configure_firewall() {
    print_header "STEP 3: Configuring Firewall"
    
    # Check if UFW is already enabled
    if sudo ufw status | grep -q "Status: active"; then
        print_warning "UFW already enabled, adding rules..."
    fi
    
    sudo ufw allow 22/tcp comment 'SSH'
    sudo ufw allow ${N8N_PORT}/tcp comment 'n8n'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'
    
    # Enable UFW (will prompt for confirmation)
    echo "y" | sudo ufw enable
    
    print_success "Firewall configured"
    sudo ufw status
}

step4_install_docker() {
    print_header "STEP 4: Installing Docker"
    
    # Check if Docker is already installed
    if command -v docker &> /dev/null; then
        print_warning "Docker already installed"
        docker --version
        return
    fi
    
    # Install Docker
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo sh /tmp/get-docker.sh
    rm /tmp/get-docker.sh
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    # Install Docker Compose
    sudo apt install -y docker-compose
    
    print_success "Docker installed"
    print_warning "You may need to log out and back in for group changes to take effect"
    
    docker --version
    docker-compose --version
}

step5_create_directories() {
    print_header "STEP 5: Creating n8n Directory Structure"
    
    mkdir -p ${INSTALL_DIR}/{data,backups,logs}
    
    print_success "Directory structure created at ${INSTALL_DIR}"
    tree -L 2 ${INSTALL_DIR} 2>/dev/null || ls -la ${INSTALL_DIR}
}

step6_create_docker_compose() {
    print_header "STEP 6: Creating Docker Compose Configuration"
    
    cat > ${INSTALL_DIR}/docker-compose.yml <<EOF
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-wondercare
    restart: unless-stopped
    ports:
      - "${N8N_PORT}:5678"
    environment:
      - N8N_HOST=${SERVER_IP}
      - N8N_PORT=${N8N_PORT}
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://${SERVER_IP}:${N8N_PORT}/
      - GENERIC_TIMEZONE=America/Los_Angeles
      - N8N_EDITOR_BASE_URL=http://${SERVER_IP}:${N8N_PORT}/
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168
      - N8N_METRICS=true
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console,file
      - N8N_LOG_FILE_LOCATION=/home/node/.n8n/logs/
    volumes:
      - ./data:/home/node/.n8n
      - ./logs:/home/node/.n8n/logs
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge
EOF
    
    print_success "Docker Compose configuration created"
    echo "Configuration file: ${INSTALL_DIR}/docker-compose.yml"
}

step7_create_backup_script() {
    print_header "STEP 7: Creating Backup Script"
    
    cat > ${INSTALL_DIR}/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/n8n/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="n8n_backup_${TIMESTAMP}.tar.gz"

echo "Starting backup at $(date)"

# Stop n8n
cd /home/ubuntu/n8n
docker-compose stop

# Create backup
tar -czf ${BACKUP_DIR}/${BACKUP_FILE} data/

# Start n8n
docker-compose start

# Keep only last 7 days of backups
find ${BACKUP_DIR} -name "n8n_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}"
echo "Backup size: $(du -h ${BACKUP_DIR}/${BACKUP_FILE} | cut -f1)"
EOF
    
    chmod +x ${INSTALL_DIR}/backup.sh
    
    print_success "Backup script created"
    
    # Add to crontab
    (crontab -l 2>/dev/null | grep -v "n8n/backup.sh"; echo "0 3 * * * ${INSTALL_DIR}/backup.sh >> ${INSTALL_DIR}/logs/backup.log 2>&1") | crontab -
    
    print_success "Backup cron job added (runs daily at 3 AM)"
}

step8_start_n8n() {
    print_header "STEP 8: Starting n8n"
    
    cd ${INSTALL_DIR}
    
    # Pull latest image
    docker-compose pull
    
    # Start n8n
    docker-compose up -d
    
    print_success "n8n container started"
    
    # Wait for n8n to be ready
    echo "Waiting for n8n to start..."
    sleep 10
    
    # Check status
    docker-compose ps
    
    # Show logs
    echo ""
    echo "Recent logs:"
    docker-compose logs --tail=20 n8n
}

step9_verify_installation() {
    print_header "STEP 9: Verifying Installation"
    
    # Check if container is running
    if docker ps | grep -q "n8n-wondercare"; then
        print_success "n8n container is running"
    else
        print_error "n8n container is not running"
        docker-compose logs --tail=50 n8n
        exit 1
    fi
    
    # Check if n8n is accessible
    sleep 5
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:${N8N_PORT} | grep -q "200\|302"; then
        print_success "n8n is accessible"
    else
        print_warning "n8n might not be fully ready yet (this is normal)"
    fi
    
    # Show resource usage
    echo ""
    echo "Container resource usage:"
    docker stats --no-stream n8n-wondercare
}

step10_post_installation() {
    print_header "STEP 10: Post-Installation Instructions"
    
    echo ""
    echo "======================================================================"
    echo "✅ n8n Community Edition Installation Complete!"
    echo "======================================================================"
    echo ""
    echo "Access n8n at: http://${SERVER_IP}:${N8N_PORT}"
    echo ""
    echo "Next steps:"
    echo "  1. Open browser to http://${SERVER_IP}:${N8N_PORT}"
    echo "  2. Create owner account (use ortal@wonder.care)"
    echo "  3. Generate API key (Settings → API)"
    echo "  4. Configure credentials (Google Sheets, Monday.com, etc.)"
    echo "  5. Import workflows from Make.com"
    echo ""
    echo "Useful commands:"
    echo "  View logs:     cd ${INSTALL_DIR} && docker-compose logs -f n8n"
    echo "  Restart n8n:   cd ${INSTALL_DIR} && docker-compose restart"
    echo "  Stop n8n:      cd ${INSTALL_DIR} && docker-compose stop"
    echo "  Start n8n:     cd ${INSTALL_DIR} && docker-compose start"
    echo "  Update n8n:    cd ${INSTALL_DIR} && docker-compose pull && docker-compose up -d"
    echo "  Backup now:    ${INSTALL_DIR}/backup.sh"
    echo ""
    echo "Configuration files:"
    echo "  Docker Compose: ${INSTALL_DIR}/docker-compose.yml"
    echo "  Backup Script:  ${INSTALL_DIR}/backup.sh"
    echo "  Data Directory: ${INSTALL_DIR}/data"
    echo "  Logs Directory: ${INSTALL_DIR}/logs"
    echo ""
    echo "Support: Contact Rensto (Shai) for assistance"
    echo "======================================================================"
    echo ""
}

###############################################################################
# Main Execution
###############################################################################

main() {
    print_header "n8n Community Edition Installation"
    echo "Customer: Wonder.Care (Ortal Flanary)"
    echo "Server: ${SERVER_IP}"
    echo "Installation Directory: ${INSTALL_DIR}"
    echo ""
    
    # Check if running as root
    check_root
    
    # Confirm installation
    read -p "Continue with installation? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled"
        exit 0
    fi
    
    # Run installation steps
    step1_system_update
    step2_install_dependencies
    step3_configure_firewall
    step4_install_docker
    step5_create_directories
    step6_create_docker_compose
    step7_create_backup_script
    step8_start_n8n
    step9_verify_installation
    step10_post_installation
}

# Run main function
main

