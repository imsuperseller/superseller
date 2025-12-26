import { NextRequest, NextResponse } from 'next/server';
import { TidyCalApi } from '@/lib/tidycal';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';

const tidycal = new TidyCalApi();

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();

    // Validate booking data
    const validation = validateBookingData(bookingData);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 1. Create booking in TidyCal
    const tidycalBooking = await tidycal.createBooking(bookingData);
    if (!tidycalBooking.success) {
      await auditAgent.log({
        service: 'other',
        action: 'tidycal_booking_failed',
        status: 'error',
        errorMessage: tidycalBooking.error
      });
      return NextResponse.json(
        { success: false, error: tidycalBooking.error },
        { status: 500 }
      );
    }

    // 2. Save booking to Firestore
    const db = getFirestoreAdmin();
    const bookingRef = await db.collection(COLLECTIONS.CONSULTATIONS).add({
      ...bookingData,
      bookingId: tidycalBooking.bookingId,
      status: 'confirmed',
      platform: 'tidycal',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await auditAgent.log({
      service: 'firebase',
      action: 'consultation_booking_saved',
      status: 'success',
      details: { bookingId: tidycalBooking.bookingId, firestoreId: bookingRef.id, email: bookingData.contact?.email }
    });

    return NextResponse.json({
      success: true,
      bookingId: tidycalBooking.bookingId,
      confirmationNumber: generateConfirmationNumber(),
      bookingDetails: {
        service: bookingData.service,
        datetime: bookingData.datetime,
        contact: bookingData.contact
      }
    });

  } catch (error: any) {
    console.error('Consultation booking error:', error);
    await auditAgent.log({
      service: 'firebase',
      action: 'consultation_booking_failed',
      status: 'error',
      errorMessage: error.message
    });
    return NextResponse.json(
      { success: false, error: 'Failed to create consultation booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');

    if (!serviceId || !date) {
      return NextResponse.json(
        { success: false, error: 'Service ID and date are required' },
        { status: 400 }
      );
    }

    // Get available time slots
    const timeSlots = await tidycal.getAvailableTimeSlots(serviceId, date);

    return NextResponse.json({
      success: true,
      timeSlots: timeSlots.timeSlots || [],
      service: timeSlots.service
    });

  } catch (error) {
    console.error('Get time slots error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get available time slots' },
      { status: 500 }
    );
  }
}

function validateBookingData(data: any) {
  const requiredFields = ['service', 'datetime', 'contact'];

  for (const field of requiredFields) {
    if (!data[field]) {
      return {
        valid: false,
        error: `Missing required field: ${field}`
      };
    }
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.contact?.email)) {
    return {
      valid: false,
      error: 'Invalid email address'
    };
  }

  return { valid: true };
}

function generateConfirmationNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CON-${timestamp}-${random}`.toUpperCase();
}
