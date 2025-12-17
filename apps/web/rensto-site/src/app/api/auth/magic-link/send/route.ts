import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirestoreAdmin, COLLECTIONS, type MagicLinkToken } from '@/lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';

// Token expiration: 24 hours
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;

// Generate magic link token
const generateToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export async function POST(request: NextRequest) {
    try {
        const { email, clientId, clientName } = await request.json();

        if (!email || !clientId) {
            return NextResponse.json(
                { success: false, error: 'Email and clientId are required' },
                { status: 400 }
            );
        }

        // Generate new token
        const token = generateToken();
        const now = Timestamp.now();
        const expiresAt = Timestamp.fromMillis(Date.now() + TOKEN_EXPIRATION_MS);

        // Store token in Firestore
        const db = getFirestoreAdmin();
        const tokenDoc: MagicLinkToken = {
            id: token,
            email,
            clientId,
            expiresAt,
            used: false,
            createdAt: now
        };

        await db.collection(COLLECTIONS.MAGIC_LINK_TOKENS).doc(token).set(tokenDoc);

        // Build magic link URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rensto.com';
        const magicLink = `${baseUrl}/auth/verify?token=${token}`;

        // Send email via Resend (or your email provider)
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
                        to: email,
                        subject: '🎉 Welcome to Rensto - Access Your Dashboard',
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
                                        <img src="${baseUrl}/rensto-logo.png" alt="Rensto" width="60" height="60" style="display: inline-block;">
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #1a1535 0%, #2d2150 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(254, 61, 81, 0.3);">
                                        <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 16px 0; text-align: center;">
                                            Welcome${clientName ? `, ${clientName}` : ''}! 🚀
                                        </h1>
                                        
                                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                                            Your custom automation system is being built. Access your dashboard to track progress, view deliverables, and manage your project.
                                        </p>
                                        
                                        <div style="text-align: center; margin: 32px 0;">
                                            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #fe3d51 0%, #ff6b7a 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px;">
                                                Access Your Dashboard →
                                            </a>
                                        </div>
                                        
                                        <p style="color: #64748b; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
                                            This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
                                        </p>
                                    </div>
                                    
                                    <div style="text-align: center; margin-top: 30px;">
                                        <p style="color: #64748b; font-size: 12px; margin: 0;">
                                            © ${new Date().getFullYear()} Rensto. All rights reserved.
                                        </p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `
                    })
                });

                if (!emailResponse.ok) {
                    const errorData = await emailResponse.json();
                    console.error('Resend error:', errorData);
                }
            } catch (emailError) {
                console.error('Email sending error:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Magic link sent successfully',
            magicLink: process.env.NODE_ENV === 'development' ? magicLink : undefined,
            expiresIn: '24 hours'
        });

    } catch (error) {
        console.error('Magic link generation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate magic link' },
            { status: 500 }
        );
    }
}
