import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env.local loader
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            let value = valueParts.join('=').trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[key.trim()] = value;
        }
    });
}

const serviceAccountVal = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let app;

if (getApps().length === 0) {
    if (serviceAccountVal) {
        let serviceAccount;
        if (serviceAccountVal.trim().startsWith('{')) {
            serviceAccount = JSON.parse(serviceAccountVal);
        } else {
            // Assume it is a path
            const saPath = path.isAbsolute(serviceAccountVal)
                ? serviceAccountVal
                : path.resolve(process.cwd(), serviceAccountVal);
            serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
        }

        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        app = initializeApp({
            credential: cert(serviceAccount),
            projectId: 'rensto'
        });
    } else {
        console.log("No FIREBASE_SERVICE_ACCOUNT_KEY found. Trying default credentials...");
        app = initializeApp({ projectId: 'rensto' });
    }
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

const TEMPLATES = [
    {
        id: 'jOIC8dQVz_zQUnmQc7Gv8',
        name: "Billy Mays Prompt Generator",
        name_he: "מחולל פרומפטים בסגנון בילי מייס",
        outcomeHeadline: "Skyrocket Your Video Conversion with High-Energy MIRACLE Ad Copy",
        outcomeHeadline_he: "הזניקו את ההמרות שלכם עם סקריפטים ויראליים בסגנון ׳ניסים במטבח׳",
        description: "Stop writing boring ads. This high-energy Engine uses AI to transform your technical blueprints into Billy Mays style 'miracle gadget' infomercial scripts, specifically optimized for KIE Video Agent delivery.",
        description_he: "הפסיקו לכתוב מודעות משעממות. מנוע מבוסס AI ההופך תהליכים טכניים לתסריטי 'מכשירי פלא' בסגנון בילי מייס, מותאמים במיוחד לשימוש ב-KIE Video Agent.",
        category: "Creative Content",
        department: "content_engine",
        price: 297,
        installPrice: 797,
        customPrice: 1497,
        rating: 5.0,
        downloads: 124,
        popular: false,
        features: ["Dynamic Script Writing", "Hook Generation", "Vibe Matching"],
        features_he: ["כתיבת תסריט דינמית", "יצירת הוקים", "התאמת סגנון"],
        tools: ['openai', 'logic_orchestrator'],
        tags: ['internal'],
        readinessStatus: 'Internal',
        owner: 'rensto',
        showInMarketplace: false,
        showInAdminDashboard: true,
        deploymentSteps: [
            { title: 'Core Automation Host', desc: 'Initialize your professional-grade Logic Orchestrator here: https://tinyurl.com/ym3awuke' },
            { title: 'Connect OpenAI', desc: 'Add your OpenAI API key to the Generate node.' },
            { title: 'Sync Firestore', desc: 'Ensure your "templates" collection is accessible.' },
            { title: 'Test Generation', desc: 'Run a manual trigger to see your first Billy Mays script.' }
        ],
        deliveryChecklist: [
            'Logic Blueprint (JSON)',
            'System Prompt Template',
            'Implementation Guide PDF'
        ]
    },
    {
        id: '4OYGXXMYeJFfAo6X',
        name: "Celebrity Selfie Video Generator",
        name_he: "מחולל סרטוני סלפי מפורסמים",
        outcomeHeadline: "Drive High-Engagement Brand Awareness with Viral AI Video Experiences",
        outcomeHeadline_he: "צרו מודעות ויראלית ומודעות למותג באמצעות חוויות וידאו AI",
        description: "Empower your audience to become the star of your brand's cinematic journey. This automated engine generates high-fidelity AI video experiences where users are seamlessly integrated into iconic scenes, perfect for viral marketing campaigns and hyper-personalized customer engagement.",
        description_he: "העצימו את הקהל שלכם להפוך לכוכב המסע הקולנועי של המותג שלכם. מנוע אוטומטי המייצר חוויות וידאו AI באיכות גבוהה שבהן המשתמשים משולבים בצורה חלקה בסצנות אייקוניות.",
        category: "Creative Content",
        department: "content_engine",
        price: 297,
        installPrice: 797,
        customPrice: 1497,
        rating: 5.0,
        downloads: 156,
        popular: true,
        features: ["AI Face Swap", "Multi-Scene Stitching", "WhatsApp Delivery"],
        features_he: ["החלפת פנים AI", "חיבור סצנות", "שליחה לוואטסאפ"],
        tools: ['whatsapp', 'kie-ai', 'pi-api', 'imgbb', 'ffmpeg'],
        video: "/videos/celebrity-selfie-generator.mp4",
        tags: ['marketplace', 'pillar:content'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true,
        deploymentSteps: [
            { title: 'Core Automation Host', desc: 'Initialize your professional-grade Logic Orchestrator here: https://tinyurl.com/ym3awuke' },
            { title: 'ImgBB API Key', desc: 'Secure a free API key from imgbb.com and add it to the "Upload to ImgBB" node.' },
            { title: 'AI Model Credits', desc: 'Ensure you have credits in Kie.ai and PiAPI (for Kling video generation).' },
            { title: 'Core Components', desc: 'Install "better-ffmpeg" and "WAHA" community nodes in your instance.' },
            { title: 'Video Processing', desc: 'Confirm FFmpeg is installed on your server for seamless scene merging.' }
        ],
        kpis: [
            { label: 'Brand Retention', value: '85%+', icon: 'Shield' },
            { label: 'Processing Time', value: '< 2 min', icon: 'Clock' },
            { label: 'Viral Potential', value: 'Extreme', icon: 'TrendingUp' }
        ],
        kpis_he: [
            { label: 'שימור מותג', value: '85%+', icon: 'Shield' },
            { label: 'זמן עיבוד', value: '< 2 דק׳', icon: 'Clock' },
            { label: 'פוטנציאל ויראלי', value: 'קיצוני', icon: 'TrendingUp' }
        ],
        useCases: [
            { title: 'Viral Marketing', desc: 'Create hyper-personalized ads that stop the scroll instantly.', icon: 'Zap' },
            { title: 'Personalized Gifts', desc: 'Turn friends into movie stars for birthdays.', icon: 'Globe' }
        ],
        useCases_he: [
            { title: 'שיווק ויראלי', desc: 'צרו מודעות בהתאמה אישית גבוהה שעוצרות את הגלילה באופן מיידי.', icon: 'Zap' },
            { title: 'מתנות מותאמות אישית', desc: 'הפכו חברים לכוכבי קולנוע לימי הולדת.', icon: 'Globe' }
        ],
        faqs: [
            { q: 'Is my data safe?', a: 'Yes. Your photo is deleted immediately after the video is generated.' },
            { q: 'How many scenes are included?', a: 'Each generation stitches 3 iconic scenes together.' }
        ],
        faqs_he: [
            { q: 'האם המידע שלי בטוח?', a: 'כן. התמונה שלך נמחקת מיד לאחר יצירת הווידאו.' },
            { q: 'כמה סצנות כלולות?', a: 'כל יצירה מחברת 3 סצנות אייקוניות יחד.' }
        ]
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: "Meta Ad Library Analyzer",
        name_he: "מנתח ספריית המודעות של מטא",
        outcomeHeadline: "Scale Your Ads with Proven, Competitor-Tested Creative Patterns",
        outcomeHeadline_he: "שדרגו את הפרסום שלכם עם דפוסי קריאייטיב מוכחים שנבדקו אצל המתחרים",
        description: "Eliminate guesswork from your creative strategy. This Engine scrapes active high-performance ads from the Meta Ad Library and uses AI vision to reverse-engineer their winning hooks, scripts, and visual patterns for your own brand.",
        description_he: "הסירו את חוסר הוודאות מאסטרטגיית הקריאייטיב שלכם. מנוע זה סורק מודעות בעלות ביצועים גבוהים מספריית המודעות של מטא ומשתמש בבינה מלאכותית ויזואלית כדי לפצח את הוקים, התסריטים והדפוסים הוויזואליים המנצחים עבור המותג שלכם.",
        category: "Lead & Sales",
        department: "lead_machine",
        price: 197,
        installPrice: 797,
        customPrice: 1497,
        rating: 4.8,
        downloads: 89,
        popular: true,
        features: ["Ad Scraping", "AI Video Analysis", "Template Generation"],
        features_he: ["שאיבת מודעות", "ניתוח וידאו AI", "יצירת תבניות"],
        tools: ['apify', 'google_gemini', 'anthropic'],
        video: "/videos/meta-ad-analyzer.mp4",
        tags: ['marketplace', 'pillar:lead-gen'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true,
        deploymentSteps: [
            { title: 'Core Automation Host', desc: 'Initialize your professional-grade Logic Orchestrator here: https://tinyurl.com/ym3awuke' },
            { title: 'Apify API Key', desc: 'Secure an API key from Apify to run the Facebook Ads Library Scraper.' },
            { title: 'Google Gemini API', desc: 'Configure Google AI (Gemini) credentials for deep video analysis.' },
            { title: 'Anthropic API', desc: 'Add Claude 3.5 Sonnet to power high-fidelity prompt generation.' }
        ],
        kpis: [
            { label: 'Creative Efficiency', value: '+40%', icon: 'Zap' },
            { label: 'Analysis Speed', value: 'Instant', icon: 'Clock' }
        ],
        kpis_he: [
            { label: 'יעילות קריאייטיב', value: '+40%', icon: 'Zap' },
            { label: 'מהירות ניתוח', value: 'מיידי', icon: 'Clock' }
        ]
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: "YouTube AI Clone",
        name_he: "משכפל יוטיוברים ב-AI",
        outcomeHeadline: "Convert Thousands of Hours of Video Into Your Private Intelligence Engine",
        outcomeHeadline_he: "הפכו אלפי שעות וידאו למנוע אינטליגנציה פרטי",
        description: "Transform any YouTube channel into a searchable, conversational persona. This Engine extracts full transcript data and synthesizes a custom LLM persona that mirrors an expert's knowledge base and communication style, accessible via Telegram.",
        description_he: "הפכו כל ערוץ יוטיוב לפרסונה חיפושית ושיחתית. המערכת מחלצת נתוני תמלול מלאים ומסנתזת פרסונת LLM מותאמת אישית שמשקפת את בסיס הידע וסגנון התקשורת של המומחה, נגישה דרך טלגרם.",
        category: "Knowledge & Research",
        department: "knowledge_engine",
        price: 347,
        installPrice: 797,
        customPrice: 1497,
        rating: 4.7,
        downloads: 64,
        features: ["Transcript Extraction", "Persona Synthesis", "Telegram Integration"],
        features_he: ["חילוץ תמלול", "סינתזת אישיות", "אינטגרציה לטלגרם"],
        tools: ['youtube', 'telegram', 'perplexity', 'apify', 'openrouter'],
        video: "/videos/youtube-clone.mp4",
        tags: ['marketplace', 'pillar:knowledge'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true,
        deploymentSteps: [
            { title: 'Core Automation Host', desc: 'Initialize your professional-grade Logic Orchestrator here: https://tinyurl.com/ym3awuke' },
            { title: 'Apify API', desc: 'Create a "Header Auth" credential with name "Authorization" and value "Bearer [Your-Apify-Token]".' },
            { title: 'OpenRouter API', desc: 'Secure an API key from openrouter.ai to power the synthesis models.' },
            { title: 'Perplexity API', desc: 'Add Perplexity key to the Search Knowledge node.' },
            { title: 'Telegram BotFather', desc: 'Create a Telegram bot and paste the token in credentials.' }
        ]
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: "Voice AI Lead Analyzer",
        name_he: "מנתח שיחות לידים",
        outcomeHeadline: "Recover Lost Revenue Hidden in Your Voice Recordings",
        outcomeHeadline_he: "החזירו הכנסות אבודות החבויות בהקלטות השיחות שלכם",
        description: "Stop letting sales opportunities slip through the cracks. This Engine transcribes call recordings, scores lead intent using sentiment analysis, and syncs qualified opportunities directly to your CRM with intelligent categorization.",
        description_he: "הפסיקו לתת להזדמנויות מכירה לחמוק מבין האצבעות. מנוע מתמלל אוטומטית הקלטות שיחות, מדרג כוונת ליד באמצעות ניתוח סנטימנט ומסנכרן הזדמנויות כשירות ישירות ל-CRM שלכם.",
        category: "Lead & Sales",
        department: "lead_machine",
        price: 497,
        installPrice: 797,
        customPrice: 1497,
        rating: 4.9,
        downloads: 203,
        popular: true,
        features: ["Audio Transcription", "Sentiment Analysis", "Workiz Sync"],
        features_he: ["תמלול אודיו", "ניתוח סנטימנט", "סנכרון Workiz"],
        tools: ['telnyx', 'workiz', 'openai'],
        video: "/videos/call-audio-analyzer.mp4",
        tags: ['marketplace', 'pillar:voice-ai'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true,
        deploymentSteps: [
            { title: 'Core Automation Host', desc: 'Initialize your professional-grade Logic Orchestrator here: https://tinyurl.com/ym3awuke' },
            { title: 'Telnyx API', desc: 'Configure Telnyx V3 credentials for audio polling.' },
            { title: 'Workiz API', desc: 'Add Workiz Token and Secret to the Config node.' }
        ]
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: "AI Calendar Assistant",
        name_he: "עוזר לוח שנה AI",
        outcomeHeadline: "Eliminate Scheduling Friction with an Autonomous Booking Agent",
        outcomeHeadline_he: "בטלו את החיכוך בתזמון פגישות עם סוכן הזמנות אוטונומי",
        description: "Delegate your entire calendar management to an agent that actually understands your business. Handles complex multi-timezone booking, natural language rescheduling requests, and human-in-the-loop approval workflows via WhatsApp.",
        description_he: "האצילו את כל ניהול היומן שלכם לסוכן שבאמת מבין את העסק שלכם. מטפל בהזמנות מורכבות במספר אזורי זמן, בקשות תזמון בשפה טבעית ותהליכי אישור אנושיים דרך WhatsApp.",
        category: "Operations",
        department: "autonomous_secretary",
        price: 147,
        installPrice: 797,
        customPrice: 1497,
        rating: 4.6,
        downloads: 312,
        features: ["Conflict Resolution", "Natural Language", "WhatsApp Approvals"],
        features_he: ["פתרון התנגשויות", "שפה טבעית", "אישורי WhatsApp"],
        tools: ['tidycal', 'openai', 'waha'],
        video: "/videos/calendar-assistant.mp4",
        tags: ['marketplace', 'pillar:workflow-bot'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true,
        deploymentSteps: [
            { title: 'Core Automation Host', desc: 'Initialize your professional-grade Logic Orchestrator here: https://tinyurl.com/ym3awuke' },
            { title: 'TidyCal API', desc: 'Secure an API token from your TidyCal account settings.' },
            { title: 'OpenAI API', desc: 'Add your OpenAI key to the Chat Model node (ensure GPT-4o access).' },
            { title: 'WhatsApp (WAHA)', desc: 'Configure your WAHA service URL and authentications for messaging.' }
        ]
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: "Floor Plan to Property Tour",
        name_he: "תוכנית קומה לסיור נכס",
        outcomeHeadline: "Sell Properties Faster with Photorealistic AI Video Walkthroughs",
        outcomeHeadline_he: "מכרו נכסים מהר יותר עם סיורי וידאו פוטוריאליסטיים ב-AI",
        description: "Transform flat 2D floor plans into immersive 4K cinematic walkthroughs. This spatial AI engine renders photorealistic room textures in multiple architectural styles and stitches them into a high-production property tour.",
        description_he: "הפכו תוכניות קומה 2D שטוחות לסיורים קולנועיים סוחפים ב-4K. מנוע spatial AI זה מרנדר טקסטורות חדרים פוטוריאליסטיות במגוון סגנונות אדריכליים ומחבר אותם לסיור נכס באיכות הפקה גבוהה.",
        category: "Creative Content",
        department: "content_engine",
        price: 397,
        installPrice: 797,
        customPrice: 1497,
        rating: 5.0,
        downloads: 45,
        features: ["2D to 3D Conversion", "Photorealistic Rendering", "Video Walkthrough"],
        features_he: ["המרה מ-2D ל-3D", "רינדור פוטוריאליסטי", "סיור וידאו"],
        tools: ['kie_ai', 'logic_orchestrator'],
        video: "/videos/floor-plan-tour.mp4",
        tags: ['marketplace', 'pillar:content'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true,
        deploymentSteps: [
            { title: 'Core Automation Host', desc: 'Initialize your professional-grade Logic Orchestrator here: https://tinyurl.com/ym3awuke' },
            { title: 'Kie.ai API', desc: 'Add your Kie.ai credentials for photorealistic architectural rendering.' },
            { title: 'Video Merge Service', desc: 'Set the VIDEO_MERGE_URL environment variable for cinematic stitching.' }
        ]
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: "Monthly CRO Insights Bot",
        name_he: "מנתח שיפור המרות חודשי",
        outcomeHeadline: "Automate Your Growth Strategy with Continuous UX Audits",
        outcomeHeadline_he: "הפכו את אסטרטגיית הצמיחה שלכם לאוטומטית עם ביקורות UX רציפות",
        description: "Turn your GA4 and Clarity data into a prioritized growth roadmap. This system autonomously identifies revenue leaks, rage clicks, and conversion bottlenecks, delivering actionable CRO recommendations directly to your team via Slack.",
        description_he: "הפכו את נתוני ה-GA4 והקלאריטי שלכם למפת דרכים מתועדפת לצמיחה. מערכת זו מזהה באופן אוטונומי דליפות הכנסה, הקלקות של תסכול וצווארי בקבוק בהמרות, ומספקת המלצות CRO מעשיות ישירות לצוות שלכם.",
        category: "Knowledge & Research",
        department: "knowledge_engine",
        price: 247,
        installPrice: 797,
        customPrice: 1497,
        rating: 4.8,
        downloads: 112,
        features: ["Drop-off Analysis", "Heatmap Integration", "Monthly Report"],
        features_he: ["ניתוח נטישה", "אינטגרציה למפות חום", "דו\"ח חודשי"],
        tools: ['google', 'logic_orchestrator', 'openai', 'clarity', 'slack'],
        video: "/videos/cro-insights.mp4",
        tags: ['marketplace', 'pillar:knowledge'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true,
        deploymentSteps: [
            { title: 'Core Automation Host', desc: 'Initialize your professional-grade Logic Orchestrator here: https://tinyurl.com/ym3awuke' },
            { title: 'GA4 Access', desc: 'Enable Google Analytics 4 API and add your Property ID to the Dashboard.' },
            { title: 'Microsoft Clarity API', desc: 'Secure a Clarity API token and add it to the Clarity HTTP Request node.' },
            { title: 'Slack Notification', desc: 'Connect your Slack workspace and choose a channel for insights delivery.' },
            { title: 'OpenAI API', desc: 'Ensure GPT-4o access for automated behavior analysis.' }
        ]
    }
];

async function seed() {
    console.log("Starting full marketplace seed with content...");
    const batch = db.batch();
    const templateDir = path.resolve(process.cwd(), 'n8n/templates');

    for (const template of TEMPLATES) {
        const ref = db.collection('templates').doc(template.id);

        let content = null;
        try {
            const jsonPath = path.join(templateDir, `${template.id}.json`);
            if (fs.existsSync(jsonPath)) {
                content = fs.readFileSync(jsonPath, 'utf8'); // Keep as string
                console.log(`📦 Loaded content for: ${template.name} (${template.id})`);
            }
        } catch (err) {
            console.error(`❌ Failed to read content for ${template.id}:`, err);
        }

        batch.set(ref, {
            ...template,
            content,
            updatedAt: Timestamp.now(),
            createdAt: Timestamp.now()
        }, { merge: true });
    }

    await batch.commit();
    console.log(`Successfully seeded ${TEMPLATES.length} marketplace templates.`);
}

seed().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
