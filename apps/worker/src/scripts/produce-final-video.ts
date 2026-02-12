import { analyzeFloorplan, buildTourSequence } from "../services/floorplan-analyzer";
import { generateClipPrompts } from "../services/prompt-generator";
import { createVeoTask, waitForTask, createSunoTask } from "../services/kie";
import { normalizeClip, stitchClips, addMusicOverlay, generateVariants, extractLastFrame } from "../services/ffmpeg";
import { uploadToR2, buildR2Key } from "../services/r2";
import { logger } from "../utils/logger";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { config } from "../config";
// Native fetch used

async function produceFinalVideo() {
    const floorplanPath = "/Users/shaifriedman/floor_plan.webp";
    const exteriorPath = "/Users/shaifriedman/474447580_10162710146543846_2609663045130967931_n-removebg-preview.png";
    const jobId = `test-prod-${Date.now()}`;
    const userId = "00000000-0000-0000-0000-000000000000"; // Internal Test User
    const workDir = join(config.temp.dir, jobId);

    console.log(`\n🎬 STARTING PRODUCTION PIPELINE [ID: ${jobId}] 🎬`);

    if (!existsSync(workDir)) mkdirSync(workDir, { recursive: true });

    try {
        // 1. ANALYSIS
        console.log("Analyzing Floorplan with Project Bible Vision Prompt...");
        const analysis = await analyzeFloorplan(floorplanPath, {
            property_type: "Single Family House",
            city: "Allen",
            state: "TX"
        } as any);

        const tour = buildTourSequence(analysis);
        console.log(`Generated sequence with ${tour.length} transitions.`);

        // 2. PROMPTS
        console.log("Generating Cinematic prompts using Master Template...");
        const prompts = await generateClipPrompts(tour, {
            property_type: "Single Family House",
            exterior_description: "Traditional brick suburban home with black shutters",
            style: "traditional"
        });

        // 3. CLIPS (Generating the first 3 for this production test to save time and credits while proving quality)
        console.log(`Generating the first 3 production clips to verify cinematic quality...`);
        const clipFiles: string[] = [];
        let lastFrameUrl: string | null = exteriorPath;

        for (let i = 0; i < Math.min(prompts.length, 3); i++) {
            const p = prompts[i];
            console.log(`[Clip ${i + 1}/${prompts.length}] ${p.from_room} -> ${p.to_room}`);

            const taskId = await createVeoTask({
                prompt: p.prompt,
                image_url: lastFrameUrl!,
                model: "veo3_fast",
                duration: 5,
                negative_prompt: p.negative_prompt
            });

            const status = await waitForTask(taskId);
            if (!status.result?.video_url) throw new Error("Veo generation result missing URL");

            const videoPath = join(workDir, `clip_${i + 1}.mp4`);
            const response = await fetch(status.result.video_url);
            writeFileSync(videoPath, Buffer.from(await response.arrayBuffer()));

            // Normalize for stitching
            const normPath = join(workDir, `clip_${i + 1}_norm.mp4`);
            await normalizeClip(videoPath, normPath);
            clipFiles.push(normPath);

            // Extract last frame for next clip continuity
            const lastFramePath = join(workDir, `clip_${i + 1}_last.jpg`);
            await extractLastFrame(videoPath, lastFramePath);
            lastFrameUrl = await uploadToR2(lastFramePath, buildR2Key(userId, jobId, `frames/clip_${i + 1}_end.jpg`));
        }

        // 4. STITCHING & MUSIC
        console.log("Stitching and adding Bible-compliant music...");
        const silentPath = join(workDir, "master_silent.mp4");
        await stitchClips(clipFiles, silentPath);

        // SOTA 2026: Generate custom Bible-compliant soundtrack via Suno V5
        console.log("Generating custom soundtrack via Suno V5...");
        const sunoTaskId = await createSunoTask({
            prompt: "luxury real estate tour, elegant piano, ambient cinematic beats, high-end feel",
            model: "V5"
        });
        const sunoStatus = await waitForTask(sunoTaskId, "suno");
        if (!sunoStatus.result?.video_url) throw new Error("Suno generation result missing URL");

        const musicPath = join(workDir, "music.mp3");
        const mResp = await fetch(sunoStatus.result.video_url);
        writeFileSync(musicPath, Buffer.from(await mResp.arrayBuffer()));

        const finalPath = join(workDir, "final_production.mp4");
        await addMusicOverlay(silentPath, musicPath, finalPath);

        // 5. UPLOAD
        console.log("Uploading final production video...");
        const finalUrl = await uploadToR2(finalPath, buildR2Key(userId, jobId, "final_production.mp4"));

        console.log("\n✅ PRODUCTION COMPLETE ✅");
        console.log("Final Video URL:", finalUrl);

    } catch (err: any) {
        console.error("\n❌ PRODUCTION FAILED ❌");
        console.error(err.message);
    }
}

produceFinalVideo();
