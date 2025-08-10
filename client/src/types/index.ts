export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'public' | 'member' | 'trainer' | 'nutritionist' | 'admin' | 'front_desk';
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  membership_type?: string;
  membership_start_date?: string;
  membership_end_date?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backward compatibility
  name?: string;
  membershipPlan?: string;
  loyaltyPoints?: number;
  consistencyStreak?: number;
  referralCount?: number;
}

export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  certifications: string[];
  bio: string;
  image: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
  };
}

export interface Class {
  id: string;
  name: string;
  trainer: string;
  time: string;
  day: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  capacity: number;
  enrolled: number;
}

export interface MembershipPlan {
  id: number;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  discount?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  memberPrice: number;
  category: string;
  image: string;
  description: string;
}

export interface Booking {
  id: string;
  userId: string;
  type: 'class' | 'trainer' | 'facility';
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  details: any;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Portal {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  requiresLogin: boolean;
}
