import { config } from "../config";
import { logger } from "../utils/logger";
import { query, queryOne } from "../db/client";
import { generateImageKie, KieImageRequest } from "./kie";
import { geminiChatCompletion } from "./gemini";
import { uploadToR2 } from "./r2";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

// ─── UAD CONFIGS ───

const UAD_COLLECTIONS = [
    'Classic™ Steel', 'Bridgeport™ Steel', 'Coachman®', 'Modern Steel™', 'Canyon Ridge® Collection',
];
const UAD_SIZES = ['8x7', '9x7', '10x7', '16x7', '16x8', '18x7', '18x8'];
const UAD_DESIGNS = ['Short Panel', 'Long Panel'];
const UAD_COLORS = ['White', 'Almond', 'Desert Tan', 'Sandtone', 'Bronze', 'Chocolate', 'Charcoal', 'Gray', 'Black'];
const UAD_CONSTRUCTIONS = [
    '2" Intellicore® Insulated R-18', '1 3/8" Intellicore R-12', '2" Polystyrene R-9', '1 3/8" Polystyrene R-6',
];
const UAD_SIZE_PRICES: Record<string, number> = {
    '8x7': 1800, '9x7': 2000, '10x7': 2200, '16x7': 3400, '16x8': 3800, '18x7': 4200, '18x8': 4600,
};

// ─── MISSPARTY CONFIGS ───

const MISSPARTY_SCENARIOS = [
    { setting: 'indoors', kids: 'few', balls: true, desc: 'Toddlers playing with colorful balls inside white bounce house in living room' },
    { setting: 'indoors', kids: 'many', balls: true, desc: 'Birthday party with kids jumping in white bouncy castle, colorful balls flying' },
    { setting: 'outdoors', kids: 'few', balls: false, desc: 'Two kids jumping in white bounce house in sunny backyard' },
    { setting: 'outdoors', kids: 'many', balls: true, desc: 'Backyard birthday party, white inflatable bouncer full of happy kids and balls' },
    { setting: 'indoors', kids: 'few', balls: false, desc: 'Kids jumping in white bounce house in garage, joyful moment' },
    { setting: 'outdoors', kids: 'many', balls: false, desc: 'Group of children bouncing in white inflatable castle at outdoor party' },
];
const MISSPARTY_PRICE = 75;
const MISSPARTY_DELIVERY = '$1/mile delivery available. Free pickup.';

// ─── SERVICE LOGIC ───

const TEMP_DIR = path.resolve(config.temp.dir, "marketplace");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

export class MarketplaceService {
    /**
     * Replenish the marketplace queue for a specific product ID ('uad' or 'missparty').
     */
    static async replenish(productId: string, count: number = 5) {
        logger.info({ msg: "Marketplace replenishment starting", productId, count });

        // 1. Get Product/Customer config from SaaS DB
        const product = await queryOne<any>(
            `SELECT * FROM marketplace_products WHERE status = 'ACTIVE' AND (id::text = $1 OR name ILIKE $1) LIMIT 1`,
            [productId]
        );
        if (!product) {
            logger.error({ msg: "Marketplace product not found", productId });
            return;
        }

        const customer = await queryOne<any>(
            `SELECT * FROM marketplace_customers WHERE id = $1`,
            [product.customer_id]
        );

        for (let i = 0; i < count; i++) {
            try {
                await this.generateAndPost(product, customer);
            } catch (err: any) {
                logger.error({ msg: "Failed to generate marketplace post", error: err.message, productId });
            }
        }
    }

    private static async generateAndPost(product: any, customer: any) {
        const productId = product.name.toLowerCase().includes('uad') ? 'uad' : 'missparty';

        // 1. Pick Location & Phone
        const location = this.getNextLocation(product);
        const phone = this.getNextPhone(product);

        // 2. Generate Unique Config
        const itemConfig = productId === 'uad' ? await this.genUadConfig() : this.genMissPartyConfig();

        // 3. Generate AI Copy
        const copy = await this.generateCopy(productId, itemConfig, location, phone);

        // 4. Generate AI Images
        const images = await this.generateImages(productId, itemConfig, phone);

        // 5. Insert into SaaS DB
        await query(
            `INSERT INTO marketplace_posts (
                customer_id, product_id, status, config_data, 
                image_url, image_url2, image_url3, video_url,
                listing_title, listing_description, price, location, phone_number
            ) VALUES ($1, $2, 'queued', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
                product.customer_id,
                product.id,
                JSON.stringify(itemConfig.configData),
                images.imageUrl,
                images.imageUrl2,
                images.imageUrl3,
                images.videoUrl || null,
                copy.title,
                copy.description,
                itemConfig.price,
                location,
                phone
            ]
        );

        logger.info({ msg: "Marketplace post queued", productId, title: copy.title });
    }

    private static async generateCopy(productId: string, config: any, location: string, phone: string) {
        const system = productId === 'uad'
            ? `You are a Facebook Marketplace listing copywriter for a garage door company in DFW. Write natural, conversational listings. No hashtags, no emojis. JSON format: {"title": "...", "description": "..."}`
            : `You are writing FB Marketplace listings for bounce house rentals in DFW. Fun, friendly, for parents. MUST include "$1/mile delivery" and "Free pickup". JSON format: {"title": "...", "description": "..."}`;

        const prompt = productId === 'uad'
            ? `Write a listing for a ${config.configData.size} ${config.configData.collection} in ${config.configData.color} in ${location}. Phone: ${phone}. Price: $${config.price}.`
            : `Write a listing for a white bounce house rental in ${location}. Scenario: ${config.configData.scenarioDesc}. Phone: ${phone}. Price: $75.`;

        const result = await geminiChatCompletion([
            { role: "system", content: system },
            { role: "user", content: prompt }
        ]);

        try {
            return JSON.parse(result.content.replace(/```json|```/g, ""));
        } catch (e) {
            // Fallback
            return { title: config.productName, description: `Call ${phone} for ${config.productName} in ${location}. Professional installation/rental available.` };
        }
    }

    private static async generateImages(productId: string, config: any, phone: string) {
        const results: any = { imageUrl: null, imageUrl2: null, imageUrl3: null, videoUrl: null };
        const subtitle = productId === 'uad' ? 'Free Estimates • Licensed & Insured' : '24hr Rentals • Dallas TX';

        let firstRawUrl: string | null = null;

        for (let i = 0; i < 3; i++) {
            const prompt = config.prompts[`prompt${i + 1}`];
            const activeRef = (i === 0) ? config.referenceImage : (firstRawUrl || config.referenceImage);

            const req: KieImageRequest = {
                prompt,
                model: activeRef ? "seedream/4.5-edit" : "flux-2/pro-text-to-image",
                image_urls: activeRef ? [activeRef] : undefined,
                aspect_ratio: "1:1"
            };

            const gen = await generateImageKie(req);
            if (i === 0) firstRawUrl = gen.url;

            // Apply overlay and upload to R2
            const localRaw = path.join(TEMP_DIR, `raw_${Date.now()}_${i}.jpg`);
            const localOverlay = path.join(TEMP_DIR, `overlay_${Date.now()}_${i}.jpg`);

            await this.download(gen.url, localRaw);
            this.applyOverlay(localRaw, localOverlay, phone, subtitle);

            const r2Key = `marketplace/${productId}/${Date.now()}_${i}.jpg`;
            const r2Url = await uploadToR2(localOverlay, r2Key);

            if (i === 0) results.imageUrl = r2Url;
            else if (i === 1) results.imageUrl2 = r2Url;
            else results.imageUrl3 = r2Url;

            // Cleanup
            fs.unlinkSync(localRaw);
            fs.unlinkSync(localOverlay);
        }

        return results;
    }

    private static async download(url: string, dest: string) {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(dest, Buffer.from(res.data));
    }

    private static applyOverlay(input: string, output: string, phone: string, subtitle: string) {
        const cmd = `convert "${input}" \\
            \\( -clone 0 -crop 100%x18%+0+82% +repage -fill "rgba(0,0,0,178)" -colorize 100% \\) -gravity South -composite \\
            -gravity South -fill white -font Helvetica-Bold -pointsize 48 -annotate +0+45 "CALL: ${phone}" \\
            -gravity South -fill white -font Helvetica -pointsize 20 -annotate +0+15 "${subtitle}" \\
            -quality 92 "${output}"`;
        execSync(cmd);
    }

    private static getNextLocation(product: any) {
        const locations = product.config?.locations || ["Dallas, TX"];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    private static getNextPhone(product: any) {
        const phones = product.config?.phoneRotation || ["+1-000-000-0000"];
        return phones[Math.floor(Math.random() * phones.length)];
    }

    private static async genUadConfig() {
        const collection = UAD_COLLECTIONS[Math.floor(Math.random() * UAD_COLLECTIONS.length)];
        const size = UAD_SIZES[Math.floor(Math.random() * UAD_SIZES.length)];
        const design = UAD_DESIGNS[Math.floor(Math.random() * UAD_DESIGNS.length)];
        const color = UAD_COLORS[Math.floor(Math.random() * UAD_COLORS.length)];
        const construction = UAD_CONSTRUCTIONS[Math.floor(Math.random() * UAD_CONSTRUCTIONS.length)];

        const basePrice = UAD_SIZE_PRICES[size] || 2500;
        const price = Math.round(basePrice * 1.1 * (0.95 + Math.random() * 0.1));

        return {
            productName: `${size} ${collection} Garage Door`,
            price,
            configData: { collection, size, design, color, construction },
            prompts: {
                prompt1: `${color} ${collection} garage door, ${design} design, suburban home exterior, realistic photo`,
                prompt2: `Close up of ${color} ${collection} garage door, ${design} pattern`,
                prompt3: `Wide shot of ${color} ${collection} garage door, curb appeal`
            }
        };
    }

    private static genMissPartyConfig() {
        const scenario = MISSPARTY_SCENARIOS[Math.floor(Math.random() * MISSPARTY_SCENARIOS.length)];
        return {
            productName: "White Bounce House Rental",
            price: MISSPARTY_PRICE,
            configData: { ...scenario, scenarioDesc: scenario.desc },
            prompts: {
                prompt1: `White bounce house, ${scenario.desc}, happy kids jumping`,
                prompt2: `White inflatable castle, party atmosphere`,
                prompt3: `White bouncy castle rental setup`
            }
        };
    }
}
