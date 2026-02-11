from flask import Flask, request, jsonify, send_from_directory
import os
import requests
import uuid
from moviepy import VideoFileClip, concatenate_videoclips, AudioFileClip, CompositeVideoClip
import moviepy.video.fx as vfx
import moviepy.audio.fx as afx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration
STORAGE_DIR = 'static/tours'
MUSIC_FILE = 'background_luxury.mp3'
TRANSITION_DURATION = 1.0  # seconds

os.makedirs(STORAGE_DIR, exist_ok=True)

def download_file(url, dest):
    logger.info(f"Downloading {url} to {dest}")
    response = requests.get(url, stream=True)
    response.raise_for_status()
    with open(dest, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    return dest

@app.route('/merge', methods=['POST'])
def merge_videos():
    data = request.json
    video_urls = data.get('video_urls', [])
    job_id = data.get('job_id', str(uuid.uuid4())) # Use provided job_id if available

    if not video_urls or not isinstance(video_urls, list):
        return jsonify({"success": False, "error": "No video_urls provided"}), 400

    job_dir = os.path.join(STORAGE_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)

    clips = []
    try:
        # 1. Download and load clips
        for i, url in enumerate(video_urls):
            temp_path = os.path.join(job_dir, f"input_{i}.mp4")
            download_file(url, temp_path)
            
            # Load clip and strip audio (noise stripping)
            clip = VideoFileClip(temp_path).without_audio()
            clips.append(clip)

        if not clips:
            return jsonify({"success": False, "error": "No clips loaded"}), 400

        # 2. Merge with transitions
        final_clips = []
        current_time = 0
        
        for i, clip in enumerate(clips):
            if i == 0:
                final_clips.append(clip.with_start(0))
                current_time = clip.duration
            else:
                start_time = current_time - TRANSITION_DURATION
                faded_clip = clip.with_start(start_time).with_effects([vfx.CrossFadeIn(TRANSITION_DURATION)])
                final_clips.append(faded_clip)
                current_time = start_time + clip.duration

        video = CompositeVideoClip(final_clips)
        total_duration = video.duration

        # 3. Handle Background Music
        audio_url = data.get('audio_url') or data.get('audio') # Support both naming conventions
        current_audio_file = MUSIC_FILE

        if audio_url:
            try:
                dynamic_audio_path = os.path.join(job_dir, "background_music.mp3")
                download_file(audio_url, dynamic_audio_path)
                current_audio_file = dynamic_audio_path
                logger.info(f"Using dynamic audio from {audio_url}")
            except Exception as e:
                logger.warning(f"Failed to download dynamic audio, falling back to default: {str(e)}")

        if os.path.isfile(current_audio_file):
            logger.info(f"Adding music from {current_audio_file}")
            audio = AudioFileClip(current_audio_file)
            
            # Loop audio to cover total_duration
            audio = audio.with_effects([afx.AudioLoop(duration=total_duration)])
            
            # Professional audio settings: fade in/out and volume adjustment
            fade_in = data.get('fade_in', 0.6)
            fade_out = data.get('fade_out', 1.0)
            gain_db = data.get('gain_db', -8)
            
            audio = audio.with_effects([
                afx.AudioFadeIn(fade_in),
                afx.AudioFadeOut(fade_out),
                afx.MultiplyVolume(10**(gain_db/20.0)) # Convert dB to factor
            ])
            
            video = video.with_audio(audio)
        else:
            logger.warning(f"Music file {current_audio_file} not found. Proceeding without music.")

        # 4. Export
        output_filename = f"tour_{job_id}.mp4"
        output_path = os.path.join(STORAGE_DIR, output_filename)
        
        # Write file (using high quality settings)
        video.write_videofile(
            output_path, 
            codec="libx264", 
            audio_codec="aac", 
            temp_audiofile=os.path.join(job_dir, 'temp-audio.m4a'), 
            remove_temp=True,
            fps=24,
            bitrate="5000k",
            audio_bitrate="192k"
        )

        video_url = f"http://172.245.56.50:5050/static/tours/{output_filename}"
        
        return jsonify({
            "success": True,
            "video_url": video_url,
            "job_id": job_id
        })

    except Exception as e:
        logger.error(f"Error during merge: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        # Close all clips to release files
        for clip in clips:
            try: clip.close() 
            except: pass
        # Note: We keep the final video in static/tours for serving

@app.route('/static/tours/<path:filename>')
def serve_video(filename):
    return send_from_directory(STORAGE_DIR, filename)

@app.get('/health')
def health():
    return jsonify({"status": "ok", "music_ready": os.path.exists(MUSIC_FILE)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050)
