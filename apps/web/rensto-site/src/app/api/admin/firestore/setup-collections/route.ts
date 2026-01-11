import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * POST /api/admin/firestore/setup-collections
 * 
 * Initializes missing Firestore collections by creating sample documents.
 * This ensures collections exist and can be queried.
 * 
 * Requires admin authentication (add your auth check here)
 */
export async function POST(request: NextRequest) {
    try {
        // TODO: Add admin authentication check
        // const session = await getServerSession();
        // if (!session || !isAdmin(session.user)) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const db = getFirestoreAdmin();
        const results: Record<string, { success: boolean; message: string; docCount?: number }> = {};

        // Collections to initialize
        const collectionsToSetup = [
            // 1. Critical Foundation
            {
                name: COLLECTIONS.USERS,
                sampleDoc: {
                    _setup: true,
                    _note: 'This is a setup document. Delete after verifying collection structure.',
                    email: 'setup@example.com',
                    status: 'active',
                    emailVerified: false,
                    businessType: 'other',
                    businessSize: 'small_team',
                    activeServices: {
                        marketplace: false,
                        whatsapp: false,
                        subscriptions: false,
                        care_plan: 'none'
                    },
                    preferences: {
                        language: 'en',
                        emailNotifications: true,
                        smsNotifications: false,
                    },
                    source: 'organic',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                },
            },
            {
                name: COLLECTIONS.SUBSCRIPTIONS,
                sampleDoc: {
                    _setup: true,
                    _note: 'This is a setup document. Delete after verifying collection structure.',
                    userId: 'setup-user-id',
                    userEmail: 'setup@example.com',
                    stripeSubscriptionId: 'sub_setup',
                    stripeCustomerId: 'cus_setup',
                    stripePriceId: 'price_setup',
                    subscriptionType: 'care_plan',
                    carePlanTier: 'starter',
                    amount: 49700,
                    currency: 'usd',
                    billingInterval: 'month',
                    status: 'active',
                    currentPeriodStart: Timestamp.now(),
                    currentPeriodEnd: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
                    cancelAtPeriodEnd: false,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                },
            },
            {
                name: COLLECTIONS.WHATSAPP_INSTANCES,
                sampleDoc: {
                    _setup: true,
                    _note: 'This is a setup document. Delete after verifying collection structure.',
                    userId: 'setup-user-id',
                    userEmail: 'setup@example.com',
                    businessName: 'Setup Business',
                    businessType: 'hvac',
                    phoneNumber: '+15550000000',
                    bundle: 'auto_qualify_book',
                    bundleFeatures: {
                        instantResponse: true,
                        faqAutoAnswer: true,
                        leadCapture: true,
                        qualification: true,
                        appointmentBooking: true
                    },
                    addOns: {
                        smartMenus: true
                    },
                    status: 'pending_setup',
                    metrics: {
                        totalMessages: 0,
                        averageResponseTime: 0,
                        leadsCaptured: 0,
                        appointmentsBooked: 0,
                        quotesSent: 0,
                        humanEscalations: 0
                    },
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                }
            },

            // 2. WhatsApp Core
            {
                name: COLLECTIONS.WHATSAPP_MESSAGES,
                sampleDoc: {
                    _setup: true,
                    _note: 'This is a setup document. Delete after verifying collection structure.',
                    whatsappInstanceId: 'setup-instance-id',
                    userId: 'setup-user-id',
                    from: '+15551234567',
                    to: '+15550000000',
                    messageType: 'text',
                    content: 'Setup message content',
                    direction: 'inbound',
                    responseTime: 45,
                    isFirstContact: true,
                    firstResponseTime: 45,
                    leadStatus: 'new',
                    escalatedToHuman: false,
                    createdAt: Timestamp.now()
                }
            },
            {
                name: COLLECTIONS.APPOINTMENT_BOOKINGS,
                sampleDoc: {
                    _setup: true,
                    _note: 'This is a setup document. Delete after verifying collection structure.',
                    whatsappInstanceId: 'setup-instance-id',
                    userId: 'setup-user-id',
                    customerName: 'John Doe',
                    customerPhone: '+15551234567',
                    serviceType: 'AC Repair',
                    appointmentDate: Timestamp.now(),
                    appointmentTime: '10:00 AM',
                    duration: 60,
                    status: 'scheduled',
                    source: 'whatsapp_ai',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                }
            },
            {
                name: COLLECTIONS.LEADS,
                sampleDoc: {
                    _setup: true,
                    _note: 'This is a setup document. Delete after verifying collection structure.',
                    subscriptionId: 'setup-subscription-id',
                    userId: 'setup-user-id',
                    userEmail: 'setup@example.com',
                    source: 'manual',
                    name: 'Setup Lead',
                    status: 'new',
                    deliveredAt: Timestamp.now(),
                    deliveryMethod: 'dashboard',
                    responseTime: 120,
                    responseTimeStatus: 'excellent',
                    qualificationStatus: 'qualified',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                },
            },

            // 3. Care Plans & Analytics
            {
                name: COLLECTIONS.CARE_PLAN_DELIVERABLES,
                sampleDoc: {
                    _setup: true,
                    _note: 'This is a setup document. Delete after verifying collection structure.',
                    userId: 'setup-user-id',
                    subscriptionId: 'setup-sub-id',
                    carePlanTier: 'starter',
                    periodStart: Timestamp.now(),
                    periodEnd: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
                    month: new Date().toISOString().slice(0, 7),
                    deliverables: {
                        monitoringHours: 5,
                        checkInCall: false,
                        faqUpdates: 0
                    },
                    hoursAllocated: 5,
                    hoursUsed: 0,
                    hoursRemaining: 5,
                    status: 'in_progress',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                }
            },
            {
                name: COLLECTIONS.RESPONSE_TIME_METRICS,
                sampleDoc: {
                    _setup: true,
                    _note: 'This is a setup document. Delete after verifying collection structure.',
                    userId: 'setup-user-id',
                    period: new Date().toISOString().slice(0, 7),
                    totalLeads: 0,
                    averageResponseTime: 0,
                    medianResponseTime: 0,
                    responseTimeBuckets: {
                        under5min: 0,
                        under30min: 0,
                        over30min: 0
                    },
                    conversionsBySpeed: {
                        under5min: { leads: 0, conversions: 0, rate: 0 },
                        under30min: { leads: 0, conversions: 0, rate: 0 },
                        over30min: { leads: 0, conversions: 0, rate: 0 }
                    },
                    targetResponseTime: 300,
                    goalMet: true,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                }
            },
            {
                name: COLLECTIONS.BUSINESS_NICHES,
                sampleDoc: {
                    _setup: true,
                    _note: 'This is a setup document. Delete after verifying collection structure.',
                    name: "HVAC Contractor",
                    slug: "hvac",
                    category: 'home_services',
                    painPoints: ["Missing calls on jobs", "Tire-kickers waste time"],
                    commonServices: ["AC Repair", "Furnace Installation"],
                    typicalRevenue: "$200k-$1M",
                    typicalEmployees: "1-10",
                    isActive: true,
                    order: 1,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                }
            }
        ];

        // Initialize each collection
        for (const collection of collectionsToSetup) {
            try {
                const collectionRef = db.collection(collection.name);

                // Check if collection already has documents
                const existingDocs = await collectionRef.limit(1).get();

                if (existingDocs.empty) {
                    // Create setup document to initialize collection
                    await collectionRef.add(collection.sampleDoc);
                    results[collection.name] = {
                        success: true,
                        message: 'Collection initialized with setup document',
                        docCount: 1,
                    };
                } else {
                    // Collection already exists
                    const allDocs = await collectionRef.get();
                    results[collection.name] = {
                        success: true,
                        message: 'Collection already exists',
                        docCount: allDocs.size,
                    };
                }
            } catch (error: any) {
                results[collection.name] = {
                    success: false,
                    message: `Error: ${error.message}`,
                };
            }
        }

        // Summary
        const successCount = Object.values(results).filter(r => r.success).length;
        const failCount = Object.values(results).filter(r => !r.success).length;

        return NextResponse.json({
            success: failCount === 0,
            message: `Setup complete: ${successCount} succeeded, ${failCount} failed`,
            results,
            nextSteps: [
                '1. Verify collections in Firebase Console',
                '2. Delete setup documents (marked with _setup: true)',
                '3. Create Firestore indexes (see FIRESTORE_COLLECTION_STRUCTURE.md)',
                '4. Update API routes to use new collections',
            ],
        });
    } catch (error: any) {
        console.error('Firestore setup error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                details: 'Check server logs for more information'
            },
            { status: 500 }
        );
    }
}

