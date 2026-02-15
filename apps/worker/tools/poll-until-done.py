#!/usr/bin/env python3
"""Poll job until complete or failed. Usage: python poll-until-done.py <job_id>"""
import urllib.request
import json
import time
import sys

job_id = sys.argv[1] if len(sys.argv) > 1 else "920cea05-86f7-4983-b34f-a50b114aa5da"
url = f"http://172.245.56.50:3002/api/jobs/{job_id}"

for i in range(180):  # 3 hours
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            data = json.loads(r.read().decode())
    except Exception as e:
        print(f"{time.strftime('%H:%M:%S')} fetch error: {e}")
        time.sleep(60)
        continue
    j = data.get("job", {})
    st = j.get("status", "?")
    pc = j.get("progress_percent", 0)
    step = j.get("current_step", "")
    master = j.get("master_video_url") or ""
    print(f"{time.strftime('%H:%M:%S')} {st} {pc}% {step}")
    if st == "complete":
        print(f"\nDONE. master_video_url: {master}")
        sys.exit(0)
    if st == "failed":
        print(f"\nFAILED: {j.get('error_message', '')}")
        sys.exit(1)
    time.sleep(60)
print("Timeout")
sys.exit(2)
