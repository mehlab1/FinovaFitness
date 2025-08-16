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

export interface DietPlanRequest {
  id: number;
  client_name: string;
  fitness_goal: string;
  current_weight: number;
  height: number;
  target_weight: number;
  activity_level: string;
  monthly_budget: number;
  dietary_restrictions?: string;
  additional_notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  nutritionist_notes?: string;
  meal_plan?: string;
  created_at: string;
  updated_at: string;
}

export interface MealPlanTemplate {
  id: number;
  template_name: string;
  template_type: string;
  target_calories: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  target_fiber?: number;
  target_sodium?: number;
  target_sugar?: number;
  meal_count: number;
  duration_weeks: number;
  difficulty_level: string;
  dietary_restrictions: string[];
  fitness_goal: string;
  age_group: string;
  activity_level: string;
  description: string;
  instructions: string;
  tips_and_notes: string;
  is_public: boolean;
  meals: Meal[];
  created_at?: string;
  updated_at?: string;
}

export interface Meal {
  id: number;
  meal_name: string;
  meal_type: string;
  meal_order: number;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  description?: string;
  preparation_time?: string;
  cooking_time?: string;
  difficulty: string;
  foods: Food[];
}

export interface Food {
  id: number;
  food_name: string;
  quantity: number;
  unit: string;
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fats_per_serving?: number;
  fiber_per_serving?: number;
  notes?: string;
}

export interface Recipe {
  id: number;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  preparation_time: number; // in minutes
  cooking_time: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  nutrition_per_serving: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
  };
  tags: string[];
  notes?: string;
}

export interface RecipeIngredient {
  id: number;
  food_name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface DailyMealPlan {
  id: number;
  day_of_week: number; // 1-7 (Monday-Sunday)
  date?: string; // Specific date if applicable
  is_cheat_day: boolean;
  meals: PlannedMeal[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
}

export interface PlannedMeal {
  id: number;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Pre-Workout' | 'Post-Workout';
  meal_order: number;
  time?: string; // When to eat this meal
  items: PlannedMealItem[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string;
}

export interface PlannedMealItem {
  id: number;
  type: 'food' | 'recipe';
  food_id?: number;
  recipe_id?: number;
  food_name?: string; // For custom foods not in database
  recipe_name?: string; // For custom recipes not in database
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string;
}

export interface WeeklyMealPlan {
  id: number;
  week_number: number;
  start_date: string;
  end_date: string;
  daily_plans: DailyMealPlan[];
  weekly_goals: {
    target_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fats: number;
    cheat_days_allowed: number;
  };
  notes?: string;
}

export interface ComprehensiveDietPlan {
  id: number;
  diet_plan_request_id: number;
  nutritionist_id: number;
  client_id: number;
  plan_name: string;
  description: string;
  total_weeks: number;
  weekly_plans: WeeklyMealPlan[];
  overall_goals: {
    target_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fats: number;
    target_fiber: number;
    target_sodium: number;
    target_sugar: number;
  };
  dietary_guidelines: string[];
  shopping_list: string[];
  preparation_tips: string[];
  progress_notes: string[];
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed';
  current_step: number;
  total_steps: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}
