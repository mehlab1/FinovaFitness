// ==============================================
// SLOT GENERATION API SERVICE
// ==============================================

export interface SlotGenerationBatch {
  id: number;
  trainer_id: number;
  batch_name: string;
  generation_start_date: string;
  generation_end_date: string;
  slot_duration: number;
  break_duration: number;
  selected_days: number[];
  daily_start_time: string;
  daily_end_time: string;
  total_slots_generated: number;
  is_active: boolean;
  notes?: string;
  generation_date: string;
  // Additional fields from joins
  trainer_first_name?: string;
  trainer_last_name?: string;
}

export interface CreateSlotBatchData {
  trainer_id: number;
  batch_name: string;
  generation_start_date: string;
  generation_end_date: string;
  slot_duration?: number;
  break_duration?: number;
  selected_days: number[];
  daily_start_time: string;
  daily_end_time: string;
  notes?: string;
}

export interface UpdateSlotBatchData {
  batch_name?: string;
  is_active?: boolean;
  notes?: string;
  daily_start_time?: string;
  daily_end_time?: string;
  slot_duration?: number;
  break_duration?: number;
  selected_days?: number[];
}

export interface AvailableSlot {
  id: number;
  date?: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  batch_name: string;
  is_available: boolean;
}

export interface MonthlyPlanAssignment {
  slot_id: number;
  date: string;
  start_time: string;
  end_time: string;
  member_name: string;
  subscription_id: number;
  assignment_type: string;
  is_permanent: boolean;
}

class SlotGenerationApiService {
  private baseUrl = 'http://localhost:3001/api/slot-generation';

  // ==============================================
  // CUSTOM FETCH WITH AUTH
  // ==============================================

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('401: No authentication token found. Please log in.');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // ==============================================
  // SLOT GENERATION BATCH MANAGEMENT
  // ==============================================

  /**
   * Create a new slot generation batch
   */
  async createSlotGenerationBatch(batchData: CreateSlotBatchData): Promise<{ success: boolean; message: string; data: SlotGenerationBatch }> {
    return this.fetchWithAuth(`${this.baseUrl}/create`, {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }

  /**
   * Get all slot generation batches for a specific trainer
   */
  async getTrainerSlotBatches(trainerId: number): Promise<{ success: boolean; message: string; data: SlotGenerationBatch[] }> {
    return this.fetchWithAuth(`${this.baseUrl}/trainer/${trainerId}`);
  }

  /**
   * Get available slots for a trainer on a specific date
   */
  async getAvailableSlotsForDate(trainerId: number, date: string): Promise<{ success: boolean; message: string; data: AvailableSlot[] }> {
    return this.fetchWithAuth(`${this.baseUrl}/trainer/${trainerId}/available-slots?date=${date}`);
  }

  /**
   * Get available slots for a trainer within a date range
   */
  async getAvailableSlotsForDateRange(trainerId: number, startDate: string, endDate: string): Promise<{ success: boolean; message: string; data: AvailableSlot[] }> {
    return this.fetchWithAuth(`${this.baseUrl}/trainer/${trainerId}/available-slots?start_date=${startDate}&end_date=${endDate}`);
  }

  /**
   * Get monthly plan assignments for a trainer
   */
  async getMonthlyPlanAssignments(trainerId: number, startDate?: string, endDate?: string): Promise<{ success: boolean; message: string; data: MonthlyPlanAssignment[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return this.fetchWithAuth(`${this.baseUrl}/trainer/${trainerId}/monthly-plan-assignments?${params.toString()}`);
  }

  /**
   * Update a slot generation batch
   */
  async updateSlotGenerationBatch(batchId: number, batchData: UpdateSlotBatchData): Promise<{ success: boolean; message: string; data: SlotGenerationBatch }> {
    return this.fetchWithAuth(`${this.baseUrl}/batch/${batchId}`, {
      method: 'PUT',
      body: JSON.stringify(batchData),
    });
  }

  /**
   * Delete a slot generation batch
   */
  async deleteSlotGenerationBatch(batchId: number): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/batch/${batchId}`, {
      method: 'DELETE',
    });
  }

  // ==============================================
  // UTILITY METHODS
  // ==============================================

  /**
   * Get day name from day number
   */
  getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || 'Unknown';
  }

  /**
   * Format time for display
   */
  formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Calculate total slots for a batch
   */
  calculateTotalSlots(batch: SlotGenerationBatch): number {
    const startDate = new Date(batch.generation_start_date);
    const endDate = new Date(batch.generation_end_date);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let totalDays = 0;
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dayOfWeek = currentDate.getDay();
      if (batch.selected_days.includes(dayOfWeek)) {
        totalDays++;
      }
    }

    const startTime = new Date(`2000-01-01T${batch.daily_start_time}`);
    const endTime = new Date(`2000-01-01T${batch.daily_end_time}`);
    const timeDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // in minutes
    const slotInterval = batch.slot_duration + batch.break_duration;
    const slotsPerDay = Math.floor(timeDiff / slotInterval);

    return totalDays * slotsPerDay;
  }
}

export const slotGenerationApi = new SlotGenerationApiService();
export default slotGenerationApi;
