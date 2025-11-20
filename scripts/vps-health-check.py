#!/usr/bin/env python3
"""
VPS Health Check with Proper Timeout Handling
Uses Python subprocess with timeout instead of bash timeout command
"""

import subprocess
import sys
import signal
import time
from datetime import datetime

VPS_IP = "173.254.201.134"
VPS_USER = "root"
TIMEOUT_SECONDS = 10

def run_command_with_timeout(cmd, timeout=10, shell=False):
    """Run command with timeout using subprocess"""
    try:
        if shell:
            process = subprocess.Popen(
                cmd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=None if sys.platform == 'win32' else lambda: signal.signal(signal.SIGINT, signal.SIG_IGN)
            )
        else:
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        
        try:
            stdout, stderr = process.communicate(timeout=timeout)
            return process.returncode, stdout.decode('utf-8', errors='ignore'), stderr.decode('utf-8', errors='ignore')
        except subprocess.TimeoutExpired:
            process.kill()
            stdout, stderr = process.communicate()
            return 124, "", f"Command timed out after {timeout}s"
    except Exception as e:
        return -1, "", str(e)

def main():
    print("🔍 VPS Health Check -", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 50)
    print()
    
    # Test 1: Ping check
    print("1️⃣ Testing ping connectivity...")
    code, stdout, stderr = run_command_with_timeout(
        ["ping", "-c", "2", "-W", "1", VPS_IP],
        timeout=5
    )
    if code == 0:
        print("✅ Ping successful")
    else:
        print(f"❌ Ping failed (code: {code})")
        if stderr:
            print(f"   Error: {stderr.strip()}")
    print()
    
    # Test 2: SSH connection test
    print("2️⃣ Testing SSH connection...")
    ssh_cmd = [
        "ssh",
        "-o", "ConnectTimeout=3",
        "-o", "StrictHostKeyChecking=no",
        "-o", "BatchMode=yes",
        f"{VPS_USER}@{VPS_IP}",
        "echo OK"
    ]
    code, stdout, stderr = run_command_with_timeout(ssh_cmd, timeout=8)
    
    if code == 0:
        print("✅ SSH connection successful")
        print(f"   Response: {stdout.strip()}")
        ssh_works = True
    elif code == 124:
        print("⏱️  SSH connection timed out")
        ssh_works = False
    else:
        print(f"❌ SSH connection failed (code: {code})")
        if stderr:
            print(f"   Error: {stderr.strip()}")
        ssh_works = False
    print()
    
    # Test 3: Docker check (if SSH works)
    if ssh_works:
        print("3️⃣ Checking Docker status...")
        docker_cmd = [
            "ssh",
            "-o", "ConnectTimeout=3",
            f"{VPS_USER}@{VPS_IP}",
            "docker ps --format 'table {{.Names}}\t{{.Status}}' | head -5"
        ]
        code, stdout, stderr = run_command_with_timeout(docker_cmd, timeout=10)
        
        if code == 0:
            print("✅ Docker accessible")
            print(stdout.strip())
        else:
            print(f"❌ Docker check failed (code: {code})")
            if stderr:
                print(f"   Error: {stderr.strip()}")
        print()
        
        # Test 4: n8n container check
        print("4️⃣ Checking n8n container...")
        n8n_cmd = [
            "ssh",
            "-o", "ConnectTimeout=3",
            f"{VPS_USER}@{VPS_IP}",
            "docker exec n8n_rensto n8n --version 2>&1 || echo 'CONTAINER_NOT_RUNNING'"
        ]
        code, stdout, stderr = run_command_with_timeout(n8n_cmd, timeout=8)
        
        if code == 0:
            print("✅ n8n container accessible")
            print(f"   Version: {stdout.strip()}")
        else:
            print(f"❌ n8n container check failed (code: {code})")
            if stderr:
                print(f"   Error: {stderr.strip()}")
            if stdout:
                print(f"   Output: {stdout.strip()}")
    else:
        print("⏭️  Skipping Docker checks (SSH not available)")
    
    print()
    print("🏁 Health check complete -", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

