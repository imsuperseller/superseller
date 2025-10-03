import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectDetails, Estimate, WebImage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const estimateSchema = {
    type: Type.OBJECT,
    properties: {
        options: {
            type: Type.ARRAY,
            description: "Three estimate tiers: Good, Better, Best. In Hebrew: טוב, טוב יותר, הכי טוב",
            items: {
                type: Type.OBJECT,
                properties: {
                    tier: { type: Type.STRING, enum: ['טוב', 'טוב יותר', 'הכי טוב'] },
                    name: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                    materials: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { name: { type: Type.STRING }, avgPrice: { type: Type.NUMBER } },
                            required: ['name', 'avgPrice']
                        }
                    },
                    totalMaterialCost: { type: Type.NUMBER }
                },
                required: ['tier', 'name', 'price', 'description', 'materials', 'totalMaterialCost']
            }
        },
        summary: { type: Type.STRING },
        measurements: {
            type: Type.OBJECT,
            properties: { area: { type: Type.NUMBER }, perimeter: { type: Type.NUMBER } },
            required: ['area', 'perimeter']
        },
        webImages: {
            type: Type.ARRAY,
            description: "A list of relevant web images found. MUST be direct image URLs (e.g., ending in .jpg, .png).",
            items: {
                type: Type.OBJECT,
                properties: {
                    imageUrl: { type: Type.STRING, description: "Direct URL to the image file." },
                    sourceDomain: { type: Type.STRING, description: "The domain the image was found on (e.g., 'zillow.com')." }
                },
                required: ['imageUrl', 'sourceDomain']
            }
        }
    },
    required: ['options', 'summary', 'measurements']
};

function buildPrompt(details: ProjectDetails): string {
    const projectTypes = details.projectTypes.join(', ');

    let prompt = `
        As an expert construction estimator AI for a US-based general contractor, create a detailed cost estimate for the following project. The response language for all user-facing text must be Hebrew.

        **Project Details:**
        - **Address:** ${details.address}
        - **Project Types:** ${projectTypes}
        ${details.additionalNotes ? `- **Additional Notes:** ${details.additionalNotes}` : ''}
        
        **Your Task:**
        1.  Analyze the provided address, project types, notes, and any user-uploaded images.
        2.  Provide three distinct estimate options: 'טוב' (Good), 'טוב יותר' (Better), and 'הכי טוב' (Best) using different quality materials.
        3.  All financial values must be in USD. All measurements must be in imperial units (square feet, linear feet).
        4.  Write a professional project summary in Hebrew.
    `;

    if (details.useWebSearch) {
        prompt += `
        5.  **CRITICAL WEB SEARCH TASK:** Your primary goal is to find high-quality images of the property.
            - **PRIORITIZE** reputable US real estate websites: Zillow, Redfin, Realtor.com.
            - You **MUST** find and return direct links to image files (ending in .jpg, .png, .webp).
            - **DO NOT** return links to HTML pages or irrelevant domains.
            - Populate the 'webImages' array in your JSON response with these findings.

        **Output Format:**
        Your response **MUST** be a single, valid JSON object that strictly conforms to the specified structure. Do not include any text, explanations, or markdown formatting before or after the JSON object.
        The JSON structure must be:
        {
          "options": [ { "tier": "טוב", "name": "...", "price": 12345, "description": "...", "materials": [{"name": "...", "avgPrice": 123}], "totalMaterialCost": 123 } /*, ... other tiers */ ],
          "summary": "...",
          "measurements": { "area": 123, "perimeter": 123 },
          "webImages": [ { "imageUrl": "https://example.com/image.jpg", "sourceDomain": "example.com" } ]
        }
        `;
    }

    return prompt;
}

export const generateEstimate = async (details: ProjectDetails): Promise<Estimate> => {
    const prompt = buildPrompt(details);
    const imageParts = details.images.map(image => ({
        inlineData: {
            data: image.inlineData.data,
            mimeType: image.inlineData.mimeType,
        }
    }));

    let contents: any;
    if (imageParts.length > 0) {
        contents = {
            parts: [{ text: prompt }, ...imageParts]
        };
    } else {
        contents = prompt;
    }
    
    let config: any = {};
    if (details.useWebSearch) {
        config.tools = [{ googleSearch: {} }];
    } else {
        config.responseMimeType = "application/json";
        config.responseSchema = estimateSchema;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config,
        });
        
        const textResponse = response.text;
        
        const cleanedResponse = textResponse.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
        const estimate: Estimate = JSON.parse(cleanedResponse);
        
        // Post-process to ensure data quality
        if (estimate.webImages) {
            estimate.webImages = estimate.webImages.filter(img => 
                img.imageUrl && typeof img.imageUrl === 'string' && img.imageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)
            );
        }
        
        return estimate;

    } catch (e) {
        console.error("Error generating estimate:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to generate estimate from AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while generating the estimate.");
    }
};