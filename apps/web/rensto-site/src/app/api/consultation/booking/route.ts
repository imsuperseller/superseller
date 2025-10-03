import { NextRequest, NextResponse } from 'next/server';
import { TidyCalApi } from '@/lib/tidycal';
import { AirtableApi } from '@/lib/airtable';

const tidycal = new TidyCalApi();
const airtable = new AirtableApi();

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

    // Create booking in TidyCal
    const tidycalBooking = await tidycal.createBooking(bookingData);
    if (!tidycalBooking.success) {
      return NextResponse.json(
        { success: false, error: tidycalBooking.error },
        { status: 500 }
      );
    }

    // Save booking to Airtable
    const airtableBooking = await airtable.saveConsultationBooking({
      ...bookingData,
      bookingId: tidycalBooking.bookingId,
      status: 'confirmed'
    });

    if (!airtableBooking.success) {
      return NextResponse.json(
        { success: false, error: airtableBooking.error },
        { status: 500 }
      );
    }

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

  } catch (error) {
    console.error('Consultation booking error:', error);
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
  if (!emailRegex.test(data.contact.email)) {
    return {
      valid: false,
      error: 'Invalid email address'
    };
  }

  // Validate phone
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (data.contact.phone && !phoneRegex.test(data.contact.phone)) {
    return {
      valid: false,
      error: 'Invalid phone number'
    };
  }

  // Validate datetime
  const bookingDate = new Date(data.datetime);
  const now = new Date();
  if (bookingDate <= now) {
    return {
      valid: false,
      error: 'Booking date must be in the future'
    };
  }

  return { valid: true };
}

function generateConfirmationNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CON-${timestamp}-${random}`.toUpperCase();
}
