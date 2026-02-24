#!/usr/bin/env node
/**
 * Yossi Laham Purim Bar Mitzvah Video — "Serious People, Embarrassing Costumes"
 * March 5th, Loft Club Haifa | Mivnim Group (קבוצת מבנים)
 *
 * Strategy: Nano Banana Pro images → FFmpeg Ken Burns animation → Stitch + Music + Overlays
 * (Kling 3.0 is down on Kie.ai — using image gen + cinematic pan/zoom as fallback)
 *
 * Run: node apps/worker/tools/produce-yossi-purim.mjs
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ── Config ──────────────────────────────────────────────────────────
const KIE_API_KEY = process.env.KIE_API_KEY || "cb711f74a221be35a20df8e26e722e04";
const KIE_BASE = "https://api.kie.ai/api";
const HEADERS = {
  Authorization: `Bearer ${KIE_API_KEY}`,
  "Content-Type": "application/json",
};

const R2_ENDPOINT = process.env.R2_ENDPOINT || "https://46a5b8a6516f86865992dbdfdb3cd77b.r2.cloudflarestorage.com";
const R2_BUCKET = process.env.R2_BUCKET || "zillow-to-video-finals";
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID || "b6326c4a74421a530ce9d577bb96555d";
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY || "ac0f9225863a96588ba35905c614d9bf5c1fd59eb7b29c375eeb6422116cf2f1";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev";

const WORK_DIR = "/tmp/yossi-purim-video";
const POLL_INTERVAL = 5000; // 5s for image gen (faster than video)
const TIMEOUT = 300000; // 5 min per image task

// ── Scene Definitions (optimized for image generation) ──────────────
const SCENES = [
  {
    id: "scene1_developer",
    duration: 5,
    prompt: "Cinematic wide shot of a handsome confident Israeli businessman in his 40s wearing an expensive tailored navy blue suit, perfectly buttoned white shirt, designer sunglasses on top of his head. Standing tall at a modern high-rise residential construction site. Construction workers in hard hats and orange vests working on a tall building behind him, cranes visible in the sky. He faces the camera with a charming powerful smile. Golden hour sunset lighting, warm tones, lens flare. Photorealistic 4K quality. Professional corporate magazine cover feel.",
    zoom: "in", // slow zoom in on the character
  },
  {
    id: "scene2_developer_costume",
    duration: 5,
    prompt: "A handsome man in his 40s wearing a full bright red and blue Superman costume with a flowing red cape, walking confidently through a luxury nightclub entrance with purple and blue neon lights glowing. He strikes a heroic pose with one fist raised, grinning widely. Dramatic cinematic lighting. Party atmosphere with fog and colored lights behind him. Purim costume comedy. Photorealistic, high energy, fun. Wide angle shot.",
    zoom: "out", // dramatic reveal zoom out
  },
  {
    id: "scene3_lawyer",
    duration: 5,
    prompt: "A distinguished Israeli lawyer in his 50s, silver-haired, wearing a perfectly fitted charcoal gray three-piece suit and dark silk tie. Standing confidently in front of a massive mahogany desk in a prestigious high-end law office. Floor-to-ceiling bookshelves filled with leather-bound law books behind him. Elegant brass lamp on the desk. Rich warm office lighting, golden tones. He looks directly at camera with a serious professional expression. Photorealistic, cinematic portrait, executive feel.",
    zoom: "in", // slow zoom in
  },
  {
    id: "scene4_lawyer_costume",
    duration: 5,
    prompt: "The same distinguished silver-haired man from a law office now wearing an outrageously funny Purim costume — a bright pink tutu ballet skirt, a wild blonde curly wig, oversized heart-shaped sunglasses, and a sparkly tiara. He dances with his arms up laughing in a luxury nightclub with pulsing colored LED lights, confetti, and fog machines. Hilarious contrast of serious face with ridiculous outfit. Photorealistic, bright energetic party lighting. Comedy gold.",
    zoom: "out", // reveal the ridiculous costume
  },
  {
    id: "scene5_trump_oval",
    duration: 5,
    prompt: "A powerful man with distinctive styled blonde swept-back hair wearing a long dark navy tailored suit and bright red tie, sitting behind the famous presidential Resolute desk in the Oval Office. American flags with golden fringe standing behind him. He looks directly at the camera with a very serious signature expression, one hand raised making a pointing gesture. Presidential setting with dramatic patriotic lighting, warm tones. Cinematic quality, photorealistic, wide angle showing the full Oval Office.",
    zoom: "in", // dramatic zoom on the presidential figure
  },
  {
    id: "scene6_trump_costume",
    duration: 5,
    prompt: "The same powerful blonde-haired man now wearing a long flowing black and dark green robe, a large black turban wrapped on his head, and a ridiculously long fake gray beard reaching his chest. He grins mischievously at the camera with one eyebrow raised, standing in front of ornate golden doors with colorful neon party lights glowing behind them. Comedy costume transformation. Purim celebration humor. Cinematic lighting with dramatic contrast. Photorealistic, wide shot.",
    zoom: "out", // reveal the absurd transformation
  },
  {
    id: "scene7_party",
    duration: 10,
    prompt: "An explosive wild Purim costume party inside a massive luxury nightclub. Hundreds of LED lights flashing in purple, blue, pink, and gold. Confetti and metallic streamers falling from the ceiling. Fog machines creating dramatic atmosphere. Dozens of people in outrageous Purim costumes — superheroes, pirates, princesses, clowns, animals — all dancing with arms up. A professional DJ at a huge turntable booth with screens behind. High energy peak celebration moment. VIP bottle service tables visible. Extreme wide angle cinematic shot capturing the entire venue. Photorealistic, festival atmosphere.",
    zoom: "slow_in", // very slow zoom into the chaos
  },
];

// ── Music (already generated from Suno V5 in previous run) ──────────
const MUSIC_URL = "https://tempfile.aiquickdraw.com/r/fbedbfa8d0dc4c288ba2e5c4f33b6636.mp3";

// ── API Helpers ─────────────────────────────────────────────────────

async function createNanoBananaTask(prompt) {
  const body = {
    model: "nano-banana-pro",
    input: {
      prompt,
      aspect_ratio: "16:9",
      resolution: "2K",
      output_format: "png",
    },
  };

  const res = await fetch(`${KIE_BASE}/v1/jobs/createTask`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Nano Banana create failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  if (data.code !== 200 && data.code !== 0) throw new Error(`Nano Banana API error: ${data.msg}`);
  return data.data.taskId;
}

async function pollImageTask(taskId) {
  const start = Date.now();

  while (Date.now() - start < TIMEOUT) {
    const res = await fetch(`${KIE_BASE}/v1/jobs/recordInfo?taskId=${taskId}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Poll failed (${res.status})`);
    const data = await res.json();
    const d = data.data;

    if (!d) {
      await sleep(POLL_INTERVAL);
      continue;
    }

    const state = (d.state || "").toLowerCase();

    if (state === "success") {
      const resultStr = d.resultJson;
      if (resultStr) {
        const parsed = typeof resultStr === "string" ? JSON.parse(resultStr) : resultStr;
        const urls = parsed.resultUrls || [];
        if (Array.isArray(urls) && urls.length > 0) {
          return typeof urls[0] === "string" ? urls[0] : urls[0]?.url;
        }
      }
      throw new Error(`Task ${taskId} completed but no URL found`);
    }

    if (state === "fail" || state === "failed") {
      throw new Error(`Task ${taskId} failed: ${d.failMsg || "Unknown"}`);
    }

    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`  [${taskId.slice(0, 8)}] ${state}... (${elapsed}s)`);
    await sleep(POLL_INTERVAL);
  }

  throw new Error(`Task ${taskId} timed out`);
}

async function downloadFile(url, localPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(localPath, buffer);
  console.log(`  Downloaded: ${localPath} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── R2 Upload ───────────────────────────────────────────────────────

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY,
    },
  });
}

async function uploadToR2(localPath, r2Key) {
  const s3 = getR2Client();
  const body = readFileSync(localPath);
  const contentType = r2Key.endsWith(".mp4") ? "video/mp4" : "application/octet-stream";

  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    Body: body,
    ContentType: contentType,
  }));

  const publicUrl = `${R2_PUBLIC_URL}/${r2Key}`;
  console.log(`  Uploaded to R2: ${publicUrl}`);
  return publicUrl;
}

// ── FFmpeg Ken Burns Animation ──────────────────────────────────────

function createKenBurnsClip(imagePath, outputPath, duration, zoomType) {
  // Ken Burns: slow zoom/pan on still image to create cinematic motion
  // All output 1920x1080 @ 24fps
  const fps = 24;
  const totalFrames = duration * fps;

  let filter;
  switch (zoomType) {
    case "in":
      // Slow zoom in from 1.0x to 1.15x, centered
      filter = `zoompan=z='min(zoom+0.00065,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=1920x1080:fps=${fps}`;
      break;
    case "out":
      // Zoom out from 1.2x to 1.0x, centered
      filter = `zoompan=z='if(eq(on,1),1.2,max(zoom-0.00085,1.0))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=1920x1080:fps=${fps}`;
      break;
    case "slow_in":
      // Very slow zoom in (for longer party scene)
      filter = `zoompan=z='min(zoom+0.0004,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=1920x1080:fps=${fps}`;
      break;
    default:
      // Default: slight pan right with zoom
      filter = `zoompan=z='min(zoom+0.0005,1.1)':x='if(eq(on,1),0,min(x+1,iw-iw/zoom))':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=1920x1080:fps=${fps}`;
  }

  execSync(
    `ffmpeg -y -loop 1 -i "${imagePath}" -vf "${filter},format=yuv420p" -c:v libx264 -crf 18 -preset fast -t ${duration} -r ${fps} "${outputPath}"`,
    { stdio: "pipe", timeout: 60000 }
  );
}

function concatClipsWithTransitions(clipPaths, outputPath) {
  // Concat with 0.5s crossfade between clips
  if (clipPaths.length === 1) {
    execSync(`cp "${clipPaths[0]}" "${outputPath}"`);
    return;
  }

  // Build xfade filter chain for crossfade transitions
  const fadeDuration = 0.5;
  let filterComplex = "";
  let lastOutput = "[0:v]";

  for (let i = 1; i < clipPaths.length; i++) {
    const offset = clipPaths.slice(0, i).reduce((sum, _, idx) => {
      const scene = SCENES[idx];
      return sum + scene.duration - fadeDuration;
    }, 0);

    const output = i === clipPaths.length - 1 ? "[vout]" : `[v${i}]`;
    filterComplex += `${lastOutput}[${i}:v]xfade=transition=fade:duration=${fadeDuration}:offset=${offset.toFixed(2)}${output};`;
    lastOutput = output;
  }

  // Remove trailing semicolon
  filterComplex = filterComplex.slice(0, -1);

  const inputs = clipPaths.map(p => `-i "${p}"`).join(" ");
  execSync(
    `ffmpeg -y ${inputs} -filter_complex "${filterComplex}" -map "[vout]" -c:v libx264 -crf 18 -preset fast -r 24 "${outputPath}"`,
    { stdio: "pipe", timeout: 120000 }
  );
}

function addMusic(videoPath, musicPath, outputPath) {
  const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`).toString().trim();
  const videoDur = parseFloat(durStr);

  const fadeOut = Math.max(0, videoDur - 3);
  execSync(
    `ffmpeg -y -i "${videoPath}" -i "${musicPath}" -filter_complex "[1:a]volume=0.35,afade=t=in:ss=0:d=2,afade=t=out:st=${fadeOut}:d=3[music];[music]atrim=0:${videoDur}[trimmed]" -map 0:v -map "[trimmed]" -c:v copy -c:a aac -shortest "${outputPath}"`,
    { stdio: "pipe", timeout: 60000 }
  );
}

function addTextOverlays(inputPath, outputPath) {
  const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`).toString().trim();
  const totalDur = parseFloat(durStr);

  const fontFile = existsSync("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
    ? "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    : "";
  const fontParam = fontFile ? `fontfile=${fontFile}:` : "";

  const closeStart = Math.max(0, totalDur - 8);

  const filters = [
    // Opening: company name top center (fade in 0-1.5, visible, fade out 4-5)
    `drawtext=${fontParam}text='MIVNIM GROUP':fontsize=52:fontcolor=white:borderw=3:bordercolor=black@0.7:x=(w-text_w)/2:y=50:enable='between(t,0.5,5)':alpha='if(lt(t,1.5),min(1,(t-0.5)),if(gt(t,4),max(0,1-(t-4)),1))'`,
    // Opening: Hebrew subtitle
    `drawtext=${fontParam}text='קבוצת מבנים':fontsize=38:fontcolor=white:borderw=2:bordercolor=black@0.7:x=(w-text_w)/2:y=115:enable='between(t,0.8,5)':alpha='if(lt(t,1.8),min(1,(t-0.8)),if(gt(t,4),max(0,1-(t-4)),1))'`,
    // Closing: פורים שמח big center
    `drawtext=${fontParam}text='פורים שמח':fontsize=80:fontcolor=white:borderw=5:bordercolor=black@0.8:x=(w-text_w)/2:y=(h-text_h)/2-80:enable='between(t,${closeStart},${totalDur})':alpha='min(1,(t-${closeStart})*1.5)'`,
    // Closing: date and venue
    `drawtext=${fontParam}text='5.3.2026 | Loft Club Haifa':fontsize=40:fontcolor=white:borderw=3:bordercolor=black@0.7:x=(w-text_w)/2:y=(h-text_h)/2+30:enable='between(t,${closeStart + 1},${totalDur})':alpha='min(1,(t-${closeStart + 1})*2)'`,
    // Closing: Mivnim branding bottom
    `drawtext=${fontParam}text='MIVNIM | מבנים':fontsize=32:fontcolor=white:borderw=2:bordercolor=black@0.7:x=(w-text_w)/2:y=h-70:enable='between(t,${closeStart + 1.5},${totalDur})':alpha='min(1,(t-${closeStart + 1.5})*2)'`,
  ].join(",");

  execSync(
    `ffmpeg -y -i "${inputPath}" -vf "${filters}" -c:v libx264 -crf 18 -preset fast -c:a copy "${outputPath}"`,
    { stdio: "pipe", timeout: 120000 }
  );
}

// ── Main Pipeline ───────────────────────────────────────────────────

async function main() {
  console.log("=== YOSSI LAHAM PURIM VIDEO PRODUCTION (Nano Banana + Ken Burns) ===");
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Scenes: ${SCENES.length}`);
  console.log(`Strategy: Nano Banana Pro images → FFmpeg Ken Burns animation`);
  console.log(`Work dir: ${WORK_DIR}`);
  console.log();

  if (!existsSync(WORK_DIR)) mkdirSync(WORK_DIR, { recursive: true });

  // ── Step 1: Generate all images with Nano Banana Pro (staggered) ──
  console.log("STEP 1: Generating scene images (Nano Banana Pro, staggered 2s)...");

  const imageResults = [];
  for (const scene of SCENES) {
    try {
      const taskId = await createNanoBananaTask(scene.prompt);
      console.log(`  ✅ ${scene.id}: created taskId=${taskId.slice(0, 12)}...`);
      imageResults.push({ scene, taskId });
    } catch (e) {
      console.error(`  ❌ ${scene.id}: ${e.message}`);
      imageResults.push({ scene, taskId: null, error: e.message });
    }
    await sleep(2000); // 2s stagger
  }

  const activeTasks = imageResults.filter(r => r.taskId);
  console.log(`\nSTEP 2: Polling ${activeTasks.length} image tasks...`);

  // ── Step 2: Poll all image tasks ──
  const completedImages = await Promise.all(
    activeTasks.map(async (task) => {
      try {
        const imageUrl = await pollImageTask(task.taskId);
        console.log(`  ✅ ${task.scene.id}: ${imageUrl.slice(0, 60)}...`);
        return { ...task, imageUrl };
      } catch (e) {
        console.error(`  ❌ ${task.scene.id}: ${e.message}`);
        return { ...task, imageUrl: null, error: e.message };
      }
    })
  );

  const successfulImages = completedImages.filter(r => r.imageUrl);
  if (successfulImages.length === 0) {
    console.error("\n❌ No images generated. Aborting.");
    process.exit(1);
  }

  // ── Step 3: Download images + music ──
  console.log(`\nSTEP 3: Downloading ${successfulImages.length} images + music...`);

  const imagePaths = [];
  for (const result of successfulImages) {
    const imgPath = join(WORK_DIR, `${result.scene.id}.png`);
    await downloadFile(result.imageUrl, imgPath);
    imagePaths.push({ path: imgPath, scene: result.scene });
  }

  const musicPath = join(WORK_DIR, "music.mp3");
  await downloadFile(MUSIC_URL, musicPath);

  // ── Step 4: Create Ken Burns animated clips from each image ──
  console.log(`\nSTEP 4: Animating ${imagePaths.length} images with Ken Burns...`);

  const clipPaths = [];
  for (const { path: imgPath, scene } of imagePaths) {
    const clipPath = join(WORK_DIR, `${scene.id}_clip.mp4`);
    console.log(`  Animating ${scene.id} (${scene.duration}s, ${scene.zoom})...`);
    createKenBurnsClip(imgPath, clipPath, scene.duration, scene.zoom);
    console.log(`  ✅ ${scene.id} animated`);
    clipPaths.push(clipPath);
  }

  // ── Step 5: Stitch with crossfade transitions ──
  console.log(`\nSTEP 5: Stitching ${clipPaths.length} clips with crossfades...`);
  const masterSilent = join(WORK_DIR, "master_silent.mp4");
  concatClipsWithTransitions(clipPaths, masterSilent);
  console.log(`  ✅ Master silent video created`);

  // ── Step 6: Add music ──
  console.log("\nSTEP 6: Adding Suno party music...");
  const masterWithMusic = join(WORK_DIR, "master_with_music.mp4");
  addMusic(masterSilent, musicPath, masterWithMusic);
  console.log(`  ✅ Music added`);

  // ── Step 7: Add text overlays ──
  console.log("\nSTEP 7: Adding text overlays (Mivnim branding + Purim)...");
  const masterFinal = join(WORK_DIR, "master_final.mp4");
  addTextOverlays(masterWithMusic, masterFinal);
  console.log(`  ✅ Final video with overlays created`);

  // ── Step 8: Upload to R2 ──
  console.log("\nSTEP 8: Uploading to R2...");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const r2Key = `mivnim/purim-2026/${timestamp}_purim_party.mp4`;
  const publicUrl = await uploadToR2(masterFinal, r2Key);

  // ── Done ──
  const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${masterFinal}"`).toString().trim();

  console.log("\n" + "=".repeat(60));
  console.log("✅ PRODUCTION COMPLETE");
  console.log("=".repeat(60));
  console.log(`Duration: ${parseFloat(durStr).toFixed(1)}s`);
  console.log(`Images: ${successfulImages.length}/${SCENES.length}`);
  console.log(`Music: Suno V5 party track`);
  console.log(`R2 URL: ${publicUrl}`);
  console.log(`Local: ${masterFinal}`);
  console.log("=".repeat(60));
  console.log("\nNOTE: This version uses Ken Burns animation on AI images.");
  console.log("When Kling 3.0 comes back online, re-run with video generation for full motion.");
}

main().catch((e) => {
  console.error("\n❌ FATAL:", e.message);
  console.error(e.stack);
  process.exit(1);
});
