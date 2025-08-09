// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Portal Types
export const PORTAL_TYPES = {
  PUBLIC: 'website',
  MEMBER: 'member',
  TRAINER: 'trainer',
  NUTRITIONIST: 'nutritionist',
  ADMIN: 'admin',
  FRONT_DESK: 'frontdesk',
} as const;

// User Roles
export const USER_ROLES = {
  PUBLIC: 'public',
  MEMBER: 'member',
  TRAINER: 'trainer',
  NUTRITIONIST: 'nutritionist',
  ADMIN: 'admin',
  FRONT_DESK: 'front_desk',
} as const;

// Session Status
export const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

// Request Types
export const REQUEST_TYPES = {
  PERSONAL_TRAINING: 'personal_training',
  DEMO_SESSION: 'demo_session',
  CONSULTATION: 'consultation',
  GROUP_SESSION: 'group_session',
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

// Booking Types
export const BOOKING_TYPES = {
  CLASS: 'class',
  PERSONAL_TRAINING: 'personal_training',
  CONSULTATION: 'consultation',
} as const;

// Navigation Items
export const TRAINER_NAV_ITEMS = [
  { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-pink-400' },
  { id: 'schedule', icon: 'fas fa-calendar', label: 'My Schedule', color: 'text-blue-400' },
  { id: 'client-requests', icon: 'fas fa-user-friends', label: 'Client Requests', color: 'text-green-400' },
  { id: 'notes', icon: 'fas fa-sticky-note', label: 'Session Notes', color: 'text-purple-400' },
  { id: 'analytics', icon: 'fas fa-chart-bar', label: 'Analytics', color: 'text-orange-400' },
  { id: 'announcements', icon: 'fas fa-bullhorn', label: 'Announcements', color: 'text-yellow-400' },
  { id: 'subscription', icon: 'fas fa-credit-card', label: 'Subscription', color: 'text-blue-400' }
];

export const MEMBER_NAV_ITEMS = [
  { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-pink-400' },
  { id: 'classes', icon: 'fas fa-calendar-alt', label: 'Classes', color: 'text-blue-400' },
  { id: 'trainers', icon: 'fas fa-user-ninja', label: 'Trainers', color: 'text-green-400' },
  { id: 'nutrition', icon: 'fas fa-apple-alt', label: 'Nutrition', color: 'text-orange-400' },
  { id: 'workouts', icon: 'fas fa-dumbbell', label: 'My Workouts', color: 'text-purple-400' },
  { id: 'announcements', icon: 'fas fa-bullhorn', label: 'Announcements', color: 'text-yellow-400' },
  { id: 'facilities', icon: 'fas fa-building', label: 'Facilities', color: 'text-cyan-400' }
];

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#ec4899', // pink-500
  SECONDARY: '#3b82f6', // blue-500
  SUCCESS: '#10b981', // green-500
  WARNING: '#f59e0b', // yellow-500
  ERROR: '#ef4444', // red-500
  INFO: '#06b6d4', // cyan-500
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CURRENT_PORTAL: 'currentPortal',
  THEME: 'theme',
} as const;
