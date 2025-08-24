// Check-in related types
export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  membership_plan: string;
  membership_status: string;
  loyalty_points: number;
  membership_start_date: string;
  membership_end_date: string;
  full_name: string;
  member_id?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  date_of_birth?: string;
  gender?: string;
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CheckIn {
  id: number;
  user_id: number;
  visit_date: string;
  check_in_time: string;
  check_in_type: string;
  member_name: string;
  member_email: string;
  membership_plan: string;
  consistency_week_start?: string;
  consistency_points_awarded?: boolean;
  created_at?: string;
}

export interface CheckInData {
  user_id: number;
  check_in_time?: string;
  check_in_type?: string;
}

export interface ConsistencyData {
  user_id: number;
  week_start_date: string;
  week_end_date: string;
  check_ins_count: number;
  consistency_achieved: boolean;
  points_awarded: number;
  created_at?: string;
}

export interface LoyaltyTransaction {
  id: number;
  user_id: number;
  points: number;
  transaction_type: string;
  description: string;
  reference_id?: string;
  created_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface SearchResponse extends ApiResponse<Member[]> {}
export interface CheckInResponse extends ApiResponse<CheckIn> {}
export interface RecentCheckInsResponse extends ApiResponse<CheckIn[]> {}
export interface ConsistencyResponse extends ApiResponse<ConsistencyData> {}
export interface LoyaltyResponse extends ApiResponse<LoyaltyTransaction> {}

// Component Props types
export interface MemberSearchProps {
  value: string;
  onSearch: (term: string) => void;
  onMemberSelect: (member: Member) => void;
  isLoading: boolean;
  members?: Member[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  member: Member | null;
  isLoading?: boolean;
}

export interface RecentCheckInsProps {
  checkIns: CheckIn[];
  isLoading: boolean;
  onRefresh: () => void;
  limit?: number;
  autoRefresh?: boolean;
  showFilters?: boolean;
  className?: string;
}

export interface ManualCheckInFormProps {
  onCheckInSuccess?: (checkIn: CheckIn) => void;
  onCheckInError?: (error: string) => void;
  className?: string;
}

// Hook return types
export interface UseCheckInReturn {
  checkInMember: (checkInData: CheckInData) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface UseMemberSearchReturn {
  searchMembers: (query: string) => Promise<void>;
  members: Member[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  clearResults: () => void;
}

export interface UseRecentCheckInsReturn {
  checkIns: CheckIn[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => void;
}

// Utility types
export type CheckInType = 'manual' | 'qr' | 'mobile' | 'kiosk';
export type MembershipStatus = 'Active' | 'Inactive' | 'Expired' | 'Paused' | 'Cancelled';
export type MembershipPlan = 'Basic' | 'Premium' | 'VIP' | 'Student' | 'Senior';

// Filter and sort types
export interface CheckInFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  checkInType?: CheckInType;
  memberId?: number;
  consistencyAchieved?: boolean;
}

export interface CheckInSort {
  field: 'check_in_time' | 'check_in_date' | 'member_name';
  direction: 'asc' | 'desc';
}
