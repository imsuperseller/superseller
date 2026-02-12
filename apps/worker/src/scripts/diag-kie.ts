import axios from 'axios';

const url = "https://api.kie.ai/api/v1/veo/generate";
const headers = {
    "Authorization": "Bearer cb711f74a221be35a20df8e26e722e04",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

async function test() {
    console.log("Testing with Axios...");
    try {
        const res = await axios.post(url, {}, { headers });
        console.log("Axios Success:", res.status, res.data);
    } catch (err: any) {
        console.error("Axios Error:", err.response?.status, err.response?.data || err.message);
    }

    console.log("\nTesting with Fetch...");
    try {
        const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({})
        });
        const data = await res.json();
        console.log("Fetch Result:", res.status, data);
    } catch (err: any) {
        console.error("Fetch Error:", err.message);
    }
}

test();
