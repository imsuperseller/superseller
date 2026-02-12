import * as dotenv from "dotenv";
import * as path from "path";
const envPath = path.join(__dirname, "../../../.env");
console.log("Loading env from:", envPath);
const result = dotenv.config({ path: envPath });
console.log("Dotenv success:", !result.error);
console.log("Parsed keys:", result.parsed ? Object.keys(result.parsed) : "none");
console.log("process.env.DATABASE_URL ends with:", process.env.DATABASE_URL ? process.env.DATABASE_URL.slice(-10) : "UNDEFINED");
