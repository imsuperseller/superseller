#!/usr/bin/env node
/**
 * Download competitor ad videos from Facebook CDN → R2
 * Then update competitor_ads.video_url with R2 URLs.
 *
 * Run: node tools/cache-competitor-videos.mjs
 * Env: DATABASE_URL, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import pg from "pg";
import https from "https";
import http from "http";
import { randomUUID } from "crypto";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || "superseller-assets";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://pub-${R2_ACCOUNT_ID}.r2.dev`;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error("R2 credentials required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const pool = new Pool({ connectionString: DATABASE_URL });

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { timeout: 60000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url.substring(0, 80)}...`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

async function uploadToR2(buffer, key) {
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "video/mp4",
  }));
}

async function main() {
  console.log("Fetching competitor ads with Facebook CDN video URLs...");

  const { rows } = await pool.query(
    `SELECT id, video_url, page_name FROM competitor_ads
     WHERE video_url LIKE '%fbcdn.net%' AND tenant_id = 'elite-pro-remodeling'
     ORDER BY created_at DESC`
  );

  console.log(`Found ${rows.length} ads with Facebook CDN videos.`);

  let success = 0, fail = 0, skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const { id, video_url, page_name } = rows[i];
    const slug = (page_name || "unknown").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().substring(0, 40);
    const key = `competitor-ads/elite-pro/${slug}-${id.substring(0, 8)}.mp4`;
    const r2Url = `${R2_PUBLIC_URL}/${key}`;

    process.stdout.write(`[${i + 1}/${rows.length}] ${page_name?.substring(0, 30)}... `);

    try {
      const buffer = await downloadBuffer(video_url);
      if (buffer.length < 1000) {
        console.log(`SKIP (too small: ${buffer.length}b)`);
        skipped++;
        continue;
      }

      await uploadToR2(buffer, key);

      await pool.query(
        `UPDATE competitor_ads SET video_url = $1 WHERE id = $2`,
        [r2Url, id]
      );

      const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
      console.log(`OK (${sizeMB}MB) → ${key}`);
      success++;
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone! ${success} uploaded, ${fail} failed, ${skipped} skipped.`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
