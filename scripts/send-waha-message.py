#!/usr/bin/env python3
"""Send WhatsApp message via WAHA API"""
import requests
import json
import sys

API_KEY = "4fc7e008d7d24fc995475029effc8fa8"
VPS_IP = "173.254.201.134"
SESSION = "default"
CHAT_ID = "14695885133@c.us"
MESSAGE = "Hello Donna, what materials are best for kitchen cabinets?"

url = f"http://{VPS_IP}:3000/api/sendText"
headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}
data = {
    "session": SESSION,
    "chatId": CHAT_ID,
    "text": MESSAGE
}

print(f"📤 Sending message to {CHAT_ID}...")
print(f"Message: {MESSAGE}\n")

try:
    response = requests.post(url, headers=headers, json=data, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}\n")
    
    if response.status_code == 200 or response.status_code == 201:
        print("✅ Message sent successfully!")
        print("📱 Check your WhatsApp")
    else:
        print(f"❌ Failed: {response.status_code}")
        sys.exit(1)
except requests.exceptions.Timeout:
    print("❌ Request timed out")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

