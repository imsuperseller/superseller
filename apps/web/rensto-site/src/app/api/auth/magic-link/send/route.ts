import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { authRateLimiter } from '@/lib/rate-limiter';
// Token expiration: 24 hours
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'service@rensto.com,admin@rensto.com').split(',').map(e => e.trim().toLowerCase());

// Generate magic link token
const generateToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export async function POST(request: NextRequest) {
    const rateLimited = authRateLimiter.middleware()(request);
    if (rateLimited) return rateLimited;

    try {
        const { email, redirectTo } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();
        let clientId = '';
        let clientName = '';
        let role = 'client';

        // 1. Check if Admin - use admin user record (Postgres)
        if (ADMIN_EMAILS.includes(normalizedEmail)) {
            const adminUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
            if (adminUser) {
                clientId = adminUser.id;
            } else {
                const created = await prisma.user.create({
                    data: {
                        email: normalizedEmail,
                        name: 'Admin',
                        status: 'active',
                        emailVerified: new Date(),
                        dashboardToken: crypto.randomUUID(),
                    },
                });
                clientId = created.id;
            }
            clientName = 'Admin';
            role = 'admin';
        } else {
            const pgUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
            const csc = await prisma.customSolutionsClient.findFirst({ where: { email: normalizedEmail } });

            if (pgUser) {
                clientId = pgUser.id;
                clientName = pgUser.name || 'Client';
            } else if (csc) {
                clientId = csc.id;
                clientName = csc.name || 'Client';
            } else {
                console.log(`Login attempt for unknown email: ${normalizedEmail}`);
                return NextResponse.json({
                    success: true,
                    message: 'If your email is registered, you will receive a magic link.',
                    debug: process.env.NODE_ENV === 'development' ? 'Email not found in database' : undefined,
                });
            }
        }

        // Generate new token
        const token = generateToken();
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);
        await prisma.magicLinkToken.create({
            data: {
                id: token,
                email: normalizedEmail,
                clientId,
                expiresAt,
                used: false,
            },
        });
        // Build magic link URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rensto.com';
        const magicLink = `${baseUrl}/api/auth/magic-link/verify?token=${token}`;

        // Send email via Resend
        const resendApiKey = process.env.RESEND_API_KEY;

        if (resendApiKey) {
            try {
                const emailResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Rensto <noreply@rensto.com>',
                        to: normalizedEmail,
                        subject: '🔐 Login to Rensto Dashboard',
                        html: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            </head>
                            <body style="margin: 0; padding: 0; background-color: #110d28; font-family: Arial, sans-serif;">
                                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                    <div style="text-align: center; margin-bottom: 30px;">
                                         <h1 style="color: #fe3d51; font-size: 24px; font-weight: bold;">Rensto</h1>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #1a1535 0%, #2d2150 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(254, 61, 81, 0.3); text-align: center;">
                                        <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">
                                            Welcome back, ${clientName}!
                                        </h2>
                                        
                                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                                            Click the button below to securely sign in to your dashboard.
                                        </p>
                                        
                                        <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #fe3d51 0%, #ff6b7a 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; margin-bottom: 24px;">
                                            Sign In Now
                                        </a>
                                        
                                        <p style="color: #64748b; font-size: 14px;">
                                            This link is valid for 24 hours.
                                        </p>
                                    </div>
                                    
                                    <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 30px;">
                                        If you didn't request this login link, please ignore this email.
                                    </p>
                                </div>
                            </body>
                            </html>
                        `
                    })
                });

                if (!emailResponse.ok) {
                    const errorData = await emailResponse.json();
                    console.error('Resend error:', errorData);
                    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
                }
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
            }
        } else {
            // Dev mode fallback
            console.log('------------------------------------------------');
            console.log(`[DEV MODE] Magic Link for ${normalizedEmail}:`);
            console.log(magicLink);
            console.log('------------------------------------------------');
        }

        return NextResponse.json({
            success: true,
            message: 'Magic link sent successfully',
            devLink: process.env.NODE_ENV === 'development' ? magicLink : undefined
        });

    } catch (error) {
        console.error('Magic link generation error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error', message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
