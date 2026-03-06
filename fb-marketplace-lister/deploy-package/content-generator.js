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
        system: `You are writing Facebook Marketplace PRODUCT listings for garage doors being sold in the DFW area.
CRITICAL: This is a PRODUCT FOR SALE listing, NOT a service ad. Facebook Marketplace bans service ads and will remove listings that sound like services.
Write like a regular person selling a physical product — casual, direct, no corporate tone.
BANNED WORDS (instant removal by Facebook): "services", "we offer", "our team", "professional", "installation services", "free estimates", "licensed", "insured", "call us today", "serving the area", "years of experience", "company", "contractor", "repair".
OK TO SAY: "includes delivery", "setup included", "text for details", "available in [city]".
Never use hashtags or emojis. No marketing jargon. No ALL CAPS words.
Return ONLY valid JSON: {"title": "...", "description": "..."}`,
        template: (job, city, phone) => {
            const collection = job.collection || job.configData?.collection || '';
            const size = job.size || job.configData?.size || '';
            const design = job.design || job.configData?.design || '';
            const color = job.color || job.configData?.color || '';
            const construction = job.construction || job.configData?.construction || '';
            const price = job.price || job.listingPrice || 2500;

            if (collection) {
                return `Write a Facebook Marketplace listing for a garage door FOR SALE in ${city}.
This is a PRODUCT listing — you are selling a physical garage door, not advertising a service.

Door specs:
- Collection: ${collection}
- Size: ${size}
- Design: ${design}
- Color: ${color}
- Insulation: ${construction}
- Price: $${price} (includes door + installation)
- Contact: ${phone}

TITLE RULES (critical — bad titles get flagged by Facebook):
1. Under 80 characters
2. Start with the size, then collection name, then ONE unique detail (color, design, or insulation)
3. NEVER include city name in title — Facebook adds location automatically
4. NEVER use words: "Professional", "Services", "Installation", "Repair", "Company"
5. Each title must be different — vary which detail you highlight
6. Good examples: "${size} ${collection} ${color} ${design}", "${size} ${color} ${collection} Door", "${collection} ${size} - ${design} - R-18 Insulated"

DESCRIPTION RULES:
1. 2-4 sentences max. Describe the PRODUCT specs (size, color, design, insulation value).
2. Mention ${city} area once naturally.
3. Include "Text ${phone}" at the end (say "text", never "call" — Facebook flags "call" as service language).
4. NEVER say "free estimates", "professional installation", "our team", "licensed", "insured", "call us", "call today", "serving", "years of experience", or anything that sounds like a service company.
5. OK to say "setup included", "delivery available", "text for details".`;
            }

            // Fallback for listings without config details
            return `Write a Facebook Marketplace listing for a garage door FOR SALE in ${city}.
This is a PRODUCT listing — selling a physical garage door, not a service ad.

Product:
- ${job.title || 'Steel Garage Door'}
- Price: $${price}
- Contact: ${phone}

TITLE: Under 80 chars. Describe the physical product. NEVER use "Services", "Professional", "Installation", "Repair", "Company", "Licensed".
DESCRIPTION: 2-4 sentences about the product specs. Say "Text ${phone}" (never "Call"). NEVER sound like a service company.`;
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
- Price: $49.99 flat rate (24-hour rental)
- Delivery: ${delivery}
- Phone: ${phone}

Requirements:
1. Title: Under 100 characters. Mention the city naturally (e.g. "Bounce House Rental - ${city.replace(', TX', '')}" or "${city.replace(', TX', '')} Party Fun").
2. Description: 3-5 sentences. Paint the picture of the ${setting} party scenario. Mention the 24hr rental period. MUST include "$1/mile delivery available" and "Free pickup". Include the phone number.
3. Price is $49.99 flat — do not say anything different.
4. Sound enthusiastic but real. Vary the angle based on the scenario (birthday, backyard BBQ, family event, etc.).`;
            }

            // Fallback
            return `Write a Facebook Marketplace listing for bounce house rentals in ${city}.

Base product info:
- Product: ${job.title || 'White Bounce House Rental'}
- Price: $49.99 (24-hour rental)
- Delivery: ${delivery}
- Phone: ${phone}

Requirements:
1. Title: Under 100 characters. Mention the city or area naturally.
2. Description: 3-5 sentences. Mention the city/area. Include the phone number. Mention delivery ($1/mile), free pickup, setup, 24hr rental period.
3. Price is $49.99 flat — do not say anything different.
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
            // Make sure price isn't stated as anything other than $49.99
            parsed.description = parsed.description.replace(/\$\d{2,4}(?:\.\d{2})?(?:\s*(?:per|a|\/)\s*(?:day|rental))?/gi, (match) => {
                if (match.includes('mile')) return match; // Don't touch "$1/mile"
                return '$49.99';
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
