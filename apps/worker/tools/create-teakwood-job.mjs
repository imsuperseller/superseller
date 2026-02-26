import { readFileSync } from "fs";
const API = "http://localhost:3001";
const IMG = "/Users/shaifriedman/.cursor/projects/Users-shaifriedman-New-SuperSeller AI-superseller/assets/PXL_20230316_112507103_Original-7392d665-557f-437f-805a-aa190a87c24f.png";
const ZILLOW = "https://www.zillow.com/homedetails/2752-Teakwood-Ln-Plano-TX-75075/26596928_zpid/";

const base64 = readFileSync(IMG).toString("base64");
const userId = (await (await fetch(`${API}/api/dev/ensure-test-user`, { method: "POST" })).json()).userId;
const r = await fetch(`${API}/api/jobs/from-zillow`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    addressOrUrl: ZILLOW,
    userId,
    realtorBase64: base64,
    realtorContentType: "image/png",
  }),
});
const d = await r.json();
if (!r.ok) throw new Error(JSON.stringify(d));
console.log(d.job?.id);
