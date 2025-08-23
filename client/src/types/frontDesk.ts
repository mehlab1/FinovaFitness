// Re-export types from the API service for convenience
export type {
  MemberCreationData,
  CreatedMember,
  ApiResponse,
  ValidationError,
  ApiError
} from '../services/frontDeskApi';

// Additional front desk specific types
export interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  emergency_contact: string;
  membership_plan_id: string;
  payment_method: string;
  payment_confirmed: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface WalkInSalesState {
  currentStep: 'form' | 'preview' | 'receipt';
  memberData: CreatedMember | null;
  transactionData: TransactionData | null;
  loading: boolean;
  error: string | null;
}

export interface TransactionData {
  transaction_id: string;
  plan_name: string;
  plan_price: number;
  amount: number;
  payment_method: string;
  member_name: string;
  email: string;
  default_password: string;
}

export interface POSSummary {
  date: string;
  total_revenue: number;
  total_transactions: number;
  payment_methods: PaymentMethodSummary[];
}

export interface PaymentMethodSummary {
  payment_method: string;
  method_count: number;
  total_revenue: number;
}
