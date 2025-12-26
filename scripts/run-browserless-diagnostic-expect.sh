#!/usr/bin/expect -f

###############################################################################
# Expect script to run Browserless diagnostic on remote server
# Handles password authentication automatically
###############################################################################

set SERVER_IP "172.245.56.50"
set SERVER_USER "root"
set PASSWORD "y0JEu4uI0hAQ606Mfr"
set SCRIPT_PATH "/tmp/diagnose-browserless-config.sh"

# Get the directory where this script is located
set SCRIPT_DIR [file dirname [file normalize [info script]]]
set DIAGNOSTIC_SCRIPT "${SCRIPT_DIR}/diagnose-browserless-config.sh"

# Set timeout
set timeout 30

# Transfer script to server
spawn scp -o StrictHostKeyChecking=no $DIAGNOSTIC_SCRIPT ${SERVER_USER}@${SERVER_IP}:${SCRIPT_PATH}
expect {
    "password:" {
        send "$PASSWORD\r"
        expect eof
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "$PASSWORD\r"
        expect eof
    }
    eof
}

# Wait for scp to complete
wait

# SSH to server and run the script
spawn ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "chmod +x ${SCRIPT_PATH} && bash ${SCRIPT_PATH}"
expect {
    "password:" {
        send "$PASSWORD\r"
        expect eof
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "$PASSWORD\r"
        expect eof
    }
    eof
}

# Wait for script to complete
wait
