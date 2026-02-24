/**
 * Dynamic content generator for Facebook Marketplace listings.
 * Uses Gemini 2.5 Flash via Kie.ai API (OpenAI-compatible) to generate city-specific listing copy.
 *
 * UAD: Door-config-specific prompts (collection, size, design, color, construction)
 * MissParty: Scenario-specific prompts with "$1/mile delivery" pricing
 *
 * API docs: NotebookLM 3e820274 (KIE.AI)
 * Endpoint: https://api.kie.ai/gemini-2.5-flash/v1/chat/completions
 * Auth: Bearer KIE_API_KEY
 */

const KIE_API_KEY = process.env.KIE_API_KEY || '';
const GEMINI_URL = 'https://api.kie.ai/gemini-2.5-flash/v1/chat/completions';

// Per-product prompt templates
const PRODUCT_PROMPTS = {
    uad: {
        system: `You are a Facebook Marketplace listing copywriter for a garage door company in the DFW (Dallas-Fort Worth) area.
Write natural, professional listings that feel like a local business owner posting.
Never use hashtags, emojis, or marketing jargon. No emojis whatsoever. Keep it genuine and conversational.
The company does garage door installation, repair, and replacement.
Return ONLY valid JSON: {"title": "...", "description": "..."}`,
        template: (job, city, phone) => {
            // If config details are provided, use them for specificity
            const collection = job.collection || job.configData?.collection || '';
            const size = job.size || job.configData?.size || '';
            const design = job.design || job.configData?.design || '';
            const color = job.color || job.configData?.color || '';
            const construction = job.construction || job.configData?.construction || '';
            const price = job.price || job.listingPrice || 2500;

            if (collection) {
                return `Write a Facebook Marketplace listing for a specific garage door in ${city}.

Door configuration:
- Collection: ${collection}
- Size: ${size}
- Design: ${design}
- Color: ${color}
- Construction: ${construction}
- Price: $${price}
- Phone: ${phone}

Requirements:
1. Title: Under 100 characters. Include the collection name and city naturally (e.g. "${size} ${collection} - ${city.replace(', TX', '')}").
2. Description: 3-5 sentences. Mention the specific door details (collection, color, design). Mention the city/area naturally. Include the phone number. Mention free estimates and professional installation.
3. Do NOT use generic "garage door" — reference the specific ${collection} in ${color}.
4. Sound like a real local business owner, not an ad. Vary wording each time.`;
            }

            // Fallback for listings without config details
            return `Write a Facebook Marketplace listing for a garage door service in ${city}.

Base product info:
- Title hint: ${job.title || 'Garage Door Installation & Repair'}
- Price: $${price}
- Phone: ${phone}

Requirements:
1. Title: Under 100 characters. Mention the city naturally.
2. Description: 3-5 sentences. Mention the city/area naturally. Include the phone number. Mention free estimates and professional installation.
3. Each listing should feel unique — vary the wording, structure, and emphasis.`;
        }
    },
    missparty: {
        system: `You are writing Facebook Marketplace listings for a bounce house and party rental company serving the DFW area.
Write fun, friendly listings that appeal to parents planning kids' parties.
Keep it natural — like a real person posting, not a corporate ad. No hashtags. No emojis.
IMPORTANT: Always include "$1/mile delivery" pricing and "Free pickup" in the description.
Return ONLY valid JSON: {"title": "...", "description": "..."}`,
        template: (job, city, phone) => {
            const scenarioDesc = job.scenarioDesc || job.configData?.scenarioDesc || '';
            const setting = job.configData?.setting || '';
            const kids = job.configData?.kids || '';
            const balls = job.configData?.balls;
            const delivery = job.delivery || '$1/mile delivery available. Free pickup.';

            if (scenarioDesc) {
                return `Write a Facebook Marketplace listing for bounce house rental in ${city}.

Scenario details:
- Setting: ${setting} party
- Kids: ${kids === 'many' ? 'big group of kids' : 'small group / toddlers'}
- Ball pit: ${balls ? 'yes, colorful balls included' : 'no ball pit'}
- Scenario vibe: ${scenarioDesc}
- Price: $75 flat rate (24-hour rental)
- Delivery: ${delivery}
- Phone: ${phone}

Requirements:
1. Title: Under 100 characters. Mention the city naturally (e.g. "Bounce House Rental - ${city.replace(', TX', '')}" or "${city.replace(', TX', '')} Party Fun").
2. Description: 3-5 sentences. Paint the picture of the ${setting} party scenario. Mention the 24hr rental period. MUST include "$1/mile delivery available" and "Free pickup". Include the phone number.
3. Price is $75 flat — do not say anything different.
4. Sound enthusiastic but real. Vary the angle based on the scenario (birthday, backyard BBQ, family event, etc.).`;
            }

            // Fallback
            return `Write a Facebook Marketplace listing for bounce house rentals in ${city}.

Base product info:
- Product: ${job.title || 'White Bounce House Rental'}
- Price: $75 (24-hour rental)
- Delivery: ${delivery}
- Phone: ${phone}

Requirements:
1. Title: Under 100 characters. Mention the city or area naturally.
2. Description: 3-5 sentences. Mention the city/area. Include the phone number. Mention delivery ($1/mile), free pickup, setup, 24hr rental period.
3. Price is $75 flat — do not say anything different.
4. Each listing should feel unique.`;
        }
    }
};

/**
 * Generate unique listing copy for a specific city using Gemini 2.5 Flash via Kie.ai.
 * Returns { title, description } or null on failure.
 */
async function generateListingCopy(clientId, job, city, phone) {
    if (!KIE_API_KEY) {
        console.log(`[${clientId.toUpperCase()}] No KIE_API_KEY — using DB copy`);
        return null;
    }

    const prompts = PRODUCT_PROMPTS[clientId];
    if (!prompts) {
        console.log(`[${clientId.toUpperCase()}] No prompt template — using DB copy`);
        return null;
    }

    try {
        const userPrompt = prompts.template(job, city, phone);

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KIE_API_KEY}`
            },
            body: JSON.stringify({
                messages: [
                    { role: 'developer', content: prompts.system },
                    { role: 'user', content: userPrompt }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error(`[${clientId.toUpperCase()}] Kie/Gemini HTTP ${response.status}: ${errBody.substring(0, 200)}`);
            return null;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) {
            console.error(`[${clientId.toUpperCase()}] Kie/Gemini returned empty response`);
            return null;
        }

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error(`[${clientId.toUpperCase()}] Kie/Gemini returned non-JSON: ${text.substring(0, 100)}`);
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.title || !parsed.description) {
            console.error(`[${clientId.toUpperCase()}] Kie/Gemini missing title/description`);
            return null;
        }

        // Enforce MissParty pricing in description
        if (clientId === 'missparty') {
            if (!parsed.description.includes('$1/mile')) {
                parsed.description += '\n$1/mile delivery available. Free pickup.';
            }
            // Make sure price isn't stated as anything other than $75
            parsed.description = parsed.description.replace(/\$\d{2,4}(?:\s*(?:per|a|\/)\s*(?:day|rental))?/gi, (match) => {
                if (match.includes('mile')) return match; // Don't touch "$1/mile"
                return '$75';
            });
        }

        console.log(`[${clientId.toUpperCase()}] AI copy generated for ${city}: "${parsed.title.substring(0, 50)}..."`);
        return { title: parsed.title, description: parsed.description };

    } catch (err) {
        console.error(`[${clientId.toUpperCase()}] Kie/Gemini content gen failed: ${err.message}`);
        return null;
    }
}

module.exports = { generateListingCopy, PRODUCT_PROMPTS };
