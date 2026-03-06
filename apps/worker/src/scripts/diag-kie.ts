import axios from 'axios';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const apiKey = process.env.KIE_API_KEY;
if (!apiKey) { console.error("KIE_API_KEY env var required"); process.exit(1); }

const KIE_BASE = process.env.KIE_BASE_URL || "https://api.kie.ai/api";
const url = `${KIE_BASE}/gemini-1.5-flash/v1/chat/completions`;
const method = "POST";
const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

async function test() {
    console.log("Testing with Axios...");
    try {
        const res = await axios.post(url, { model: "google/gemini-1.5-flash", messages: [{ role: "user", content: "hi" }] }, { headers });
        console.log("Axios Success:", res.status, res.data);
    } catch (err: any) {
        console.error("Axios Error:", err.response?.status, err.response?.data || err.message);
    }

    console.log("\nTesting with Fetch...");
    try {
        const res = await fetch(url, {
            method: "POST",
            headers,

        });
        const data = await res.json();
        console.log("Fetch Result:", res.status, data);
    } catch (err: any) {
        console.error("Fetch Error:", err.message);
    }
}

test();
