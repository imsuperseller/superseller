import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDefaultFreeTrialEntitlements, UserEntitlements } from '@/types/entitlements';
import { sendSlackNotification, SlackTemplates } from '@/lib/slack';
import prisma from '@/lib/prisma';
import { authRateLimiter } from '@/lib/rate-limiter';
// Configuration
const N8N_LEAD_MACHINE_WEBHOOK = 'https://n8n.superseller.agency/webhook/universal-lead-machine-v3-optimized';
const FREE_TRIAL_LIMIT = 10;
const RATE_LIMIT_HOURS = 24; // One request per 24 hours per email

export async function POST(req: NextRequest) {
    const rateLimited = authRateLimiter.middleware()(req);
    if (rateLimited) return rateLimited;

    try {
        const body = await req.json();
        const { email, niche, source, name } = body;

        // Basic validation
        if (!email || !niche) {
            return NextResponse.json(
                { error: 'Email and Niche are required' },
                { status: 400 }
            );
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();
        const userDocId = normalizedEmail.replace(/[^a-z0-9]/g, '_');
        let pgUser = await prisma.user.findUnique({ where: { id: userDocId } });

        let entitlements: UserEntitlements;
        let dashboardToken: string;
        let isNewUser = false;

        if (pgUser) {
            entitlements = (pgUser.entitlements as unknown as UserEntitlements) || getDefaultFreeTrialEntitlements();
            dashboardToken = pgUser.dashboardToken || uuidv4().slice(0, 8);

            // GUARDRAIL 1: Check if free trial is exhausted
            if (!entitlements.freeLeadsTrial) {
                return NextResponse.json(
                    {
                        error: 'Free trial already used',
                        message: 'You have already used your free trial. Upgrade to continue getting leads.',
                        upgradeUrl: '/pricing?upgrade=leads'
                    },
                    { status: 403 }
                );
            }

            // GUARDRAIL 2: Check if free leads remaining is 0
            const remaining = entitlements.freeLeadsRemaining ?? FREE_TRIAL_LIMIT;
            if (remaining <= 0) {
                return NextResponse.json(
                    {
                        error: 'Free leads exhausted',
                        message: 'You have used all 10 free leads. Upgrade to get unlimited leads.',
                        upgradeUrl: '/pricing?upgrade=leads'
                    },
                    { status: 403 }
                );
            }

            // GUARDRAIL 3: Rate limiting - check last request time (Postgres)
            const lastRequest = await prisma.leadRequest.findFirst({
                where: { userId: userDocId },
                orderBy: { createdAt: 'desc' },
            });

            if (lastRequest) {
                const hoursSinceLastRequest = (Date.now() - lastRequest.createdAt.getTime()) / (1000 * 60 * 60);
                if (hoursSinceLastRequest < RATE_LIMIT_HOURS) {
                    const hoursRemaining = Math.ceil(RATE_LIMIT_HOURS - hoursSinceLastRequest);
                    return NextResponse.json(
                        {
                            error: 'Rate limit exceeded',
                            message: `You can request new leads in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}. Your previous request is still processing.`
                        },
                        { status: 429 }
                    );
                }
            }

            // Update dashboardToken if missing
            if (!pgUser.dashboardToken) {
                await prisma.user.update({
                    where: { id: userDocId },
                    data: { dashboardToken },
                });
            }

        } else {
            // New user — create with free trial entitlements
            isNewUser = true;
            dashboardToken = uuidv4().slice(0, 8);
            entitlements = getDefaultFreeTrialEntitlements();
            pgUser = await prisma.user.create({
                data: {
                    id: userDocId,
                    email: normalizedEmail,
                    name: name || null,
                    dashboardToken,
                    entitlements: entitlements as any,
                    status: 'lead',
                    emailVerified: false,
                    preferences: { language: 'en', emailNotifications: true, smsNotifications: false },
                    source: 'organic',
                },
            });

        }

        // 2. Decrement freeLeadsRemaining counter
        const newRemaining = Math.max(0, (entitlements.freeLeadsRemaining ?? FREE_TRIAL_LIMIT) - FREE_TRIAL_LIMIT);
        const updatedEntitlements = {
            ...entitlements,
            freeLeadsRemaining: newRemaining,
            freeLeadsTrial: newRemaining > 0,
        };
        await prisma.user.update({
            where: { id: userDocId },
            data: { entitlements: updatedEntitlements as any },
        });
        // 3. Save lead request to Postgres (primary)
        const leadRequest = await prisma.leadRequest.create({
            data: {
                userId: userDocId,
                data: {
                    email: normalizedEmail,
                    niche,
                    source: source || 'web_free_trial',
                    limit: FREE_TRIAL_LIMIT,
                    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: req.headers.get('user-agent') || 'unknown',
                },
                status: 'pending',
            },
        });
        // 4. Trigger n8n Webhook with enforced limit
        console.log(`[FreeLeads] Triggering n8n for ${normalizedEmail} (Search: ${niche})`);

        fetch(N8N_LEAD_MACHINE_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestId: leadRequest.id,
                userId: userDocId,
                email: normalizedEmail,
                niche,
                limit: FREE_TRIAL_LIMIT,
                source: 'web_free_trial',
                isFreeTrialUser: true
            })
        }).catch(err => {
            console.error('[FreeLeads] n8n Trigger Error:', err);
        });

        // 5. Send Slack notification for admin
        sendSlackNotification(SlackTemplates.newLeadRequest(normalizedEmail, niche)).catch(() => { });

        // 6. Return success with dashboard URL
        const dashboardUrl = `/dashboard/${userDocId}?token=${dashboardToken}`;

        return NextResponse.json({
            success: true,
            id: leadRequest.id,
            dashboardUrl,
            leadsRemaining: newRemaining,
            message: isNewUser
                ? 'Welcome! Your 10 free leads are being generated.'
                : `Your leads are being generated. You have ${newRemaining} free leads remaining.`
        });

    } catch (error: any) {
        console.error('[FreeLeads] API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
