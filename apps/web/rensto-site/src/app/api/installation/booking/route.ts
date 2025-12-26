import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';

// TidyCal token
const TIDYCAL_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjliYThhMDk0YzgyOTU4M2IwMTllMTY0ODBhOTE5NDM5NzFhMzY2MWRiYjJjM2EzMTgyMWI3NzQ2YzJkNmY1YTIxY2Y3M2VhZTExMDQ2NmEiLCJpYXQiOjE3NTc3MTA4ODYuNTMzMzg0LCJuYmYiOjE3NTc3MTA4ODYuNTMzMzg2LCJleHAiOjQ5MTMzODQ0ODYuNTIzMTE2LCJzdWIiOiIzMzEzOCIsInNjb3BlcyI6W119.WEkUmJ4XOi_1Cia5jWFUFk6Q30G1A80l2WPNrZa-svMdp4A3Ft_DzsKLfeGkeDZ7B-0lnXaaOV04R9DuX6GbYsKXZZyC8UreNANDn-8wEZmkYOw5Dzt4X_9vHJup3hlexTjTMDSwro4uKQA6YAoZuCtKr1aj32O_8Egop9IjMbrblowRzmiLck2KBn3x11GNfaFR-5xZ3-b-K8QKB0OlERV_ZOfUq25JWRF3XlUJLC1Y8yYQt5qIbX-LnAfk_FahiiHiGGN0jdPHUzJJ5WM9iLqNxTjgMdbdSUvif6lL6vjoaMP_2jLXQCd0ANGH-9LsoqWb92Ze9LFc4Mx-1q7D4WlEvl3bsyeuxfuRoZs0SVLNTiEjGyFZJG2_ChDac9t7RNq7BKTSzHYY9jBFwjeVsq_lxLkaMfKMfZ_hOF83EizIhjc0r4ajDxyWDatA-vr88SIE2vEA0ixzGV7c2NFbtge-HztY-LE0XWO1BZRR0NU3a1K_ihE4L4kBdI1C8US_tVTGYJ1hFWze3ESaYhqNiCyfUemT0S3AXpS3xwI7DuHjR3q-eRco4-fiuTQqVQYMmcemQaULeknP9tMsQMUTIWNbDSBrJL2adO3LIV8F3JgGsJnDhXJmAufLMe8OcweQAQs63kXApZrikPn5w3j0yy-O7SYQcHDCjJxNwYqslYA';

const TIDYCAL_API_KEY = process.env.TIDYCAL_API_KEY || TIDYCAL_TOKEN;
const TIDYCAL_BASE_URL = 'https://tidycal.com/api';

async function getTidyCalBookingLink() {
  try {
    const accountResponse = await axios.get(`${TIDYCAL_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${TIDYCAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const vanityPath = accountResponse.data.vanity_path || 'shai';

    const bookingTypesResponse = await axios.get(`${TIDYCAL_BASE_URL}/booking-types`, {
      headers: {
        'Authorization': `Bearer ${TIDYCAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const bookingTypes = bookingTypesResponse.data.data || [];
    const installationBookingType = bookingTypes.find((bt: any) =>
      bt.title?.toLowerCase().includes('installation') ||
      bt.url_slug?.toLowerCase().includes('installation')
    ) || bookingTypes[0];

    const bookingLink = installationBookingType?.url || `https://tidycal.com/${vanityPath}/installation`;

    return {
      success: true,
      tidycalLink: bookingLink,
      bookingUrl: bookingLink,
      url: bookingLink
    };

  } catch (error: any) {
    console.error('TidyCal API error:', error?.response?.data || error?.message);
    return {
      success: true,
      tidycalLink: 'https://tidycal.com/shai/installation',
      bookingUrl: 'https://tidycal.com/shai/installation',
      url: 'https://tidycal.com/shai/installation'
    };
  }
}

async function updatePurchaseRecord(purchaseRecordId: string, tidycalLink: string) {
  try {
    const db = getFirestoreAdmin();
    await db.collection(COLLECTIONS.PURCHASES).doc(purchaseRecordId).update({
      tidycalBookingLink: tidycalLink,
      status: 'installation_booked',
      installationBooked: true,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Firestore update purchase error:', error);
    return { success: false, error };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, purchaseRecordId } = await request.json();

    if (!customerEmail || !purchaseRecordId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bookingResult = await getTidyCalBookingLink();

    if (purchaseRecordId) {
      await updatePurchaseRecord(purchaseRecordId, bookingResult.tidycalLink);
    }

    await auditAgent.log({
      service: 'other',
      action: 'installation_link_generated',
      status: 'success',
      details: { customerEmail, purchaseRecordId }
    });

    return NextResponse.json({
      success: true,
      tidycalLink: bookingResult.tidycalLink,
      message: 'TidyCal booking link generated successfully'
    });

  } catch (error: any) {
    console.error('Installation booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create installation booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingTypeId = searchParams.get('bookingTypeId');
    const startsAt = searchParams.get('starts_at');
    const endsAt = searchParams.get('ends_at');

    if (!bookingTypeId || !startsAt || !endsAt) {
      return NextResponse.json({ success: false, error: 'Parameters required' }, { status: 400 });
    }

    const response = await axios.get(`${TIDYCAL_BASE_URL}/booking-types/${bookingTypeId}/timeslots`, {
      headers: {
        'Authorization': `Bearer ${TIDYCAL_API_KEY}`
      },
      params: { starts_at: startsAt, ends_at: endsAt }
    });

    return NextResponse.json({
      success: true,
      timeSlots: response.data.data || []
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to get time slots' }, { status: 500 });
  }
}
