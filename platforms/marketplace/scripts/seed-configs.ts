import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CLIENTS = [
  {
    id: 'uad',
    category: 'Property for Rent',
    config: {
      tableId: '6T8jI35R2tX1Mni9',
      flowType: 'IMAGE',
      modelName: 'flux-pro-1.1',
      prompts: [
        "A hyper-realistic photo of a modern garage door, sleek aluminum finish, morning sunlight",
        "A cozy suburban home with a wooden carriage-style garage door, warm evening lighting",
      ],
      technical: { profileId: 'Profile_UAD_123', videoSuffix: '_garage' },
    },
    secrets: {}, // populate with actual creds when deploying
  },
  {
    id: 'missparty',
    category: 'Property for Rent',
    config: {
      tableId: 'lOkdHmJ3IHnz4cPR',
      flowType: 'VIDEO',
      modelName: 'bytedance/v1-pro-fast-image-to-video',
      prompts: [
        "A cinematic video of a beautiful white inflatable bounce house in a sunny backyard, children joyfully bouncing inside, gentle camera movement",
      ],
      technical: { profileId: 'Profile_MissParty_456', videoSuffix: '_bounce' },
    },
    secrets: {},
  },
];

async function seedConfigs() {
  console.log("Seeding marketplace_clients...");

  for (const client of CLIENTS) {
    await pool.query(
      `INSERT INTO marketplace_clients (id, category, config, secrets)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         category = EXCLUDED.category,
         config = EXCLUDED.config,
         updated_at = NOW()`,
      [client.id, client.category, JSON.stringify(client.config), JSON.stringify(client.secrets)]
    );
    console.log(`  + ${client.id} (${client.config.flowType})`);
  }

  console.log("Done.");
  await pool.end();
}

seedConfigs().catch(console.error);
