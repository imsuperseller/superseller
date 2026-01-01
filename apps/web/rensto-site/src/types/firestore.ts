export interface UsageLog {
    id: string;
    clientId: string;
    agentId: string; // matches ServiceManifest.id
    timestamp: any; // Firestore Timestamp
    model: string; // "gpt-4-turbo"
    tokens: {
        input: number;
        output: number;
        total: number;
    };
    cost: number; // in cents, calculated by n8n or generic calculator
    metadata?: Record<string, any>; // workflow execution ID, etc.
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
    readinessStatus?: 'Draft' | 'Active' | 'Internal';
    tags?: string[];
    video?: string;
    rating?: number;
    downloads?: number;
    image?: string;
    workflowId?: string;
    createdAt?: any;
    updatedAt?: any;

    // Fulfillment Configuration
    configurationSchema?: FormField[]; // Questions to ask for "Implementation" mode
    deliveryChecklist?: string[]; // Items to verify for "Download" mode
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

    createdAt: any; // Firestore Timestamp
    activatedAt?: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}
