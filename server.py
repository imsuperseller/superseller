import os
import sys
import requests
import uuid
import logging
import threading
import time
import subprocess
import json
import shutil
from collections import deque
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load API Keys
load_dotenv()
KIE_API_KEY = os.getenv("KIE_API_KEY") or "cb711f74a221be35a20df8e26e722e04"

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
STORAGE_DIR = 'static/tours'
TEMP_DIR = 'temp'
JOBS_FILE = 'jobs.json'
os.makedirs(STORAGE_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# Global Job Queues
job_queue = deque()
jobs = {}
jobs_lock = threading.Lock()

def load_jobs():
    global jobs
    if os.path.exists(JOBS_FILE):
        try:
            with open(JOBS_FILE, 'r') as f: jobs = json.load(f)
        except: jobs = {}

def save_jobs():
    with jobs_lock:
        try:
            temp_jobs = JOBS_FILE + '.tmp'
            with open(temp_jobs, 'w') as f: json.dump(jobs, f)
            os.replace(temp_jobs, JOBS_FILE)
        except Exception as e: logger.error(f"Failed to save jobs: {str(e)}")

load_jobs()

# --- FFMPEG PRO UTILS ---
def run_ffmpeg(cmd, cwd=None):
    logger.info(f"FFmpeg V7.0-OneShot ({cwd or 'root'}): {' '.join([str(c) for c in cmd])}")
    subprocess.run(cmd, check=True, cwd=cwd)

def is_image(url):
    exts = ['.jpg', '.jpeg', '.png', '.webp']
    return any(url.split('?')[0].lower().endswith(e) for e in exts) or 'imgbb.com' in url

def get_duration(path):
    try:
        cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path]
        res = subprocess.check_output(cmd).decode().strip()
        return float(res) if res != 'N/A' else 5.0
    except: return 5.0

def extract_frame(video_path, time_offset, output_path):
    """Accurately extracts a frame at a specific timestamp."""
    try:
        cmd = ["ffmpeg", "-y", "-ss", str(time_offset), "-i", video_path, "-frames:v", "1", "-update", "1", "-vcodec", "png", output_path]
        run_ffmpeg(cmd)
        return True
    except Exception as e:
        logger.error(f"Frame extraction failed: {e}")
        return False

# --- KIE.AI JOB SYSTEM ---
def poll_kie_job(task_id):
    url = f"https://api.kie.ai/api/v1/jobs/recordInfo?taskId={task_id}"
    headers = {"Authorization": f"Bearer {KIE_API_KEY}"}
    for i in range(180): # Max 30 mins
        try:
            resp = requests.get(url, headers=headers, timeout=30)
            data = resp.json().get("data", {})
            state = data.get("state")
            if i % 6 == 0: logger.info(f"Task {task_id} state: {state}")
            if state == "success" or data.get("successFlag") == 1:
                rj = json.loads(data.get("resultJson", "{}"))
                return rj.get("resultUrls", [None])[0]
            if state in ["fail", "failed"] or data.get("successFlag") in [2, 3]: return None
            time.sleep(10)
        except Exception as e: logger.error(f"Poll error: {str(e)}"); time.sleep(10)
    return None

def poll_kie_direct(task_id):
    url = f"https://api.kie.ai/api/v1/generate/record-info?taskId={task_id}"
    headers = {"Authorization": f"Bearer {KIE_API_KEY}"}
    for i in range(180):
        try:
            resp = requests.get(url, headers=headers, timeout=30)
            data = resp.json().get("data", {})
            status = data.get("status")
            if status == "completed" or data.get("success"):
                return data.get("videoUrl") or data.get("output", {}).get("video_url")
            if status == "failed": return None
            time.sleep(10)
        except: time.sleep(10)
    return None

def generate_agent_genesis(job_dir, realtor_image, prompt):
    """
    Creates the 'Genesis' clip: The Agent Intro.
    Uses Kling 2.6 for high-fidelity face rendering.
    """
    url = "https://api.kie.ai/api/v1/jobs/createTask"
    headers = {"Authorization": f"Bearer {KIE_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "kling-2.6/image-to-video",
        "input": {
            "prompt": prompt,
            "image_urls": [realtor_image],
            "duration": "5",
            "sound": False,
            "cfg_scale": 0.5,
            "negative_prompt": "distortion, bad aesthetics, blurry, scary, monster, talking, speaking, lip movement, open mouth"  # === CHANGED === added no-talking to negative
        }
    }
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        res_data = resp.json()
        if res_data.get("code") == 200 or res_data.get("code") == 0:
            tid = res_data["data"]["taskId"]
            vurl = poll_kie_job(tid)
            if vurl:
                out = os.path.join(job_dir, "genesis.mp4")
                download_and_standardize(vurl, out)
                return out
    except Exception as e: logger.error(f"Genesis Gen Fail: {str(e)}")
    return None

def generate_chain_link(job_dir, start_frame_path, end_image_url, index):
    """
    Creates a 'Chain Link': Seamless morph from 'Last Frame' -> 'Next Room'.
    Uses Kling V2.1 Master for best Start+End image morphing.
    """
    # Host the local frame so Kie can see it
    frame_name = f"link_{str(uuid.uuid4())[:8]}.png"
    public_frame_path = os.path.join(STORAGE_DIR, frame_name)
    shutil.copy(start_frame_path, public_frame_path)
    
    base_url = "http://172.245.56.50:5050/static/tours/"
    start_url = base_url + frame_name
    
    url = "https://api.kie.ai/api/v1/generate"
    headers = {"Authorization": f"Bearer {KIE_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "klingai/v2.1-master-image-to-video",
        # === CHANGED === Updated prompt for continuous walkthrough with face lock and magical furnishing
        "prompt": "POV: Realtor takes a selfie and walks to the next room with a smile, in excitement, while vlogging. Camera is locked on the face, held at arm's length. Match the face one-to-one with the starting frame, preserve exact facial features. The room magically furnishes and transforms from empty space into fully styled luxury as the realtor enters. Furniture, decor, and lighting appear seamlessly. Smooth unbroken forward movement. No cuts, no jump cuts, no transitions. Cinematic lighting, 4K. No one is talking.",
        "start_image_url": start_url,
        "tail_image_url": end_image_url,
        "duration": 5,
        "camera_control": {"type": "forward_up"},
        # === CHANGED === Updated negative prompt
        "negative_prompt": "cut, jump cut, fade, transition, blur, talking, speaking, lip movement, open mouth, static camera, frozen"
    }
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        res_data = resp.json()
        if res_data.get("success"):
            vurl = poll_kie_direct(res_data["data"]["taskId"])
            if vurl:
                out = os.path.join(job_dir, f"link_{index}.mp4")
                download_and_standardize(vurl, out)
                return out
    except Exception as e: logger.error(f"Link {index} Fail: {str(e)}")
    return None

def download_and_standardize(url, out_path):
    with requests.get(url, stream=True) as r:
        with open(out_path + ".raw.mp4", 'wb') as f: shutil.copyfileobj(r.raw, f)
    # Standardize to 4K H.264
    cmd = ["ffmpeg", "-y", "-i", out_path + ".raw.mp4", "-vf", "format=yuv420p,scale=3840:2160,pad=3840:2160:(ow-iw)/2:(oh-ih)/2,setsar=1", "-c:v", "libx264", "-crf", "18", out_path]
    run_ffmpeg(cmd)

# === ADDED === Helper to download a file from URL
def download_file(url, dest_path):
    """Downloads a file from a URL to a local path."""
    try:
        with requests.get(url, stream=True, timeout=120) as r:
            r.raise_for_status()
            with open(dest_path, 'wb') as f:
                shutil.copyfileobj(r.raw, f)
        return True
    except Exception as e:
        logger.error(f"Download failed ({url}): {e}")
        return False

# --- MAIN WORKER ---
def process_render_job(job_id):
    job = None
    with jobs_lock: job = jobs.get(job_id)
    if not job: return
    job_dir = os.path.join(TEMP_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)
    
    try:
        # V7: ONE-SHOT CONTINUOUS CHAIN LOGIC
        # 1. Genesis (Agent Intro)
        realtor_img = job.get('realtor_image')
        # Fallback if workflow doesn't send image
        if not realtor_img: 
            logger.warning("No realtor_image provided. Using default Sarah.")
            realtor_img = "https://images.pexels.com/photos/3778680/pexels-photo-3778680.jpeg"
        
        with jobs_lock: job['message'] = "Phase 1: Generating Agent Genesis (Anchor)..."
        save_jobs()
        
        # === CHANGED === Genesis prompt now describes approaching the front of the property
        realtor_name = job.get('realtor_name', 'Sarah')
        genesis_prompt = (
            f"POV: Professional realtor {realtor_name} takes a selfie while approaching the front of a luxury property. "
            f"Match the face one-to-one with the reference image, preserve exact facial features and skin tone. "
            f"Camera is locked on the face, held at arm's length like a vlog. "
            f"Walking confidently toward the entrance with a warm excited smile, golden hour lighting, cinematic depth of field, 4K quality. "
            f"No one is talking. Silent, no speaking, no lip movement."
        )
        genesis_clip = generate_agent_genesis(job_dir, realtor_img, genesis_prompt)
        if not genesis_clip: raise Exception("Failed to generate Genesis Clip")
        
        master_chain = [genesis_clip]
        current_last_frame = os.path.join(job_dir, "frame_0.png")
        
        # Extract end frame of Genesis to start the chain
        duration = get_duration(genesis_clip)
        extract_frame(genesis_clip, duration - 0.1, current_last_frame)
        
        # 2. Iterate and Chain
        idx = 0
        input_urls = job.get('video_urls', [])
        
        for url in input_urls:
            idx += 1
            target_image_path = None
            
            # Smart Input Handling: Image vs Video
            if is_image(url):
                target_image_path = url # Direct URL
            else:
                # Video Input (Veo fallback): Download & Extract First Frame
                logger.info(f"Input {idx} is video. Extracting anchor frame...")
                v_path = os.path.join(job_dir, f"source_veo_{idx}.mp4")
                try:
                    # Download video
                    with requests.get(url, stream=True) as r:
                         with open(v_path, 'wb') as f: shutil.copyfileobj(r.raw, f)
                    
                    # Extract First Frame (Frame 0)
                    f_path = os.path.join(job_dir, f"target_frame_{idx}.png")
                    extract_frame(v_path, 0.0, f_path)
                    
                    # Copy to public storage for API access
                    public_name = f"tf_{str(uuid.uuid4())[:8]}.png"
                    shutil.copy(f_path, os.path.join(STORAGE_DIR, public_name))
                    target_image_path = f"http://172.245.56.50:5050/static/tours/{public_name}"
                except Exception as ex: 
                    logger.error(f"Failed to process video input {idx}: {ex}")
                    continue

            if not target_image_path: continue

            with jobs_lock: job['message'] = f"Phase 2: Generating Chain Link {idx}/{len(input_urls)} (Selfie Walk)..."
            save_jobs()
            
            # Generate Link: [Last Frame] -> [Target Image]
            link_clip = generate_chain_link(job_dir, current_last_frame, target_image_path, idx)
            
            if link_clip:
                master_chain.append(link_clip)
                # Prepare for next iteration
                next_frame_path = os.path.join(job_dir, f"frame_{idx}.png")
                duration = get_duration(link_clip)
                extract_frame(link_clip, duration - 0.1, next_frame_path)
                current_last_frame = next_frame_path
            else:
                logger.error(f"Failed to generate link {idx}, skipping hop.")

        # 3. Final Stitch
        with jobs_lock: job['message'] = "Phase 3: Final Seamless Stitching..."
        save_jobs()
        
        # Concat all clips
        with open(os.path.join(job_dir, "list.txt"), 'w') as f:
            for p in master_chain: f.write(f"file '{os.path.basename(p)}'\n")
            
        run_ffmpeg(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "concat_no_audio.mp4"], cwd=job_dir)
        
        # === ADDED === Phase 4: Mix in background music if provided
        concat_path = os.path.join(job_dir, "concat_no_audio.mp4")
        final_local_path = os.path.join(job_dir, "final.mp4")
        audio_url = job.get('audio', '')
        
        if audio_url and audio_url.strip():
            with jobs_lock: job['message'] = "Phase 4: Mixing background music..."
            save_jobs()
            
            music_path = os.path.join(job_dir, "music.mp3")
            music_downloaded = download_file(audio_url.strip(), music_path)
            
            if music_downloaded and os.path.exists(music_path) and os.path.getsize(music_path) > 0:
                try:
                    # Mix music into video:
                    # -map 0:v:0 = take video from first input (the concat)
                    # -map 1:a:0 = take audio from second input (the music)
                    # -shortest = trim to whichever is shorter (music or video)
                    # -c:v copy = don't re-encode video (fast)
                    # -c:a aac = encode audio as AAC
                    # -b:a 192k = good audio quality
                    run_ffmpeg([
                        "ffmpeg", "-y",
                        "-i", "concat_no_audio.mp4",
                        "-i", "music.mp3",
                        "-map", "0:v:0",
                        "-map", "1:a:0",
                        "-c:v", "copy",
                        "-c:a", "aac",
                        "-b:a", "192k",
                        "-shortest",
                        "final.mp4"
                    ], cwd=job_dir)
                    logger.info(f"Job {job_id}: Music mixed successfully")
                except Exception as audio_err:
                    logger.error(f"Job {job_id}: Music mixing failed ({audio_err}), using video without music")
                    # Fall back to no-music version
                    shutil.copy(concat_path, final_local_path)
            else:
                logger.warning(f"Job {job_id}: Music download failed or empty, using video without music")
                shutil.copy(concat_path, final_local_path)
        else:
            logger.info(f"Job {job_id}: No music URL provided, finalizing without music")
            shutil.copy(concat_path, final_local_path)
        
        # Move final file to public storage
        out_file = f"walkthrough_{job_id}.mp4"
        out_path = os.path.join(STORAGE_DIR, out_file)
        shutil.move(final_local_path, out_path)
        
        with jobs_lock: job.update({'status': 'completed', 'progress': 100, 'video_url': f"http://172.245.56.50:5050/static/tours/{out_file}"})
        save_jobs()
        logger.info(f"Job {job_id} DONE (V7 Continuous Chain + Audio)")
        
    except Exception as e:
        logger.error(f"Job {job_id} fail: {str(e)}")
        with jobs_lock: job.update({'status': 'failed', 'error': str(e)})
        save_jobs()

def worker():
    while True:
        if job_queue: process_render_job(job_queue.popleft())
        time.sleep(1)

threading.Thread(target=worker, daemon=True).start()

# --- ROUTES ---
@app.route('/health')
def health(): return jsonify({"status": "online", "version": "V7.1-OneShot-Audio", "queue_size": len(job_queue)})

@app.route('/merge', methods=['POST'])
def merge():
    jid = str(uuid.uuid4())
    with jobs_lock: jobs[jid] = {'id': jid, 'status': 'queued', 'created_at': time.time(), **request.json}
    job_queue.append(jid)
    save_jobs()
    return jsonify({"success": True, "job_id": jid})

@app.route('/status/<jid>')
def get_status(jid):
    with jobs_lock: return jsonify(jobs.get(jid, {"error": "Not found"}))

@app.route('/static/tours/<path:filename>')
def serve_vid(filename): return send_from_directory(STORAGE_DIR, filename)

if __name__ == '__main__': app.run(host='0.0.0.0', port=5050, threaded=True)
