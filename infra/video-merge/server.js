const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Download helper
const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

app.post('/merge', async (req, res) => {
    const { video_urls } = req.body;

    if (!video_urls || !Array.isArray(video_urls) || video_urls.length < 2) {
        return res.status(400).json({ error: 'Please provide at least 2 video URLs in "video_urls" array' });
    }

    const jobId = uuidv4();
    const jobDir = path.join(uploadDir, jobId);
    fs.mkdirSync(jobDir);

    try {
        console.log(`[${jobId}] Starting merge job for ${video_urls.length} videos`);

        // Filter out empty or invalid URLs
        const validUrls = video_urls.filter(url => url && typeof url === 'string' && url.trim().length > 0);

        if (validUrls.length < 1) {
            throw new Error(`No valid video URLs provided.`);
        }

        console.log(`[${jobId}] Processing ${validUrls.length} valid videos`);

        // Download all videos
        const downloadPromises = validUrls.map((url, index) => {
            const ext = path.extname(url).split('?')[0] || '.mp4';
            const dest = path.join(jobDir, `input_${index}${ext}`);
            return downloadFile(url, dest).then(() => dest);
        });

        const inputFiles = await Promise.all(downloadPromises);
        console.log(`[${jobId}] Downloads complete`);

        // Create file list for ffmpeg
        const listPath = path.join(jobDir, 'inputs.txt');
        const fileContent = inputFiles.map(f => `file '${f}'`).join('\n');
        fs.writeFileSync(listPath, fileContent);

        const outputPath = path.join(jobDir, 'output.mp4');

        // Merge using concat demuxer
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(listPath)
                .inputOptions(['-f', 'concat', '-safe', '0'])
                .outputOptions('-c', 'copy')
                .save(outputPath)
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`[${jobId}] Merge complete`);

        // Stream file back
        res.setHeader('Content-Type', 'video/mp4');
        const readStream = fs.createReadStream(outputPath);
        readStream.pipe(res);

        // Cleanup after sending (approx 1 min later to allow stream to finish)
        setTimeout(() => {
            fs.rmSync(jobDir, { recursive: true, force: true });
        }, 60000);

    } catch (error) {
        console.error(`[${jobId}] Error:`, error);
        res.status(500).json({ error: 'Merge failed', details: error.message });
        // Cleanup on error
        fs.rmSync(jobDir, { recursive: true, force: true });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'video-merge' });
});

app.listen(PORT, () => {
    console.log(`Video Merge Service running on port ${PORT}`);
});
