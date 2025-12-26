#!/bin/bash

###############################################################################
# Wrapper script to run Browserless diagnostic on remote server
# Handles password authentication
###############################################################################

SERVER_IP="172.245.56.50"
SERVER_USER="root"
PASSWORD="y0JEu4uI0hAQ606Mfr"
SCRIPT_PATH="/tmp/diagnose-browserless-config.sh"

# Check if sshpass is available
if ! command -v sshpass &> /dev/null; then
    echo "sshpass not found. Installing or using alternative method..."
    
    # Try to install sshpass (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            echo "Installing sshpass via Homebrew..."
            brew install hudochenkov/sshpass/sshpass 2>/dev/null || {
                echo "Failed to install sshpass. Please install manually:"
                echo "  brew install hudochenkov/sshpass/sshpass"
                echo ""
                echo "Or run the diagnostic manually:"
                echo "  scp scripts/diagnose-browserless-config.sh root@${SERVER_IP}:/tmp/"
                echo "  ssh root@${SERVER_IP}"
                echo "  bash /tmp/diagnose-browserless-config.sh"
                exit 1
            }
        else
            echo "Homebrew not found. Please install sshpass manually or run commands manually."
            exit 1
        fi
    else
        echo "Please install sshpass: sudo apt-get install sshpass (Linux) or brew install hudochenkov/sshpass/sshpass (macOS)"
        exit 1
    fi
fi

echo "======================================================================"
echo "Transferring diagnostic script to server..."
echo "======================================================================"

# Read the diagnostic script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIAGNOSTIC_SCRIPT="${SCRIPT_DIR}/diagnose-browserless-config.sh"

if [ ! -f "$DIAGNOSTIC_SCRIPT" ]; then
    echo "Error: Diagnostic script not found at $DIAGNOSTIC_SCRIPT"
    exit 1
fi

# Transfer script to server
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no "$DIAGNOSTIC_SCRIPT" "${SERVER_USER}@${SERVER_IP}:${SCRIPT_PATH}" || {
    echo "Failed to transfer script. Trying alternative method..."
    # Alternative: create script directly on server
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "cat > ${SCRIPT_PATH}" < "$DIAGNOSTIC_SCRIPT"
}

# Make script executable and run it
echo ""
echo "======================================================================"
echo "Running diagnostic on server..."
echo "======================================================================"
echo ""

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "chmod +x ${SCRIPT_PATH} && bash ${SCRIPT_PATH}"

echo ""
echo "======================================================================"
echo "Diagnostic complete!"
echo "======================================================================"
