import { queryOne } from "../src/db/client";
const uid = process.argv[2] || "c60b6d2f-856d-49fd-8737-7e1fee3fa848";
queryOne("SELECT id, avatar_url FROM users WHERE id = $1", [uid]).then((u) => {
  console.log(JSON.stringify(u, null, 2));
  process.exit(0);
}).catch((e) => { console.error(e); process.exit(1); });
