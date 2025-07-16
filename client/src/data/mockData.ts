import { Trainer, Class, MembershipPlan, Product, Portal } from '../types';

export const portals: Portal[] = [
  {
    id: 'public',
    name: 'Public Portal',
    color: 'text-blue-400',
    icon: 'fas fa-users',
    description: 'Browse our facilities, classes, and membership options',
    requiresLogin: false
  },
  {
    id: 'member',
    name: 'Member Portal',
    color: 'text-green-400',
    icon: 'fas fa-user-circle',
    description: 'Access your dashboard, book sessions, and track progress',
    requiresLogin: true
  },
  {
    id: 'trainer',
    name: 'Trainer Portal',
    color: 'text-pink-400',
    icon: 'fas fa-user-tie',
    description: 'Manage your schedule, clients, and training programs',
    requiresLogin: true
  },
  {
    id: 'nutritionist',
    name: 'Nutritionist Portal',
    color: 'text-purple-400',
    icon: 'fas fa-apple-alt',
    description: 'Create meal plans and manage client consultations',
    requiresLogin: true
  },
  {
    id: 'admin',
    name: 'Admin Portal',
    color: 'text-orange-400',
    icon: 'fas fa-crown',
    description: 'Oversee operations, manage staff, and view analytics',
    requiresLogin: true
  },
  {
    id: 'frontdesk',
    name: 'Front Desk Portal',
    color: 'text-cyan-400',
    icon: 'fas fa-desktop',
    description: 'Handle check-ins, sales, and customer service',
    requiresLogin: true
  }
];

export const trainers: Trainer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    specialization: 'HIIT Specialist',
    certifications: ['NASM Certified Personal Trainer', 'TRX Suspension Training', 'Nutrition Specialist'],
    bio: 'Sarah has 8 years of experience helping clients achieve their fitness goals through high-intensity training and personalized nutrition plans.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    socialMedia: {
      instagram: '#',
      facebook: '#'
    }
  },
  {
    id: '2',
    name: 'Mike Chen',
    specialization: 'Strength Coach',
    certifications: ['CSCS Certified Strength Coach', 'Olympic Weightlifting', 'Sports Performance'],
    bio: 'Mike specializes in strength training and sports performance with 10 years of experience working with athletes and fitness enthusiasts.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    socialMedia: {
      instagram: '#',
      facebook: '#'
    }
  },
  {
    id: '3',
    name: 'Alex Rodriguez',
    specialization: 'Yoga & Pilates Instructor',
    certifications: ['500-Hour Yoga Teacher Training', 'Pilates Mat Certification', 'Meditation & Mindfulness'],
    bio: 'Alex brings 6 years of experience in yoga and pilates, focusing on flexibility, balance, and mental wellness for holistic fitness.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    socialMedia: {
      instagram: '#',
      facebook: '#'
    }
  },
  {
    id: '4',
    name: 'Tom Wilson',
    specialization: 'Boxing Coach',
    certifications: ['USA Boxing Certified Coach', 'Kickboxing Instructor', 'Self-Defense Training'],
    bio: 'Tom has 12 years of boxing experience and specializes in boxing fundamentals, conditioning, and self-defense techniques.',
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    socialMedia: {
      instagram: '#',
      facebook: '#'
    }
  },
  {
    id: '5',
    name: 'Lisa Park',
    specialization: 'CrossFit Coach',
    certifications: ['CrossFit Level 2 Trainer', 'Gymnastics Coach', 'Mobility Specialist'],
    bio: 'Lisa brings 7 years of CrossFit coaching experience, focusing on functional movements, gymnastics, and injury prevention.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    socialMedia: {
      instagram: '#',
      facebook: '#'
    }
  },
  {
    id: '6',
    name: 'David Kim',
    specialization: 'Swimming Coach',
    certifications: ['USA Swimming Certified', 'Water Aerobics Instructor', 'Lifeguard Certified'],
    bio: 'David has 9 years of swimming instruction experience, specializing in stroke technique, water aerobics, and aquatic fitness.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    socialMedia: {
      instagram: '#',
      facebook: '#'
    }
  }
];

export const classes: Class[] = [
  { id: '1', name: 'Morning HIIT', trainer: 'Sarah Johnson', time: '6:00 AM', day: 'Monday', difficulty: 'intermediate', capacity: 20, enrolled: 15 },
  { id: '2', name: 'Yoga Flow', trainer: 'Alex Rodriguez', time: '6:00 AM', day: 'Wednesday', difficulty: 'beginner', capacity: 15, enrolled: 12 },
  { id: '3', name: 'CrossFit', trainer: 'Lisa Park', time: '6:00 AM', day: 'Friday', difficulty: 'advanced', capacity: 12, enrolled: 12 },
  { id: '4', name: 'Strength Training', trainer: 'Mike Chen', time: '10:00 AM', day: 'Tuesday', difficulty: 'intermediate', capacity: 18, enrolled: 14 },
  { id: '5', name: 'Pilates', trainer: 'Alex Rodriguez', time: '10:00 AM', day: 'Thursday', difficulty: 'beginner', capacity: 16, enrolled: 13 },
  { id: '6', name: 'Boxing', trainer: 'Tom Wilson', time: '10:00 AM', day: 'Saturday', difficulty: 'intermediate', capacity: 14, enrolled: 11 },
  { id: '7', name: 'Evening Cardio', trainer: 'Sarah Johnson', time: '6:00 PM', day: 'Monday', difficulty: 'beginner', capacity: 25, enrolled: 20 },
  { id: '8', name: 'Functional Training', trainer: 'Mike Chen', time: '6:00 PM', day: 'Wednesday', difficulty: 'intermediate', capacity: 20, enrolled: 16 },
  { id: '9', name: 'Spin Class', trainer: 'Lisa Park', time: '6:00 PM', day: 'Saturday', difficulty: 'intermediate', capacity: 22, enrolled: 18 }
];

export const membershipPlans: MembershipPlan[] = [
  {
    id: '1',
    name: 'Drop-In',
    price: 25,
    duration: 'per visit',
    features: ['Single day access', 'All equipment', 'Locker room access'],
    discount: ''
  },
  {
    id: '2',
    name: 'Monthly',
    price: 79,
    duration: 'per month',
    features: ['24/7 gym access', 'All group classes', 'Locker room access', '2 guest passes/month', 'Sauna/Steam access'],
    discount: ''
  },
  {
    id: '3',
    name: 'Quarterly',
    price: 199,
    duration: 'per quarter',
    features: ['24/7 gym access', 'All group classes', 'Locker room access', '3 guest passes/month', 'Sauna/Steam access', '2 PT sessions included'],
    popular: true,
    discount: 'Student'
  },
  {
    id: '4',
    name: 'Yearly',
    price: 599,
    duration: 'per year',
    features: ['24/7 gym access', 'All group classes', 'Locker room access', '5 guest passes/month', 'Sauna/Steam access', '2 PT sessions/month', 'Nutrition consultation'],
    discount: 'Family'
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Whey Protein Powder',
    price: 49.99,
    memberPrice: 44.99,
    category: 'Supplements',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    description: 'Premium whey protein for muscle building and recovery'
  },
  {
    id: '2',
    name: 'Resistance Bands Set',
    price: 29.99,
    memberPrice: 26.99,
    category: 'Equipment',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    description: 'Complete resistance bands set for home workouts'
  },
  {
    id: '3',
    name: 'Finova Fitness T-Shirt',
    price: 24.99,
    memberPrice: 22.49,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    description: 'Official Finova Fitness branded t-shirt'
  },
  {
    id: '4',
    name: 'Pre-Workout Supplement',
    price: 39.99,
    memberPrice: 35.99,
    category: 'Supplements',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    description: 'Energy boost for intense training sessions'
  },
  {
    id: '5',
    name: 'Yoga Mat',
    price: 34.99,
    memberPrice: 31.49,
    category: 'Equipment',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    description: 'Premium non-slip yoga mat for all practices'
  },
  {
    id: '6',
    name: 'Gym Hoodie',
    price: 49.99,
    memberPrice: 44.99,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    description: 'Comfortable hoodie for pre and post workout'
  }
];

export const chatResponses = {
  public: {
    'Which membership is best for me?': 'For beginners, I recommend starting with our Monthly plan at $79/month. It gives you full access to all facilities and includes 2 guest passes. If you\'re committed to long-term fitness, our Quarterly plan offers great value with 2 personal training sessions included!',
    'What are your gym hours?': 'We\'re open 24/7! Our staff is available Monday-Friday 6AM-10PM, Saturday-Sunday 8AM-8PM. You can access the gym anytime with your membership card.',
    'Do you offer personal training?': 'Yes! We have certified personal trainers available. Monthly members get discounted rates, Quarterly members get 2 sessions included, and Yearly members get 2 sessions per month. You can book through our member portal.',
    'What classes do you offer?': 'We offer a wide variety of classes including HIIT, Yoga, CrossFit, Boxing, Pilates, Strength Training, and more. Check our class schedule for specific times and trainers.',
    'Do you have a pool and sauna?': 'Yes! We have an Olympic-sized swimming pool and luxury sauna facilities. These are included with Monthly memberships and above.'
  },
  member: {
    'Recommend leg day exercises': 'Great choice! For leg day, I recommend: 1) Squats 4x12, 2) Romanian Deadlifts 3x10, 3) Leg Press 3x15, 4) Walking Lunges 3x12 each leg, 5) Calf Raises 4x15. Remember to warm up with 5-10 minutes of cardio first!',
    'What should my macros be for 70kg?': 'Based on your profile (70kg, muscle building goal), I recommend: Protein: 140g (2g per kg), Carbs: 175g (2.5g per kg), Fats: 70g (1g per kg). Total: ~1,950 calories. Adjust based on your activity level and progress!',
    'How can I improve my consistency?': 'Here are proven strategies: 1) Set specific workout times and treat them as appointments, 2) Start with 3 days/week, 3) Track your workouts in the app, 4) Find a workout buddy, 5) Focus on small wins. Your 90-day streak shows you\'re already doing great!',
    'How do I book a personal training session?': 'Go to "Book Sessions" in your dashboard, select "Trainers" tab, choose your preferred trainer and available time slot, then click "Book". You\'ll receive a confirmation email.',
    'What are my loyalty points worth?': 'You have 1,247 loyalty points! Each 100 points = $5 discount. You can redeem them for: merchandise (200 points), guest passes (150 points), or personal training sessions (500 points).'
  },
  trainer: {
    'Suggest warm-up drills for a HIIT session': 'Perfect HIIT warm-up sequence: 1) 2 minutes light jogging, 2) Arm circles 30 seconds each direction, 3) High knees 30 seconds, 4) Butt kicks 30 seconds, 5) Jumping jacks 30 seconds, 6) Dynamic stretches (leg swings, hip circles) 1 minute. This prepares muscles and prevents injury!',
    'How to modify exercises for beginners?': 'Key modifications: 1) Reduce intensity by 50%, 2) Increase rest periods, 3) Focus on form over speed, 4) Offer alternatives (knee push-ups vs regular), 5) Use bodyweight before adding weights, 6) Monitor heart rate closely. Always prioritize safety over intensity!',
    'Best practices for client motivation?': 'Effective motivation strategies: 1) Set SMART goals together, 2) Celebrate small wins, 3) Vary workouts to prevent boredom, 4) Track progress visually, 5) Be positive and encouraging, 6) Listen to their concerns, 7) Adjust programs based on feedback.',
    'How to handle client injuries?': 'If a client reports pain: 1) Stop exercise immediately, 2) Assess the situation, 3) Apply RICE if needed, 4) Recommend seeing a physiotherapist, 5) Document the incident, 6) Modify future programs to avoid aggravation. Never diagnose - refer to professionals.'
  },
  nutritionist: {
    'Generate a 1500-calorie meal plan for a 65kg user': 'Here\'s a balanced 1500-calorie plan: Breakfast (400cal): Oatmeal with berries and almonds. Lunch (450cal): Grilled chicken salad with olive oil dressing. Dinner (450cal): Baked salmon with quinoa and vegetables. Snacks (200cal): Greek yogurt with nuts. Includes 120g protein, 150g carbs, 50g fats.',
    'What supplements should I recommend?': 'Basic supplements for most clients: 1) Vitamin D3 (2000-4000 IU), 2) Omega-3 fish oil (1-2g EPA/DHA), 3) Multivitamin for nutrient gaps, 4) Protein powder if dietary intake is low, 5) Magnesium for sleep and recovery. Always assess individual needs first.',
    'How to calculate macros for weight loss?': 'Weight loss macro calculation: 1) Calculate BMR, 2) Multiply by activity factor, 3) Subtract 500-750 calories for 1-2lb/week loss, 4) Set protein at 1.2-1.6g per kg, 5) Fats at 0.8-1.2g per kg, 6) Fill remaining calories with carbs. Monitor and adjust based on progress.',
    'Best foods for muscle building?': 'Top muscle-building foods: 1) Lean proteins: chicken, fish, eggs, Greek yogurt, 2) Complex carbs: oats, quinoa, sweet potato, 3) Healthy fats: nuts, avocado, olive oil, 4) Leucine-rich foods: cottage cheese, whey protein, 5) Creatine-rich foods: red meat, fish. Timing matters - protein within 2 hours post-workout.'
  },
  admin: {
    'Which location lost the most members last month?': 'Based on our analytics, the Downtown location had a 5.2% membership decline last month (67 members). Main reasons: 1) Equipment maintenance issues, 2) Staffing shortage during peak hours, 3) Competitor opening nearby. We\'ve implemented improvement plans.',
    'Generate a CSV of last week\'s revenue by trainer': 'I can help you access that data. Go to Analytics > Revenue Reports > Filter by "Last Week" and "By Trainer". You can then export to CSV. Last week\'s top performers: Sarah Johnson ($2,340), Mike Chen ($1,890), Alex Rodriguez ($1,650).',
    'What\'s our member retention rate?': 'Current member retention rates: Monthly: 78%, Quarterly: 85%, Yearly: 92%. Overall gym retention: 83% (industry average: 75%). Top retention factors: 1) Personal training usage, 2) Class participation, 3) Facility utilization, 4) Loyalty program engagement.',
    'How can we improve member engagement?': 'Recommendations to boost engagement: 1) Launch fitness challenges with prizes, 2) Create member referral rewards, 3) Offer free nutrition consultations, 4) Host social events, 5) Implement gamification in the app, 6) Send personalized workout recommendations, 7) Create member spotlights.'
  },
  frontdesk: {
    'How to refund a membership?': 'Membership refund process: 1) Verify member identity and account, 2) Check refund policy (within 30 days for new members), 3) Access Admin Panel > Members > Select member > Refund option, 4) Select refund amount and reason, 5) Process refund (takes 3-5 business days), 6) Update member status, 7) Send confirmation email.',
    'What\'s the walk-in day pass price?': 'Current walk-in day pass pricing: Standard day pass: $25, Student (with ID): $20, Senior (65+): $18, Group (3+ people): $22 each. Day pass includes: gym access, group classes, locker room. Excludes: personal training, sauna/steam rooms, guest privileges.',
    'How to handle a member complaint?': 'Complaint handling steps: 1) Listen actively and empathetically, 2) Document the issue in detail, 3) Apologize and acknowledge concern, 4) Investigate if needed, 5) Offer solution/compensation, 6) Follow up within 24 hours, 7) Log in system for tracking. Common resolutions: free day passes, service credits, facility improvements.',
    'What are today\'s check-in numbers?': 'Today\'s stats (as of current time): Total check-ins: 347, Peak hours: 6-8 AM (89 check-ins), 6-8 PM (112 check-ins). Current occupancy: 67 members. Busiest areas: cardio (23 people), weights (19 people), classes (25 people). Pool: 8 people.'
  }
};

export const blogPosts = [
  {
    id: '1',
    title: '10 Morning Exercises to Start Your Day',
    excerpt: 'Discover the perfect morning workout routine that will energize your day and boost your metabolism. These simple exercises can be done in just 15 minutes.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
    date: 'March 15, 2024',
    author: 'Sarah Johnson'
  },
  {
    id: '2',
    title: 'Nutrition Guide: Meal Prep Made Easy',
    excerpt: 'Learn how to prepare healthy meals for the week ahead. Our comprehensive guide includes recipes, shopping lists, and storage tips.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
    date: 'March 10, 2024',
    author: 'Mike Chen'
  },
  {
    id: '3',
    title: 'The Science Behind HIIT Training',
    excerpt: 'Explore the physiological benefits of High-Intensity Interval Training and why it\'s so effective for fat loss and cardiovascular health.',
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
    date: 'March 5, 2024',
    author: 'Alex Rodriguez'
  }
];

export const facilities = [
  {
    id: '1',
    name: 'Sauna',
    capacity: 8,
    timeSlots: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM']
  },
  {
    id: '2',
    name: 'Pool',
    capacity: 12,
    timeSlots: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM']
  },
  {
    id: '3',
    name: 'Jacuzzi',
    capacity: 6,
    timeSlots: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM']
  }
];

export const exercises = [
  'Squats', 'Deadlifts', 'Bench Press', 'Pull-ups', 'Push-ups', 'Lunges', 'Plank', 'Burpees', 'Mountain Climbers', 'Jumping Jacks'
];

export const memberStats = {
  totalMembers: 5247,
  activePlans: 4891,
  sessionsToday: 156,
  revenueToday: 12450,
  pointsRedeemedToday: 2340
};

export const staffMembers = [
  { id: '1', name: 'Sarah Johnson', role: 'Personal Trainer', contact: 'sarah@finovafitness.com' },
  { id: '2', name: 'Mike Chen', role: 'Strength Coach', contact: 'mike@finovafitness.com' },
  { id: '3', name: 'Alex Rodriguez', role: 'Yoga Instructor', contact: 'alex@finovafitness.com' },
  { id: '4', name: 'Dr. Emily Wilson', role: 'Nutritionist', contact: 'emily@finovafitness.com' },
  { id: '5', name: 'David Kim', role: 'Swimming Coach', contact: 'david@finovafitness.com' }
];
