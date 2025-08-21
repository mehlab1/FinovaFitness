// ==============================================
// SLOT ASSIGNMENT API SERVICE
// ==============================================

export interface SlotAssignment {
  id: number;
  slot_id: number;
  monthly_plan_subscription_id?: number;
  client_id?: number;
  assignment_type: string;
  start_date: string;
  end_date: string;
  is_permanent: boolean;
  status: string;
  notes?: string;
  created_at: string;
  // Additional fields from joins
  slot_date?: string;
  start_time?: string;
  end_time?: string;
  slot_duration?: number;
  batch_name?: string;
  assigned_to_name?: string;
  assignment_category?: string;
}

export interface AssignToMonthlyPlanData {
  trainer_id: number;
  slot_id: number;
  monthly_plan_subscription_id: number;
  assignment_type?: string;
  start_date: string;
  end_date: string;
  is_permanent?: boolean;
  notes?: string;
}

export interface AssignToOneTimeSessionData {
  trainer_id: number;
  slot_id: number;
  client_id: number;
  session_date: string;
  session_type?: string;
  notes?: string;
}

export interface UpdateSlotAssignmentData {
  start_date?: string;
  end_date?: string;
  assignment_type?: string;
  notes?: string;
  status?: string;
}

export interface MonthlyPlanSubscription {
  id: number;
  member_id: number;
  monthly_plan_id: number;
  status: string;
  start_date: string;
  end_date: string;
  member_name: string;
  plan_name: string;
}

export interface AvailableSlot {
  id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  batch_name: string;
  is_available: boolean;
}

class SlotAssignmentApiService {
  private baseUrl = 'http://localhost:3001/api/slot-assignments';

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
  // SLOT ASSIGNMENT MANAGEMENT
  // ==============================================

  /**
   * Assign a slot to a monthly plan member
   */
  async assignSlotToMonthlyPlan(assignmentData: AssignToMonthlyPlanData): Promise<{ success: boolean; message: string; data: SlotAssignment }> {
    return this.fetchWithAuth(`${this.baseUrl}/monthly-plan`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  /**
   * Assign a slot for one-time training session
   */
  async assignSlotForOneTimeSession(assignmentData: AssignToOneTimeSessionData): Promise<{ success: boolean; message: string; data: SlotAssignment }> {
    return this.fetchWithAuth(`${this.baseUrl}/one-time`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  /**
   * Get all slot assignments for a specific trainer
   */
  async getTrainerSlotAssignments(trainerId: number, startDate?: string, endDate?: string, assignmentType?: string): Promise<{ success: boolean; message: string; data: SlotAssignment[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (assignmentType) params.append('assignment_type', assignmentType);
    
    return this.fetchWithAuth(`${this.baseUrl}/trainer/${trainerId}?${params.toString()}`);
  }

  /**
   * Update a slot assignment
   */
  async updateSlotAssignment(assignmentId: number, assignmentData: UpdateSlotAssignmentData): Promise<{ success: boolean; message: string; data: SlotAssignment }> {
    return this.fetchWithAuth(`${this.baseUrl}/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  /**
   * Delete a slot assignment
   */
  async deleteSlotAssignment(assignmentId: number): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  // ==============================================
  // UTILITY METHODS
  // ==============================================

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
   * Get assignment type display name
   */
  getAssignmentTypeDisplay(type: string): string {
    const types: { [key: string]: string } = {
      'personal': 'Personal Training',
      'group': 'Group Training',
      'one_time': 'One-time Session'
    };
    return types[type] || type;
  }

  /**
   * Get assignment category display name
   */
  getAssignmentCategoryDisplay(category: string): string {
    const categories: { [key: string]: string } = {
      'monthly_plan': 'Monthly Plan',
      'one_time': 'One-time Session'
    };
    return categories[category] || category;
  }

  /**
   * Check if assignment is active
   */
  isAssignmentActive(assignment: SlotAssignment): boolean {
    return assignment.status === 'active';
  }

  /**
   * Check if assignment is permanent
   */
  isAssignmentPermanent(assignment: SlotAssignment): boolean {
    return assignment.is_permanent;
  }
}

export const slotAssignmentApi = new SlotAssignmentApiService();
export default slotAssignmentApi;
