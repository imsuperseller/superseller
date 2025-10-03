import axios from 'axios';

export class TidyCalApi {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.TIDYCAL_API_KEY || '';
    this.baseUrl = 'https://tidycal.com/api';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async getUser() {
    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        user: response.data
      };

    } catch (error) {
      console.error('TidyCal getUser error:', error);
      return {
        success: false,
        error: 'Failed to get user information'
      };
    }
  }

  async getAvailableTimeSlots(serviceId: string, date: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/availability`, {
        headers: this.getHeaders(),
        params: {
          service: serviceId,
          date: date,
          timezone: 'UTC'
        }
      });

      return {
        success: true,
        timeSlots: response.data.timeSlots || [],
        service: response.data.service
      };

    } catch (error) {
      console.error('TidyCal getAvailableTimeSlots error:', error);
      return {
        success: false,
        error: 'Failed to get available time slots'
      };
    }
  }

  async createBooking(bookingData: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/bookings`, {
        service: bookingData.service,
        datetime: bookingData.datetime,
        contact: bookingData.contact,
        template: bookingData.template,
        notes: bookingData.notes || '',
        timezone: 'UTC'
      }, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        bookingId: response.data.id,
        booking: response.data
      };

    } catch (error) {
      console.error('TidyCal createBooking error:', error);
      return {
        success: false,
        error: 'Failed to create booking'
      };
    }
  }

  async getBooking(bookingId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/bookings/${bookingId}`, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        booking: response.data
      };

    } catch (error) {
      console.error('TidyCal getBooking error:', error);
      return {
        success: false,
        error: 'Failed to get booking'
      };
    }
  }

  async updateBooking(bookingId: string, updateData: any) {
    try {
      const response = await axios.patch(`${this.baseUrl}/bookings/${bookingId}`, updateData, {
        headers: this.getHeaders()
      });

      return {
        success: true,
        booking: response.data
      };

    } catch (error) {
      console.error('TidyCal updateBooking error:', error);
      return {
        success: false,
        error: 'Failed to update booking'
      };
    }
  }

  async cancelBooking(bookingId: string, reason?: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/bookings/${bookingId}`, {
        headers: this.getHeaders(),
        data: {
          reason: reason || 'Cancelled by user'
        }
      });

      return {
        success: true,
        response: response.data
      };

    } catch (error) {
      console.error('TidyCal cancelBooking error:', error);
      return {
        success: false,
        error: 'Failed to cancel booking'
      };
    }
  }

  async getBookings(params: {
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
  } = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/bookings`, {
        headers: this.getHeaders(),
        params
      });

      return {
        success: true,
        bookings: response.data.bookings || [],
        total: response.data.total || 0
      };

    } catch (error) {
      console.error('TidyCal getBookings error:', error);
      return {
        success: false,
        error: 'Failed to get bookings'
      };
    }
  }

  async getEvents(params: {
    startDate?: string;
    endDate?: string;
    service?: string;
  } = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/events`, {
        headers: this.getHeaders(),
        params
      });

      return {
        success: true,
        events: response.data.events || []
      };

    } catch (error) {
      console.error('TidyCal getEvents error:', error);
      return {
        success: false,
        error: 'Failed to get events'
      };
    }
  }

  async testConnectivity() {
    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return {
        success: true,
        responseTime: response.data.responseTime || 0,
        user: response.data.user || null
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
