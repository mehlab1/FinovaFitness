export interface User {
  id: string;
  name: string;
  email: string;
  role: 'public' | 'member' | 'trainer' | 'nutritionist' | 'admin' | 'frontdesk';
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
  id: string;
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
