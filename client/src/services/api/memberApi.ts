const BASE_URL = 'http://localhost:3001/api';

// Get authentication token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    
    // For 400 responses, preserve the error message from the backend
    if (response.status === 400 && errorData.error) {
      throw new Error(errorData.error);
    }
    
    // For other error responses, use the error message or status
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
};

export const memberApi = {
  // Get member dashboard data
  getDashboard: async () => {
    const response = await fetch(`${BASE_URL}/members/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get member bookings
  getBookings: async () => {
    const response = await fetch(`${BASE_URL}/members/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get available trainers
  getTrainers: async () => {
    const response = await fetch(`${BASE_URL}/members/trainers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Book training session
  bookTrainingSession: async (sessionData: {
    trainer_id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    session_type: string;
    notes?: string;
  }) => {
    const response = await fetch(`${BASE_URL}/members/book-training-session`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sessionData),
    });
    return handleResponse(response);
  },

  // Get upcoming training sessions
  getUpcomingSessions: async () => {
    const response = await fetch(`${BASE_URL}/members/upcoming-sessions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get completed training sessions
  getCompletedSessions: async () => {
    const response = await fetch(`${BASE_URL}/members/completed-sessions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Submit session review
  submitSessionReview: async (reviewData: {
    session_id: number;
    rating: number;
    review_text: string;
    training_effectiveness: number;
    communication: number;
    punctuality: number;
    professionalism: number;
  }) => {
    const response = await fetch(`${BASE_URL}/members/session-review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  // Submit nutritionist session review
  submitNutritionistSessionReview: async (reviewData: {
    session_request_id: number;
    rating: number;
    review_text: string;
    nutritional_guidance: number;
    communication: number;
    punctuality: number;
    professionalism: number;
    session_effectiveness: number;
  }) => {
    const response = await fetch(`${BASE_URL}/members/nutritionist-session-review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  // Submit nutritionist diet plan review
  submitNutritionistDietPlanReview: async (reviewData: {
    diet_plan_request_id: number;
    rating: number;
    review_text: string;
    meal_plan_quality: number;
    nutritional_accuracy: number;
    customization_level: number;
    support_quality: number;
    follow_up_support: number;
  }) => {
    const response = await fetch(`${BASE_URL}/members/nutritionist-diet-plan-review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  // Get nutritionists
  getNutritionists: async () => {
    const response = await fetch(`${BASE_URL}/members/nutritionists`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create diet plan request
  createDietPlanRequest: async (requestData: {
    nutritionist_id: number;
    fitness_goal: string;
    current_weight: number;
    height: number;
    target_weight: number;
    activity_level: string;
    monthly_budget: number;
    dietary_restrictions?: string;
    additional_notes?: string;
  }) => {
    const response = await fetch(`${BASE_URL}/members/diet-plan-request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  },

  // Get diet plan requests
  getDietPlanRequests: async () => {
    const response = await fetch(`${BASE_URL}/members/diet-plan-requests`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get nutritionist available slots
  getNutritionistSlots: async (nutritionistId: number, date: string) => {
    const response = await fetch(`${BASE_URL}/nutritionists/${nutritionistId}/available-slots/${date}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Request nutritionist session
  requestNutritionistSession: async (requestData: {
    nutritionist_id: number;
    preferred_date: string;
    preferred_time: string;
    session_type: string;
    message?: string;
  }) => {
    const response = await fetch(`${BASE_URL}/members/nutritionist-session-request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  },

  // Get nutritionist session requests
  getNutritionistSessionRequests: async () => {
    const response = await fetch(`${BASE_URL}/members/nutritionist-session-requests`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Cancel nutritionist session request
  cancelNutritionistSessionRequest: async (requestId: number) => {
    const response = await fetch(`${BASE_URL}/members/nutritionist-session-request/${requestId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Cancel diet plan request
  cancelDietPlanRequest: async (requestId: number) => {
    const response = await fetch(`${BASE_URL}/members/diet-plan-request/${requestId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get workout schedule
  getWorkoutSchedule: async () => {
    const response = await fetch(`${BASE_URL}/members/workout-schedule`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create workout schedule
  createWorkoutSchedule: async (scheduleData: any) => {
    const response = await fetch(`${BASE_URL}/members/workout-schedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(scheduleData),
    });
    return handleResponse(response);
  },

  // Delete workout schedule for a specific day
  deleteWorkoutSchedule: async (dayOfWeek: number) => {
    const response = await fetch(`${BASE_URL}/members/workout-schedule/${dayOfWeek}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  // Remove specific exercise from a workout schedule
  removeExercise: async (scheduleId: number, exerciseName: string) => {
    const response = await fetch(`${BASE_URL}/members/workout-schedule/${scheduleId}/exercise/${encodeURIComponent(exerciseName)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get muscle groups
  getMuscleGroups: async () => {
    const response = await fetch(`${BASE_URL}/members/muscle-groups`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get exercises
  getExercises: async (muscleGroupId?: number) => {
    const url = muscleGroupId 
      ? `${BASE_URL}/members/exercises?muscleGroupId=${muscleGroupId}`
      : `${BASE_URL}/members/exercises`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Log workout performance
  logWorkout: async (data: any) => {
    const response = await fetch(`${BASE_URL}/members/workout-log`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get workout history
  getWorkoutHistory: async (limit = 20, offset = 0) => {
    const response = await fetch(`${BASE_URL}/members/workout-history?limit=${limit}&offset=${offset}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create training request
  createTrainingRequest: async (data: any) => {
    const response = await fetch(`${BASE_URL}/members/training-request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get announcements
  getAnnouncements: async () => {
    const response = await fetch(`${BASE_URL}/members/announcements`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get facilities
  getFacilities: async () => {
    const response = await fetch(`${BASE_URL}/members/facilities`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get membership plans
  getMembershipPlans: async () => {
    const response = await fetch(`${BASE_URL}/members/membership-plans`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get gym classes
  getClasses: async () => {
    const response = await fetch(`${BASE_URL}/members/classes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Book a class
  bookClass: async (classId: number, date: string, time: string) => {
    const response = await fetch(`${BASE_URL}/members/book-class`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ classId, date, time }),
    });
    return handleResponse(response);
  },

  // Get member profile data
  getProfile: async () => {
    const response = await fetch(`${BASE_URL}/members/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update member profile
  updateProfile: async (profileData: any) => {
    const response = await fetch(`${BASE_URL}/members/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Log new weight
  logWeight: async (weightData: { weight: number; notes?: string }) => {
    const response = await fetch(`${BASE_URL}/members/weight-log`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(weightData),
    });
    return handleResponse(response);
  },

  // Get weight change data
  getWeightChange: async () => {
    const response = await fetch(`${BASE_URL}/members/weight-change`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/members/forgot-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  // Reset password
  resetPassword: async (resetData: { email: string; verificationCode: string; newPassword: string }) => {
    const response = await fetch(`${BASE_URL}/members/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(resetData),
    });
    return handleResponse(response);
  },

  // Plan change functionality
  calculatePlanChange: async (newPlanId: number) => {
    const response = await fetch(`${BASE_URL}/members/calculate-plan-change`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPlanId }),
    });
    return handleResponse(response);
  },

  initiatePlanChange: async (planChangeData: {
    newPlanId: number;
    currentPlanBalance: number;
    newPlanPrice: number;
    balanceDifference: number;
  }) => {
    const response = await fetch(`${BASE_URL}/members/initiate-plan-change`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(planChangeData),
    });
    return handleResponse(response);
  },

  confirmPlanChange: async (confirmationData: {
    requestId: number;
    email: string;
    password: string;
  }) => {
    const response = await fetch(`${BASE_URL}/members/confirm-plan-change`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(confirmationData),
    });
    return handleResponse(response);
  },

  getBalance: async () => {
    const response = await fetch(`${BASE_URL}/members/balance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Top up balance
  topUpBalance: async (amount: number) => {
    const response = await fetch(`${BASE_URL}/members/top-up-balance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    return handleResponse(response);
  },

  // Pause subscription
  pauseSubscription: async (pauseDurationDays: number) => {
    const response = await fetch(`${BASE_URL}/members/pause-subscription`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ pauseDurationDays }),
    });
    return handleResponse(response);
  },

  // Resume subscription
  resumeSubscription: async () => {
    const response = await fetch(`${BASE_URL}/members/resume-subscription`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Cancel subscription
  cancelSubscription: async () => {
    const response = await fetch(`${BASE_URL}/members/cancel-subscription`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update personal data
  updatePersonalData: async (personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  }) => {
    const response = await fetch(`${BASE_URL}/members/update-personal-data`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(personalData),
    });
    return handleResponse(response);
  },

  // Subscribe to new plan
  subscribeToPlan: async (subscriptionData: {
    planId: number;
    paymentMethod: string;
    personalData: any;
  }) => {
    const response = await fetch(`${BASE_URL}/members/subscribe-to-plan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(subscriptionData),
    });
    return handleResponse(response);
  },

  // Get trainer's booked slots
  getTrainerBookedSlots: async (trainerId: number) => {
    const response = await fetch(`${BASE_URL}/members/trainers/${trainerId}/booked-slots`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get trainer's schedule
  getTrainerSchedule: async (trainerId: number, date: string) => {
    const response = await fetch(`${BASE_URL}/members/trainers/${trainerId}/schedule/${date}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

};
