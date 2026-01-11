export interface UsageLog {
    id: string;
    clientId: string;
    agentId: string; // matches ServiceManifest.id
    status: 'completed' | 'failed' | 'running';
    startedAt: any; // Firestore Timestamp
    completedAt?: any; // Firestore Timestamp
    durationMs?: number;
    model?: string; // "gpt-4-turbo"
    tokens?: {
        input: number;
        output: number;
        total: number;
    };
    cost: number; // in cents
    output?: string; // Result summary or failure reason
    metadata?: Record<string, any>;
}

export interface ApprovalRequest {
    id: string;
    clientId: string;
    serviceId: string;
    title: string;
    description: string;
    content: any; // structured content to approve
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: any;
    respondedAt?: any;
    feedback?: string;
    expiresAt?: any;
}

export interface ServiceManifest {
    id: string; // "review-responder"
    name: string; // "Review Responder Agent"
    slug: string; // URL friendly slug
    description: string;
    type: "n8n_workflow" | "code_function";
    active: boolean;
    pricing: {
        subscription: number; // In cents
        setup: number; // In cents
    };
    n8n: {
        webhookId: string; // "review-responder-prod"
        inputs: Array<{ name: string; type: "text" | "number" | "email" }>;
    };
    stripe: {
        productId: string;
        priceId: string; // Subscription price ID
        setupPriceId?: string; // One-time setup fee price ID
    };
    createdAt?: any; // Firestore Timestamp
    updatedAt?: any; // Firestore Timestamp
}

// TypeScript types for Custom Solutions
export interface CustomSolutionsClient {
    id: string;
    email: string;
    name: string;
    websiteUrl?: string;

    // Qualification
    qualificationScore: number;
    qualificationTier: 'high' | 'medium' | 'low';
    answers: Record<string, string>;

    // Solution
    selectedTier?: 'starter' | 'professional' | 'enterprise';
    solutionPlan?: Record<string, unknown>;

    // Payment
    stripeSessionId?: string;
    stripeCustomerId?: string;
    amountPaid?: number;

    // Contract
    contractId?: string;
    contractStatus?: 'pending' | 'signed' | 'declined';

    // Status
    status: 'qualified' | 'contract_sent' | 'paid' | 'onboarding' | 'active';

    // Timestamps
    createdAt: any;
    updatedAt: any;
    lastLogin?: any;
}

export interface MagicLinkToken {
    id: string;
    email: string;
    clientId: string;
    expiresAt: any;
    used: boolean;
    createdAt: any;
}

export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    installPrice?: number;
    customPrice?: number;
    features: string[];
    installation?: boolean;
    popular?: boolean;
    version?: string;
    fileSize?: number;
    content?: string;
    readinessStatus?: 'Draft' | 'Active' | 'Internal' | 'Beta' | 'Coming Soon';
    tags?: string[];
    downloads?: number;
    image?: string;
    video?: string;
    rating?: number;
    tools?: string[];
    outcomeHeadline?: string;

    // Hebrew Translations (Dynamic)
    name_he?: string;
    description_he?: string;
    outcomeHeadline_he?: string;
    features_he?: string[];
    workflowId?: string;
    createdAt?: any;
    updatedAt?: any;

    // Ownership & Department
    owner?: 'rensto' | 'client';
    clientId?: string; // if client-owned
    department?: 'lead_machine' | 'autonomous_secretary' | 'knowledge_engine' | 'content_engine' | 'internal_ops' | 'client_fulfillment';

    // n8n Integration
    n8nWorkflowId?: string;
    n8nWorkflowUrl?: string;

    // Stripe Integration
    stripeProductId?: string;
    stripePriceId?: string;

    // Visibility Rules - controls where this appears
    showInMarketplace?: boolean;
    showInAdminDashboard?: boolean;
    showInClientDashboard?: boolean;

    // Audit
    lastAuditedAt?: any;

    // Fulfillment Configuration
    configurationSchema?: FormField[]; // Questions to ask for "Implementation" mode
    deliveryChecklist?: string[]; // Items to verify for "Download" mode

    // Rich Content (Dynamic / Marketing)
    complexity?: 'Beginner' | 'Intermediate' | 'Advanced';
    setupTime?: string;
    businessImpact?: string;
    businessImpact_he?: string;
    roiExample?: string;
    roiExample_he?: string;
    oneTimeCost?: number;
    maintenanceCost?: number;
    maintenanceExplanation?: string;
    maintenanceExplanation_he?: string;
    aiPromptScript?: string;
    soraVideoPrompt?: string;
    guarantee?: string;
    guarantee_he?: string;
    isTargetTier?: boolean;

    kpis?: Array<{ label: string; value: string; icon?: string }>;
    kpis_he?: Array<{ label: string; value: string; icon?: string }>;

    useCases?: Array<{ title: string; desc: string; icon?: string }>;
    useCases_he?: Array<{ title: string; desc: string; icon?: string }>;

    faqs?: Array<{ q: string; a: string }>;
    faqs_he?: Array<{ q: string; a: string }>;

    creator?: {
        name: string;
        bio: string;
        photo?: string;
        expertise: string[];
    };
    creator_he?: {
        name: string;
        bio: string;
        photo?: string;
        expertise: string[];
    };
}

export interface DownloadEvent {
    id: string;
    templateId: string;
    userEmail: string;
    paymentIntentId: string;
    timestamp: any;
    status: string;
}

export type FormFieldType = 'text' | 'number' | 'email' | 'url' | 'select' | 'textarea' | 'boolean';

export interface FormField {
    id: string;
    label: string;
    type: FormFieldType;
    required: boolean;
    placeholder?: string;
    options?: string[]; // For 'select' type
    helperText?: string;
}

export interface ServiceInstance {
    id: string;
    clientId: string; // User ID
    clientEmail: string;
    productId: string; // Template ID
    productName: string;
    status: 'pending_setup' | 'provisioning' | 'active' | 'suspended' | 'cancelled';

    // The user's answers to the configuration schema
    configuration: Record<string, any>;

    // Administrative links
    n8nWorkflowId?: string; // The specific instance running for them
    adminNotes?: string;

    // WhatsApp-Specific (if this is a WhatsApp service)
    whatsappInstanceId?: string;    // Links to whatsapp_instances
    whatsappBundle?: string;

    // Performance Metrics
    speedToLeadAverage?: number;     // Average response time in seconds
    leadsCaptured?: number;
    appointmentsBooked?: number;

    createdAt: any; // Firestore Timestamp
    activatedAt?: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp

    // Legacy / Alternate Fields (for compatibility with agents/page.tsx)
    serviceId?: string;
    parameters?: Record<string, any>;
}

export interface Client {
    id: string;
    name: string;
    logoUrl: string;
    showLogoOnLanding: boolean;
    privacySettings: {
        hideBusinessName: boolean;
        customLabel?: string;
    };
    hebrew: {
        name: string;
    };
    status: 'active' | 'inactive';
    createdAt: any;
    updatedAt: any;
}

export interface Testimonial {
    id: string;
    clientId: string;
    language: 'en' | 'he';
    author: string;
    role: string;
    quote: string;
    result: string;
    imageUrl?: string;
    label?: string;
    order: number;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

// New interfaces (Jan 2026 - Optimized for SMB Service Businesses)

export interface User {
    id: string; // Firebase Auth UID or email-based ID
    email: string;
    name?: string;
    phone?: string;

    // Business Profile (SMB-specific)
    businessName?: string;
    businessType?: 'hvac' | 'realtor' | 'restaurant' | 'insurance' | 'cpa' | 'garage_door' | 'local_store' | 'lawyer' | 'contractor' | 'plumber' | 'electrician' | 'roofer' | 'locksmith' | 'photographer' | 'bookkeeper' | 'other';
    businessSize?: 'solo' | 'small_team' | 'medium_team'; // 1-5, 6-20, 21-50
    revenueRange?: '$200k-500k' | '$500k-1m' | '$1m-5m' | '$5m-10m';

    // Account Status
    status: 'active' | 'suspended' | 'cancelled';
    emailVerified: boolean;

    // Service Access
    activeServices: {
        marketplace: boolean;
        whatsapp: boolean;          // WhatsApp AI agent
        subscriptions: boolean;     // Lead generation
        custom_solutions: boolean;
        care_plan: 'none' | 'starter' | 'growth' | 'scale';
    };

    // Billing
    stripeCustomerId?: string;
    defaultPaymentMethodId?: string;
    billingAddress?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };

    // Preferences
    preferences: {
        language: 'en' | 'he' | 'es';  // Multi-language support
        emailNotifications: boolean;
        smsNotifications: boolean;
        timezone?: string;              // For appointment booking
    };

    // Metadata
    source: 'organic' | 'referral' | 'paid_ad' | 'partner' | 'qualification_quiz';
    referrerId?: string; // User ID who referred them
    qualificationScore?: number;      // From /custom quiz
    qualificationTier?: 'high' | 'medium' | 'low';

    createdAt: any;
    lastLoginAt?: any;
    updatedAt: any;
}

export interface WhatsAppInstance {
    id: string;
    userId: string;
    userEmail: string;
    businessName: string;
    businessType: string;

    // WhatsApp Configuration
    phoneNumber: string;              // WhatsApp Business number
    wahaInstanceId?: string;         // WAHA Pro instance ID
    n8nWorkflowId?: string;          // n8n workflow managing this agent

    // Bundle Selection (Outcome-Focused)
    bundle: 'never_miss_lead' | 'auto_qualify_book' | 'full_ai_sales_rep';
    bundleFeatures: {
        instantResponse: boolean;       // 24/7 instant replies
        faqAutoAnswer: boolean;         // Answer common questions
        leadCapture: boolean;           // Capture name, phone, email
        qualification: boolean;          // Ask qualifying questions
        appointmentBooking: boolean;     // Book directly in calendar
        quoteSending: boolean;          // Send estimates via WhatsApp
        objectionHandling: boolean;     // Handle "too expensive" etc.
        multiLanguage: boolean;         // Spanish, Hebrew, etc.
        humanEscalation: boolean;       // "Alert Me" button
    };

    // Add-Ons (Outcome-Focused, Not Technical)
    addOns: {
        sendPhotosQuotes: boolean;     // Send/receive photos & estimates
        teamInbox: boolean;             // Multiple people manage same WhatsApp
        smartMenus: boolean;            // Button menus instead of typing
        multiLocation: boolean;        // Separate agents per location
    };

    // Status
    status: 'pending_setup' | 'provisioning' | 'active' | 'suspended' | 'cancelled';

    // Performance Metrics (Speed-to-Lead Tracking)
    metrics: {
        totalMessages: number;
        averageResponseTime: number;    // In seconds (target: <5 min = 300s)
        leadsCaptured: number;
        appointmentsBooked: number;
        quotesSent: number;
        humanEscalations: number;
        lastResponseTime?: number;       // Most recent response time
    };

    // Configuration
    configuration: {
        businessHours?: { start: string; end: string; timezone: string };
        serviceAreas?: string[];        // Geographic coverage
        pricing?: Record<string, number>; // Service pricing for FAQs
        calendarIntegration?: 'tidycal' | 'calendly' | 'google';
        crmIntegration?: 'hubspot' | 'salesforce' | 'pipedrive' | 'workiz' | 'custom';
    };

    // Subscription Link
    subscriptionId?: string;          // Links to subscriptions collection
    carePlanId?: string;             // Links to care_plan_deliverables

    createdAt: any;
    activatedAt?: any;
    updatedAt: any;
}

export interface WhatsAppMessage {
    id: string;
    whatsappInstanceId: string;
    userId: string;

    // Message Details
    from: string;                    // Customer phone number
    to: string;                      // Business WhatsApp number
    messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
    content: string;                  // Message text or media URL
    direction: 'inbound' | 'outbound';

    // Speed-to-Lead Tracking (CRITICAL METRIC)
    responseTime?: number;           // Seconds between customer message and AI response
    isFirstContact: boolean;         // First message from this customer
    firstResponseTime?: number;      // Time to first response (target: <300s)

    // Lead Qualification
    leadStatus?: 'new' | 'qualified' | 'booked' | 'quoted' | 'converted' | 'lost';
    qualificationData?: {
        budget?: string;
        timeline?: string;
        urgency?: 'immediate' | 'this_week' | 'this_month' | 'exploring';
        serviceNeeded?: string;
    };

    // Appointment Booking
    appointmentBooked?: {
        appointmentId: string;         // Links to appointment_bookings
        date: any;
        serviceType: string;
    };

    // Human Escalation
    escalatedToHuman: boolean;
    escalatedAt?: any;
    humanRespondedAt?: any;

    // Metadata
    sessionId?: string;              // Conversation session
    metadata?: Record<string, any>;

    createdAt: any;
}

export interface AppointmentBooking {
    id: string;
    whatsappInstanceId: string;
    userId: string;

    // Customer Info
    customerName: string;
    customerPhone: string;
    customerEmail?: string;

    // Appointment Details
    serviceType: string;             // "AC Repair", "Home Inspection", etc.
    appointmentDate: any;
    appointmentTime: string;          // "10:00 AM"
    duration: number;                // Minutes
    location?: string;               // Service address

    // Status
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    confirmedAt?: any;
    reminderSent?: boolean;
    reminderSentAt?: any;

    // Calendar Integration
    calendarEventId?: string;        // TidyCal/Calendly/Google Calendar ID
    calendarProvider?: 'tidycal' | 'calendly' | 'google';

    // Source
    source: 'whatsapp_ai' | 'manual' | 'website' | 'phone';
    whatsappMessageId?: string;      // Links to whatsapp_messages

    // Notes
    notes?: string;
    internalNotes?: string;         // Admin-only

    createdAt: any;
    updatedAt: any;
}

export interface Subscription {
    id: string;
    userId: string;
    userEmail: string;

    // Stripe Integration
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripePriceId: string;

    // Subscription Type
    subscriptionType: 'whatsapp' | 'care_plan' | 'lead_generation' | 'content_ai';

    // WhatsApp Subscriptions
    whatsappBundle?: 'never_miss_lead' | 'auto_qualify_book' | 'full_ai_sales_rep';
    whatsappInstanceId?: string;     // Links to whatsapp_instances

    // Care Plan Subscriptions
    carePlanTier?: 'starter' | 'growth' | 'scale';
    carePlanDeliverables?: {         // What's included this month
        hoursIncluded: number;          // 5, 15, or 40
        hoursUsed: number;
        automationsBuilt: number;
        optimizationsDone: number;
        checkInCalls: number;
    };

    // Lead Generation Subscriptions
    leadGenTier?: 'low' | 'medium' | 'high' | 'enterprise';
    leadGenConfig?: {
        leadsPerMonth: number;         // 10-50, 50-200, 200-500, 500+
        sources: string[];              // LinkedIn, Google Maps, Facebook, etc.
        niche?: string;                 // HVAC, realtor, etc.
    };

    // Pricing
    amount: number;                  // Monthly amount in cents
    currency: string;
    billingInterval: 'month' | 'year';

    // Status
    status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
    currentPeriodStart: any;
    currentPeriodEnd: any;
    cancelAtPeriodEnd: boolean;
    canceledAt?: any;

    // Usage Tracking
    usageLimits?: {
        leadsPerMonth?: number;
        messagesPerMonth?: number;
        apiCallsPerMonth?: number;
    };
    currentUsage?: {
        leadsThisMonth?: number;
        messagesThisMonth?: number;
        apiCallsThisMonth?: number;
    };

    createdAt: any;
    updatedAt: any;
}

export interface CarePlanDeliverable {
    id: string;
    userId: string;
    subscriptionId: string;
    carePlanTier: 'starter' | 'growth' | 'scale';

    // Period
    periodStart: any;
    periodEnd: any;
    month: string;                   // "2026-01"

    // Deliverables (Specific, Not Vague)
    deliverables: {
        // Starter Care (5 hours)
        monitoringHours?: number;      // System monitoring time
        fixHours?: number;             // Fixing broken automations
        checkInCall?: boolean;         // Monthly 15-min call
        faqUpdates?: number;           // Number of FAQ updates
        performanceReport?: boolean;   // Basic report sent

        // Growth Care (15 hours) - includes Starter +:
        newAutomationsBuilt?: number;  // 1-2 new automations
        optimizationHours?: number;    // Optimizing existing flows
        strategyCall?: boolean;        // Quarterly 1-hour call
        abTestsRun?: number;           // A/B test messaging
        crmMaintenance?: boolean;      // CRM integration maintenance

        // Scale Care (40 hours) - includes Growth +:
        customFeatures?: string[];     // Custom features built
        weeklySyncCalls?: number;      // Weekly calls
        analyticsDashboard?: boolean;  // Full dashboard created
        multiLocationSupport?: boolean;
        priorityResponseTime?: number; // Hours (target: <4)
    };

    // Hours Tracking
    hoursAllocated: number;          // 5, 15, or 40
    hoursUsed: number;
    hoursRemaining: number;

    // Status
    status: 'in_progress' | 'completed' | 'overdue';
    completedAt?: any;

    // Notes
    notes?: string;
    customerFeedback?: string;

    createdAt: any;
    updatedAt: any;
}

export interface Lead {
    id: string;

    // Source
    source: 'whatsapp' | 'linkedin' | 'google_maps' | 'facebook' | 'apify' | 'manual' | 'qualification_quiz';
    sourceId?: string;               // External ID from source

    // Customer Links
    userId: string;                  // Who owns this lead
    subscriptionId?: string;         // If from subscription
    whatsappInstanceId?: string;     // If from WhatsApp

    // Lead Data
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    website?: string;
    location?: {
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };

    // Speed-to-Lead Tracking (CRITICAL METRIC)
    firstContactAt?: any;     // When lead first reached out
    firstResponseAt?: any;     // When we first responded
    responseTime?: number;           // Seconds (target: <300s = 5 min)
    responseTimeStatus?: 'excellent' | 'good' | 'poor'; // <5min, 5-30min, >30min

    // Qualification (Pre-Qualify Before Owner Invests Time)
    qualificationStatus: 'unqualified' | 'qualified' | 'high_priority';
    qualificationData?: {
        budget?: string;
        timeline?: string;
        urgency?: 'immediate' | 'this_week' | 'this_month' | 'exploring';
        serviceNeeded?: string;
        businessType?: string;
        decisionMaker?: boolean;
    };

    // Enrichment
    enrichedData?: {
        linkedinUrl?: string;
        companySize?: string;
        industry?: string;
        revenue?: string;
        technologies?: string[];
    };

    // Status (Customer's CRM Status)
    status: 'new' | 'contacted' | 'qualified' | 'quoted' | 'converted' | 'lost';
    statusUpdatedAt?: any;

    // Delivery
    deliveredAt: any;
    deliveryMethod: 'whatsapp' | 'email' | 'api' | 'webhook' | 'dashboard' | 'crm';

    // Conversion Tracking
    convertedAt?: any;
    conversionValue?: number;        // Revenue from this lead
    conversionSource?: string;       // How they converted

    // Metadata
    tags?: string[];
    notes?: string;
    metadata?: Record<string, any>;

    createdAt: any;
    updatedAt: any;
}

export interface BusinessNiche {
    id: string;
    name: string;                    // "HVAC Contractor"
    slug: string;                    // "hvac"
    category: 'home_services' | 'professional_services' | 'retail' | 'food_service' | 'other';

    // Common Pain Points (For Personalization)
    painPoints: string[];            // ["Missing calls on jobs", "Tire-kickers waste time"]

    // Common Services (For FAQs)
    commonServices: string[];        // ["AC Repair", "Furnace Installation", etc.]

    // Typical Business Profile
    typicalRevenue: string;          // "$200k-$1M"
    typicalEmployees: string;         // "1-10"

    // WhatsApp Configuration Templates
    whatsappFaqs?: Array<{
        question: string;
        answer: string;
    }>;

    isActive: boolean;
    order: number;                    // Display order

    createdAt: any;
    updatedAt: any;
}

export interface ResponseTimeMetrics {
    id: string;
    userId: string;
    whatsappInstanceId?: string;
    subscriptionId?: string;

    // Time Period
    period: string;                  // "2026-01"
    periodStart: any;
    periodEnd: any;

    // Metrics
    totalLeads: number;
    averageResponseTime: number;      // Seconds
    medianResponseTime: number;

    // Response Time Buckets
    responseTimeBuckets: {
        under5min: number;              // <300s (excellent)
        under30min: number;             // 300-1800s (good)
        over30min: number;              // >1800s (poor)
    };

    // Conversion by Response Time
    conversionsBySpeed: {
        under5min: { leads: number; conversions: number; rate: number };
        under30min: { leads: number; conversions: number; rate: number };
        over30min: { leads: number; conversions: number; rate: number };
    };

    // Goals
    targetResponseTime: number;       // Usually 300s (5 min)
    goalMet: boolean;                 // Average < target?

    createdAt: any;
    updatedAt: any;
}
