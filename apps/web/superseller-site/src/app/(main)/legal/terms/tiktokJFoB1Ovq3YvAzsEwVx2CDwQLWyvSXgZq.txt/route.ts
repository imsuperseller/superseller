
import { NextResponse } from 'next/server';

export async function GET() {
    return new NextResponse('tiktok-developers-site-verification=JFoB1Ovq3YvAzsEwVx2CDwQLWyvSXgZq', {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
