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
        const serviceAccount = JSON.parse(serviceAccountVal);
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
        tools: ['whatsapp', 'n8n', 'higgsfield'],
        video: "/videos/celebrity-selfie-generator.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true,
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
        description: "Eliminate guesswork from your creative strategy. This engine scrapes active high-performance ads from the Meta Ad Library and uses AI vision to reverse-engineer their winning hooks, scripts, and visual patterns for your own brand.",
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
        tools: ['meta', 'openai', 'n8n'],
        video: "/videos/meta-ad-analyzer.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true,
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
        description: "Transform any YouTube channel into a searchable, conversational persona. This system extracts full transcript data and synthesizes a custom LLM persona that mirrors an expert's knowledge base and communication style, accessible via Telegram.",
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
        tools: ['youtube', 'telegram', 'perplexity'],
        video: "/videos/youtube-clone.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: "Call Audio Lead Analyzer",
        name_he: "מנתח שיחות לידים",
        outcomeHeadline: "Recover Lost Revenue Hidden in Your Voice Recordings",
        outcomeHeadline_he: "החזירו הכנסות אבודות החבויות בהקלטות השיחות שלכם",
        description: "Stop letting sales opportunities slip through the cracks. Our Telnyx-powered engine automatically transcribes call recordings, scores lead intent using sentiment analysis, and syncs qualified opportunities directly to your CRM with intelligent categorization.",
        description_he: "הפסיקו לתת להזדמנויות מכירה לחמוק מבין האצבעות. מנוע מבוסס Telnyx שלנו מתמלל אוטומטית הקלטות שיחות, מדרג כוונת ליד באמצעות ניתוח סנטימנט ומסנכרן הזדמנויות כשירות ישירות ל-CRM שלכם.",
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
        tags: ['marketplace'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: "AI Calendar Assistant",
        name_he: "עוזר לוח שנה AI",
        outcomeHeadline: "Eliminate Scheduling Friction with an Autonomous Booking Agent",
        outcomeHeadline_he: "בטלו את החיכוך בתזמון פגישות עם סוכן הזמנות אוטונומי",
        description: "Delegate your entire calendar management to an agent that actually understands your business. Handles complex multi-timezone booking, natural language rescheduling requests, and human-in-the-loop approval workflows via Telegram or Slack.",
        description_he: "האצילו את כל ניהול היומן שלכם לסוכן שבאמת מבין את העסק שלכם. מטפל בהזמנות מורכבות במספר אזורי זמן, בקשות תזמון בשפה טבעית ותהליכי אישור אנושיים דרך טלגרם או סלאק.",
        category: "Operations",
        department: "autonomous_secretary",
        price: 147,
        installPrice: 797,
        customPrice: 1497,
        rating: 4.6,
        downloads: 312,
        features: ["Conflict Resolution", "Natural Language", "Smart Rescheduling"],
        features_he: ["פתרון התנגשויות", "שפה טבעית", "תזמון חכם מחדש"],
        tools: ['tidycal', 'slack', 'google'],
        video: "/videos/calendar-assistant.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true
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
        tools: ['n8n', 'openai', 'midjourney'],
        video: "/videos/floor-plan-tour.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true
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
        tools: ['google', 'n8n', 'openai'],
        video: "/videos/cro-insights.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        owner: 'rensto',
        showInMarketplace: true,
        showInAdminDashboard: true
    }
];

async function seed() {
    console.log("Starting full marketplace seed...");
    const batch = db.batch();

    for (const template of TEMPLATES) {
        const ref = db.collection('templates').doc(template.id);

        batch.set(ref, {
            ...template,
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
