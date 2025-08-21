import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { trainers, classes, products, blogPosts } from '../data/mockData';
import { usePortal } from '../hooks/usePortal';
import { authApi } from '../services/api';
import { MembershipPlan } from '../types';
import { PublicStore } from './public-store/PublicStore';

interface WebsitePortalProps {
  onSignIn: () => void;
  onBookClass: () => void;
}

interface WizardData {
  name?: string;
  email?: string;
  phone?: string;
  age?: string;
  selectedPlan?: number;
}

export const WebsitePortal = ({ onSignIn, onBookClass }: WebsitePortalProps) => {
  const { login } = usePortal();
  const [currentPage, setCurrentPage] = useState('home');
  const [showPortalDropdown, setShowPortalDropdown] = useState(false);
  const [showMembershipWizard, setShowMembershipWizard] = useState(false);
  const [showTrialWizard, setShowTrialWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [accountData, setAccountData] = useState<any>({});
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  // Optimized input handlers to prevent re-renders
  const handleInputChange = useCallback((field: string, value: any) => {
    setWizardData((prev: any) => ({...prev, [field]: value}));
  }, []);



  // Optimized account data handler
  const handleAccountDataChange = useCallback((field: string, value: string) => {
    setAccountData((prev: any) => ({...prev, [field]: value}));
  }, []);

  // Only clear validation errors when moving to next step or submitting
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  // Memoized handlers to prevent re-renders
  const handleJoinNow = useCallback(() => setShowMembershipWizard(true), []);
  const handleFreeTrial = useCallback(() => setShowTrialWizard(true), []);

  const validateStep1 = () => {
    const errors: any = {};
    if (!wizardData.name || wizardData.name.trim() === '') {
      errors.name = 'Full name is required';
    }
    if (!wizardData.email || wizardData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(wizardData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!wizardData.phone || wizardData.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    }
    if (!wizardData.age || parseInt(wizardData.age) < 16 || parseInt(wizardData.age) > 100) {
      errors.age = 'Age must be between 16 and 100';
    }
    return errors;
  };

  const validateStep2 = () => {
    const errors: any = {};
    if (!wizardData.selectedPlan) {
      errors.plan = 'Please select a membership plan';
    }
    return errors;
  };

  const validateStep3 = () => {
    const errors: any = {};
    if (!selectedPaymentMethod) {
      errors.payment = 'Please select a payment method';
    }
    return errors;
  };



  const validateAccountCreation = () => {
    const errors: any = {};
    if (!wizardData.email || wizardData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(wizardData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!accountData.password || accountData.password.trim() === '') {
      errors.password = 'Password is required';
    } else if (accountData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!accountData.confirmPassword || accountData.confirmPassword.trim() === '') {
      errors.confirmPassword = 'Please confirm your password';
    } else if (accountData.password !== accountData.confirmPassword) {
      errors.password = 'Passwords do not match';
    }
    return errors;
  };

  const handleMembershipWizardNext = () => {
    let errors = {};
    
    if (wizardStep === 1) {
      errors = validateStep1();
    } else if (wizardStep === 2) {
      errors = validateStep2();
    } else if (wizardStep === 3) {
      errors = validateStep3();
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
    } else {
      // After step 3, show account creation form directly
      setShowAccountCreation(true);
    }
  };

  // Remove payment processing step - go directly to account creation

  const handleAccountCreation = async () => {
    const errors = validateAccountCreation();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Prepare user data for registration
      const [firstName, ...lastNameParts] = (wizardData.name || '').split(' ');
      const lastName = lastNameParts.join(' ') || firstName; // Use firstName as fallback if no lastName
      
      // Ensure we have at least a first name
      if (!firstName || firstName.trim() === '') {
        setValidationErrors({ 
          general: 'Please enter your full name' 
        });
        return;
      }
      
      const userData = {
        email: wizardData.email,
        password: accountData.password,
        first_name: firstName,
        last_name: lastName,
        role: 'member',
        phone: wizardData.phone,
        date_of_birth: wizardData.age ? new Date().getFullYear() - parseInt(wizardData.age) + '-01-01' : undefined,
        gender: undefined, // Could be added to the form if needed
        address: undefined, // Could be added to the form if needed
        emergency_contact: undefined, // Could be added to the form if needed
        membership_plan_id: wizardData.selectedPlan // Pass the selected membership plan ID
      };

      console.log('Sending registration data:', userData);
      console.log('Email being sent:', userData.email);
      console.log('Email type:', typeof userData.email);
      console.log('Email length:', userData.email?.length);
      
      // Register the user using the imported authApi
      const response = await authApi.register(userData);
      
      // Store the token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setValidationErrors({});
      setShowAccountCreation(false);
      setShowMembershipWizard(false);
      setWizardStep(1);
      setWizardData({});
      setSelectedPaymentMethod('');
      setAccountData({});
      
      // Show success message and redirect to member portal
      alert('Account created successfully! Welcome to Finova Fitness!');
      
              // Use the login function from usePortal to automatically log in the user
        // and redirect to the member portal
        login({ user: { ...response.user, role: response.user.role as 'member' }, token: response.token });
    } catch (error: any) {
      console.error('Account creation error:', error);
      setValidationErrors({ 
        general: error.message || 'Failed to create account. Please try again.' 
      });
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setValidationErrors({ ...validationErrors, payment: '' });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateTrialStep1 = () => {
    const errors: any = {};
    if (!wizardData.name || wizardData.name.trim() === '') {
      errors.name = 'Full name is required';
    }
    if (!wizardData.email || wizardData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(wizardData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!wizardData.phone || wizardData.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    }
    return errors;
  };

  const handleTrialWizardNext = () => {
    if (wizardStep === 1) {
      const errors = validateTrialStep1();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      setValidationErrors({});
    }

    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
    } else {
      setShowTrialWizard(false);
      setWizardStep(1);
      setWizardData({});
      setValidationErrors({});
      // Show success message
      alert('Your 3-day trial has been activated! Welcome to Finova Fitness!');
    }
  };

  const handlePortalSelect = (portalId: string) => {
    setShowPortalDropdown(false);
    // This will trigger the portal selection in the parent App component
    if (portalId === 'member') {
      onSignIn();
    }
  };

  // Fetch membership plans from backend
  useEffect(() => {
    const fetchMembershipPlans = async () => {
      try {
        setIsLoadingPlans(true);
        setPlansError(null);
        
        // Fetch plans directly from the backend API
        const response = await fetch('http://localhost:3001/api/members/plans');
        if (response.ok) {
          const data = await response.json();
          // Transform the backend data to match the MembershipPlan interface
          const transformedPlans = data.plans.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            price: parseFloat(plan.price) / 100, // Convert from cents to dollars
            duration: plan.duration_months === 0 ? 'Single Day' : 
                     plan.duration_months === 1 ? 'Monthly' : 
                     plan.duration_months === 3 ? 'Quarterly' : 
                     plan.duration_months === 12 ? 'Yearly' : 
                     `${plan.duration_months} months`,
            features: plan.features || [],
            discount: ''
          }));
          setMembershipPlans(transformedPlans);
        } else {
          throw new Error('Failed to fetch plans');
        }
      } catch (error) {
        console.error('Error fetching membership plans:', error);
        setPlansError('Failed to load membership plans. Please try again.');
        // Fallback to mock data if API fails
        setMembershipPlans([
          {
            id: 1,
            name: 'Basic',
            price: 49.99,
            duration: 'per month',
            features: ['Gym access', 'Group classes', 'Locker room'],
            discount: ''
          },
          {
            id: 2,
            name: 'Premium',
            price: 89.99,
            duration: 'per month',
            features: ['Gym access', 'All classes', 'Personal training', 'Nutrition consultation'],
            discount: ''
          },
          {
            id: 3,
            name: 'Elite',
            price: 129.99,
            duration: 'per month',
            features: ['Unlimited access', 'All classes', 'Personal training', 'Nutrition consultation', 'Spa access'],
            discount: ''
          }
        ]);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchMembershipPlans();
  }, []);

  // Page Components
  const HomePage = ({ onSignIn, onBookClass, onJoinNow, onFreeTrial }: { onSignIn: () => void; onBookClass: () => void; onJoinNow: () => void; onFreeTrial: () => void }) => (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-blue-400 neon-glow mb-6 animate-pulse tracking-wider" style={{ fontFamily: 'Orbitron, monospace' }}>
            FOR EVERYONE
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-white mb-12 max-w-3xl mx-auto leading-relaxed tracking-wide">
            Transform your body and mind with cutting-edge training methods and world-class facilities
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={onJoinNow}
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-xl rounded-xl hover-glow transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-blue-500/50"
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease infinite'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center">
                <i className="fas fa-rocket mr-3 text-2xl animate-pulse"></i>
                <span className="tracking-wider" style={{ fontFamily: 'Orbitron, monospace' }}>JOIN NOW</span>
              </div>
            </button>
            <button
              onClick={onBookClass}
              className="group relative px-10 py-5 bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 hover:from-green-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold text-xl rounded-xl hover-glow transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-green-500/50"
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease infinite'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center">
                <i className="fas fa-calendar-plus mr-3 text-2xl animate-pulse"></i>
                <span className="tracking-wider" style={{ fontFamily: 'Orbitron, monospace' }}>BOOK FREE CLASS</span>
              </div>
            </button>
            <button
              onClick={onFreeTrial}
              className="group relative px-10 py-5 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600 text-white font-bold text-xl rounded-xl hover-glow transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-pink-500/50"
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease infinite'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center">
                <i className="fas fa-gift mr-3 text-2xl animate-pulse"></i>
                <span className="tracking-wider" style={{ fontFamily: 'Orbitron, monospace' }}>FREE 3-DAY TRIAL</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Circles */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-cyan-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-opacity-40 transition-all duration-500 animate-pulse-glow shadow-2xl hover:shadow-blue-500/50">
                <i className="fas fa-clock text-5xl text-blue-400 neon-glow group-hover:scale-110 transition-transform duration-300"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-blue-400 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>24/7 Access</h3>
              <p className="text-lg text-gray-300 leading-relaxed max-w-sm mx-auto">
                Train whenever you want with round-the-clock facility access. No more excuses - your fitness journey never sleeps!
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-opacity-40 transition-all duration-500 animate-pulse-glow shadow-2xl hover:shadow-green-500/50">
                <i className="fas fa-user-graduate text-5xl text-green-400 neon-glow group-hover:scale-110 transition-transform duration-300"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-green-400 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>Certified Trainers</h3>
              <p className="text-lg text-gray-300 leading-relaxed max-w-sm mx-auto">
                Expert guidance from internationally certified fitness professionals. Get personalized training plans and motivation!
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-opacity-40 transition-all duration-500 animate-pulse-glow shadow-2xl hover:shadow-pink-500/50">
                <i className="fas fa-swimming-pool text-5xl text-pink-400 neon-glow group-hover:scale-110 transition-transform duration-300"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-pink-400 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>Pool & Sauna</h3>
              <p className="text-lg text-gray-300 leading-relaxed max-w-sm mx-auto">
                Relax and recover in our premium wellness facilities. Complete your fitness experience with luxury amenities!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>5000+</div>
              <div className="text-gray-300">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>50+</div>
              <div className="text-gray-300">Expert Trainers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>10+</div>
              <div className="text-gray-300">Locations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const AboutPage = () => (
    <div className="animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            About Finova Fitness
          </h1>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6 text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Our Story</h2>
              <p className="text-gray-300 leading-relaxed">
                Founded in 2010, Finova Fitness emerged from a simple belief: everyone deserves access to functional training that transforms both body and mind. We started with a single location and a vision to revolutionize how people approach fitness. Today, we're proud to serve over 5,000 members across 10 state-of-the-art facilities, each equipped with cutting-edge technology and staffed by world-class professionals.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6 text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                Our mission is to empower individuals to achieve their fitness goals through innovative training methods, personalized guidance, and a supportive community. We believe that fitness should be accessible, enjoyable, and sustainable for everyone, regardless of age, fitness level, or background. Every day, we work to create an environment where members can push their limits, discover their potential, and transform their lives.
              </p>
            </div>
          </div>
          
          {/* Location Map */}
          <div className="glass-card p-8 rounded-2xl mb-16">
            <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Our Locations</h2>
            <div className="mb-6">
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <img 
                  src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80" 
                  alt="Google Map of Islamabad"
                  className="w-full h-80 object-cover rounded-lg shadow-2xl hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const nextElement = target.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'block';
                    }
                  }}
                />
                <div className="hidden w-full h-80 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center shadow-2xl">
                  <div className="text-center p-8">
                    <i className="fas fa-map-marker-alt text-6xl text-blue-400 mb-6 neon-glow"></i>
                    <h3 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Orbitron, monospace' }}>Islamabad, Pakistan</h3>
                    <p className="text-gray-300 text-lg">Our main location in the capital city</p>
                    <div className="mt-4 flex justify-center space-x-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-xl hover-glow transition-all duration-300">
                <div className="flex items-center mb-3">
                  <i className="fas fa-map-marker-alt text-2xl text-green-400 mr-3"></i>
                  <h3 className="font-bold text-green-400 text-lg">Islamabad Central</h3>
                </div>
                <p className="text-gray-300">Blue Area, Islamabad, Pakistan</p>
                <p className="text-sm text-gray-400 mt-2">Main facility with all amenities</p>
              </div>
              <div className="glass-card p-6 rounded-xl hover-glow transition-all duration-300">
                <div className="flex items-center mb-3">
                  <i className="fas fa-map-marker-alt text-2xl text-blue-400 mr-3"></i>
                  <h3 className="font-bold text-blue-400 text-lg">Islamabad North</h3>
                </div>
                <p className="text-gray-300">F-7 Markaz, Islamabad, Pakistan</p>
                <p className="text-sm text-gray-400 mt-2">Premium location with luxury facilities</p>
              </div>
            </div>
          </div>
          
          {/* Target Audience */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center glass-card p-8 rounded-2xl">
              <i className="fas fa-mars text-4xl text-blue-400 mb-4 neon-glow"></i>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>Men</h3>
              <p className="text-gray-300">Tailored strength training, bodybuilding, and functional fitness programs designed for men's specific goals and physiology.</p>
            </div>
            
            <div className="text-center glass-card p-8 rounded-2xl">
              <i className="fas fa-venus text-4xl text-pink-400 mb-4 neon-glow"></i>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>Women</h3>
              <p className="text-gray-300">Empowering fitness programs including strength training, cardio, and specialized classes for women's health and wellness.</p>
            </div>
            
            <div className="text-center glass-card p-8 rounded-2xl">
              <i className="fas fa-users text-4xl text-green-400 mb-4 neon-glow"></i>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>All Ages</h3>
              <p className="text-gray-300">Inclusive programs for teens, adults, and seniors with age-appropriate training methods and safety protocols.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ServicesPage = () => (
    <div className="animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Our Services
        </h1>
        
        {/* Main Facilities */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            { icon: 'fas fa-dumbbell', title: 'Weight Training', color: 'text-green-400', description: 'State-of-the-art strength training equipment including free weights, machines, and functional training tools for all fitness levels.' },
            { icon: 'fas fa-heartbeat', title: 'Cardio Zone', color: 'text-pink-400', description: 'Premium cardio equipment including treadmills, ellipticals, rowing machines, and bikes with entertainment systems.' },
            { icon: 'fas fa-fist-raised', title: 'CrossFit', color: 'text-purple-400', description: 'Dedicated CrossFit area with Olympic lifting platforms, battle ropes, and functional training equipment.' },
            { icon: 'fas fa-hand-rock', title: 'Boxing', color: 'text-orange-400', description: 'Professional boxing ring, heavy bags, speed bags, and training equipment for all levels from beginner to pro.' },
            { icon: 'fas fa-hot-tub', title: 'Sauna & Steam', color: 'text-blue-400', description: 'Luxury sauna and steam rooms for post-workout recovery and relaxation. Separate facilities for men and women.' },
            { icon: 'fas fa-swimming-pool', title: 'Swimming Pool', color: 'text-green-400', description: 'Olympic-sized swimming pool with designated lanes for lap swimming, water aerobics, and recreational swimming.' }
          ].map((service, index) => (
            <div key={index} className={`glass-card p-8 rounded-2xl text-center hover-glow transition-all duration-300 ${service.color}`}>
              <i className={`${service.icon} text-4xl mb-4 neon-glow`}></i>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>{service.title}</h3>
              <p className="text-gray-300">{service.description}</p>
            </div>
          ))}
        </div>
        
        {/* Additional Services */}
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-8 text-blue-400 text-center" style={{ fontFamily: 'Orbitron, monospace' }}>
            Additional Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <i className="fas fa-user-tie text-3xl text-pink-400 mb-4 neon-glow"></i>
              <h3 className="text-lg font-bold mb-2">Personal Training</h3>
              <p className="text-gray-300 text-sm">One-on-one training sessions with certified personal trainers customized to your goals and fitness level.</p>
            </div>
            
            <div className="text-center">
              <i className="fas fa-apple-alt text-3xl text-green-400 mb-4 neon-glow"></i>
              <h3 className="text-lg font-bold mb-2">Nutrition Plans</h3>
              <p className="text-gray-300 text-sm">Personalized meal plans and nutrition counseling from registered dietitians and nutritionists.</p>
            </div>
            
            <div className="text-center">
              <i className="fas fa-hand-holding-heart text-3xl text-orange-400 mb-4 neon-glow"></i>
              <h3 className="text-lg font-bold mb-2">Physiotherapy</h3>
              <p className="text-gray-300 text-sm">Professional physiotherapy services for injury recovery, prevention, and movement optimization.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SchedulePage = () => (
    <div className="animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Class Schedule
        </h1>
        
        {/* Filter Bar */}
        <div className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div>
              <label className="block text-sm font-medium mb-2">Trainer</label>
              <select className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none">
                <option value="">All Trainers</option>
                {trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none">
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <select className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none">
                <option value="">All Times</option>
                <option value="morning">Morning (6-12)</option>
                <option value="afternoon">Afternoon (12-18)</option>
                <option value="evening">Evening (18-22)</option>
              </select>
            </div>
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg hover-glow transition-all duration-300">
              Filter
            </button>
          </div>
        </div>
        
        {/* Weekly Schedule */}
        <div className="glass-card p-8 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
              <div key={day} className="text-center">
                <h3 className="font-bold text-blue-400 mb-4 p-4" style={{ fontFamily: 'Orbitron, monospace' }}>{day}</h3>
                <div className="space-y-2">
                  {classes.filter(cls => cls.day === day).map(cls => (
                    <div key={cls.id} className="glass-card p-3 rounded-lg cursor-pointer hover-glow transition-all duration-300">
                      <div className="text-sm font-bold text-green-400">{cls.name}</div>
                      <div className="text-xs text-gray-300">{cls.time}</div>
                      <div className="text-xs text-gray-400">{cls.trainer}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const MembershipPage = () => (
    <div className="animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Membership Plans
        </h1>
        
        {/* Auto-renew Toggle */}
        <div className="text-center mb-8">
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-300">Auto-renew subscription</span>
          </label>
        </div>
        
        {/* Pricing Table */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {membershipPlans.map((plan, index) => (
            <div key={plan.id} className={`glass-card p-8 rounded-2xl text-center hover-glow transition-all duration-300 ${plan.popular ? 'neon-border border-green-400' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>{plan.name}</h3>
              <div className="text-4xl font-bold mb-2">PKR {plan.price.toLocaleString()}</div>
              <div className="text-gray-400 mb-6">{plan.duration}</div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <i className="fas fa-check text-green-400 mr-3"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-bold hover-glow transition-all duration-300 ${
                plan.popular 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}>
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
        
        {/* Special Discount Badges */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: 'fas fa-graduation-cap', title: 'Student Discount', description: '15% off all memberships with valid student ID', color: 'text-green-400' },
            { icon: 'fas fa-heart', title: 'Couple Package', description: '20% off when two people sign up together', color: 'text-pink-400' },
            { icon: 'fas fa-users', title: 'Family Plan', description: '25% off for families of 3 or more', color: 'text-purple-400' }
          ].map((discount, index) => (
            <div key={index} className={`glass-card p-6 rounded-2xl text-center ${discount.color}`}>
              <i className={`${discount.icon} text-3xl mb-4`}></i>
              <h3 className="text-lg font-bold mb-2">{discount.title}</h3>
              <p className="text-gray-300 mb-4">{discount.description}</p>
              <div className="font-bold">Special Offer</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const GalleryPage = () => (
    <div className="animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Gallery
        </h1>
        
        {/* Photo Gallery */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Photo Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
              'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
              'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
              'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
              'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
            ].map((image, index) => (
              <div key={index} className="glass-card rounded-2xl overflow-hidden hover-glow transition-all duration-300">
                <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-64 object-cover" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Virtual Tour */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>360° Virtual Tour</h2>
          <div className="glass-card p-8 rounded-2xl">
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <i className="fas fa-vr-cardboard text-6xl text-pink-400 mb-4"></i>
              <h3 className="text-xl font-bold mb-4">Experience Our Gym Virtually</h3>
              <p className="text-gray-300 mb-6">Take a 360° tour of our facilities from the comfort of your home</p>
              <button className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg hover-glow transition-all duration-300">
                Start Virtual Tour
              </button>
            </div>
          </div>
        </div>
        
        {/* Video Gallery */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-purple-400" style={{ fontFamily: 'Orbitron, monospace' }}>Short Reels</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Morning Workout Routine', description: 'Start your day with our energizing morning workout routine' },
              { title: 'HIIT Training Session', description: 'High-intensity interval training for maximum results' },
              { title: 'Strength Training Tips', description: 'Professional tips for effective strength training' }
            ].map((video, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl">
                <div className="bg-gray-900 rounded-lg p-8 text-center mb-4">
                  <i className="fas fa-play-circle text-4xl text-purple-400 mb-4"></i>
                  <h3 className="font-bold">{video.title}</h3>
                </div>
                <p className="text-gray-300 text-sm">{video.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const TrainersPage = () => (
    <div className="animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Our Trainers
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="glass-card p-8 rounded-2xl text-center hover-glow transition-all duration-300">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-400">
                <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
                {trainer.name}
              </h3>
              <p className="text-green-400 mb-4">{trainer.specialization}</p>
              <div className="text-sm text-gray-300 mb-4">
                {trainer.certifications.map((cert, index) => (
                  <p key={index} className="mb-2">• {cert}</p>
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-6">{trainer.bio}</p>
              <div className="flex justify-center space-x-4">
                <a href={trainer.socialMedia.instagram} className="text-pink-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href={trainer.socialMedia.facebook} className="text-blue-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const BlogPage = () => (
    <div className="animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Fitness Blog
        </h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="glass-card rounded-2xl overflow-hidden hover-glow transition-all duration-300">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>
                  {post.title}
                </h3>
                <p className="text-gray-300 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{post.date}</span>
                  <a href="#" className="text-green-400 hover:text-white transition-colors">
                    Read More <i className="fas fa-arrow-right ml-1"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ContactPage = () => (
    <div className="animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Contact Us
        </h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>
              Get In Touch
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="Your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="Subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="Your message"
                ></textarea>
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold hover-glow transition-all duration-300">
                Send Message
              </button>
            </form>
          </div>
          
          {/* Contact Info */}
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>
              Visit Us
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-blue-400 mb-2">Islamabad Central</h3>
                <p className="text-gray-300">Blue Area<br />Islamabad, Pakistan</p>
              </div>
              <div>
                <h3 className="font-bold text-blue-400 mb-2">Islamabad North</h3>
                <p className="text-gray-300">F-7 Markaz<br />Islamabad, Pakistan</p>
              </div>
              <div>
                <h3 className="font-bold text-blue-400 mb-2">Quick Contact</h3>
                <div className="space-y-2">
                  <a href="tel:+92511234567" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
                    <i className="fas fa-phone mr-3"></i>
                    +92 51 123 4567
                  </a>
                  <a href="mailto:info@finovafitness.com" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
                    <i className="fas fa-envelope mr-3"></i>
                    info@finovafitness.com
                  </a>
                  <a href="#" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
                    <i className="fab fa-whatsapp mr-3"></i>
                    WhatsApp Chat
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StorePage = () => {
    const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setShowToast({ message, type });
      setTimeout(() => setShowToast(null), 3000);
    };

    return (
      <div className="animate-fade-in">
        {/* Toast Notification */}
        {showToast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            showToast.type === 'success' ? 'bg-green-500 text-white' :
            showToast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {showToast.message}
          </div>
        )}

        {/* Import and render the PublicStore component */}
        <PublicStore showToast={handleShowToast} />
      </div>
    );
  };

  // Render page function - defined after all components
  const renderPage = useMemo(() => {
    switch (currentPage) {
      case 'home':
        return <HomePage onSignIn={onSignIn} onBookClass={onBookClass} onJoinNow={handleJoinNow} onFreeTrial={handleFreeTrial} />;
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'membership':
        return <MembershipPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'trainers':
        return <TrainersPage />;
      case 'blog':
        return <BlogPage />;
      case 'contact':
        return <ContactPage />;
      case 'store':
        return <StorePage />;
      default:
        return <HomePage onSignIn={onSignIn} onBookClass={onBookClass} onJoinNow={handleJoinNow} onFreeTrial={handleFreeTrial} />;
    }
  }, [currentPage, onSignIn, onBookClass, handleJoinNow, handleFreeTrial]);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="topbar px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <i className="fas fa-dumbbell text-2xl text-blue-400 neon-glow"></i>
            <h1 className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
              FINOVA FITNESS
            </h1>
          </div>
          <div className="hidden md:flex space-x-6">
            {['home', 'about', 'services', 'schedule', 'membership', 'gallery', 'trainers', 'blog', 'contact', 'store'].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`capitalize hover:text-blue-400 transition-colors ${
                  currentPage === page ? 'text-blue-400' : 'text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            {/* Portal Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPortalDropdown(!showPortalDropdown)}
                className="flex items-center space-x-1 hover:text-blue-400 transition-colors text-gray-300"
              >
                <span>Portals</span>
                <i className={`fas fa-chevron-down text-xs transition-transform ${showPortalDropdown ? 'rotate-180' : ''}`}></i>
              </button>
              {showPortalDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button
                      onClick={() => handlePortalSelect('member')}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-blue-400 transition-colors"
                    >
                      <i className="fas fa-user mr-2"></i>
                      Member Portal
                    </button>
                    <button
                      onClick={() => handlePortalSelect('trainer')}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-green-400 transition-colors"
                    >
                      <i className="fas fa-dumbbell mr-2"></i>
                      Trainer Portal
                    </button>
                    <button
                      onClick={() => handlePortalSelect('nutritionist')}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-pink-400 transition-colors"
                    >
                      <i className="fas fa-apple-alt mr-2"></i>
                      Nutritionist Portal
                    </button>
                    <button
                      onClick={() => handlePortalSelect('admin')}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-purple-400 transition-colors"
                    >
                      <i className="fas fa-cog mr-2"></i>
                      Admin Portal
                    </button>
                    <button
                      onClick={() => handlePortalSelect('frontdesk')}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-orange-400 transition-colors"
                    >
                      <i className="fas fa-desktop mr-2"></i>
                      Front Desk Portal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onSignIn}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg hover-glow transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
              <main>{renderPage}</main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>Contact Info</h3>
              <div className="space-y-2 text-gray-300">
                <p><i className="fas fa-map-marker-alt text-blue-400 mr-2"></i>Islamabad, Pakistan</p>
                <p><i className="fas fa-phone text-blue-400 mr-2"></i>+92 51 123 4567</p>
                <p><i className="fas fa-envelope text-blue-400 mr-2"></i>info@finovafitness.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>Quick Links</h3>
              <div className="space-y-2">
                <button onClick={() => setCurrentPage('membership')} className="block text-gray-300 hover:text-green-400 transition-colors">Membership Plans</button>
                <button onClick={() => setCurrentPage('schedule')} className="block text-gray-300 hover:text-green-400 transition-colors">Class Schedule</button>
                <button onClick={() => setCurrentPage('trainers')} className="block text-gray-300 hover:text-green-400 transition-colors">Our Trainers</button>
                <button onClick={() => setCurrentPage('contact')} className="block text-gray-300 hover:text-green-400 transition-colors">Contact Us</button>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-pink-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center hover-glow transition-all duration-300">
                  <i className="fab fa-instagram text-white"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center hover-glow transition-all duration-300">
                  <i className="fab fa-facebook-f text-white"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Finova Fitness. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Membership Signup Wizard Modal */}
      {showMembershipWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="glass-card p-8 rounded-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Membership Signup</h2>
              <button 
                onClick={() => setShowMembershipWizard(false)} 
                className="close-button text-gray-300 hover:text-white p-2 rounded-lg"
                title="Close"
              >
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Step 1: Your Information</h3>
                <div>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-600 focus:border-blue-400'
                    }`}
                    value={wizardData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                  {validationErrors.name && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email *"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-600 focus:border-blue-400'
                    }`}
                    value={wizardData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  {validationErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone *"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none ${
                      validationErrors.phone ? 'border-red-500' : 'border-gray-600 focus:border-blue-400'
                    }`}
                    value={wizardData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.phone}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Age *"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none ${
                      validationErrors.age ? 'border-red-500' : 'border-gray-600 focus:border-blue-400'
                    }`}
                    value={wizardData.age || ''}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                  {validationErrors.age && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.age}</p>
                  )}
                </div>
                <button
                  onClick={handleMembershipWizardNext}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg hover-glow transition-all duration-300"
                >
                  Next
                </button>
              </div>
            )}
            
            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Step 2: Choose Your Plan *</h3>
                {validationErrors.plan && (
                  <p className="text-red-400 text-sm mb-2">{validationErrors.plan}</p>
                )}
                <div className="space-y-3">
                  {membershipPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                        wizardData.selectedPlan === plan.id
                          ? 'border-blue-400 bg-blue-500 bg-opacity-20'
                          : 'border-gray-600 hover:border-blue-400'
                      }`}
                                              onClick={() => {
                          handleInputChange('selectedPlan', plan.id);
                        }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white">{plan.name}</h4>
                          <p className="text-gray-300 text-sm">{plan.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-400">PKR {plan.price.toLocaleString()}</p>
                          {plan.popular && <span className="text-xs text-green-400">Popular</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleMembershipWizardNext}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg hover-glow transition-all duration-300"
                >
                  Next
                </button>
              </div>
            )}
            
            {wizardStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Step 3: Payment Method *</h3>
                {validationErrors.payment && (
                  <p className="text-red-400 text-sm mb-2">{validationErrors.payment}</p>
                )}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div 
                    className={`p-4 border rounded-lg text-center cursor-pointer transition-all duration-300 ${
                      selectedPaymentMethod === 'jazzcash' 
                        ? 'border-green-400 bg-green-500 bg-opacity-20' 
                        : 'border-gray-600 hover:border-green-400'
                    }`}
                    onClick={() => handlePaymentMethodSelect('jazzcash')}
                  >
                    <i className="fas fa-mobile-alt text-2xl text-green-400 mb-2"></i>
                    <p className="text-sm text-gray-300">JazzCash</p>
                  </div>
                  <div 
                    className={`p-4 border rounded-lg text-center cursor-pointer transition-all duration-300 ${
                      selectedPaymentMethod === 'easypaisa' 
                        ? 'border-blue-400 bg-blue-500 bg-opacity-20' 
                        : 'border-gray-600 hover:border-blue-400'
                    }`}
                    onClick={() => handlePaymentMethodSelect('easypaisa')}
                  >
                    <i className="fas fa-wallet text-2xl text-blue-400 mb-2"></i>
                    <p className="text-sm text-gray-300">EasyPaisa</p>
                  </div>
                  <div 
                    className={`p-4 border rounded-lg text-center cursor-pointer transition-all duration-300 ${
                      selectedPaymentMethod === 'stripe' 
                        ? 'border-purple-400 bg-purple-500 bg-opacity-20' 
                        : 'border-gray-600 hover:border-purple-400'
                    }`}
                    onClick={() => handlePaymentMethodSelect('stripe')}
                  >
                    <i className="fab fa-stripe text-2xl text-purple-400 mb-2"></i>
                    <p className="text-sm text-gray-300">Stripe</p>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-white mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p>Name: {wizardData.name}</p>
                    <p>Email: {wizardData.email}</p>
                    <p>Plan: {membershipPlans.find(p => p.id === wizardData.selectedPlan)?.name}</p>
                    <p className="text-blue-400 font-bold">Total: PKR {membershipPlans.find(p => p.id === wizardData.selectedPlan)?.price.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={handleMembershipWizardNext}
                  disabled={isProcessingPayment}
                  className={`w-full py-2 rounded-lg transition-all duration-300 ${
                    isProcessingPayment 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600 hover-glow'
                  } text-white`}
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing Payment...
                    </div>
                  ) : (
                    'Confirm Signup'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Processing Loading Screen */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-60">
          <div className="glass-card p-8 rounded-2xl max-w-md w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-blue-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
              Payment Processing
            </h3>
            <p className="text-gray-300 mb-4">
              Please wait while we process your payment...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Free Trial Wizard Modal */}
      {showTrialWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="glass-card p-8 rounded-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Free 3-Day Trial</h2>
              <button 
                onClick={() => setShowTrialWizard(false)} 
                className="close-button text-gray-300 hover:text-white p-2 rounded-lg"
                title="Close"
              >
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Step 1: Your Information</h3>
                <div>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-600 focus:border-green-400'
                    }`}
                    value={wizardData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                  {validationErrors.name && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email *"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-600 focus:border-green-400'
                    }`}
                    value={wizardData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  {validationErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone *"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none ${
                      validationErrors.phone ? 'border-red-500' : 'border-gray-600 focus:border-green-400'
                    }`}
                    value={wizardData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.phone}</p>
                  )}
                </div>
                <button
                  onClick={handleTrialWizardNext}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg hover-glow transition-all duration-300"
                >
                  Next
                </button>
              </div>
            )}
            
            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Step 2: Confirm Trial</h3>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-white mb-2">Trial Details</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p>Name: {wizardData.name}</p>
                    <p>Email: {wizardData.email}</p>
                    <p>Phone: {wizardData.phone}</p>
                    <p className="text-green-400 font-bold">Duration: 3 Days</p>
                    <p className="text-green-400 font-bold">Cost: FREE</p>
                  </div>
                </div>
                <button
                  onClick={handleTrialWizardNext}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg hover-glow transition-all duration-300"
                >
                  Activate Trial
                </button>
              </div>
            )}
            
            {wizardStep === 3 && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white">Your 3-Day Trial Is Active!</h3>
                <p className="text-gray-300">Welcome to Finova Fitness! Your trial starts now. You can access all facilities and classes for the next 3 days.</p>
                <button
                  onClick={handleTrialWizardNext}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg hover-glow transition-all duration-300"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      

             {/* Account Creation Form */}
       {showAccountCreation && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
           <div className="glass-card p-8 rounded-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Create Account</h2>
              <button 
                onClick={() => setShowAccountCreation(false)} 
                className="close-button text-gray-300 hover:text-white p-2 rounded-lg"
                title="Close"
              >
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Step 1: Account Details</h3>
              
              {/* General error display */}
              {validationErrors.general && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                  {validationErrors.general}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  placeholder="Email"
                  className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-600 focus:border-blue-400'
                  }`}
                  value={wizardData.email || ''}
                  disabled
                />
                <p className="text-gray-400 text-sm mt-1">Email from your membership application</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <input
                  type="password"
                  placeholder="Password"
                  className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-600 focus:border-blue-400'
                  }`}
                  value={accountData.password || ''}
                                      onChange={(e) => handleAccountDataChange('password', e.target.value)}
                />
                {validationErrors.password && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-600 focus:border-blue-400'
                  }`}
                  value={accountData.confirmPassword || ''}
                                      onChange={(e) => handleAccountDataChange('confirmPassword', e.target.value)}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>
              <button
                onClick={handleAccountCreation}
                disabled={isProcessingPayment}
                className={`w-full py-2 rounded-lg transition-all duration-300 ${
                  isProcessingPayment 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 hover-glow'
                } text-white`}
              >
                {isProcessingPayment ? (
                  <div className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating Account...
                  </div>
                ) : (
                  'Complete Signup'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
