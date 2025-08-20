import { api } from './index';

export interface Facility {
  id: number;
  name: string;
  description: string;
  category: string;
  default_duration_minutes: number;
  max_capacity: number;
  location: string;
  image_url?: string;
  is_active: boolean;
  base_price: number;
  peak_hours_start: string;
  peak_hours_end: string;
  peak_price_multiplier: number;
  member_discount_percentage: number;
  cancellation_hours: number;
  refund_percentage: number;
  total_bookings?: number;
  total_revenue?: number;
  utilization_percentage?: number;
}

export interface FacilitySchedule {
  id: number;
  facility_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface FacilitySlot {
  id: number;
  facility_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  base_price: number;
  final_price: number;
  slot_type: 'regular' | 'peak' | 'off_peak';
  max_capacity: number;
  current_bookings: number;
  facility_name?: string;
  default_duration_minutes?: number;
  member_price?: number;
}

export interface FacilityBooking {
  id: number;
  user_id: number;
  slot_id: number;
  facility_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  price_paid: number;
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  facility_name?: string;
  location?: string;
  slot_date?: string;
  slot_start_time?: string;
  slot_end_time?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

export interface FacilityAnalytics {
  date: string;
  total_slots: number;
  total_bookings: number;
  total_revenue: number;
  peak_hour_bookings: number;
  off_peak_bookings: number;
  member_bookings: number;
  non_member_bookings: number;
  average_utilization_percentage: number;
}

export interface WaitlistEntry {
  id: number;
  user_id: number;
  facility_id: number;
  preferred_date: string;
  preferred_start_time: string;
  preferred_end_time: string;
  status: 'waiting' | 'notified' | 'booked' | 'expired';
  priority: number;
  facility_name?: string;
  location?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

export interface CreateFacilityData {
  name: string;
  description: string;
  category: string;
  default_duration_minutes: number;
  max_capacity: number;
  location: string;
  image_url?: string;
  is_active: boolean;
  base_price: number;
  peak_hours_start: string;
  peak_hours_end: string;
  peak_price_multiplier: number;
  member_discount_percentage: number;
  cancellation_hours: number;
  refund_percentage: number;
}

export interface UpdateFacilityData extends Partial<CreateFacilityData> {}

export interface SlotGenerationData {
  availableDays: number[];
  openingTime: string;
  closingTime: string;
  duration: number;
  generationPeriod: string;
  periodType: 'days' | 'weeks' | 'months';
  startDate: string;
}

export interface SlotStatusUpdateData {
  slotIds: number[];
  status: 'available' | 'blocked' | 'maintenance';
  reason?: string;
}

export interface BookingData {
  slotId: number;
  notes?: string;
}

export interface WaitlistData {
  facilityId: number;
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime: string;
}

export interface CancellationData {
  cancellationReason: string;
}

// Admin API endpoints
export const adminFacilitiesApi = {
  // Get all facilities with analytics
  getAllFacilities: async (): Promise<Facility[]> => {
    const response = await api.get('/facilities/admin/facilities');
    return response;
  },

  // Get facility by ID
  getFacilityById: async (id: number): Promise<Facility> => {
    const response = await api.get(`/facilities/admin/facilities/${id}`);
    return response;
  },

  // Create new facility
  createFacility: async (data: CreateFacilityData): Promise<{ message: string; facility_id: number }> => {
    const response = await api.post('/facilities/admin/facilities', data);
    return response;
  },

  // Update facility
  updateFacility: async (id: number, data: UpdateFacilityData): Promise<{ message: string }> => {
    const response = await api.put(`/facilities/admin/facilities/${id}`, data);
    return response;
  },

  // Delete/Deactivate facility
  deleteFacility: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/facilities/admin/facilities/${id}`);
    return response;
  },

  // Get facility schedules
  getFacilitySchedules: async (facilityId: number): Promise<FacilitySchedule[]> => {
    const response = await api.get(`/facilities/admin/facilities/${facilityId}/schedules`);
    return response;
  },

  // Update facility schedules
  updateFacilitySchedules: async (facilityId: number, schedules: FacilitySchedule[]): Promise<{ message: string }> => {
    const response = await api.put(`/facilities/admin/facilities/${facilityId}/schedules`, { schedules });
    return response;
  },

  // Generate slots for a date range
  generateSlots: async (facilityId: number, data: SlotGenerationData): Promise<{ 
    message: string; 
    slotsGenerated: number; 
    dateRange: { start: string; end: string }; 
    facility: string; 
  }> => {
    const response = await api.post(`/facilities/admin/facilities/${facilityId}/slots`, data);
    return response;
  },

  // Update slot status (bulk operations)
  updateSlotStatus: async (data: SlotStatusUpdateData): Promise<{ message: string }> => {
    const response = await api.put('/facilities/admin/slots/status', data);
    return response;
  },

  // Get facility analytics
  getFacilityAnalytics: async (facilityId: number, startDate?: string, endDate?: string): Promise<FacilityAnalytics[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', startDate);
    
    const response = await api.get(`/facilities/admin/facilities/${facilityId}/analytics?${params}`);
    return response;
  },

  // Get slots for a specific facility and date
  getFacilitySlots: async (facilityId: number, date: string): Promise<FacilitySlot[]> => {
    const response = await api.get(`/facilities/admin/facilities/${facilityId}/slots?date=${date}`);
    return response;
  },

  // Get all bookings for admin view
  getAllBookings: async (facilityId?: number, date?: string, status?: string): Promise<FacilityBooking[]> => {
    const params = new URLSearchParams();
    if (facilityId) params.append('facilityId', facilityId.toString());
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    
    const response = await api.get(`/facilities/admin/bookings?${params}`);
    return response;
  },

  // Get waitlist for a facility
  getFacilityWaitlist: async (facilityId: number, date?: string): Promise<WaitlistEntry[]> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await api.get(`/facilities/admin/facilities/${facilityId}/waitlist?${params}`);
    return response;
  },

  // Test database connectivity
  testDatabase: async (): Promise<any> => {
    const response = await api.get('/facilities/admin/test-database');
    return response;
  },

  // Clear all slots for a facility
  clearFacilitySlots: async (facilityId: number): Promise<{ message: string; slotsCleared: number }> => {
    const response = await api.delete(`/facilities/admin/facilities/${facilityId}/slots`);
    return response;
  },
};

// Public API endpoints
export const publicFacilitiesApi = {
  // Get available facilities
  getAvailableFacilities: async (): Promise<Facility[]> => {
    const response = await api.get('/facilities/facilities');
    return response;
  },

  // Get available slots for a facility
  getAvailableSlots: async (facilityId: number, date?: string, startDate?: string, endDate?: string): Promise<FacilitySlot[]> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/facilities/facilities/${facilityId}/slots?${params}`);
    return response;
  },

  // Get available slots for a specific date range
  getAvailableSlotsForDateRange: async (facilityId: number, startDate: string, endDate: string): Promise<FacilitySlot[]> => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    const response = await api.get(`/facilities/facilities/${facilityId}/slots?${params}`);
    return response;
  },
};

// User API endpoints
export const userFacilitiesApi = {
  // Book a facility slot
  bookSlot: async (data: BookingData): Promise<{ 
    message: string; 
    booking_id: number; 
    facility_name: string; 
    date: string; 
    time: string; 
    price: number; 
  }> => {
    const response = await api.post('/facilities/bookings', data);
    return response;
  },

  // Get user's bookings
  getUserBookings: async (): Promise<FacilityBooking[]> => {
    const response = await api.get('/facilities/bookings/user');
    return response;
  },

  // Cancel a booking
  cancelBooking: async (bookingId: number, data: CancellationData): Promise<{ 
    message: string; 
    refund_amount: number; 
  }> => {
    const response = await api.put(`/facilities/bookings/${bookingId}/cancel`, data);
    return response;
  },

  // Join waitlist
  joinWaitlist: async (data: WaitlistData): Promise<{ message: string; waitlist_id: number }> => {
    const response = await api.post('/facilities/waitlist', data);
    return response;
  },

  // Get user's waitlist entries
  getUserWaitlist: async (): Promise<WaitlistEntry[]> => {
    const response = await api.get('/facilities/waitlist/user');
    return response;
  },

  // Remove from waitlist
  removeFromWaitlist: async (waitlistId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/facilities/waitlist/${waitlistId}`);
    return response;
  },
};

export default {
  admin: adminFacilitiesApi,
  public: publicFacilitiesApi,
  user: userFacilitiesApi,
};
