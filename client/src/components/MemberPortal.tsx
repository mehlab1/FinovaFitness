import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types';
import { facilities, exercises } from '../data/mockData';
import { useToast } from './Toast';
import { memberApi } from '../services/api/memberApi';
import { publicFacilitiesApi, userFacilitiesApi } from '../services/api/facilitiesApi';
import { TrainersTab } from './member/TrainersTab';
import { CheckCircle, Star, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import Chat from './Chat';

interface MemberPortalProps {
  user: User | null;
  onLogout: () => void;
}

export const MemberPortal = ({ user, onLogout }: MemberPortalProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [membershipData, setMembershipData] = useState<any>(null);
  const [pendingReviewSession, setPendingReviewSession] = useState<any>(null);
  const { showToast } = useToast();

  // Fetch membership data on component mount
  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        const data = await memberApi.getDashboard();
        setMembershipData(data);
      } catch (error) {
        console.error('Failed to fetch membership data:', error);
        showToast('Failed to load membership data', 'error');
      }
    };

    fetchMembershipData();
  }, []); // Remove showToast dependency to prevent infinite loop

  // Membership pause overlay component
  const MembershipPauseOverlay = () => (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center p-4">
      <div className="glass-card p-6 rounded-xl max-w-sm w-full mx-4 animate-slide-up transform transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/25 relative overflow-hidden group">
        {/* Background gradient and shimmer effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 via-orange-500/20 to-red-600/20 rounded-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute inset-0 animate-shimmer"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-yellow-400/60 rounded-full animate-pulseGlow"></div>
        <div className="absolute bottom-3 left-3 w-1 h-1 bg-orange-400/40 rounded-full animate-pulseGlow" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Main content */}
        <div className="relative z-10 text-center">
          {/* Icon and title */}
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-400/30 mb-3 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-pause-circle text-2xl text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300"></i>
            </div>
            <h2 className="text-lg font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300" style={{ fontFamily: 'Orbitron, monospace' }}>
              Membership Paused
            </h2>
            <p className="text-gray-300 leading-relaxed text-xs">
              Your membership is currently on pause. Access to most features is restricted until your membership becomes active again.
            </p>
          </div>
          
          {/* Pause details card */}
          {membershipData?.pauseDetails && (
            <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-lg p-3 border border-yellow-400/20 mb-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <i className="fas fa-calendar-alt text-yellow-400 text-xs"></i>
                  <span className="text-yellow-200 text-xs font-medium">Pause Ends</span>
                </div>
                <p className="text-white font-semibold text-sm">
                  {new Date(membershipData.pauseDetails.pause_end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="space-y-2">
            <div className="bg-gradient-to-br from-blue-600/10 via-purple-500/10 to-blue-600/10 rounded-lg p-3 border border-blue-400/20">
              <div className="flex items-center justify-center space-x-2">
                <i className="fas fa-info-circle text-blue-400 text-xs"></i>
                <span className="text-blue-200 text-xs font-medium">What You Can Still Do</span>
              </div>
              <p className="text-gray-300 text-xs mt-1">
                Access membership details and manage your account
              </p>
            </div>
            
            <button
              onClick={() => setCurrentPage('membership')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 active:scale-95 relative overflow-hidden group text-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <i className="fas fa-id-card text-xs"></i>
                <span>Go to Membership</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage = () => {
    // If subscription is cancelled, only show membership tab
    if (membershipData?.subscriptionStatus === 'cancelled' || membershipData?.subscriptionCancelled) {
      if (currentPage !== 'membership') {
        return (
          <div className="animate-fade-in">
            <div className="glass-card p-8 rounded-2xl max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-lock text-3xl text-red-400"></i>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-red-400" style={{ fontFamily: 'Orbitron, monospace' }}>
                  Portal Frozen
                </h2>
                <p className="text-gray-300 mb-4">
                  Your subscription has been cancelled. You can only access the membership tab to reactivate your account.
                </p>
                <button
                  onClick={() => setCurrentPage('membership')}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Go to Membership
                </button>
              </div>
            </div>
          </div>
        );
      }
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} showToast={showToast} />;
      case 'profile':
        return <Profile user={user} showToast={showToast} />;
      case 'membership':
        return <Membership user={user} showToast={showToast} membershipData={membershipData} onMembershipUpdate={setMembershipData} />;
      case 'workout':
        return <WorkoutSchedule showToast={showToast} />;
      case 'trainers':
        return <TrainersTab showToast={showToast} onNavigateToReviews={(session) => {
          setPendingReviewSession(session);
          setCurrentPage('reviews');
        }} />;
      case 'nutritionists':
        return <NutritionistsTab showToast={showToast} user={user} onNavigateToReviews={(session) => {
          setPendingReviewSession(session);
          setCurrentPage('reviews');
        }} />;
      case 'facilities':
        return <FacilitiesBooking showToast={showToast} />;
      case 'store':
        return <MemberStore showToast={showToast} />;
      case 'loyalty':
        return <LoyaltyReferrals user={user} showToast={showToast} />;
      case 'announcements':
        return <MemberAnnouncements showToast={showToast} />;
      case 'reviews':
        return <Reviews 
          showToast={showToast} 
          pendingReviewSession={pendingReviewSession} 
          onClearPendingReview={() => setPendingReviewSession(null)}
        />;
      default:
        return <Dashboard user={user} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="sidebar w-64 h-screen fixed left-0 top-0 p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-6 flex-shrink-0">
          <i className="fas fa-dumbbell text-2xl text-blue-400 neon-glow"></i>
          <h1 className="text-xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            FINOVA FITNESS
          </h1>
        </div>
        
        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto enhanced-scroll pr-2">
            <nav className="space-y-2 pb-4">
              {[
                { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-blue-400' },
                { id: 'profile', icon: 'fas fa-user', label: 'My Profile', color: 'text-green-400' },
                { id: 'membership', icon: 'fas fa-id-card', label: 'Membership', color: 'text-pink-400' },
                { id: 'workout', icon: 'fas fa-dumbbell', label: 'Workout Schedule', color: 'text-purple-400' },
                { id: 'trainers', icon: 'fas fa-user-tie', label: 'Trainers', color: 'text-orange-400' },
                { id: 'nutritionists', icon: 'fas fa-apple-alt', label: 'Nutritionists', color: 'text-purple-400' },
                { id: 'facilities', icon: 'fas fa-swimming-pool', label: 'Facilities', color: 'text-blue-400' },
                { id: 'store', icon: 'fas fa-shopping-cart', label: 'Store', color: 'text-green-400' },
                { id: 'loyalty', icon: 'fas fa-gift', label: 'Loyalty & Referrals', color: 'text-pink-400' },
                { id: 'announcements', icon: 'fas fa-bullhorn', label: 'Announcements', color: 'text-yellow-400' },
                { id: 'reviews', icon: 'fas fa-star', label: 'Reviews', color: 'text-purple-400' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-400 hover:bg-opacity-10 transition-all ${
                    currentPage === item.id ? 'bg-blue-400 bg-opacity-20' : ''
                  }`}
                >
                  <i className={`${item.icon} ${item.color}`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Scroll Indicators */}
        <div className="flex-shrink-0 mt-4 text-center">
          <div className="text-xs text-gray-400 mb-2">Scroll to see all tabs</div>
          <div className="flex justify-center space-x-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 relative">
        {/* Show pause overlay for all tabs except membership */}
        {membershipData?.subscriptionPaused && currentPage !== 'membership' && <MembershipPauseOverlay />}
        
        {/* Topbar */}
        <div className="topbar px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ')}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">Welcome back, {user?.name}!</div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content with conditional blur */}
        <div className={`transition-all duration-300 ${
          membershipData?.subscriptionPaused && currentPage !== 'membership' 
            ? 'filter blur-sm pointer-events-none' 
            : ''
        }`}>
        <div className="p-6">
          {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  // All state hooks first
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  // All useEffect hooks
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await memberApi.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Remove showToast dependency to prevent infinite loop

  // All useCallback hooks
  const closeBalanceModal = useCallback(() => {
    setShowBalanceModal(false);
  }, []);

  const openBalanceModal = useCallback(() => {
    setShowBalanceModal(true);
  }, []);

  const refreshDashboardData = useCallback(async () => {
    try {
      const data = await memberApi.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  }, []);

  const handleTopUp = useCallback(async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    setTopUpLoading(true);
    try {
      const result = await memberApi.topUpBalance(parseFloat(topUpAmount));
      showToast('Balance topped up successfully!', 'success');
      setTopUpAmount('');
      closeBalanceModal();
      
      // Refresh dashboard data to get updated balance
      const data = await memberApi.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Top-up failed:', error);
      showToast('Failed to top up balance', 'error');
    } finally {
      setTopUpLoading(false);
    }
  }, [topUpAmount, showToast, closeBalanceModal]);

  // All useMemo hooks
  const formatCurrency = useMemo(() => (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  const getTransactionTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'top_up':
        return 'text-green-400';
      case 'plan_change':
        return 'text-blue-400';
      case 'purchase':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  }, []);

  const getTransactionTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'top_up':
        return 'fas fa-plus-circle';
      case 'plan_change':
        return 'fas fa-exchange-alt';
      case 'purchase':
        return 'fas fa-shopping-cart';
      default:
        return 'fas fa-circle';
    }
  }, []);

  // All useMemo hooks must come before any conditional returns
  const profile = useMemo(() => dashboardData?.profile || {}, [dashboardData?.profile]);
  const currentPlan = useMemo(() => dashboardData?.currentPlan || {}, [dashboardData?.currentPlan]);
  const loyaltyStats = useMemo(() => dashboardData?.loyaltyStats || {}, [dashboardData?.loyaltyStats]);
  const referralCount = useMemo(() => dashboardData?.referralCount || 0, [dashboardData?.referralCount]);
  const workoutStats = useMemo(() => dashboardData?.workoutStats || {}, [dashboardData?.workoutStats]);
  const balance = useMemo(() => dashboardData?.balance || {}, [dashboardData?.balance]);

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          MEMBER DASHBOARD
        </h1>
        <p className="text-gray-300">Welcome back, {user?.first_name || user?.name}! Here's your fitness overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="metric-card p-4 rounded-xl border-purple-400 cursor-pointer group relative overflow-hidden" onClick={() => openBalanceModal()}>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-xl border border-purple-400/50 group-hover:border-purple-400 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-purple-400 group-hover:text-purple-300 transition-colors duration-300" style={{ fontFamily: 'Orbitron, monospace' }}>
                Balance
              </h3>
              <div className="relative">
                <i className="fas fa-wallet text-purple-400 text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"></i>
                {/* Pulse effect */}
                <div className="absolute inset-0 bg-purple-400 rounded-full opacity-0 group-hover:opacity-20 animate-ping"></div>
              </div>
            </div>
            
            <p className="text-xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors duration-300">
              {balance?.current_balance ? formatCurrency(parseFloat(balance.current_balance)) : '$0.00'}
            </p>
            
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors duration-300">Click to view</p>
              <i className="fas fa-chevron-right text-purple-400 text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"></i>
            </div>
          </div>
          
          {/* Hover scale effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-xl"></div>
        </div>

        <div className="metric-card p-6 rounded-xl border-blue-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Current Plan</h3>
            <i className="fas fa-crown text-blue-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">{currentPlan.name || 'No Plan'}</p>
          <p className="text-gray-300">
            {currentPlan.days_remaining !== null 
              ? `${currentPlan.days_remaining} days remaining`
              : 'Plan details loading...'
            }
          </p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-green-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Loyalty Points</h3>
            <i className="fas fa-star text-green-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">{profile.loyalty_points || 0}</p>
          <button 
            onClick={() => showToast('Redirecting to loyalty page...', 'info')}
            className="text-green-400 hover:text-green-300 text-sm"
          >
            Redeem Now
          </button>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-pink-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Streak</h3>
            <i className="fas fa-fire text-pink-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">{profile.streak_days || 0} days</p>
          <p className="text-gray-300">
            {profile.streak_days >= 7 ? 'Keep it up!' : 'Start your streak today!'}
          </p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-yellow-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-yellow-400" style={{ fontFamily: 'Orbitron, monospace' }}>Referrals</h3>
            <i className="fas fa-users text-yellow-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">{referralCount}</p>
          <p className="text-gray-300">
            {referralCount > 0 ? 'Friends joined' : 'Invite friends to earn points'}
          </p>
        </div>
      </div>

      {/* Progress Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="metric-card p-6 rounded-xl border-green-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Weight Change</h3>
            <i className="fas fa-weight text-green-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">
            {profile.weight_change !== null 
              ? `${profile.weight_change > 0 ? '+' : ''}${profile.weight_change} kg`
              : 'No data'
            }
          </p>
          <p className="text-gray-300">
            {profile.weight_change !== null ? 'since last recorded' : 'Start tracking weight'}
          </p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-blue-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>BMI</h3>
            <i className="fas fa-chart-line text-blue-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">
            {profile.bmi || 'N/A'}
          </p>
          <p className="text-gray-300">
            {profile.bmi ? 'Your BMI' : 'Update height & weight'}
          </p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-pink-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Workout Completion</h3>
            <i className="fas fa-check-circle text-pink-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">
            {workoutStats.completed > 0 
              ? workoutStats.total > 0 
                ? `${workoutStats.completed}/${workoutStats.total}`
                : workoutStats.completed
              : '0'
            }
          </p>
          <p className="text-gray-300">
            {workoutStats.completed > 0 
              ? workoutStats.total > 0 
                ? 'scheduled workouts done'
                : 'workouts completed'
              : 'No workouts completed'
            }
          </p>
        </div>
      </div>

      {/* Consistency Reward */}
      {(profile.streak_days || 0) >= 90 && (
        <div className="bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                🏆 CONSISTENCY REWARD
              </h3>
              <p className="text-white">You've maintained a 90-day streak! Claim your voucher.</p>
            </div>
            <button 
              onClick={() => showToast('Voucher claimed!', 'success')}
              className="bg-white text-pink-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              CLAIM REWARD
            </button>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={closeBalanceModal}>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl w-full max-w-sm mx-auto shadow-2xl border border-gray-700/50 animate-slideUp overflow-hidden transform transition-all duration-300 hover:scale-[1.02] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {/* Compact Header */}
            <div className="relative p-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md flex items-center justify-center animate-pulse">
                    <i className="fas fa-wallet text-white text-xs"></i>
                  </div>
                  <h2 className="text-base font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                    Balance
                  </h2>
                </div>
                <button
                  onClick={closeBalanceModal}
                  className="w-6 h-6 bg-gray-700/50 hover:bg-gray-600 rounded-md flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-purple-400 hover:scrollbar-thumb-purple-300">
              {/* Compact Balance Display */}
              <div className="p-3">
                <div className="bg-gradient-to-br from-purple-600/20 via-purple-500/20 to-blue-600/20 rounded-lg p-3 border border-purple-500/30 relative overflow-hidden group animate-balanceCardFloat">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 animate-shimmer"></div>
                  <div className="relative z-10 text-center">
                    <p className="text-purple-200 text-xs mb-1 opacity-80">Current Balance</p>
                    <p className="text-xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300 animate-balanceGlow">
                      {balance?.current_balance ? formatCurrency(parseFloat(balance.current_balance)) : '$0.00'}
                    </p>
                    <div className="flex justify-center space-x-3 text-xs">
                      <div className="text-center">
                        <p className="text-purple-200 opacity-60">Earned</p>
                        <p className="text-white font-medium">{balance?.total_earned ? formatCurrency(parseFloat(balance.total_earned)) : '$0.00'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-purple-200 opacity-60">Spent</p>
                        <p className="text-white font-medium">{balance?.total_spent ? formatCurrency(parseFloat(balance.total_spent)) : '$0.00'}</p>
                      </div>
                    </div>
                  </div>
                  {/* Animated decorative elements */}
                  <div className="absolute top-1 right-1 w-1 h-1 bg-white/40 rounded-full animate-pulseGlow"></div>
                  <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulseGlow" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>

              {/* Compact Top Up Section */}
              <div className="px-3 pb-3">
                <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                  <h3 className="text-xs font-semibold text-gray-300 mb-2 flex items-center">
                    <i className="fas fa-plus-circle text-green-400 mr-2 text-xs"></i>
                    Quick Top Up
                  </h3>
                  
                  {/* Quick Amount Buttons - More compact */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {[10, 25, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setTopUpAmount(amount.toString());
                          // Add pop animation class
                          const button = document.activeElement as HTMLElement;
                          if (button) {
                            button.classList.add('animate-amountButtonPop');
                            setTimeout(() => button.classList.remove('animate-amountButtonPop'), 300);
                          }
                        }}
                        className={`px-1.5 py-1 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 border relative overflow-hidden ${
                          topUpAmount === amount.toString()
                            ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/25'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <span className="relative z-10">${amount}</span>
                        {topUpAmount === amount.toString() && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-shimmer"></div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Amount Input */}
                  <div className="flex space-x-2 mb-2">
                    <div className="flex-1 relative group">
                      <input
                        type="number"
                        placeholder="Custom amount"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="w-full bg-gray-700 text-white px-2.5 py-1.5 rounded-md border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 focus:outline-none text-xs transition-all duration-200 placeholder-gray-500 group-hover:border-gray-500"
                        min="0"
                        step="0.01"
                      />
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-blue-500/0 group-focus-within:from-purple-500/10 group-focus-within:via-purple-500/5 group-focus-within:to-blue-500/10 transition-all duration-300 pointer-events-none"></div>
                    </div>
                    <button
                      onClick={handleTopUp}
                      disabled={topUpLoading || !topUpAmount || parseFloat(topUpAmount) <= 0}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25 relative overflow-hidden"
                    >
                      {topUpLoading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-shimmer"></div>
                      )}
                      <span className="relative z-10">
                        {topUpLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-credit-card mr-1"></i>
                            Top Up
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                  
                  <p className="text-gray-400 text-xs flex items-start leading-relaxed">
                    <i className="fas fa-info-circle mr-2 mt-0.5 text-blue-400 flex-shrink-0"></i>
                    <span className="transition-all duration-200">
                      {topUpLoading 
                        ? 'Processing your top-up request...' 
                        : 'Enter amount and click Top Up to proceed to payment gateway'
                      }
                    </span>
                  </p>
                  
                  {/* Success indicator */}
                  {!topUpLoading && topUpAmount && parseFloat(topUpAmount) > 0 && (
                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-md animate-pulseGlow">
                      <p className="text-green-400 text-xs flex items-center">
                        <i className="fas fa-check-circle mr-2"></i>
                        Ready to top up {formatCurrency(parseFloat(topUpAmount))}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Transaction History */}
              <div className="px-3 pb-3">
                <div className="bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="p-2.5 border-b border-gray-700/30">
                    <h3 className="text-xs font-semibold text-gray-300 flex items-center">
                      <i className="fas fa-history text-blue-400 mr-2 text-xs"></i>
                      Recent Activity
                    </h3>
                  </div>
                  
                  {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-blue-400">
                      {dashboardData.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                        <div 
                          key={index} 
                          className="p-2 border-b border-gray-700/20 last:border-b-0 hover:bg-gray-700/20 transition-all duration-200 group"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                                transaction.transaction_type === 'top_up' 
                                  ? 'bg-green-500/20 group-hover:bg-green-500/30' 
                                  : 'bg-red-500/20 group-hover:bg-red-500/30'
                              }`}>
                                <i className={`${getTransactionTypeIcon(transaction.transaction_type)} ${getTransactionTypeColor(transaction.transaction_type)} text-xs`}></i>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white text-xs font-medium group-hover:text-gray-100 transition-colors duration-200 truncate">
                                  {transaction.description}
                                </p>
                                <p className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors duration-200">
                                  {new Date(transaction.created_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <p className={`font-bold text-xs transition-all duration-200 ${
                                transaction.transaction_type === 'top_up' 
                                  ? 'text-green-400 group-hover:text-green-300' 
                                  : 'text-red-400 group-hover:text-red-300'
                              }`}>
                                {transaction.transaction_type === 'top_up' ? '+' : ''}{formatCurrency(parseFloat(transaction.amount))}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-2 relative overflow-hidden animate-pulseGlow">
                        <i className="fas fa-receipt text-gray-500 text-sm"></i>
                      </div>
                      <p className="text-gray-500 text-xs">No recent transactions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [profile, setProfile] = useState({
    firstName: user?.first_name || user?.name?.split(' ')[0] || '',
    lastName: user?.last_name || user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    height: '',
    weight: '',
    fitnessGoals: 'Build muscle and improve endurance',
    healthGoals: 'Maintain good health and prevent injuries'
  });

  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showWeightLog, setShowWeightLog] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [weightNotes, setWeightNotes] = useState('');
  const [passwordResetStep, setPasswordResetStep] = useState<'email' | 'verification' | 'newPassword'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [weightChange, setWeightChange] = useState<number | null>(null);
  const [previousWeight, setPreviousWeight] = useState<number | null>(null);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await memberApi.getProfile();
      setProfileData(response);
      
      // Update local state with fetched data
      setProfile({
        firstName: response.user.first_name || '',
        lastName: response.user.last_name || '',
        email: response.user.email || '',
        phone: response.user.phone || '',
        dateOfBirth: response.user.date_of_birth ? response.user.date_of_birth.split('T')[0] : '',
        gender: response.user.gender || '',
        address: response.user.address || '',
        emergencyContact: response.user.emergency_contact || '',
        height: response.profile.height || '',
        weight: response.profile.weight || '',
        fitnessGoals: response.profile.fitness_goals || 'Build muscle and improve endurance',
        healthGoals: response.profile.health_notes || 'Maintain good health and prevent injuries'
      });

      // Set profile image if exists
      if (response.profile.profile_image_url) {
        setImagePreview(response.profile.profile_image_url);
      }

      // Get weight change data
      if (response.profile.weight) {
        await fetchWeightChange(response.profile.weight);
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Failed to load profile data', 'error');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchWeightChange = async (currentWeight: number) => {
    try {
      const response = await memberApi.getWeightChange();
      if (response.success) {
        setWeightChange(response.weightChange);
        setPreviousWeight(response.previousWeight);
      }
    } catch (error) {
      console.error('Error fetching weight change:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWeightLog = async () => {
    if (newWeight && parseFloat(newWeight) > 0) {
      try {
        setIsLoading(true);
        const response = await memberApi.logWeight({
          weight: parseFloat(newWeight),
          notes: weightNotes
        });

        if (response.success) {
          // Update local state
          setProfile({ ...profile, weight: newWeight });
          setNewWeight('');
          setWeightNotes('');
          setShowWeightLog(false);
          
          // Fetch updated weight change
          await fetchWeightChange(parseFloat(newWeight));
          
          showToast('Weight logged successfully!', 'success');
        }
      } catch (error) {
        console.error('Error logging weight:', error);
        showToast('Failed to log weight', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      showToast('Please enter a valid weight', 'error');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const profileData = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        date_of_birth: profile.dateOfBirth,
        gender: profile.gender,
        address: profile.address,
        emergency_contact: profile.emergencyContact,
        height: profile.height ? parseFloat(profile.height) || null : null,
        weight: profile.weight ? parseFloat(profile.weight) || null : null,
        fitness_goals: profile.fitnessGoals,
        health_notes: profile.healthGoals
      };

      const response = await memberApi.updateProfile(profileData);
      
      if (response.success) {
        showToast('Profile saved successfully!', 'success');
        // Refresh profile data
        await fetchProfileData();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      setIsResettingPassword(true);
      
      // Call the forgot password API
      const response = await memberApi.forgotPassword(profile.email);
      
      if (response.success) {
        // Simulate 3-second loading
        setTimeout(() => {
          setPasswordResetStep('verification');
          setIsResettingPassword(false);
          showToast('Verification code sent to your email!', 'success');
        }, 3000);
      } else {
        showToast(response.error || 'Failed to send verification code', 'error');
        setIsResettingPassword(false);
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      showToast('Failed to send verification code', 'error');
      setIsResettingPassword(false);
    }
  };

  const handleVerificationCodeSubmit = () => {
    // Accept any verification code for now
    setPasswordResetStep('newPassword');
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setIsResettingPassword(true);
      
      // Call the reset password API
      const response = await memberApi.resetPassword({
        email: profile.email,
        verificationCode: verificationCode,
        newPassword: newPassword
      });

      if (response.success) {
        showToast('Password reset successfully!', 'success');
        setShowPasswordReset(false);
        setPasswordResetStep('email');
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(response.error || 'Failed to reset password', 'error');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showToast('Failed to reset password', 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const resetPasswordModal = () => {
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetEmail('');
    setPasswordResetStep('email');
  };

  if (isLoadingProfile) {
    return (
      <div className="animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
            PROFILE SETTINGS
          </h1>
          <p className="text-gray-300">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Image & Quick Actions */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              {/* Profile Image Section */}
              <div className="text-center mb-8 animate-slide-in">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-600 hover:border-blue-400 transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-400/50">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <i className="fas fa-user text-4xl text-gray-400 group-hover:text-blue-400 transition-colors duration-300"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Camera Icon Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <i className="fas fa-camera text-2xl text-white transform group-hover:scale-110 transition-transform duration-300"></i>
                  </div>
                  
                  {/* File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-300 group-hover:text-blue-400 transition-colors duration-300 cursor-pointer">
                    <i className="fas fa-camera mr-2 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Click to change photo
                  </label>
                  <p className="text-xs text-gray-400 animate-pulse">
                    <i className="fas fa-info-circle mr-1 text-blue-400"></i>
                    Supports JPG, PNG, GIF (Max 5MB)
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                {/* Reset Password Button */}
                <button
                  onClick={() => {
                    resetPasswordModal();
                    setShowPasswordReset(true);
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 flex items-center justify-center space-x-3 group animate-slide-in relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <i className="fas fa-key text-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 text-2xl"></i>
                  <span className="relative z-10 text-lg">Forgot Password</span>
                  <div className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </button>

                {/* Weight Log Button */}
                <button
                  onClick={() => setShowWeightLog(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 flex items-center justify-center space-x-3 group animate-slide-in relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <i className="fas fa-weight text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-2xl"></i>
                  <span className="relative z-10 text-lg">Log Weight</span>
                  <div className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8 rounded-2xl hover:shadow-2xl transition-all duration-500 animate-slide-in">
              <h2 className="text-3xl font-bold mb-8 text-blue-400 flex items-center animate-bounce-in" style={{ fontFamily: 'Orbitron, monospace' }}>
                <i className="fas fa-user-edit mr-4 animate-pulse text-purple-400"></i>
                Personal Information
                <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* First Name */}
                <div className="group animate-stagger-1">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-user mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    First Name
                    <span className="ml-auto text-red-400 text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                    placeholder="Enter first name"
                  />
                </div>

                {/* Last Name */}
                <div className="group animate-stagger-2">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-user mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Last Name
                    <span className="ml-auto text-red-400 text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                    placeholder="Enter last name"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2 group animate-stagger-3">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-envelope mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Email Address
                    <span className="ml-auto text-red-400 text-xs">*</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Phone */}
                <div className="group animate-stagger-4">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-phone mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Date of Birth */}
                <div className="group animate-stagger-5">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-calendar mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                  />
                </div>

                {/* Gender */}
                <div className="group animate-stagger-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-venus-mars mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Gender
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02] cursor-pointer"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                {/* Height */}
                <div className="group animate-stagger-7">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-ruler-vertical mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                    placeholder="Enter height in cm"
                    min="100"
                    max="250"
                  />
                </div>

                {/* Weight */}
                <div className="group animate-stagger-8">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-weight mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                    placeholder="Enter weight in kg"
                    min="30"
                    max="300"
                    step="0.1"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2 group animate-stagger-9">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-map-marker-alt mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Address
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02] resize-none"
                    rows={3}
                    placeholder="Enter your full address"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="md:col-span-2 group animate-stagger-10">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-exclamation-triangle mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                    placeholder="Name and phone number of emergency contact"
                  />
                </div>

                {/* Fitness Goals */}
                <div className="md:col-span-2 group animate-stagger-11">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-dumbbell mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Fitness Goals
                  </label>
                  <textarea
                    value={profile.fitnessGoals}
                    onChange={(e) => setProfile({ ...profile, fitnessGoals: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02] resize-none"
                    rows={3}
                    placeholder="Describe your fitness goals and objectives"
                  />
                </div>

                {/* Health Goals */}
                <div className="md:col-span-2 group animate-stagger-12">
                  <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                    <i className="fas fa-heart mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                    Health Goals
                  </label>
                  <textarea
                    value={profile.healthGoals}
                    onChange={(e) => setProfile({ ...profile, healthGoals: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02] resize-none"
                    rows={3}
                    placeholder="Describe your health goals and any medical considerations"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-10 pt-8 border-t-2 border-gray-600 animate-stagger-13">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:via-gray-600 disabled:to-gray-700 text-white py-5 rounded-2xl font-bold text-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-4 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'} group-hover:rotate-12 transition-transform duration-300 text-2xl`}></i>
                  <span className="relative z-10">{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                  <div className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </button>
                
                {/* Success indicator */}
                {!isSaving && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-400 text-sm animate-pulse">
                      <i className="fas fa-info-circle mr-2 text-blue-400"></i>
                      All changes are automatically validated before saving
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Reset Modal */}
        {showPasswordReset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
            <div className="glass-card p-8 rounded-2xl max-w-md w-full mx-4 animate-slide-up transform transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/25">
              {passwordResetStep === 'email' && (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-3 text-red-400 flex items-center justify-center animate-bounce-in">
                      <i className="fas fa-key mr-3 text-red-400 animate-pulse"></i>
                      Forgot Password
                    </h3>
                    <p className="text-gray-300 text-lg">A verification code will be sent to your email address.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border-2 border-gray-700 hover:border-red-400 transition-all duration-500 mb-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                        <i className="fas fa-envelope text-white text-2xl"></i>
                      </div>
                      <h4 className="text-lg font-bold text-red-400 mb-2">Your Email Address</h4>
                      <p className="text-white text-xl font-semibold break-all">{profile.email}</p>
                      <p className="text-gray-400 text-sm mt-2">A verification code will be sent to this email</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => setShowPasswordReset(false)}
                      className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-gray-500/25 flex items-center justify-center space-x-3 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <i className="fas fa-times text-lg group-hover:rotate-90 group-hover:scale-110 transition-all duration-500"></i>
                      <span className="relative z-10">Cancel</span>
                    </button>
                    <button
                      onClick={handleForgotPassword}
                      disabled={isResettingPassword}
                      className="flex-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 disabled:from-gray-500 disabled:via-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-3 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-red-500 to-red-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <i className={`fas ${isResettingPassword ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}></i>
                      <span className="relative z-10">{isResettingPassword ? 'Sending...' : 'Send Code'}</span>
                    </button>
                  </div>
                </>
              )}

              {passwordResetStep === 'verification' && (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-3 text-blue-400 flex items-center justify-center animate-bounce-in">
                      <i className="fas fa-shield-alt mr-3 text-blue-400 animate-pulse"></i>
                      Verification Code
                    </h3>
                    <p className="text-gray-300 text-lg">Enter the verification code sent to your email.</p>
                    <p className="text-gray-400 text-sm mt-2">For now, any code will be accepted for testing</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-blue-400 transition-all duration-300 flex items-center">
                        <i className="fas fa-shield-alt mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300"></i>
                        Verification Code
                        <span className="ml-auto text-blue-400 text-xs">*</span>
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-blue-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                        placeholder="Enter any 6-digit code (testing mode)"
                        maxLength={6}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => setPasswordResetStep('email')}
                      className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-gray-500/25 flex items-center justify-center space-x-3 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <i className="fas fa-arrow-left text-lg group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-500"></i>
                      <span className="relative z-10">Back</span>
                    </button>
                    <button
                      onClick={handleVerificationCodeSubmit}
                      disabled={!verificationCode.trim()}
                      className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 disabled:from-gray-500 disabled:via-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-3 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <i className="fas fa-check text-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500"></i>
                      <span className="relative z-10">Verify Code</span>
                    </button>
                  </div>
                </>
              )}

              {passwordResetStep === 'newPassword' && (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-3 text-green-400 flex items-center justify-center animate-bounce-in">
                      <i className="fas fa-lock mr-3 text-green-400 animate-pulse"></i>
                      New Password
                    </h3>
                    <p className="text-gray-300 text-lg">Enter your new password.</p>
                    <p className="text-gray-400 text-sm mt-2">Password will be updated in the database</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-green-400 transition-all duration-300 flex items-center">
                        <i className="fas fa-lock mr-3 text-green-400 group-hover:scale-110 transition-transform duration-300"></i>
                        New Password
                        <span className="ml-auto text-red-400 text-xs">*</span>
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-green-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-green-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-semibold mb-3 text-gray-300 group-hover:text-green-400 transition-all duration-300 flex items-center">
                        <i className="fas fa-lock mr-3 text-green-400 group-hover:scale-110 transition-transform duration-300"></i>
                        Confirm New Password
                        <span className="ml-auto text-red-400 text-xs">*</span>
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-green-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-green-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => setPasswordResetStep('verification')}
                      className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-gray-500/25 flex items-center justify-center space-x-3 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <i className="fas fa-arrow-left text-lg group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-500"></i>
                      <span className="relative z-10">Back</span>
                    </button>
                    <button
                      onClick={handlePasswordReset}
                      disabled={isResettingPassword || newPassword !== confirmPassword || newPassword.length < 6}
                      className="flex-1 bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 disabled:from-gray-500 disabled:via-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-3 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-green-500 to-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <i className={`fas ${isResettingPassword ? 'fa-spinner fa-spin' : 'fa-key'} text-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}></i>
                      <span className="relative z-10">{isResettingPassword ? 'Resetting...' : 'Reset Password'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Weight Logging Modal */}
        {showWeightLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
            <div className="glass-card p-6 rounded-2xl max-w-lg w-full mx-4 animate-slide-up transform transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/25 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-2 text-green-400 flex items-center justify-center animate-bounce-in">
                  <i className="fas fa-weight mr-3 animate-bounce text-green-400 text-xl"></i>
                  Weight Dashboard
                </h3>
                <p className="text-gray-300 text-sm">Track your weight progress and log new measurements</p>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 enhanced-scroll">
                {/* Current Weight Display */}
                {profile.weight && (
                  <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-4 rounded-xl mb-4 border-2 border-gray-700 hover:border-green-400 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/25">
                    <h4 className="text-base font-bold text-green-400 mb-3 text-center flex items-center justify-center animate-slide-in">
                      <i className="fas fa-chart-line mr-2 text-green-400 animate-pulse"></i>
                      Current Weight Statistics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-600 hover:border-blue-400">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce-gentle">
                          <i className="fas fa-weight text-white text-sm"></i>
                        </div>
                        <p className="text-gray-400 text-xs font-medium mb-1">Current Weight</p>
                        <p className="text-sm font-bold text-blue-400">{profile.weight} kg</p>
                      </div>
                      {previousWeight && (
                        <div className="text-center p-2 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-600 hover:border-purple-400">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce-gentle">
                            <i className="fas fa-history text-white text-sm"></i>
                          </div>
                          <p className="text-gray-400 text-xs font-medium mb-1">Previous Weight</p>
                          <p className="text-sm font-bold text-purple-400">{previousWeight} kg</p>
                        </div>
                      )}
                      {weightChange !== null && weightChange !== 0 && (
                        <div className="text-center p-2 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-600 hover:border-orange-400">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce-gentle ${weightChange > 0 ? 'bg-red-500' : 'bg-green-500'}`}>
                            <i className={`fas ${weightChange > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-white text-sm`}></i>
                          </div>
                          <p className="text-gray-400 text-xs font-medium mb-1">Weight Change</p>
                          <p className={`text-sm font-bold ${weightChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border-2 border-gray-700 hover:border-green-400 transition-all duration-500 mb-4">
                  <h4 className="text-base font-bold text-green-400 mb-3 text-center flex items-center justify-center animate-slide-in">
                    <i className="fas fa-plus-circle mr-2 text-green-400 animate-pulse"></i>
                    Log New Weight Entry
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="group">
                      <label className="block text-sm font-semibold mb-2 text-gray-300 group-hover:text-green-400 transition-all duration-300 flex items-center">
                        <i className="fas fa-weight mr-2 text-green-400 group-hover:scale-110 transition-transform duration-300"></i>
                        New Weight (kg)
                        <span className="ml-auto text-red-400 text-xs">*</span>
                      </label>
                      <input
                        type="number"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border-2 border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-green-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02]"
                        placeholder="Enter weight in kg"
                        min="30"
                        max="300"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-semibold mb-2 text-gray-300 group-hover:text-green-400 transition-all duration-300 flex items-center">
                        <i className="fas fa-sticky-note mr-2 text-green-400 group-hover:scale-110 transition-transform duration-300"></i>
                        Notes (Optional)
                      </label>
                      <textarea
                        value={weightNotes}
                        onChange={(e) => setWeightNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border-2 border-gray-600 rounded-lg focus:border-green-400 focus:outline-none transition-all duration-300 text-white hover:border-gray-500 focus:ring-4 focus:ring-green-400 focus:ring-opacity-20 group-hover:bg-gray-800 transform group-hover:scale-[1.02] resize-none"
                        rows={2}
                        placeholder="Any notes about this weight measurement (e.g., after workout, morning weight, etc.)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowWeightLog(false)}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-gray-500/25 flex items-center justify-center space-x-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <i className="fas fa-times text-lg group-hover:rotate-90 group-hover:scale-110 transition-all duration-500"></i>
                  <span className="relative z-10">Cancel</span>
                </button>
                <button
                  onClick={handleWeightLog}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 disabled:from-gray-500 disabled:via-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-check'} text-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}></i>
                  <span className="relative z-10">{isLoading ? 'Logging...' : 'Log Weight'}</span>
                  <div className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Membership = ({ user, showToast, membershipData, onMembershipUpdate }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void; membershipData: any; onMembershipUpdate: (data: any) => void }) => {
  const [autoRenew, setAutoRenew] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planChangeDetails, setPlanChangeDetails] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [requestId, setRequestId] = useState<number | null>(null);
  const [showPauseWizard, setShowPauseWizard] = useState(false);
  const [pauseStep, setPauseStep] = useState(1);
  const [selectedPauseDuration, setSelectedPauseDuration] = useState<number>(0);
  const [pauseLoading, setPauseLoading] = useState(false);
  
  // Cancel subscription states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelConfirmation, setCancelConfirmation] = useState(false);
  const [cancellationDetails, setCancellationDetails] = useState<any>(null);
  const [showMembershipPlans, setShowMembershipPlans] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<any>(null);
  const [showPersonalDataUpdate, setShowPersonalDataUpdate] = useState(false);
  const [personalDataForm, setPersonalDataForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    if (membershipData) {
        setLoading(false);
      }
  }, [membershipData]);

  const fetchAvailablePlans = async () => {
    try {
      const plans = await memberApi.getMembershipPlans();
      setAvailablePlans(plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      showToast('Failed to load available plans', 'error');
    }
  };

  const handleChangePlan = async () => {
    setShowPlanChangeModal(true);
    await fetchAvailablePlans();
  };

  const calculatePlanChange = async (planId: number) => {
    try {
      const data = await memberApi.calculatePlanChange(planId);
      if (data.success) {
        setPlanChangeDetails(data);
        setShowConfirmationModal(true);
      } else {
        showToast(data.error || 'Failed to calculate plan change', 'error');
      }
    } catch (error) {
      console.error('Failed to calculate plan change:', error);
      showToast('Failed to calculate plan change details', 'error');
    }
  };

  const initiatePlanChange = async () => {
    try {
      const data = await memberApi.initiatePlanChange({
        newPlanId: selectedPlan.id,
        currentPlanBalance: planChangeDetails.currentPlanBalance,
        newPlanPrice: planChangeDetails.newPlan.price,
        balanceDifference: planChangeDetails.balanceDifference
      });
      
      if (data.success) {
        setRequestId(data.requestId);
        if (planChangeDetails.paymentRequired) {
          setShowPaymentModal(true);
        } else {
          setShowConfirmationModal(false);
          setShowPaymentModal(true);
        }
      } else {
        showToast(data.error || 'Failed to initiate plan change', 'error');
      }
    } catch (error) {
      console.error('Failed to initiate plan change:', error);
      showToast('Failed to initiate plan change', 'error');
    }
  };

  const confirmPlanChange = async () => {
    if (!requestId) return; // Add null check
    
    try {
      const data = await memberApi.confirmPlanChange({
        requestId: requestId!, // Use non-null assertion
        email: credentials.email,
        password: credentials.password
      });
      
      if (data.success) {
        showToast('Plan changed successfully!', 'success');
        setShowPaymentModal(false);
        setShowPlanChangeModal(false);
        setCredentials({ email: '', password: '' });
        setRequestId(null);
        setSelectedPlan(null);
        setPlanChangeDetails(null);
        
        // Refresh membership data
        const updatedData = await memberApi.getDashboard();
        onMembershipUpdate(updatedData);
      } else {
        showToast(data.error || 'Failed to confirm plan change', 'error');
      }
    } catch (error) {
      console.error('Failed to confirm plan change:', error);
      showToast('Failed to confirm plan change', 'error');
    }
  };

  const handlePayment = () => {
    // This would integrate with a payment gateway
    showToast('Redirecting to payment gateway...', 'info');
    // For now, just show success message
    setTimeout(() => {
      showToast('Payment successful!', 'success');
      setShowPaymentModal(false);
      setShowPlanChangeModal(false);
      setCredentials({ email: '', password: '' });
      setRequestId(null);
      setSelectedPlan(null);
      setPlanChangeDetails(null);
    }, 2000);
  };

  const handlePauseSubscription = () => {
    setShowPauseWizard(true);
    setPauseStep(1);
    setSelectedPauseDuration(0);
  };

  const handlePauseDurationSelect = (duration: number) => {
    setSelectedPauseDuration(duration);
    setPauseStep(2);
  };

  const confirmPauseSubscription = async () => {
    if (!selectedPauseDuration) return;
    
    setPauseLoading(true);
    try {
      const data = await memberApi.pauseSubscription(selectedPauseDuration);
      
      if (data.success) {
        showToast(data.message, 'success');
        setShowPauseWizard(false);
        setPauseStep(1);
        setSelectedPauseDuration(0);
        
        // Refresh membership data
        const updatedData = await memberApi.getDashboard();
        onMembershipUpdate(updatedData);
      } else {
        showToast(data.error || 'Failed to pause subscription', 'error');
      }
    } catch (error) {
      console.error('Failed to pause subscription:', error);
      showToast('Failed to pause subscription', 'error');
    } finally {
      setPauseLoading(false);
    }
  };

  const closePauseWizard = () => {
    setShowPauseWizard(false);
    setPauseStep(1);
    setSelectedPauseDuration(0);
    setPauseLoading(false);
  };

  // Cancel subscription handlers
  const handleCancelSubscription = async () => {
    try {
      // Calculate cancellation details
      const currentPlan = membershipData?.currentPlan || {};
      const endDate = new Date(currentPlan.end_date);
      const today = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate value lost (proportional to days remaining)
      const totalDays = Math.ceil((endDate.getTime() - new Date(currentPlan.start_date).getTime()) / (1000 * 60 * 60 * 24));
      const valueLost = daysLeft > 0 ? (currentPlan.price / totalDays) * daysLeft : 0;
      
      setCancellationDetails({
        daysLeft: Math.max(0, daysLeft),
        valueLost: valueLost.toFixed(2),
        planName: currentPlan.name,
        endDate: currentPlan.end_date
      });
      
      setShowCancelModal(true);
    } catch (error) {
      console.error('Error calculating cancellation details:', error);
      showToast('Failed to calculate cancellation details', 'error');
    }
  };

  const confirmCancellation = async () => {
    try {
      setLoading(true);
      const data = await memberApi.cancelSubscription();
      
      if (data.success) {
        showToast('Subscription cancelled successfully', 'success');
        setShowCancelModal(false);
        setCancelConfirmation(true);
        
        // Refresh membership data
        const updatedData = await memberApi.getDashboard();
        onMembershipUpdate(updatedData);
      } else {
        showToast(data.error || 'Failed to cancel subscription', 'error');
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      showToast('Failed to cancel subscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalDataUpdate = async () => {
    try {
      setLoading(true);
      const data = await memberApi.updatePersonalData(personalDataForm);
      
      if (data.success) {
        showToast('Personal data updated successfully', 'success');
        setShowPersonalDataUpdate(false);
        setShowMembershipPlans(true);
      } else {
        showToast(data.error || 'Failed to update personal data', 'error');
      }
    } catch (error) {
      console.error('Failed to update personal data:', error);
      showToast('Failed to update personal data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMembershipSelection = async (plan: any) => {
    setSelectedNewPlan(plan);
    setShowMembershipPlans(false);
    setShowPaymentModal(true);
  };

  const handleNewMembershipPayment = async () => {
    try {
      setLoading(true);
      const data = await memberApi.subscribeToPlan({
        planId: selectedNewPlan.id,
        paymentMethod: 'credit_card', // This would be dynamic based on user selection
        personalData: personalDataForm
      });
      
      if (data.success) {
        showToast('New membership activated successfully!', 'success');
        setShowPaymentModal(false);
        setCancelConfirmation(false);
        setSelectedNewPlan(null);
        
        // Refresh membership data
        const updatedData = await memberApi.getDashboard();
        onMembershipUpdate(updatedData);
      } else {
        showToast(data.error || 'Failed to activate new membership', 'error');
      }
    } catch (error) {
      console.error('Failed to activate new membership:', error);
      showToast('Failed to activate new membership', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="glass-card p-8 rounded-2xl max-w-2xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = membershipData?.currentPlan || {};
  const profile = membershipData?.profile || {};
  const isSubscriptionCancelled = membershipData?.subscriptionStatus === 'cancelled' || membershipData?.subscriptionCancelled;

  // Show reactivation UI for cancelled members
  if (isSubscriptionCancelled) {
    return (
      <div className="animate-fade-in">
        <div className="glass-card p-8 rounded-2xl max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <i className="fas fa-times-circle text-3xl text-red-400"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-400" style={{ fontFamily: 'Orbitron, monospace' }}>
              Subscription Cancelled
            </h2>
            <p className="text-gray-300">
              Your membership has been cancelled. Your portal is currently frozen and you can only access membership management.
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Reactivation Options */}
            <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Reactivate Your Membership</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowPersonalDataUpdate(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold transition-colors text-center"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <i className="fas fa-user-edit text-2xl"></i>
                    <div>
                      <div className="font-semibold">Update Personal Data</div>
                      <div className="text-sm opacity-90">Review and update your information</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowMembershipPlans(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold transition-colors text-center"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <i className="fas fa-credit-card text-2xl"></i>
                    <div>
                      <div className="font-semibold">Choose New Plan</div>
                      <div className="text-sm opacity-90">Select a membership plan</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Current Status */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="text-center">
                <div className="text-gray-300 text-sm mb-2">Portal Status</div>
                <div className="text-red-400 font-semibold">FROZEN</div>
                <div className="text-gray-400 text-xs mt-1">
                  All features locked except membership management
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-8 rounded-2xl max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Membership Details
        </h2>
        
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-green-400 mb-4">Current Plan</h3>
            <div className="space-y-2">
              <p><strong>Plan:</strong> {currentPlan.name || 'No Plan'}</p>
              <p><strong>Start Date:</strong> {currentPlan.start_date ? new Date(currentPlan.start_date).toLocaleDateString() : 'Not set'}</p>
              <p><strong>End Date:</strong> {currentPlan.end_date ? new Date(currentPlan.end_date).toLocaleDateString() : 'Not set'}</p>
              <p><strong>Price:</strong> {currentPlan.price ? `$${currentPlan.price}` : 'Not set'}</p>
              <p><strong>Status:</strong> 
                {membershipData?.subscriptionPaused ? (
                  <span className="text-yellow-400">Paused</span>
                ) : (
                  <span className="text-green-400">Active</span>
                )}
              </p>
              {membershipData?.subscriptionPaused && membershipData?.pauseDetails && (
                <p><strong>Pause Ends:</strong> <span className="text-yellow-400">
                  {new Date(membershipData.pauseDetails.pause_end_date).toLocaleDateString()}
                </span></p>
              )}
              {currentPlan.days_remaining !== null && (
                <p><strong>Days Remaining:</strong> {currentPlan.days_remaining} days</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Auto-Renew</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => {
                    setAutoRenew(e.target.checked);
                    showToast(`Auto-renew ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleChangePlan}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Change Plan
              </button>
              {membershipData?.subscriptionPaused ? (
              <button
                  onClick={async () => {
                    try {
                      const data = await memberApi.resumeSubscription();
                      if (data.success) {
                        showToast(data.message, 'success');
                        // Refresh membership data
                        const updatedData = await memberApi.getDashboard();
                        onMembershipUpdate(updatedData);
                      } else {
                        showToast(data.error || 'Failed to resume subscription', 'error');
                      }
                    } catch (error) {
                      console.error('Failed to resume subscription:', error);
                      showToast('Failed to resume subscription', 'error');
                    }
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Resume Subscription
                </button>
              ) : (
                <button
                  onClick={handlePauseSubscription}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Pause Subscription
              </button>
              )}
              <button
                onClick={handleCancelSubscription}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Change Modal */}
      {showPlanChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Change Your Plan</h3>
            
            <div className="space-y-4">
              {availablePlans.map((plan) => (
                <div key={plan.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                      <p className="text-gray-300 text-sm">{plan.description}</p>
                      <div className="mt-2 space-y-1">
                        {plan.features && plan.features.map((feature: string, index: number) => (
                          <p key={index} className="text-green-400 text-sm">• {feature}</p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">${plan.price}</p>
                      <p className="text-gray-400 text-sm">{plan.duration_months === 12 ? 'Yearly' : 'Monthly'}</p>
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          calculatePlanChange(plan.id);
                        }}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                      >
                        Select Plan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowPlanChangeModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && planChangeDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Plan Change Summary</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-white"><strong>From:</strong> {planChangeDetails.currentPlan.name}</p>
                <p className="text-white"><strong>To:</strong> {planChangeDetails.newPlan.name}</p>
                <p className="text-green-400"><strong>Current Plan Balance:</strong> ${planChangeDetails.currentPlanBalance}</p>
                <p className="text-blue-400"><strong>New Plan Price:</strong> ${planChangeDetails.newPlan.price}</p>
                <p className="text-yellow-400"><strong>Difference:</strong> ${planChangeDetails.balanceDifference}</p>
              </div>
              
              <p className="text-white text-center">{planChangeDetails.message}</p>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={initiatePlanChange}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment/Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-blue-400 mb-4">
              {planChangeDetails?.paymentRequired ? 'Complete Payment' : 'Confirm Plan Change'}
            </h3>
            
            <div className="space-y-4">
              {planChangeDetails?.paymentRequired ? (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-white text-center">Amount to pay: <span className="text-green-400 font-bold">${planChangeDetails.paymentAmount}</span></p>
                  <p className="text-gray-300 text-sm text-center mt-2">You will be redirected to our secure payment gateway</p>
                </div>
              ) : (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-white text-center">Please confirm your identity to complete the plan change</p>
                </div>
              )}
              
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              {planChangeDetails?.paymentRequired ? (
                <button
                  onClick={handlePayment}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Proceed to Payment
                </button>
              ) : (
                <button
                  onClick={confirmPlanChange}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pause Subscription Wizard */}
      {showPauseWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            {pauseStep === 1 && (
              <>
                <h3 className="text-xl font-bold text-blue-400 mb-4">Pause Your Subscription</h3>
                <p className="text-gray-300 mb-6 text-center">
                  Choose how long you'd like to pause your subscription. Your membership will be extended by the same number of days.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handlePauseDurationSelect(15)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Pause for 15 Days
                  </button>
                  <button
                    onClick={() => handlePauseDurationSelect(30)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Pause for 1 Month (30 Days)
                  </button>
                  <button
                    onClick={() => handlePauseDurationSelect(90)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Pause for 3 Months (90 Days)
                  </button>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={closePauseWizard}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {pauseStep === 2 && (
              <>
                <h3 className="text-xl font-bold text-blue-400 mb-4">Confirm Pause</h3>
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <p className="text-white text-center mb-2">
                    Your subscription will be paused for <span className="text-yellow-400 font-bold">{selectedPauseDuration} days</span>
                  </p>
                  <p className="text-gray-300 text-sm text-center">
                    During this time, your membership will be extended by {selectedPauseDuration} days, so you won't lose any time.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setPauseStep(1)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={confirmPauseSubscription}
                    disabled={pauseLoading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                  >
                    {pauseLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Confirm Pause'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-xl max-w-sm w-full mx-4 animate-slide-up transform transition-all duration-500 hover:shadow-xl hover:shadow-red-500/25 relative overflow-hidden group">
            {/* Background gradient and shimmer effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-red-500/20 to-red-600/20 rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 animate-shimmer"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-400/60 rounded-full animate-pulseGlow"></div>
            <div className="absolute bottom-3 left-3 w-1 h-1 bg-red-400/40 rounded-full animate-pulseGlow" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Main content */}
            <div className="relative z-10 text-center">
              {/* Icon and title */}
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full border border-red-400/30 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-exclamation-triangle text-2xl text-red-400 group-hover:text-red-300 transition-colors duration-300"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300" style={{ fontFamily: 'Orbitron, monospace' }}>
                  Cancel Subscription
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  This action cannot be undone. Your portal will be frozen.
                </p>
              </div>
              
              {/* Cancellation Details */}
              {cancellationDetails && (
                <div className="bg-gradient-to-br from-red-500/10 via-red-600/10 to-red-500/10 rounded-lg p-3 border border-red-400/20 mb-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-red-200 text-xs font-medium mb-2">What You'll Lose</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400 mb-1">
                          {cancellationDetails.daysLeft}
                        </div>
                        <div className="text-gray-300 text-xs">Days Left</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-400 mb-1">
                          ${cancellationDetails.valueLost}
                        </div>
                        <div className="text-gray-300 text-xs">Value Lost</div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-gray-300 text-xs mb-1">{cancellationDetails.planName}</div>
                      <div className="text-red-200 text-xs">
                        Ends: {new Date(cancellationDetails.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Warning Message */}
              <div className="bg-gradient-to-br from-red-500/10 via-red-600/10 to-red-500/10 rounded-lg p-3 border border-red-400/20 mb-4">
                <div className="flex items-start space-x-2">
                  <i className="fas fa-info-circle text-red-400 text-xs mt-0.5"></i>
                  <div className="text-xs text-red-200 text-left">
                    <p className="font-semibold mb-1">After cancellation:</p>
                    <ul className="space-y-0.5 text-xs">
                      <li>• Portal will be frozen</li>
                      <li>• Only membership tab accessible</li>
                      <li>• Can reactivate anytime</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 active:scale-95 relative overflow-hidden group text-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Keep Subscription</span>
                </button>
                
                <button
                  onClick={confirmCancellation}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-600/50 disabled:to-red-700/50 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 active:scale-95 relative overflow-hidden group text-sm disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Membership Plans Modal */}
      {showMembershipPlans && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-green-400 mb-4">Select New Membership Plan</h3>
            <div className="space-y-4">
              {availablePlans.map((plan) => (
                <div key={plan.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                      <p className="text-gray-300 text-sm">{plan.description}</p>
                      <div className="mt-2 space-y-1">
                        {plan.features && plan.features.map((feature: string, index: number) => (
                          <p key={index} className="text-green-400 text-sm">• {feature}</p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">${plan.price}</p>
                      <p className="text-gray-400 text-sm">{plan.duration_months === 12 ? 'Yearly' : 'Monthly'}</p>
                      <button
                        onClick={() => handleNewMembershipSelection(plan)}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                      >
                        Select Plan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowMembershipPlans(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Data Update Modal */}
      {showPersonalDataUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-purple-400 mb-4">Update Personal Data</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={personalDataForm.firstName}
                  onChange={(e) => setPersonalDataForm({ ...personalDataForm, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={personalDataForm.lastName}
                  onChange={(e) => setPersonalDataForm({ ...personalDataForm, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={personalDataForm.email}
                  onChange={(e) => setPersonalDataForm({ ...personalDataForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={personalDataForm.phone}
                  onChange={(e) => setPersonalDataForm({ ...personalDataForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={personalDataForm.address}
                  onChange={(e) => setPersonalDataForm({ ...personalDataForm, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="Enter address"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handlePersonalDataUpdate}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Update Data
                </button>
                <button
                  onClick={() => setShowPersonalDataUpdate(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Flow */}
      {cancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-2xl text-yellow-400"></i>
              </div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Subscription Cancelled</h3>
              <p className="text-gray-300 text-sm">
                Your subscription has been cancelled. Your portal is now frozen and you can only access the membership tab.
              </p>
            </div>
            
            {/* Portal Status */}
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-yellow-500/20">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <i className="fas fa-lock text-yellow-400"></i>
                <span className="text-white font-semibold">Portal Status: Frozen</span>
              </div>
              <p className="text-gray-300 text-sm text-center">
                All features are locked except membership management
              </p>
            </div>
            
            {/* Next Steps */}
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-semibold text-white text-center">What would you like to do next?</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setShowPersonalDataUpdate(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-user-edit text-lg"></i>
                    <div>
                      <div className="font-semibold">Update Personal Data</div>
                      <div className="text-sm opacity-90">Review and update your information before choosing a new plan</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowMembershipPlans(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-credit-card text-lg"></i>
                    <div>
                      <div className="font-semibold">Choose New Plan</div>
                      <div className="text-sm opacity-90">Skip data update and go directly to membership plans</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setCancelConfirmation(false)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Membership Payment Modal */}
      {showPaymentModal && selectedNewPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-green-400 mb-4">Complete New Membership</h3>
            
            {/* Plan Summary */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">{selectedNewPlan.name}</h4>
              <p className="text-gray-300 text-sm mb-3">{selectedNewPlan.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Price:</span>
                <span className="text-2xl font-bold text-green-400">${selectedNewPlan.price}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-300">Duration:</span>
                <span className="text-white">{selectedNewPlan.duration_months === 12 ? 'Yearly' : 'Monthly'}</span>
              </div>
            </div>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="credit_card" defaultChecked className="text-green-500" />
                  <span className="text-white">Credit Card</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="debit_card" className="text-green-500" />
                  <span className="text-white">Debit Card</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="bank_transfer" className="text-green-500" />
                  <span className="text-white">Bank Transfer</span>
                </label>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewMembershipPayment}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-600/50 text-white py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  'Complete Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WorkoutSchedule = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMuscleGroup, setShowAddMuscleGroup] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showWorkoutLog, setShowWorkoutLog] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [customMuscleGroupName, setCustomMuscleGroupName] = useState('');
  const [scheduleName, setScheduleName] = useState('');
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [muscleGroupToRemove, setMuscleGroupToRemove] = useState<any>(null);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [exerciseSets, setExerciseSets] = useState<Array<{weight: string, reps: string, restSeconds: number}>>([
    { weight: '', reps: '8-12', restSeconds: 60 }
  ]);
  const [workoutLogData, setWorkoutLogData] = useState({
    workoutDate: new Date().toISOString().split('T')[0],
    workoutType: '',
    durationMinutes: 0,
    caloriesBurned: 0,
    notes: '',
    exercises: [] as any[],
    // Enhanced workout logging fields
    startTime: '',
    endTime: '',
    energyLevel: 5, // 1-10 scale
    difficulty: 5, // 1-10 scale
    mood: 'Good',
    sleepQuality: 7, // 1-10 scale
    hydration: 8, // 1-10 scale
    preWorkoutMeal: '',
    postWorkoutMeal: '',
    supplements: [] as string[],
    bodyWeight: '',
    bodyFatPercentage: '',
    muscleSoreness: 'None', // None, Light, Moderate, Heavy
    cardioIntensity: 'Moderate', // Low, Moderate, High
    workoutFocus: 'Strength', // Strength, Hypertrophy, Endurance, Power, Flexibility
    personalNotes: ''
  });

  // New state variables for enhanced workout logging
  const [showExerciseLog, setShowExerciseLog] = useState(false);
  const [currentExerciseLog, setCurrentExerciseLog] = useState({
    exerciseName: '',
    muscleGroup: '',
    sets: [{ weight: '', reps: '', restSeconds: 60, rpe: 7, notes: '' }]
  });
  const [loggedExercises, setLoggedExercises] = useState<Array<{
    id: number;
    exerciseName: string;
    muscleGroup: string;
    sets: Array<{ weight: string; reps: string; restSeconds: number; rpe: number; notes: string }>;
  }>>([]);
  const [showSupplementModal, setShowSupplementModal] = useState(false);
  const [supplementInput, setSupplementInput] = useState('');

  const days = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
    { id: 0, name: 'Sunday' }
  ];

  // Fetch workout data on component mount
  useEffect(() => {
    fetchWorkoutData();
    fetchMuscleGroups();
    fetchExercises();
  }, []);

  const fetchWorkoutData = async () => {
    try {
      const data = await memberApi.getWorkoutSchedule();
      setWorkoutData(data || []); // Ensure we always have an array
    } catch (error) {
      console.error('Failed to fetch workout data:', error);
      // Don't show error toast for workout data, just set empty array
      setWorkoutData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMuscleGroups = async () => {
    try {
      const data = await memberApi.getMuscleGroups();
      setMuscleGroups(data || []); // Ensure we always have an array
    } catch (error) {
      console.error('Failed to fetch muscle groups:', error);
      setMuscleGroups([]); // Set empty array on error
    }
  };

  const fetchExercises = async () => {
    try {
      const data = await memberApi.getExercises();
      setExercises(data || []); // Ensure we always have an array
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      setExercises([]); // Set empty array on error
    }
  };

  const getWorkoutForDay = (dayId: number) => {
    return workoutData.find(workout => workout.day_of_week === dayId);
  };

  const handleAddMuscleGroup = async (dayId: number, muscleGroupId: number | null, customName: string, scheduleName: string) => {
    try {
      let muscleGroupName = customName;
      let muscleGroupIdToUse = muscleGroupId;
      
      // If no custom name provided, use the selected muscle group
      if (!customName && muscleGroupId) {
        const muscleGroup = muscleGroups.find(mg => mg.id === muscleGroupId);
        if (!muscleGroup) return;
        muscleGroupName = muscleGroup.name;
        muscleGroupIdToUse = muscleGroup.id;
      } else if (customName && !muscleGroupId) {
        // Custom name provided, create a temporary ID for display
        muscleGroupIdToUse = Date.now(); // Temporary ID for custom muscle groups
      }

      // Check if schedule already exists for this day
      const existingSchedule = workoutData.find(w => w.day_of_week === dayId);
      
      if (existingSchedule) {
        // Add to existing schedule
        const updatedMuscleGroups = [
          ...existingSchedule.muscle_groups,
          {
            muscle_group_id: muscleGroupIdToUse,
            muscle_group_name: muscleGroupName,
            exercises: []
          }
        ];

        const updatedSchedule = {
          dayOfWeek: dayId,
          scheduleName: scheduleName || existingSchedule.schedule_name,
          muscleGroups: updatedMuscleGroups.map((mg: any) => ({
            muscleGroupId: mg.muscle_group_id,
            exercises: mg.exercises || []
          }))
        };

        await memberApi.createWorkoutSchedule(updatedSchedule);
        showToast(`Added ${muscleGroupName} to ${days.find(d => d.id === dayId)?.name}`, 'success');
      } else {
        // Create new schedule
        const newSchedule = {
          dayOfWeek: dayId,
          scheduleName: scheduleName || `${muscleGroupName} Day`,
          muscleGroups: [{
            muscleGroupId: muscleGroupIdToUse,
            exercises: []
          }]
        };

        await memberApi.createWorkoutSchedule(newSchedule);
        showToast(`Created ${scheduleName || muscleGroupName + ' Day'} for ${days.find(d => d.id === dayId)?.name}`, 'success');
      }

      fetchWorkoutData();
      setShowAddMuscleGroup(false);
      setCustomMuscleGroupName(''); // Reset custom name
      setSelectedMuscleGroup(null); // Reset selection
    } catch (error) {
      console.error('Failed to add muscle group:', error);
      showToast('Failed to add muscle group', 'error');
    }
  };

  const handleRemoveMuscleGroup = async (dayId: number, muscleGroupId: number) => {
    try {
      const existingSchedule = workoutData.find(w => w.day_of_week === dayId);
      if (!existingSchedule) return;

      // Remove the specific muscle group
      const updatedMuscleGroups = existingSchedule.muscle_groups.filter(
        (mg: any) => mg.muscle_group_id !== muscleGroupId
      );

      if (updatedMuscleGroups.length === 0) {
        // If no muscle groups left, delete the entire schedule using the schedule ID
        await memberApi.deleteWorkoutSchedule(existingSchedule.id);
        showToast(`Removed workout schedule for ${days.find(d => d.id === dayId)?.name}`, 'success');
      } else {
        // Update the schedule with remaining muscle groups
        const updatedSchedule = {
          dayOfWeek: dayId,
          scheduleName: existingSchedule.schedule_name,
          muscleGroups: updatedMuscleGroups.map((mg: any) => ({
            muscleGroupId: mg.muscle_group_id,
            exercises: mg.exercises || []
          }))
        };

        await memberApi.createWorkoutSchedule(updatedSchedule);
        showToast(`Removed muscle group from ${days.find(d => d.id === dayId)?.name}`, 'success');
      }

      fetchWorkoutData();
    } catch (error) {
      console.error('Failed to remove muscle group:', error);
      showToast('Failed to remove muscle group', 'error');
    }
  };

  const handleRemoveExercise = async (scheduleId: number, exerciseName: string) => {
    try {
      await memberApi.removeExercise(scheduleId, exerciseName);
      showToast(`Removed ${exerciseName} from workout`, 'success');
      fetchWorkoutData();
    } catch (error) {
      console.error('Failed to remove exercise:', error);
      showToast('Failed to remove exercise', 'error');
    }
  };

  const handleAddExercise = async (scheduleId: number, muscleGroupId: number, exerciseId: number | null, exerciseName: string, sets: Array<{weight: string, reps: string, restSeconds: number}>) => {
    try {
      let exerciseIdToUse = exerciseId;
      
      // If no exerciseId provided, create a temporary one for custom exercises
      if (!exerciseId) {
        exerciseIdToUse = Date.now(); // Temporary ID for custom exercises
      }

      // Get current schedule and add exercise
      const currentSchedule = workoutData.find(w => w.id === scheduleId);
      if (!currentSchedule) return;

      const updatedMuscleGroups = currentSchedule.muscle_groups.map((mg: any) => {
        if (mg.muscle_group_id === muscleGroupId) {
          // Create a single exercise entry with all sets
          const newExercise = {
            exerciseId: exerciseIdToUse,
            exerciseName: exerciseName, // Store the actual exercise name
            sets: sets.length, // Total number of sets
            reps: sets.map(set => set.reps).join(', '), // Combine all reps
            weight: sets.map(set => set.weight).join(', '), // Combine all weights
            restSeconds: sets.map(set => set.restSeconds || 60).join(', '), // Combine all rest times
            notes: '', // Default empty notes
            orderIndex: mg.exercises?.length || 0
          };
          
          const updatedExercises = [...(mg.exercises || []), newExercise];
          return { ...mg, exercises: updatedExercises };
        }
        return mg;
      });

      const updatedSchedule = {
        dayOfWeek: currentSchedule.day_of_week,
        scheduleName: currentSchedule.schedule_name,
        muscleGroups: updatedMuscleGroups.map((mg: any) => ({
          muscleGroupId: mg.muscle_group_id,
          exercises: mg.exercises || []
        }))
      };

      await memberApi.createWorkoutSchedule(updatedSchedule);
      showToast(`Added ${exerciseName} with ${sets.length} set(s) to workout`, 'success');
      fetchWorkoutData();
      setShowAddExercise(false);
    } catch (error) {
      console.error('Failed to add exercise:', error);
      showToast('Failed to add exercise', 'error');
    }
  };

  // Helper functions for managing exercise sets
  const addExerciseSet = () => {
    setExerciseSets([...exerciseSets, { weight: '', reps: '8-12', restSeconds: 60 }]);
  };

  const removeExerciseSet = (index: number) => {
    if (exerciseSets.length > 1) {
      setExerciseSets(exerciseSets.filter((_, i) => i !== index));
    }
  };

  const updateExerciseSet = (index: number, field: 'weight' | 'reps' | 'restSeconds', value: string | number) => {
    const updatedSets = [...exerciseSets];
    if (field === 'weight') {
      // For weight, ensure it's a valid number or empty string
      const weightValue = typeof value === 'string' ? value : value.toString();
      updatedSets[index] = { ...updatedSets[index], [field]: weightValue };
    } else {
      updatedSets[index] = { ...updatedSets[index], [field]: value };
    }
    setExerciseSets(updatedSets);
  };

  // Enhanced workout logging helper functions
  const addExerciseSetToLog = () => {
    setCurrentExerciseLog(prev => ({
      ...prev,
      sets: [...prev.sets, { weight: '', reps: '', restSeconds: 60, rpe: 7, notes: '' }]
    }));
  };

  const removeExerciseSetFromLog = (index: number) => {
    if (currentExerciseLog.sets.length > 1) {
      setCurrentExerciseLog(prev => ({
        ...prev,
        sets: prev.sets.filter((_, i) => i !== index)
      }));
    }
  };

  const updateExerciseSetInLog = (index: number, field: string, value: string | number) => {
    setCurrentExerciseLog(prev => ({
      ...prev,
      sets: prev.sets.map((set, i) => 
        i === index ? { ...set, [field]: value } : set
      )
    }));
  };

  const addExerciseToLog = () => {
    if (currentExerciseLog.exerciseName.trim() && currentExerciseLog.muscleGroup.trim()) {
      setLoggedExercises(prev => [...prev, { ...currentExerciseLog, id: Date.now() }]);
      setCurrentExerciseLog({
        exerciseName: '',
        muscleGroup: '',
        sets: [{ weight: '', reps: '', restSeconds: 60, rpe: 7, notes: '' }]
      });
      setShowExerciseLog(false);
    }
  };

  const removeExerciseFromLog = (exerciseId: number) => {
    setLoggedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const addSupplement = () => {
    if (supplementInput.trim()) {
      setWorkoutLogData(prev => ({
        ...prev,
        supplements: [...prev.supplements, supplementInput.trim()]
      }));
      setSupplementInput('');
      setShowSupplementModal(false);
    }
  };

  const removeSupplement = (index: number) => {
    setWorkoutLogData(prev => ({
      ...prev,
      supplements: prev.supplements.filter((_, i) => i !== index)
    }));
  };

  const handleLogWorkout = async () => {
    try {
      // Include logged exercises in the workout data
      const workoutDataToLog = {
        ...workoutLogData,
        exercises: loggedExercises
      };
      
      await memberApi.logWorkout(workoutDataToLog);
      showToast('Workout logged successfully!', 'success');
      setShowWorkoutLog(false);
      
      // Reset all workout log data
      setWorkoutLogData({
        workoutDate: new Date().toISOString().split('T')[0],
        workoutType: '',
        durationMinutes: 0,
        caloriesBurned: 0,
        notes: '',
        exercises: [],
        // Enhanced workout logging fields
        startTime: '',
        endTime: '',
        energyLevel: 5, // 1-10 scale
        difficulty: 5, // 1-10 scale
        mood: 'Good',
        sleepQuality: 7, // 1-10 scale
        hydration: 8, // 1-10 scale
        preWorkoutMeal: '',
        postWorkoutMeal: '',
        supplements: [] as string[],
        bodyWeight: '',
        bodyFatPercentage: '',
        muscleSoreness: 'None', // None, Light, Moderate, Heavy
        cardioIntensity: 'Moderate', // Low, Moderate, High
        workoutFocus: 'Strength', // Strength, Hypertrophy, Endurance, Power, Flexibility
        personalNotes: ''
      });
      
      // Reset logged exercises
      setLoggedExercises([]);
    } catch (error) {
      console.error('Failed to log workout:', error);
      showToast('Failed to log workout', 'error');
    }
  };

  const getAISuggestion = (day: number) => {
    const workout = getWorkoutForDay(day);
    if (!workout || !workout.muscle_groups || workout.muscle_groups.length === 0) {
      return { 
        message: 'No workout plan set for this day. Add exercises to get personalized AI suggestions!', 
        color: 'text-blue-400', 
        bgColor: 'bg-blue-500' 
      };
    }
    
    // Simple AI suggestion based on workout intensity
    const totalExercises = workout.muscle_groups.reduce((total: number, mg: any) => 
      total + (mg.exercises?.length || 0), 0);
    
    if (totalExercises > 8) {
      return { 
        message: 'High volume workout detected! Consider splitting into two sessions or reducing volume for better recovery.', 
        color: 'text-orange-400', 
        bgColor: 'bg-orange-500' 
      };
    } else if (totalExercises > 5) {
      return { 
        message: 'Great balanced workout! This volume should provide optimal muscle stimulation and recovery.', 
        color: 'text-green-400', 
        bgColor: 'bg-green-500' 
      };
    } else {
      return { 
        message: 'Moderate workout volume. Consider adding 1-2 more exercises for better muscle group coverage.', 
        color: 'text-blue-400', 
        bgColor: 'bg-blue-500' 
      };
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
          <p className="text-gray-300">Loading workout schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Weekly Workout Schedule
        </h2>
          <button
            onClick={() => setShowWorkoutLog(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>Log Today's Workout
          </button>
        </div>
        
        {/* Weekly Overview */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <div className="grid grid-cols-7 gap-4">
            {days.map(day => {
              const workout = getWorkoutForDay(day.id);
              const muscleGroupCount = workout?.muscle_groups?.length || 0;
              
              return (
              <button
                  key={day.id}
                  onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                className={`p-4 rounded-lg text-center transition-all duration-300 ${
                    expandedDay === day.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                  <div className="font-bold">{day.name}</div>
                <div className="text-sm opacity-75">
                    {muscleGroupCount > 0 ? `${muscleGroupCount} groups` : 'No plan'}
                </div>
                  {/* Show schedule name if it exists */}
                  {workout?.schedule_name && (
                    <div className="text-xs opacity-60 mt-1 truncate">
                      {workout.schedule_name}
                    </div>
                  )}
              </button>
              );
            })}
          </div>
        </div>

        {/* Expanded Day View */}
        {expandedDay !== null && (
          <div className="glass-card p-6 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-blue-400">
                  {days.find(d => d.id === expandedDay)?.name} Workout
                </h3>
                {/* Display schedule name if it exists */}
                {(() => {
                  const workout = getWorkoutForDay(expandedDay);
                  return workout?.schedule_name ? (
                    <p className="text-sm text-gray-400 mt-1">
                      {workout.schedule_name}
                    </p>
                  ) : null;
                })()}
              </div>
              <button
                onClick={() => {
                  setSelectedDay(expandedDay);
                  setShowAddMuscleGroup(true);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Add Muscle Group
              </button>
            </div>

            {(() => {
              const workout = getWorkoutForDay(expandedDay);
              if (!workout || !workout.muscle_groups || workout.muscle_groups.length === 0) {
                return (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <i className="fas fa-dumbbell text-4xl mb-3"></i>
                      <p className="text-lg">No workout plan set for {days.find(d => d.id === expandedDay)?.name}</p>
                      <p className="text-sm text-gray-500 mt-2">Click "Add Muscle Group" to start building your workout plan</p>
                    </div>
                  </div>
                );
              }

              return (
                <>
            {/* Workout Table */}
            <div className="overflow-x-auto minimal-scroll">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3 text-blue-400">Muscle Group</th>
                    <th className="text-left p-3 text-blue-400">Exercises</th>
                    <th className="text-left p-3 text-blue-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                        {workout.muscle_groups.map((muscleGroup: any) => (
                          <tr key={muscleGroup.muscle_group_id} className="border-b border-gray-700">
                            <td className="p-3 font-semibold text-green-400">{muscleGroup.muscle_group_name}</td>
                      <td className="p-3">
                              <div className="space-y-2">
                                {muscleGroup.exercises && muscleGroup.exercises.length > 0 ? (
                                  (() => {
                                    return muscleGroup.exercises.map((exercise: any) => {
                                      // Parse the comma-separated values
                                      const exerciseName = exercise.exercise_name || 'Unknown Exercise';
                                      const weights = exercise.weight ? exercise.weight.split(',').map((w: string) => w.trim()) : ['0'];
                                      const reps = exercise.reps ? exercise.reps.split(',').map((r: string) => r.trim()) : ['8-12'];
                                      const restTimes = exercise.rest_seconds ? exercise.rest_seconds.split(',').map((r: string) => r.trim()) : ['60'];
                                      const setCount = parseInt(exercise.sets) || 1;
                                      
                                      return (
                                        <div key={`${exerciseName}-${exercise.exercise_id}`} className="bg-gray-800 p-3 rounded-lg">
                                          <div className="flex justify-between items-center mb-2">
                                            <div className="font-medium text-white">{exerciseName}</div>
                                            <button
                                              onClick={() => {
                                                const currentSchedule = workoutData.find(w => w.day_of_week === expandedDay);
                                                if (currentSchedule) {
                                                  handleRemoveExercise(currentSchedule.id, exerciseName);
                                                }
                                              }}
                                              className="text-red-400 hover:text-red-300 text-sm bg-red-500/10 hover:bg-red-500/20 p-1 rounded-full transition-all duration-200"
                                              title="Remove exercise"
                                            >
                                              <i className="fas fa-times"></i>
                                            </button>
                                          </div>
                                          <div className="space-y-1">
                                            {Array.from({ length: setCount }, (_, setIndex) => (
                                              <div key={setIndex} className="flex items-center space-x-3 text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
                                                <span className="font-medium">Set {setIndex + 1}:</span>
                                                <span>Weight: {weights[setIndex] || weights[0] || '0'}kg</span>
                                                <span>Reps: {reps[setIndex] || reps[0] || '8-12'}</span>
                                                <span>Rest: {restTimes[setIndex] || restTimes[0] || '60'}s</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    });
                                  })()
                                ) : (
                                  <div className="text-gray-500 text-sm">No exercises added</div>
                                )}
                        </div>
                      </td>
                      <td className="p-3">
                              <div className="flex space-x-2">
                        <button
                                  onClick={() => {
                                    setSelectedMuscleGroup(muscleGroup);
                                    setSelectedDay(expandedDay);
                                    setShowAddExercise(true);
                                  }}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                                >
                                  <i className="fas fa-plus mr-2"></i>Add Exercise
                        </button>
                                <button
                                  onClick={() => {
                                    setMuscleGroupToRemove(muscleGroup);
                                    setShowRemoveConfirmation(true);
                                  }}
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                                >
                                  <i className="fas fa-trash mr-2"></i>Remove
                                </button>
                              </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Suggestions Bar */}
                  {expandedDay !== null && (
            <div className={`mt-6 p-4 rounded-lg ${getAISuggestion(expandedDay).bgColor} bg-opacity-20 border border-current`}>
              <div className="flex items-center">
                <i className="fas fa-robot mr-3 text-2xl"></i>
                <div>
                  <div className={`font-bold ${getAISuggestion(expandedDay).color}`}>AI Suggestion:</div>
                  <div className={`${getAISuggestion(expandedDay).color}`}>
                    {getAISuggestion(expandedDay).message}
                  </div>
                </div>
              </div>
            </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Add Muscle Group Modal */}
        {showAddMuscleGroup && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
            <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-green-400">Add Muscle Group</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Muscle Group Name</label>
                  <div className="relative">
                <input
                  type="text"
                      value={customMuscleGroupName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomMuscleGroupName(value);
                        
                        // Check if the typed value matches any predefined muscle group
                        const matchingGroup = muscleGroups.find(mg => 
                          mg.name.toLowerCase().includes(value.toLowerCase())
                        );
                        
                        if (matchingGroup && value.toLowerCase() === matchingGroup.name.toLowerCase()) {
                          setSelectedMuscleGroup(matchingGroup);
                        } else {
                          setSelectedMuscleGroup(null);
                        }
                      }}
                      placeholder="Type custom name or select from list"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none pr-10"
                    />
                    <button
                      onClick={() => setCustomMuscleGroupName('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  {/* Dropdown suggestions */}
                  {customMuscleGroupName.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-y-auto bg-gray-800 rounded-lg border border-gray-600">
                      {muscleGroups
                        .filter(mg => mg.name.toLowerCase().includes(customMuscleGroupName.toLowerCase()))
                        .map(mg => (
                          <button
                            key={mg.id}
                            onClick={() => {
                              setCustomMuscleGroupName(mg.name);
                              setSelectedMuscleGroup(mg);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                          >
                            {mg.name}
                          </button>
                        ))
                      }
                    </div>
                  )}
                </div>

                {/* Schedule Name - Only show if this is the first muscle group */}
                {(() => {
                  const workout = getWorkoutForDay(selectedDay);
                  const isFirstMuscleGroup = !workout || !workout.muscle_groups || workout.muscle_groups.length === 0;
                  
                  return isFirstMuscleGroup ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">Schedule Name (Optional)</label>
                      <input
                        type="text"
                        value={scheduleName}
                        onChange={(e) => setScheduleName(e.target.value)}
                        placeholder="e.g., Push Day, Upper Body"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none"
                      />
                    </div>
                  ) : null;
                })()}

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      if (selectedDay !== null && customMuscleGroupName.trim()) {
                        // Check if this is the first muscle group to determine if we should use schedule name
                        const workout = getWorkoutForDay(selectedDay);
                        const isFirstMuscleGroup = !workout || !workout.muscle_groups || workout.muscle_groups.length === 0;
                        
                        if (isFirstMuscleGroup) {
                          // First muscle group - use schedule name if provided
                          handleAddMuscleGroup(selectedDay, selectedMuscleGroup?.id || null, customMuscleGroupName.trim(), scheduleName);
                        } else {
                          // Additional muscle groups - don't use schedule name
                          handleAddMuscleGroup(selectedDay, selectedMuscleGroup?.id || null, customMuscleGroupName.trim(), '');
                        }
                      }
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                    disabled={!customMuscleGroupName.trim()}
                  >
                    Add Group
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMuscleGroup(false);
                      setCustomMuscleGroupName('');
                      setSelectedMuscleGroup(null);
                      setScheduleName('');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Exercise Modal */}
        {showAddExercise && selectedMuscleGroup && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
            <div className="glass-card p-8 rounded-3xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-blue-400/20 shadow-2xl shadow-blue-500/10">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>Add Exercise</h3>
                <p className="text-gray-400 text-sm">Configure your exercise with custom sets and parameters</p>
      </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3 text-blue-300">Exercise Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customExerciseName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomExerciseName(value);
                        
                        // Check if the typed value matches any predefined exercise
                        const matchingExercise = exercises.find(ex => 
                          ex.name.toLowerCase().includes(value.toLowerCase())
                        );
                        
                        if (matchingExercise && value.toLowerCase() === matchingExercise.name.toLowerCase()) {
                          // Auto-select the matching exercise
                        }
                      }}
                      placeholder="Type custom exercise name or select from suggestions"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 pr-10 text-white placeholder-gray-500 transition-all duration-200"
                    />
                    <button
                      onClick={() => setCustomExerciseName('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 p-1 rounded-full transition-all duration-200"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  {/* Exercise suggestions */}
                  {customExerciseName.length > 0 && (
                    <div className="mt-3 max-h-32 overflow-y-auto bg-gray-800/50 rounded-xl border border-blue-400/30 shadow-lg">
                      {exercises
                        .filter(ex => 
                          ex.name.toLowerCase().includes(customExerciseName.toLowerCase()) &&
                          (ex.primary_muscle_group_id === selectedMuscleGroup.muscle_group_id || !selectedMuscleGroup.muscle_group_id)
                        )
                        .map(ex => (
                          <button
                            key={ex.id}
                            onClick={() => {
                              setCustomExerciseName(ex.name);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-500/10 text-gray-300 hover:text-blue-300 transition-all duration-200 border-b border-blue-400/10 last:border-b-0"
                          >
                            {ex.name}
                          </button>
                        ))
                      }
                    </div>
                  )}
                </div>

                {/* Sets Management */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-blue-300">Exercise Sets</label>
                    <button
                      onClick={addExerciseSet}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                      <i className="fas fa-plus mr-2"></i>Add Set
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {exerciseSets.map((set, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-2xl border border-blue-400/20 shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">Set {index + 1}</span>
                          {exerciseSets.length > 1 && (
                            <button
                              onClick={() => removeExerciseSet(index)}
                              className="text-red-400 hover:text-red-300 text-sm bg-red-500/10 hover:bg-red-500/20 p-2 rounded-full transition-all duration-200"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-blue-300 mb-2 font-medium">Weight (kg)</label>
                            <input
                              type="text"
                              value={set.weight}
                              onChange={(e) => updateExerciseSet(index, 'weight', e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 bg-gray-800/50 border border-blue-400/30 rounded-xl text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-white placeholder-gray-500 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-blue-300 mb-2 font-medium">Reps</label>
                            <input
                              type="text"
                              value={set.reps}
                              onChange={(e) => updateExerciseSet(index, 'reps', e.target.value)}
                              placeholder="8-12"
                              className="w-full px-3 py-2 bg-gray-800/50 border border-blue-400/30 rounded-xl text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-white placeholder-gray-500 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-blue-300 mb-2 font-medium">Rest (sec)</label>
                            <input
                              type="number"
                              min="0"
                              value={set.restSeconds}
                              onChange={(e) => updateExerciseSet(index, 'restSeconds', parseInt(e.target.value) || 60)}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-blue-400/30 rounded-xl text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-white placeholder-gray-500 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => {
                      if (selectedDay !== null && customExerciseName.trim()) {
                        const currentSchedule = workoutData.find(w => w.day_of_week === selectedDay);
                        if (currentSchedule) {
                          // Add exercise with multiple sets
                          handleAddExercise(
                            currentSchedule.id,
                            selectedMuscleGroup.muscle_group_id,
                            null, // No predefined exercise ID for custom exercises
                            customExerciseName.trim(),
                            exerciseSets
                          );
                        }
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!customExerciseName.trim() || exerciseSets.length === 0}
                  >
                    <i className="fas fa-plus mr-2"></i>Add Exercise
                  </button>
                  <button
                    onClick={() => {
                      setShowAddExercise(false);
                      setCustomExerciseName('');
                      setExerciseSets([{ weight: '', reps: '8-12', restSeconds: 60 }]);
                    }}
                    className="flex-1 bg-gray-600/50 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 border border-gray-500/30 hover:border-gray-500/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Workout Log Modal */}
        {showWorkoutLog && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
            <div className="glass-card p-8 rounded-3xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-blue-400/20 shadow-2xl shadow-blue-500/10">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-blue-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                  Log Your Workout
                </h3>
                <p className="text-gray-400">Track every detail of your fitness journey</p>
              </div>

              <div className="space-y-6">
                {/* Basic Workout Info */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-blue-400/20">
                  <h4 className="text-xl font-semibold text-blue-400 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Workout Date</label>
                      <input
                        type="date"
                        value={workoutLogData.workoutDate}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, workoutDate: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Workout Type</label>
                      <input
                        type="text"
                        placeholder="e.g., Push Day, Cardio, Strength"
                        value={workoutLogData.workoutType}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, workoutType: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Start Time</label>
                      <input
                        type="time"
                        value={workoutLogData.startTime}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, startTime: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">End Time</label>
                      <input
                        type="time"
                        value={workoutLogData.endTime}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, endTime: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-blue-400/20">
                  <h4 className="text-xl font-semibold text-blue-400 mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Duration (minutes)</label>
                      <input
                        type="number"
                        min="0"
                        value={workoutLogData.durationMinutes}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, durationMinutes: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Calories Burned</label>
                      <input
                        type="number"
                        min="0"
                        value={workoutLogData.caloriesBurned}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, caloriesBurned: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Energy Level (1-10)</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={workoutLogData.energyLevel}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, energyLevel: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center text-sm text-gray-400 mt-1">{workoutLogData.energyLevel}/10</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Difficulty (1-10)</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={workoutLogData.difficulty}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, difficulty: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center text-sm text-gray-400 mt-1">{workoutLogData.difficulty}/10</div>
                    </div>
                  </div>
                </div>

                {/* Body Metrics */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-blue-400/20">
                  <h4 className="text-xl font-semibold text-blue-400 mb-4">Body Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Body Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={workoutLogData.bodyWeight}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, bodyWeight: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Body Fat %</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={workoutLogData.bodyFatPercentage}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, bodyFatPercentage: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Muscle Soreness</label>
                      <select
                        value={workoutLogData.muscleSoreness}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, muscleSoreness: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white transition-all duration-200"
                      >
                        <option value="None">None</option>
                        <option value="Light">Light</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Heavy">Heavy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Workout Focus</label>
                      <select
                        value={workoutLogData.workoutFocus}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, workoutFocus: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white transition-all duration-200"
                      >
                        <option value="Strength">Strength</option>
                        <option value="Hypertrophy">Hypertrophy</option>
                        <option value="Endurance">Endurance</option>
                        <option value="Power">Power</option>
                        <option value="Flexibility">Flexibility</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Nutrition & Wellness */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-blue-400/20">
                  <h4 className="text-xl font-semibold text-blue-400 mb-4">Nutrition & Wellness</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Pre-Workout Meal</label>
                      <input
                        type="text"
                        placeholder="What did you eat before working out?"
                        value={workoutLogData.preWorkoutMeal}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, preWorkoutMeal: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Post-Workout Meal</label>
                      <input
                        type="text"
                        placeholder="What did you eat after working out?"
                        value={workoutLogData.postWorkoutMeal}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, postWorkoutMeal: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Sleep Quality (1-10)</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={workoutLogData.sleepQuality}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, sleepQuality: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center text-sm text-gray-400 mt-1">{workoutLogData.sleepQuality}/10</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Hydration (1-10)</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={workoutLogData.hydration}
                        onChange={(e) => setWorkoutLogData({ ...workoutLogData, hydration: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center text-sm text-gray-400 mt-1">{workoutLogData.hydration}/10</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-gray-300">Supplements</label>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => setShowSupplementModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                      >
                        <i className="fas fa-plus mr-2"></i>Add Supplement
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {workoutLogData.supplements.map((supplement, index) => (
                        <span
                          key={index}
                          className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {supplement}
                          <button
                            onClick={() => removeSupplement(index)}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Exercise Log */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-blue-400/20">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-semibold text-blue-400">Exercise Log</h4>
                    <button
                      onClick={() => setShowExerciseLog(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                    >
                      <i className="fas fa-plus mr-2"></i>Add Exercise
                    </button>
                  </div>
                  
                  {loggedExercises.length > 0 ? (
                    <div className="space-y-3">
                      {loggedExercises.map((exercise) => (
                        <div key={exercise.id} className="bg-gray-800/50 p-4 rounded-xl border border-blue-400/20">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium text-white">{exercise.exerciseName}</div>
                            <button
                              onClick={() => removeExerciseFromLog(exercise.id)}
                              className="text-red-400 hover:text-red-300 text-sm bg-red-500/10 hover:bg-red-500/20 p-1 rounded-full transition-all duration-200"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                          <div className="text-sm text-gray-400 mb-2">{exercise.muscleGroup}</div>
                          <div className="space-y-1">
                            {exercise.sets.map((set, setIndex) => (
                              <div key={setIndex} className="flex items-center space-x-3 text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded">
                                <span className="font-medium">Set {setIndex + 1}:</span>
                                <span>Weight: {set.weight}kg</span>
                                <span>Reps: {set.reps}</span>
                                <span>Rest: {set.restSeconds}s</span>
                                <span>RPE: {set.rpe}/10</span>
                                {set.notes && <span>Notes: {set.notes}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-dumbbell text-4xl mb-3"></i>
                      <p>No exercises logged yet. Click "Add Exercise" to start logging your workout.</p>
                    </div>
                  )}
                </div>

                {/* Personal Notes */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-blue-400/20">
                  <h4 className="text-xl font-semibold text-blue-400 mb-4">Personal Notes</h4>
                  <textarea
                    placeholder="How did the workout feel? Any notes, achievements, or areas for improvement?"
                    value={workoutLogData.personalNotes}
                    onChange={(e) => setWorkoutLogData({ ...workoutLogData, personalNotes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                    rows={4}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleLogWorkout}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                  >
                    <i className="fas fa-save mr-2"></i>Save Workout Log
                  </button>
                  <button
                    onClick={() => setShowWorkoutLog(false)}
                    className="flex-1 bg-gray-600/50 hover:bg-gray-600 text-white py-4 rounded-xl font-semibold transition-all duration-200 border border-gray-500/30 hover:border-gray-500/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Muscle Group Confirmation Modal */}
        {showRemoveConfirmation && muscleGroupToRemove && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
            <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-red-400">Remove Muscle Group</h3>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Are you sure you want to remove <span className="font-semibold text-white">{muscleGroupToRemove.muscle_group_name}</span> from your workout?
                </p>
                <p className="text-sm text-gray-400">
                  This will also remove all exercises associated with this muscle group.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      if (expandedDay !== null) {
                        handleRemoveMuscleGroup(expandedDay, muscleGroupToRemove.muscle_group_id);
                      }
                      setShowRemoveConfirmation(false);
                      setMuscleGroupToRemove(null);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => {
                      setShowRemoveConfirmation(false);
                      setMuscleGroupToRemove(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Exercise to Log Modal */}
        {showExerciseLog && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
            <div className="glass-card p-8 rounded-3xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-blue-400/20 shadow-2xl shadow-blue-500/10">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                  Add Exercise to Log
                </h3>
                <p className="text-gray-400">Log the details of this exercise</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Exercise Name</label>
                  <input
                    type="text"
                    value={currentExerciseLog.exerciseName}
                    onChange={(e) => setCurrentExerciseLog(prev => ({ ...prev, exerciseName: e.target.value }))}
                    placeholder="e.g., Bench Press, Squats"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Muscle Group</label>
                  <input
                    type="text"
                    value={currentExerciseLog.muscleGroup}
                    onChange={(e) => setCurrentExerciseLog(prev => ({ ...prev, muscleGroup: e.target.value }))}
                    placeholder="e.g., Chest, Legs, Back"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                  />
                </div>

                {/* Exercise Sets */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-300">Exercise Sets</label>
                    <button
                      onClick={addExerciseSetToLog}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                      <i className="fas fa-plus mr-1"></i>Add Set
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {currentExerciseLog.sets.map((set, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-2xl border border-blue-400/20">
                        <div className="flex justify-between items-center mb-3">
                          <span className="bg-blue-500/10 px-3 py-1 rounded-full text-sm text-blue-400 font-medium">
                            Set {index + 1}
                          </span>
                          {currentExerciseLog.sets.length > 1 && (
                            <button
                              onClick={() => removeExerciseSetFromLog(index)}
                              className="text-red-400 hover:text-red-300 text-sm bg-red-500/10 hover:bg-red-500/20 p-2 rounded-full transition-all duration-200"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-400">Weight (kg)</label>
                            <input
                              type="text"
                              value={set.weight}
                              onChange={(e) => updateExerciseSetInLog(index, 'weight', e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 bg-gray-900/50 border border-blue-400/30 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-400">Reps</label>
                            <input
                              type="text"
                              value={set.reps}
                              onChange={(e) => updateExerciseSetInLog(index, 'reps', e.target.value)}
                              placeholder="8-12"
                              className="w-full px-3 py-2 bg-gray-900/50 border border-blue-400/30 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-400">Rest (sec)</label>
                            <input
                              type="number"
                              min="0"
                              value={set.restSeconds}
                              onChange={(e) => updateExerciseSetInLog(index, 'restSeconds', parseInt(e.target.value) || 60)}
                              className="w-full px-3 py-2 bg-gray-900/50 border border-blue-400/30 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-400">RPE (1-10)</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={set.rpe}
                              onChange={(e) => updateExerciseSetInLog(index, 'rpe', parseInt(e.target.value) || 7)}
                              className="w-full px-3 py-2 bg-gray-900/50 border border-blue-400/30 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white transition-all duration-200"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="block text-xs font-medium mb-1 text-gray-400">Notes</label>
                          <input
                            type="text"
                            value={set.notes}
                            onChange={(e) => updateExerciseSetInLog(index, 'notes', e.target.value)}
                            placeholder="Optional notes for this set"
                            className="w-full px-3 py-2 bg-gray-900/50 border border-blue-400/30 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={addExerciseToLog}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                    disabled={!currentExerciseLog.exerciseName.trim() || !currentExerciseLog.muscleGroup.trim()}
                  >
                    <i className="fas fa-plus mr-2"></i>Add Exercise
                  </button>
                  <button
                    onClick={() => setShowExerciseLog(false)}
                    className="flex-1 bg-gray-600/50 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 border border-gray-500/30 hover:border-gray-500/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Supplement Modal */}
        {showSupplementModal && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
            <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4 border border-blue-400/20 shadow-2xl shadow-blue-500/10">
              <h3 className="text-xl font-bold mb-4 text-blue-400">Add Supplement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Supplement Name</label>
                  <input
                    type="text"
                    value={supplementInput}
                    onChange={(e) => setSupplementInput(e.target.value)}
                    placeholder="e.g., Protein Powder, Creatine"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-blue-400/30 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-200"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addSupplement}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    disabled={!supplementInput.trim()}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowSupplementModal(false)}
                    className="flex-1 bg-gray-600/50 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 border border-gray-500/30 hover:border-gray-500/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BookSessions = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [activeTab, setActiveTab] = useState('trainers');

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('trainers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'trainers' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Trainers
          </button>
          <button
            onClick={() => setActiveTab('nutritionists')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'nutritionists' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Nutritionists
          </button>
        </div>
        
        {activeTab === 'trainers' && (
          <div className="space-y-4">
            {[
              { name: 'Sarah Johnson', specialty: 'HIIT Specialist', slots: ['9:00 AM', '2:00 PM', '6:00 PM'] },
              { name: 'Mike Chen', specialty: 'Strength Coach', slots: ['10:00 AM', '3:00 PM', '7:00 PM'] },
              { name: 'Alex Rodriguez', specialty: 'Yoga Instructor', slots: ['8:00 AM', '1:00 PM', '5:00 PM'] }
            ].map((trainer, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-green-400 mb-2">{trainer.name}</h3>
                <p className="text-gray-300 mb-4">{trainer.specialty}</p>
                <div className="flex flex-wrap gap-2">
                  {trainer.slots.map((slot, slotIndex) => (
                    <button
                      key={slotIndex}
                      onClick={() => showToast(`Booked session with ${trainer.name} at ${slot}`, 'success')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'nutritionists' && (
          <div className="space-y-4">
            {[
              { name: 'Dr. Emily Wilson', specialty: 'Sports Nutrition', slots: ['11:00 AM', '4:00 PM'] },
              { name: 'Dr. Maria Garcia', specialty: 'Weight Management', slots: ['10:00 AM', '3:00 PM'] }
            ].map((nutritionist, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-purple-400 mb-2">{nutritionist.name}</h3>
                <p className="text-gray-300 mb-4">{nutritionist.specialty}</p>
                <div className="flex items-center space-x-4 mb-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  />
                  <span className="text-sm text-gray-400">Upload Food Diary</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {nutritionist.slots.map((slot, slotIndex) => (
                    <button
                      key={slotIndex}
                      onClick={() => showToast(`Requested consultation with ${nutritionist.name} at ${slot}`, 'success')}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Request Plan - {slot}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FacilitiesBooking = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Get today's date in local timezone, not UTC
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);

  // Helper function to normalize dates for comparison (handle timezone issues)
  const normalizeDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const maxDateString = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    fetchFacilities();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedFacility !== 'all') {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedFacility]);

  const fetchFacilities = async () => {
    try {
      // Call API to fetch available facilities
      const response = await publicFacilitiesApi.getAvailableFacilities();
      setFacilities(response);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      showToast('Failed to load facilities', 'error');
      setFacilities([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      if (selectedFacility === 'all') {
        setAvailableSlots([]);
        return;
      }
      
      // Find the facility ID from the selected facility name
      const facility = facilities.find(f => f.name === selectedFacility);
      if (!facility) {
        setAvailableSlots([]);
        return;
      }
      
      console.log('Fetching slots for:', {
        facilityId: facility.id,
        selectedDate: selectedDate,
        facilityName: facility.name
      });
      
      // Call API to fetch available slots
      const response = await publicFacilitiesApi.getAvailableSlots(facility.id, selectedDate);
      console.log('Received slots:', response);
      
      // Check for date mismatches
      const mismatchedSlots = response.filter(slot => {
        const slotDate = new Date(slot.date);
        const selectedDateObj = new Date(selectedDate);
        return slotDate.toDateString() !== selectedDateObj.toDateString();
      });
      
      if (mismatchedSlots.length > 0) {
        console.warn('Found slots with mismatched dates:', mismatchedSlots);
        console.warn('Selected date:', selectedDate);
        console.warn('Slot dates:', mismatchedSlots.map(s => ({ id: s.id, date: s.date, parsed: new Date(s.date).toDateString() })));
      }
      
      setAvailableSlots(response);
    } catch (error) {
      console.error('Error fetching slots:', error);
      showToast('Failed to load available slots', 'error');
      setAvailableSlots([]); // Set empty array on error
    }
  };

  const fetchMyBookings = async () => {
    try {
      // Call API to fetch user's bookings
      const response = await userFacilitiesApi.getUserBookings();
      console.log('Fetched user bookings:', response);
      setMyBookings(response);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast('Failed to load your bookings', 'error');
      setMyBookings([]); // Set empty array on error
    }
  };

  const handleBookSlot = async (slot: any) => {
    if (slot.status !== 'available') return;
    
    setBookingLoading(true);
    try {
      // Debug: Log current user's bookings before attempting to book
      console.log('Current user bookings before booking:', myBookings);
      console.log('Attempting to book slot:', slot);
      console.log('Selected date:', selectedDate);
      
      // Check if user has conflicting bookings for the same time
      const normalizedSelectedDate = normalizeDate(selectedDate);
      
      const conflictingBooking = myBookings.find(booking => {
        const normalizedBookingDate = normalizeDate(booking.booking_date);
        return normalizedBookingDate.getTime() === normalizedSelectedDate.getTime() && 
               booking.start_time === slot.start_time &&
               ['confirmed', 'pending'].includes(booking.status);
      });
      
      if (conflictingBooking) {
        showToast(`You already have a booking for ${slot.start_time} on ${selectedDate}. Please cancel it first.`, 'error');
        setBookingLoading(false);
        return;
      }
      
      // Debug: Check for date mismatch between selected date and slot date
      const slotDate = new Date(slot.date);
      const selectedDateObj = new Date(selectedDate);
      
      // Normalize dates to local timezone for comparison
      const normalizedSlotDate = normalizeDate(slot.date);
      const normalizedSelectedDateForSlot = normalizeDate(selectedDate);
      
      console.log('Date comparison:', {
        selectedDate: selectedDate,
        selectedDateObj: selectedDateObj.toDateString(),
        slotDate: slot.date,
        slotDateParsed: slotDate.toDateString(),
        normalizedSlotDate: normalizedSlotDate.toDateString(),
        normalizedSelectedDateForSlot: normalizedSelectedDateForSlot.toDateString(),
        datesMatch: normalizedSlotDate.getTime() === normalizedSelectedDateForSlot.getTime(),
        timezoneOffset: slotDate.getTimezoneOffset(),
        selectedTimezoneOffset: selectedDateObj.getTimezoneOffset()
      });
      
      if (normalizedSlotDate.getTime() !== normalizedSelectedDateForSlot.getTime()) {
        console.error('CRITICAL: Date mismatch detected!');
        console.error('User selected:', selectedDate);
        console.error('Slot has date:', slot.date);
        console.error('Normalized comparison failed');
        showToast('Date mismatch detected. Please refresh and try again.', 'error');
        setBookingLoading(false);
        return;
      }
      
      // Call API to book slot
      await userFacilitiesApi.bookSlot({ slotId: slot.id });
      showToast(`Slot booked successfully for ${slot.start_time} - ${slot.end_time}`, 'success');
      
      // Refresh data
      fetchAvailableSlots();
      fetchMyBookings();
    } catch (error) {
      console.error('Error booking slot:', error);
      
      // Extract error message from the error object
      let errorMessage = 'Failed to book slot';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    setCancellingBookingId(bookingId);
    try {
      // Call API to cancel booking with a default cancellation reason
      await userFacilitiesApi.cancelBooking(bookingId, { cancellationReason: 'Cancelled by user' });
      showToast('Booking cancelled successfully', 'success');
      
      // Refresh data
      fetchMyBookings();
      fetchAvailableSlots(); // Also refresh available slots since capacity is now available
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showToast('Failed to cancel booking', 'error');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-red-100 text-red-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  if (loading) {
  return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
          FACILITIES BOOKING
        </h1>
        <p className="text-gray-300">Book your preferred time slots at our world-class facilities</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Facility</label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
            >
              <option value="all">All Facilities</option>
              {facilities.map(facility => (
                <option key={facility.id} value={facility.name}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                      <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={todayString}
              max={maxDateString}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
            />
        </div>
        
          <div className="flex items-end">
                    <button
              onClick={fetchAvailableSlots}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search Slots
            </button>
          </div>
        </div>
      </div>

      {/* Available Slots */}
      {selectedFacility !== 'all' && availableSlots.length > 0 && (
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-blue-400 mb-4">
            Available Slots for {selectedDate}
          </h3>
          
          {/* Check for conflicting bookings */}
          {(() => {
            const normalizedSelectedDateForConflicts = normalizeDate(selectedDate);
            
            const conflictingBookings = myBookings.filter(booking => {
              const normalizedBookingDate = normalizeDate(booking.booking_date);
              return normalizedBookingDate.getTime() === normalizedSelectedDateForConflicts.getTime() &&
                     ['confirmed', 'pending'].includes(booking.status);
            });
            
            if (conflictingBookings.length > 0) {
              return (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                    <span className="text-yellow-200 font-medium">Conflicting Bookings</span>
                  </div>
                  <p className="text-yellow-100 text-sm">
                    You have existing bookings for this date. Please cancel them before booking new slots.
                  </p>
                  <div className="mt-2 space-y-1">
                    {conflictingBookings.map(booking => (
                      <div key={booking.id} className="text-xs text-yellow-200">
                        {booking.facility_name} at {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {availableSlots.map((slot) => {
              // Check if this slot conflicts with existing bookings
              const normalizedSelectedDateForSlotConflict = normalizeDate(selectedDate);
              
              const hasConflict = myBookings.some(booking => {
                const normalizedBookingDate = normalizeDate(booking.booking_date);
                return normalizedBookingDate.getTime() === normalizedSelectedDateForSlotConflict.getTime() && 
                       booking.start_time === slot.start_time &&
                       ['confirmed', 'pending'].includes(booking.status);
              });
              
              return (
                <div key={slot.id} className="text-center">
                  <button
                    onClick={() => handleBookSlot(slot)}
                    disabled={slot.status !== 'available' || bookingLoading || hasConflict}
                    className={`w-full p-4 rounded-lg transition-all duration-300 ${
                      hasConflict
                        ? 'bg-red-600 text-white cursor-not-allowed opacity-75'
                        : slot.status === 'available'
                        ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                    title={hasConflict ? 'You already have a booking for this time' : ''}
                  >
                    <div className="font-semibold">
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </div>
                    <div className="text-sm mt-1">
                      PKR {slot.member_price}
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      {hasConflict ? 'Conflict' : slot.status === 'available' ? 'Available' : 'Booked'}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Bookings */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-4">My Bookings</h3>
        
        {myBookings.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No bookings found</p>
        ) : (
          <div className="space-y-4">
            {myBookings.map((booking) => (
              <div key={booking.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">{booking.facility_name}</h4>
                  <p className="text-gray-300">
                    {new Date(booking.date).toLocaleDateString()} at {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                  </p>
                  <p className="text-sm text-gray-400">PKR {booking.price_paid}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to cancel your booking for ${booking.facility_name} on ${new Date(booking.date).toLocaleDateString()} at ${formatTime(booking.start_time)}?`)) {
                          handleCancelBooking(booking.id);
                        }
                      }}
                      disabled={cancellingBookingId === booking.id}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        cancellingBookingId === booking.id
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Facilities Overview */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Available Facilities</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <div key={facility.id} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <img
                src={facility.image_url}
                alt={facility.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h4 className="text-lg font-semibold text-white mb-2">{facility.name}</h4>
                <p className="text-gray-300 text-sm mb-3">{facility.description}</p>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{facility.location}</span>
                  <span>Capacity: {facility.max_capacity}</span>
                </div>
                <button
                  onClick={() => setSelectedFacility(facility.name)}
                  className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Slots
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MemberStore = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    showToast(`${product.name} added to cart`, 'success');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.memberPrice, 0).toFixed(2);
  };

  const products = [
    {
      id: 1,
      name: 'Whey Protein Powder',
      price: 13999,
      memberPrice: 12599,
      category: 'Supplements',
      image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      name: 'Resistance Bands Set',
      price: 8399,
      memberPrice: 7559,
      category: 'Equipment',
      image: 'https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      name: 'Finova Fitness T-Shirt',
      price: 6999,
      memberPrice: 6299,
      category: 'Apparel',
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 4,
      name: 'Pre-Workout Supplement',
      price: 11199,
      memberPrice: 10079,
      category: 'Supplements',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 5,
      name: 'Yoga Mat',
      price: 9799,
      memberPrice: 8819,
      category: 'Equipment',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 6,
      name: 'Gym Hoodie',
      price: 13999,
      memberPrice: 12599,
      category: 'Apparel',
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80'
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Member Store
        </h2>
        <button
          onClick={() => setShowCart(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Cart ({cart.length})
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="product-card p-6 rounded-2xl">
            <div className="bg-gray-800 h-48 rounded-lg mb-4 flex items-center justify-center relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const nextElement = target.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
              <div className="hidden w-full h-full flex items-center justify-center absolute inset-0">
                <i className="fas fa-image text-4xl text-gray-600"></i>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">{product.name}</h3>
            <p className="text-gray-300 text-sm mb-4">{product.category}</p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-lg line-through text-gray-500">PKR {product.price.toLocaleString()}</span>
                <span className="text-xl font-bold text-green-400 ml-2">PKR {product.memberPrice.toLocaleString()}</span>
                <div className="text-sm text-green-400">Member Price (10% off)</div>
              </div>
            </div>
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      
      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-400">Shopping Cart</h3>
              <button onClick={() => setShowCart(false)} className="close-button text-gray-300 hover:text-white p-2 rounded-lg" title="Close">
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            <div className="space-y-4 mb-4">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center">Your cart is empty</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="text-green-400">PKR {item.memberPrice.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <strong>Total: PKR {getTotalPrice()}</strong>
                </div>
                <button
                  onClick={() => {
                    showToast(`Order placed! Total: PKR ${getTotalPrice()}`, 'success');
                    setCart([]);
                    setShowCart(false);
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const LoyaltyReferrals = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [referralLink] = useState('https://finovafitness.com/ref/johndoe123');

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToast('Referral link copied!', 'success');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Points Wallet */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-green-400 mb-4">Points Wallet</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{user?.loyaltyPoints || 1247}</div>
            <div className="text-sm text-gray-400">Points Earned</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">345</div>
            <div className="text-sm text-gray-400">Points Spent</div>
          </div>
        </div>
        <button
          onClick={() => showToast('Redeeming 500 points for $25 credit', 'success')}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
        >
          Redeem Points
        </button>
      </div>
      
      {/* Referrals */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Referral Program</h3>
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">Your Referral Link</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm"
              />
              <button
                onClick={copyReferralLink}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">{user?.referralCount || 5}</div>
              <div className="text-sm text-gray-400">Invites Sent</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">250</div>
              <div className="text-sm text-gray-400">Points Earned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reviews = ({ showToast, pendingReviewSession, onClearPendingReview }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void; pendingReviewSession?: any; onClearPendingReview?: () => void }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [trainingEffectiveness, setTrainingEffectiveness] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [completedNutritionistSessions, setCompletedNutritionistSessions] = useState<any[]>([]);
  const [completedDietPlanRequests, setCompletedDietPlanRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trainers' | 'nutritionists'>('trainers');

  useEffect(() => {
    fetchAllCompletedServices();
  }, []);

  // Auto-open review modal if there's a pending review session
  useEffect(() => {
    if (pendingReviewSession && (completedSessions.length > 0 || completedNutritionistSessions.length > 0 || completedDietPlanRequests.length > 0)) {
      // Find the session in completed services
      let session = completedSessions.find(s => s.id === pendingReviewSession.id);
      if (!session) {
        session = completedNutritionistSessions.find(s => s.id === pendingReviewSession.id);
      }
      if (!session) {
        session = completedDietPlanRequests.find(s => s.id === pendingReviewSession.id);
      }
      
      if (session && !session.has_review) {
        handleReview(session);
        // Clear the pending review session after opening the modal
        // This will be handled by the parent component
      }
    }
  }, [pendingReviewSession, completedSessions, completedNutritionistSessions, completedDietPlanRequests]);

  const fetchAllCompletedServices = async () => {
    try {
      setLoading(true);
      const [sessions, nutritionistSessions, dietPlanRequests] = await Promise.all([
        memberApi.getCompletedSessions(),
        memberApi.getCompletedNutritionistSessions(),
        memberApi.getCompletedDietPlanRequests()
      ]);
      setCompletedSessions(sessions);
      setCompletedNutritionistSessions(nutritionistSessions);
      setCompletedDietPlanRequests(dietPlanRequests);
    } catch (error) {
      console.error('Failed to fetch completed services:', error);
      showToast('Failed to load completed services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (session: any) => {
    setSelectedSession(session);
    setRating(5);
    setReviewText('');
    setTrainingEffectiveness(5);
    setCommunication(5);
    setPunctuality(5);
    setProfessionalism(5);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedSession) return;

    try {
      setSubmitting(true);
      
      // Determine the type of review and submit accordingly
      if (selectedSession.session_type) {
        // This is a nutritionist session review
        await memberApi.submitNutritionistSessionReview({
          session_request_id: selectedSession.id,
          rating,
          review_text: reviewText,
          nutritional_guidance: trainingEffectiveness, // Map to nutritional_guidance
          communication,
          punctuality,
          professionalism,
          session_effectiveness: trainingEffectiveness // Map to session_effectiveness
        });
      } else if (selectedSession.fitness_goal) {
        // This is a diet plan review
        await memberApi.submitNutritionistDietPlanReview({
          diet_plan_request_id: selectedSession.id,
          rating,
          review_text: reviewText,
          meal_plan_quality: trainingEffectiveness, // Map to meal_plan_quality
          nutritional_accuracy: communication, // Map to nutritional_accuracy
          customization_level: punctuality, // Map to customization_level
          support_quality: professionalism, // Map to support_quality
          follow_up_support: trainingEffectiveness // Map to follow_up_support
        });
      } else {
        // This is a trainer session review
        await memberApi.submitSessionReview({
          session_id: selectedSession.id,
          rating,
          review_text: reviewText,
          training_effectiveness: trainingEffectiveness,
          communication,
          punctuality,
          professionalism
        });
      }

      showToast('Thank you for your review!', 'success');
      setShowReviewModal(false);
      
      // Clear pending review session
      if (onClearPendingReview) {
        onClearPendingReview();
      }
      
      // Refresh the completed services to show updated review status
      await fetchAllCompletedServices();
      
    } catch (error) {
      console.error('Failed to submit review:', error);
      showToast('Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getReviewStatus = (session: any) => {
    if (session.has_review) {
      return (
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">Review submitted</span>
        </div>
      );
    }
    return (
      <Button
        onClick={() => handleReview(session)}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 rounded text-sm font-semibold transition-all duration-300 transform hover:scale-105"
      >
        <Star className="w-3 h-3 mr-1" />
        Review
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
          <p className="text-gray-300">Loading completed services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6 rounded-2xl">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800 rounded-xl p-1 flex space-x-1">
            <button
              onClick={() => setActiveTab('trainers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'trainers' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-dumbbell w-4 h-4" />
              <span className="font-medium text-sm">Training Sessions</span>
            </button>
            <button
              onClick={() => setActiveTab('nutritionists')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'nutritionists' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-apple-alt w-4 h-4" />
              <span className="font-medium text-sm">Nutritionist Services</span>
            </button>
          </div>
        </div>

        {activeTab === 'trainers' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">Training Session Reviews</h3>
                <p className="text-gray-300 text-sm">Review your completed training sessions and help trainers improve</p>
              </div>
              <div className="text-sm text-gray-400">
                {completedSessions.filter(s => s.has_review).length} of {completedSessions.length} reviewed
              </div>
            </div>

        {completedSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h4 className="text-lg font-semibold text-gray-300 mb-2">No completed sessions yet</h4>
            <p className="text-sm">Complete a training session to leave a review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedSessions.map((session) => (
              <div key={session.id} className="p-4 border border-gray-600 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {session.session_type}
                      </h4>
                      <p className="text-gray-300 text-xs">
                        with {session.trainer_first_name} {session.trainer_last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">#{session.id}</span>
                    {getReviewStatus(session)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Date & Time</p>
                    <p className="text-white font-medium">
                      {new Date(session.session_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-gray-300 text-xs">
                      {session.start_time} - {session.end_time}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Session Details</p>
                    <p className="text-white font-medium">
                      {session.session_type}
                    </p>
                    <p className="text-gray-300 text-xs">
                      Duration: {session.start_time} - {session.end_time}
                    </p>
                  </div>
                </div>
                
                {session.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-gray-400 text-xs mb-1">Session Notes</p>
                    <p className="text-gray-300 text-sm italic">"{session.notes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
          </>
        )}

        {activeTab === 'nutritionists' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-2">Nutritionist Service Reviews</h3>
                <p className="text-gray-300 text-sm">Review your completed nutritionist sessions and diet plans</p>
              </div>
              <div className="text-sm text-gray-400">
                {(completedNutritionistSessions.filter(s => s.has_review).length + completedDietPlanRequests.filter(s => s.has_review).length)} of {(completedNutritionistSessions.length + completedDietPlanRequests.length)} reviewed
              </div>
            </div>

            {/* Nutritionist Sessions */}
            {completedNutritionistSessions.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-purple-400 mb-4">Nutritionist Sessions</h4>
                <div className="space-y-4">
                  {completedNutritionistSessions.map((session) => (
                    <div key={session.id} className="p-4 border border-gray-600 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-apple-alt text-white w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">
                              {session.session_type}
                            </h4>
                            <p className="text-gray-300 text-xs">
                              with {session.nutritionist_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">#{session.id}</span>
                          {getReviewStatus(session)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Date & Time</p>
                          <p className="text-white font-medium">
                            {new Date(session.session_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {session.start_time}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Service Type</p>
                          <p className="text-white font-medium">
                            {session.session_type}
                          </p>
                          <p className="text-gray-300 text-xs">
                            Nutritionist Session
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diet Plan Requests */}
            {completedDietPlanRequests.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-pink-400 mb-4">Diet Plan Requests</h4>
                <div className="space-y-4">
                  {completedDietPlanRequests.map((request) => (
                    <div key={request.id} className="p-4 border border-gray-600 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-utensils text-white w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">
                              Diet Plan: {request.fitness_goal}
                            </h4>
                            <p className="text-gray-300 text-xs">
                              with {request.nutritionist_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">#{request.id}</span>
                          {getReviewStatus(request)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Goal</p>
                          <p className="text-white font-medium">
                            {request.fitness_goal}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {request.current_weight}kg → {request.target_weight}kg
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Request Date</p>
                          <p className="text-white font-medium">
                            {new Date(request.created_at).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-gray-300 text-xs">
                            Diet Plan Request
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedNutritionistSessions.length === 0 && completedDietPlanRequests.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <i className="fas fa-apple-alt w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h4 className="text-lg font-semibold text-gray-300 mb-2">No completed nutritionist services yet</h4>
                <p className="text-sm">Complete a nutritionist session or diet plan request to leave a review</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Enhanced Review Modal */}
      {showReviewModal && selectedSession && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-8 rounded-3xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto relative">
            {/* Enhanced Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Share Your Experience</h3>
              <p className="text-gray-300 text-lg">
                Help {selectedSession.trainer_first_name || selectedSession.nutritionist_first_name} improve their services
              </p>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => {
                setShowReviewModal(false);
                if (onClearPendingReview) {
                  onClearPendingReview();
                }
              }} 
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-3 rounded-full hover:bg-gray-700/50"
              title="Close"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>

            {/* Service Details Card */}
            <div className={`p-6 rounded-2xl mb-8 border backdrop-blur-sm ${
              selectedSession.session_type 
                ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30' 
                : selectedSession.fitness_goal 
                ? 'bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-pink-500/30'
                : 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30'
            }`}>
              <div className="flex items-center justify-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  selectedSession.session_type 
                    ? 'bg-purple-500' 
                    : selectedSession.fitness_goal 
                    ? 'bg-pink-500'
                    : 'bg-blue-500'
                }`}>
                  <i className={`text-white text-xl ${
                    selectedSession.session_type 
                      ? 'fas fa-apple-alt' 
                      : selectedSession.fitness_goal 
                      ? 'fas fa-utensils'
                      : 'fas fa-dumbbell'
                  }`}></i>
                </div>
                <h4 className="text-2xl font-bold text-white">
                  {selectedSession.session_type ? 'Session Details' : selectedSession.fitness_goal ? 'Diet Plan Details' : 'Session Details'}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedSession.session_type 
                        ? 'bg-purple-500/20' 
                        : selectedSession.fitness_goal 
                        ? 'bg-pink-500/20'
                        : 'bg-blue-500/20'
                    }`}>
                      <i className={`text-sm ${
                        selectedSession.session_type 
                          ? 'fas fa-user-md text-purple-400' 
                          : selectedSession.fitness_goal 
                          ? 'fas fa-user-md text-pink-400'
                          : 'fas fa-user-tie text-blue-400'
                      }`}></i>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">
                        {selectedSession.session_type ? 'Nutritionist' : selectedSession.fitness_goal ? 'Nutritionist' : 'Trainer'}
                      </p>
                      <p className="text-white font-semibold text-lg">
                        {selectedSession.trainer_first_name || selectedSession.nutritionist_first_name} {selectedSession.trainer_last_name || selectedSession.nutritionist_last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedSession.session_type 
                        ? 'bg-green-500/20' 
                        : selectedSession.fitness_goal 
                        ? 'bg-green-500/20'
                        : 'bg-green-500/20'
                    }`}>
                      <i className={`text-sm ${
                        selectedSession.session_type 
                          ? 'fas fa-apple-alt text-green-400' 
                          : selectedSession.fitness_goal 
                          ? 'fas fa-utensils text-green-400'
                          : 'fas fa-dumbbell text-green-400'
                      }`}></i>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">
                        {selectedSession.session_type ? 'Session Type' : selectedSession.fitness_goal ? 'Goal' : 'Session Type'}
                      </p>
                      <p className="text-white font-semibold text-lg">
                        {selectedSession.session_type || selectedSession.fitness_goal || 'Training Session'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-calendar text-purple-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-semibold text-lg">
                        {new Date(selectedSession.session_date || selectedSession.created_at).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-clock text-orange-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">
                        {selectedSession.session_type ? 'Time' : selectedSession.fitness_goal ? 'Request Date' : 'Time'}
                      </p>
                      <p className="text-white font-semibold text-lg">
                        {selectedSession.start_time || new Date(selectedSession.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className="space-y-8">
              {/* Overall Rating Section */}
              <div className="text-center">
                <label className="block text-2xl font-bold text-white mb-6">How would you rate your overall experience?</label>
                <div className="flex justify-center space-x-3 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transform transition-all duration-300 hover:scale-125 ${
                        star <= rating 
                          ? 'text-yellow-400 scale-110 animate-pulse' 
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                        star <= rating 
                          ? 'bg-yellow-400/20 shadow-lg shadow-yellow-400/25' 
                          : 'bg-gray-700/50 hover:bg-gray-600/50'
                      }`}>
                        <span className="text-4xl">⭐</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-lg text-white font-semibold mb-2">
                    {rating === 5 ? 'Excellent!' : 
                     rating === 4 ? 'Very Good!' : 
                     rating === 3 ? 'Good' : 
                     rating === 2 ? 'Fair' : 'Poor'}
                  </p>
                  <p className="text-gray-400 text-sm">Click on a star to rate</p>
                </div>
              </div>
              
              {/* Detailed Ratings Section */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-gray-600/50">
                <h4 className="text-xl font-bold text-white mb-6 text-center">Rate Specific Aspects</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Training Effectiveness */}
                  <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-4 rounded-xl border border-blue-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-lg font-semibold text-white flex items-center">
                        <i className="fas fa-dumbbell text-blue-400 mr-2"></i>
                        Training Effectiveness
                      </label>
                      <span className="text-blue-400 font-bold text-lg">{trainingEffectiveness}/5</span>
                    </div>
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setTrainingEffectiveness(star)}
                          className={`transform transition-all duration-200 hover:scale-110 ${
                            star <= trainingEffectiveness ? 'text-blue-400' : 'text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          <span className="text-xl">⭐</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      How effective was the training session?
                    </p>
                  </div>
                  
                  {/* Communication */}
                  <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-4 rounded-xl border border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-lg font-semibold text-white flex items-center">
                        <i className="fas fa-comments text-green-400 mr-2"></i>
                        Communication
                      </label>
                      <span className="text-green-400 font-bold text-lg">{communication}/5</span>
                    </div>
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setCommunication(star)}
                          className={`transform transition-all duration-200 hover:scale-110 ${
                            star <= communication ? 'text-green-400' : 'text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          <span className="text-xl">⭐</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      How well did the trainer communicate?
                    </p>
                  </div>
                  
                  {/* Punctuality */}
                  <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-4 rounded-xl border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-lg font-semibold text-white flex items-center">
                        <i className="fas fa-clock text-purple-400 mr-2"></i>
                        Punctuality
                      </label>
                      <span className="text-purple-400 font-bold text-lg">{punctuality}/5</span>
                    </div>
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setPunctuality(star)}
                          className={`transform transition-all duration-200 hover:scale-110 ${
                            star <= punctuality ? 'text-purple-400' : 'text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          <span className="text-xl">⭐</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      Was the trainer on time?
                    </p>
                  </div>
                  
                  {/* Professionalism */}
                  <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 p-4 rounded-xl border border-pink-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-lg font-semibold text-white flex items-center">
                        <i className="fas fa-user-tie text-pink-400 mr-2"></i>
                        Professionalism
                      </label>
                      <span className="text-pink-400 font-bold text-lg">{professionalism}/5</span>
                    </div>
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setProfessionalism(star)}
                          className={`transform transition-all duration-200 hover:scale-110 ${
                            star <= professionalism ? 'text-pink-400' : 'text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          <span className="text-xl">⭐</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      How professional was the trainer?
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Review Text Section */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-gray-600/50">
                <div className="text-center mb-4">
                  <label className="block text-xl font-bold text-white mb-2">
                    <i className="fas fa-comment-dots text-blue-400 mr-2"></i>
                    Additional Comments (Optional)
                  </label>
                  <p className="text-gray-400 text-sm">Share your experience, feedback, or suggestions to help improve future sessions</p>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={
                    selectedSession.session_type 
                      ? "Tell us about your nutritionist session experience... What went well? What could be improved? Any specific feedback for the nutritionist?"
                      : selectedSession.fitness_goal 
                      ? "Tell us about your diet plan experience... What went well? What could be improved? Any specific feedback for the nutritionist?"
                      : "Tell us about your training session experience... What went well? What could be improved? Any specific feedback for the trainer?"
                  }
                  className="w-full px-6 py-4 bg-gray-800/80 border-2 border-gray-600/50 rounded-xl focus:border-blue-500 focus:outline-none text-white text-lg placeholder-gray-500 resize-none transition-all duration-300"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-gray-400">
                    Your feedback helps {selectedSession.session_type || selectedSession.fitness_goal ? 'nutritionists' : 'trainers'} improve their services
                  </p>
                  <p className="text-xs text-gray-400">{reviewText.length}/500 characters</p>
                </div>
              </div>
              
              {/* Submit Section */}
              <div className="text-center pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={submitReview}
                    disabled={submitting}
                    className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl hover:shadow-green-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center">
                      {submitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-3 text-xl"></i>
                          Submitting Review...
                        </>
                      ) : (
                        <>
                          <Star className="w-6 h-6 mr-3" />
                          Submit Review
                        </>
                      )}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      if (onClearPendingReview) {
                        onClearPendingReview();
                      }
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <i className="fas fa-times mr-3"></i>
                    Cancel
                  </button>
                </div>
                
                {/* Progress Indicator */}
                <div className="mt-6">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Review Form Complete</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MemberAnnouncements = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const announcements = [
    {
      id: 1,
      title: 'New Equipment Arrival',
      message: 'We have new cardio machines arriving next week!',
      priority: 'high',
      date: '2024-01-20',
      target: 'all'
    },
    {
      id: 2,
      title: 'Holiday Schedule',
      message: 'Gym will be closed on Independence Day',
      priority: 'high',
      date: '2024-01-15',
      target: 'all'
    },
    {
      id: 3,
      title: 'New Classes Available',
      message: 'Check out our new HIIT and Yoga classes starting next month!',
      priority: 'medium',
      date: '2024-01-10',
      target: 'members'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Announcements
        </h2>
        <p className="text-gray-300">Stay updated with the latest gym announcements</p>
      </div>

      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="glass-card p-6 rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                  <span className={`text-sm font-semibold ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{announcement.message}</p>
                <p className="text-sm text-gray-400">Posted: {announcement.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NutritionistsTab = ({ showToast, user, onNavigateToReviews }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void; user: User | null; onNavigateToReviews?: (session: any) => void }) => {
  const [selectedNutritionist, setSelectedNutritionist] = useState<any>(null);
  const [showDietForm, setShowDietForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [nutritionists, setNutritionists] = useState<any[]>([]);
  const [dietRequests, setDietRequests] = useState<any[]>([]);
  const [nutritionistSessionRequests, setNutritionistSessionRequests] = useState<any[]>([]);
  const [activeMainTab, setActiveMainTab] = useState('nutritionists');
  const [activeDietTab, setActiveDietTab] = useState('pending');
  const [activeSessionTab, setActiveSessionTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedChatRequest, setSelectedChatRequest] = useState<any>(null);
  const [dietForm, setDietForm] = useState({
    fitnessGoal: '',
    customGoal: '',
    currentWeight: '',
    height: '',
    targetWeight: '',
    activityLevel: '',
    budget: '',
    dietaryRestrictions: '',
    additionalNotes: ''
  });
  const [sessionForm, setSessionForm] = useState({
    preferredDate: '',
    preferredTime: '',
    sessionType: 'initial_consultation',
    message: ''
  });
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch nutritionists and diet requests on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [nutritionistsData, requestsData, sessionRequestsData] = await Promise.all([
          memberApi.getNutritionists(),
          memberApi.getDietPlanRequests(),
          memberApi.getNutritionistSessionRequests()
        ]);
        setNutritionists(nutritionistsData);
        setDietRequests(requestsData);
        setNutritionistSessionRequests(sessionRequestsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        showToast('Failed to load nutritionist data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDietRequest = async () => {
    if (!selectedNutritionist) {
      showToast('Please select a nutritionist first', 'error');
      return;
    }

    try {
      const requestData = {
        nutritionist_id: selectedNutritionist.id,
        fitness_goal: dietForm.fitnessGoal === 'custom' ? dietForm.customGoal : dietForm.fitnessGoal,
        current_weight: parseFloat(dietForm.currentWeight),
        height: parseFloat(dietForm.height),
        target_weight: parseFloat(dietForm.targetWeight),
        activity_level: dietForm.activityLevel,
        monthly_budget: parseFloat(dietForm.budget),
        dietary_restrictions: dietForm.dietaryRestrictions,
        additional_notes: dietForm.additionalNotes
      };

      await memberApi.createDietPlanRequest(requestData);
      
      // Refresh diet requests
      const updatedRequests = await memberApi.getDietPlanRequests();
      setDietRequests(updatedRequests);
      
    showToast('Diet plan request submitted successfully!', 'success');
    setShowDietForm(false);
    setDietForm({
      fitnessGoal: '',
      customGoal: '',
      currentWeight: '',
      height: '',
      targetWeight: '',
      activityLevel: '',
      budget: '',
      dietaryRestrictions: '',
      additionalNotes: ''
    });
      setSelectedNutritionist(null);
    } catch (error) {
      console.error('Failed to submit diet request:', error);
      showToast('Failed to submit diet plan request', 'error');
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    if (!selectedNutritionist) return;
    
    try {
      setLoadingSlots(true);
      const slots = await memberApi.getNutritionistSlots(selectedNutritionist.id, date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      showToast('Failed to fetch available slots', 'error');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSessionRequest = async () => {
    if (!selectedNutritionist) {
      showToast('Please select a nutritionist first', 'error');
      return;
    }

    if (!sessionForm.preferredDate || !sessionForm.preferredTime) {
      showToast('Please select a date and time', 'error');
      return;
    }

    try {
      const requestData = {
        nutritionist_id: selectedNutritionist.id,
        preferred_date: sessionForm.preferredDate,
        preferred_time: sessionForm.preferredTime,
        session_type: sessionForm.sessionType,
        message: sessionForm.message
      };

      await memberApi.requestNutritionistSession(requestData);
      
      showToast('Session request submitted successfully!', 'success');
      setShowSessionForm(false);
      setSessionForm({
        preferredDate: '',
        preferredTime: '',
        sessionType: 'initial_consultation',
        message: ''
      });
      setSelectedNutritionist(null);
      setAvailableSlots([]);
    } catch (error) {
      console.error('Failed to submit session request:', error);
      showToast('Failed to submit session request', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'pending': return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      case 'approved': return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case 'rejected': return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      case 'completed': return `${baseClasses} bg-blue-500/20 text-blue-400 border border-blue-500/30`;
      default: return `${baseClasses} bg-gray-500/20 text-gray-400 border border-gray-500/30`;
    }
  };

  const filteredDietRequests = dietRequests.filter(request => {
    if (activeDietTab === 'pending') return request.status === 'pending';
    if (activeDietTab === 'approved') return request.status === 'approved';
    if (activeDietTab === 'rejected') return request.status === 'rejected';
    if (activeDietTab === 'completed') return request.status === 'completed';
    return true;
  });

  const filteredSessionRequests = nutritionistSessionRequests.filter(request => {
    if (activeSessionTab === 'pending') return request.status === 'pending';
    if (activeSessionTab === 'approved') return request.status === 'approved';
    if (activeSessionTab === 'rejected') return request.status === 'rejected';
    if (activeSessionTab === 'completed') return request.status === 'completed';
    return true;
  });

  if (loading) {
  return (
    <div className="animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-purple-400 text-lg">Loading nutritionist data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Main Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'nutritionists', label: 'Our Nutritionists', icon: 'fas fa-user-md' },
          { id: 'diet-plan-requests', label: 'Diet Plan Requests', icon: 'fas fa-apple-alt' },
          { id: 'session-requests', label: 'Session Requests', icon: 'fas fa-calendar' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMainTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeMainTab === tab.id
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className={tab.icon}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Nutritionists Tab */}
      {activeMainTab === 'nutritionists' && (
        <div>
      <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Our Nutritionists
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nutritionists.map((nutritionist) => (
          <div key={nutritionist.id} className="glass-card p-6 rounded-2xl text-center hover-glow transition-all duration-300">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-400 bg-gray-700 flex items-center justify-center">
                  <i className="fas fa-user-md text-3xl text-purple-400"></i>
            </div>
                <h3 className="text-xl font-bold text-purple-400 mb-2">
                  {nutritionist.first_name} {nutritionist.last_name}
                </h3>
                <p className="text-green-400 mb-2">Registered Nutritionist</p>
                <p className="text-gray-300 text-sm mb-4">Specialized in personalized nutrition plans and dietary guidance.</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedNutritionist(nutritionist);
                  setShowDietForm(true);
                }}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Request Diet Plan
              </button>
              <button
                onClick={() => {
                  setSelectedNutritionist(nutritionist);
                  setShowSessionForm(true);
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Book a Session
              </button>
            </div>
          </div>
        ))}
      </div>
        </div>
      )}

      {/* Diet Plan Requests Tab */}
      {activeMainTab === 'diet-plan-requests' && (
        <div>
          {/* Diet Plan Status Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-700 p-1 rounded-lg">
            {[
              { id: 'pending', label: 'Pending', icon: 'fas fa-clock' },
              { id: 'approved', label: 'Approved', icon: 'fas fa-check-circle' },
              { id: 'rejected', label: 'Rejected', icon: 'fas fa-times-circle' },
              { id: 'completed', label: 'Completed', icon: 'fas fa-star' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDietTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeDietTab === tab.id
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
              >
                <i className={tab.icon}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            Diet Plan Requests - {activeDietTab.charAt(0).toUpperCase() + activeDietTab.slice(1)}
          </h2>
          
          {filteredDietRequests.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400 text-lg">No {activeDietTab} diet plan requests found</p>
            </div>
            ) : (
            <div className="space-y-4">
              {filteredDietRequests.map((request) => (
                <div key={request.id} className="glass-card p-6 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="font-bold text-white text-lg">
                          {request.first_name} {request.last_name}
                        </h4>
                        <span className={getStatusBadge(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div>
                          <strong className="text-white">Fitness Goal:</strong> {request.fitness_goal}
                        </div>
                        <div>
                          <strong className="text-white">Current Weight:</strong> {request.current_weight} kg
                        </div>
                        <div>
                          <strong className="text-white">Height:</strong> {request.height} cm
                        </div>
                        <div>
                          <strong className="text-white">Target Weight:</strong> {request.target_weight} kg
                        </div>
                        <div>
                          <strong className="text-white">Activity Level:</strong> {request.activity_level?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </div>
                        <div>
                          <strong className="text-white">Monthly Budget:</strong> PKR {request.monthly_budget}
                        </div>
                        {request.dietary_restrictions && (
                          <div className="md:col-span-2">
                            <strong className="text-white">Dietary Restrictions:</strong> {request.dietary_restrictions}
                          </div>
                        )}
                        {request.additional_notes && (
                          <div className="md:col-span-2">
                            <strong className="text-white">Additional Notes:</strong> {request.additional_notes}
                          </div>
                        )}
                        {request.nutritionist_notes && (
                          <div className="md:col-span-2">
                            <strong className="text-white">Nutritionist Notes:</strong> {request.nutritionist_notes}
                          </div>
                        )}
                        {request.preparation_time && (
                          <div className="md:col-span-2">
                            <strong className="text-white">Preparation Time:</strong> {request.preparation_time}
                          </div>
                        )}
                        {request.meal_plan && (
                          <div className="md:col-span-2">
                            <strong className="text-white">Meal Plan:</strong> {request.meal_plan}
                          </div>
                        )}
                        <div className="md:col-span-2 text-xs text-gray-500">
                          Requested on: {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="mt-4 flex justify-end space-x-2">
                        {/* Chat button for approved and completed requests - ONLY for diet requests */}
                        {(request.status === 'approved' || request.status === 'completed') && (
                          <button
                            onClick={() => {
                              setSelectedChatRequest(request);
                              setShowChat(true);
                            }}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Chat with Nutritionist
                          </button>
                        )}
                        
                        {/* Review button for completed requests */}
                        {request.status === 'completed' && !request.has_review && onNavigateToReviews && (
                          <button
                            onClick={() => onNavigateToReviews(request)}
                            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <i className="fas fa-star w-4 h-4" />
                            Review
                          </button>
                        )}
                        
                        {/* Review submitted indicator */}
                        {request.status === 'completed' && request.has_review && (
                          <div className="flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
                            <i className="fas fa-check-circle w-4 h-4" />
                            Review Submitted
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Session Requests Tab */}
      {activeMainTab === 'session-requests' && (
        <div>
          {/* Session Status Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-700 p-1 rounded-lg">
            {[
              { id: 'pending', label: 'Pending', icon: 'fas fa-clock' },
              { id: 'approved', label: 'Approved', icon: 'fas fa-check-circle' },
              { id: 'rejected', label: 'Rejected', icon: 'fas fa-times-circle' },
              { id: 'completed', label: 'Completed', icon: 'fas fa-star' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSessionTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeSessionTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
              >
                <i className={tab.icon}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            Session Requests - {activeSessionTab.charAt(0).toUpperCase() + activeSessionTab.slice(1)}
          </h2>
          
          {filteredSessionRequests.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-calendar text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400 text-lg">No {activeSessionTab} session requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessionRequests.map((request) => (
                <div key={request.id} className="glass-card p-6 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="font-bold text-white text-lg">
                          {request.nutritionist_first_name} {request.nutritionist_last_name}
                        </h4>
                        <span className={getStatusBadge(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div>
                          <strong className="text-white">Session Type:</strong> {request.session_type}
                        </div>
                        <div>
                          <strong className="text-white">Preferred Date:</strong> {new Date(request.preferred_date).toLocaleDateString()}
                        </div>
                        <div>
                          <strong className="text-white">Preferred Time:</strong> {request.preferred_time}
                        </div>
                        <div>
                          <strong className="text-white">Status:</strong> {request.status}
                        </div>
                        {request.message && (
                          <div className="md:col-span-2">
                            <strong className="text-white">Message:</strong> {request.message}
                          </div>
                        )}
                        <div className="md:col-span-2 text-xs text-gray-500">
                          Requested on: {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="mt-4 flex justify-end space-x-2">
                        {/* No chat option for session requests - chat is only available for diet requests */}
                        
                        {/* Review button for completed requests */}
                        {request.status === 'completed' && !request.has_review && onNavigateToReviews && (
                          <button
                            onClick={() => onNavigateToReviews(request)}
                            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <i className="fas fa-star w-4 h-4" />
                            Review
                          </button>
                        )}
                        
                        {/* Review submitted indicator */}
                        {request.status === 'completed' && request.has_review && (
                          <div className="flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
                            <i className="fas fa-check-circle w-4 h-4" />
                            Review Submitted
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Diet Plan Request Modal */}
      {showDietForm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="glass-card p-4 sm:p-6 rounded-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-purple-400">Request Diet Plan</h3>
              <button 
                onClick={() => setShowDietForm(false)} 
                className="close-button text-gray-300 hover:text-white p-2 rounded-lg touch-manipulation" 
                title="Close"
              >
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            {selectedNutritionist && (
              <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-sm text-purple-300">
                  <strong>Selected Nutritionist:</strong> {selectedNutritionist.first_name} {selectedNutritionist.last_name}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Fitness Goal</label>
                <select
                  value={dietForm.fitnessGoal}
                  onChange={(e) => setDietForm({...dietForm, fitnessGoal: e.target.value})}
                  className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white touch-manipulation"
                >
                  <option value="">Select Goal</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="performance">Performance</option>
                  <option value="custom">Custom Goal</option>
                </select>
              </div>
              
              {dietForm.fitnessGoal === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Custom Goal Description</label>
                  <input
                    type="text"
                    value={dietForm.customGoal || ''}
                    onChange={(e) => setDietForm({...dietForm, customGoal: e.target.value})}
                    className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white touch-manipulation"
                    placeholder="Describe your specific fitness goal..."
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={dietForm.currentWeight}
                    onChange={(e) => setDietForm({...dietForm, currentWeight: e.target.value})}
                    className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white touch-manipulation"
                    placeholder="70"
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Height (cm)</label>
                  <input
                    type="number"
                    value={dietForm.height}
                    onChange={(e) => setDietForm({...dietForm, height: e.target.value})}
                    className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white touch-manipulation"
                    placeholder="170"
                    inputMode="decimal"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Target Weight (kg)</label>
                  <input
                    type="number"
                    value={dietForm.targetWeight}
                    onChange={(e) => setDietForm({...dietForm, targetWeight: e.target.value})}
                    className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white touch-manipulation"
                    placeholder="65"
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Activity Level</label>
                  <select
                    value={dietForm.activityLevel}
                    onChange={(e) => setDietForm({...dietForm, activityLevel: e.target.value})}
                    className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white touch-manipulation"
                  >
                    <option value="">Select Activity Level</option>
                    <option value="sedentary">Sedentary (Little to no exercise)</option>
                    <option value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</option>
                    <option value="moderately_active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                    <option value="very_active">Very Active (Hard exercise 6-7 days/week)</option>
                    <option value="extremely_active">Extremely Active (Very hard exercise, physical job)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Monthly Budget (PKR)</label>
                <input
                  type="number"
                  value={dietForm.budget}
                  onChange={(e) => setDietForm({...dietForm, budget: e.target.value})}
                  className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white touch-manipulation"
                  placeholder="15000"
                  inputMode="decimal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Dietary Restrictions</label>
                <textarea
                  value={dietForm.dietaryRestrictions}
                  onChange={(e) => setDietForm({...dietForm, dietaryRestrictions: e.target.value})}
                  className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white touch-manipulation resize-none"
                  placeholder="Any allergies or dietary preferences..."
                  rows={2}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Additional Notes</label>
                <textarea
                  value={dietForm.additionalNotes}
                  onChange={(e) => setDietForm({...dietForm, additionalNotes: e.target.value})}
                  className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white touch-manipulation resize-none"
                  placeholder="Any other information you'd like to share..."
                  rows={2}
                ></textarea>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleDietRequest}
                  disabled={!dietForm.fitnessGoal || !dietForm.currentWeight || !dietForm.height || !dietForm.targetWeight || !dietForm.activityLevel || !dietForm.budget}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors touch-manipulation min-h-[44px]"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowDietForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors touch-manipulation min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Booking Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="glass-card p-4 sm:p-6 rounded-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-blue-400">Book a Session</h3>
              <button 
                onClick={() => setShowSessionForm(false)} 
                className="close-button text-gray-300 hover:text-white p-2 rounded-lg touch-manipulation" 
                title="Close"
              >
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            {selectedNutritionist && (
              <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  <strong>Selected Nutritionist:</strong> {selectedNutritionist.first_name} {selectedNutritionist.last_name}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Session Type</label>
                <select
                  value={sessionForm.sessionType}
                  onChange={(e) => setSessionForm({...sessionForm, sessionType: e.target.value})}
                  className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none text-white touch-manipulation"
                >
                  <option value="initial_consultation">Initial Consultation</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="meal_plan_review">Meal Plan Review</option>
                  <option value="progress_check">Progress Check</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Preferred Date</label>
                  <input
                    type="date"
                    value={sessionForm.preferredDate}
                    onChange={(e) => {
                      setSessionForm({...sessionForm, preferredDate: e.target.value});
                      if (e.target.value) {
                        fetchAvailableSlots(e.target.value);
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none text-white touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Preferred Time</label>
                  <select
                    value={sessionForm.preferredTime}
                    onChange={(e) => setSessionForm({...sessionForm, preferredTime: e.target.value})}
                    className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none text-white touch-manipulation"
                  >
                    <option value="">Select Time</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.id} value={slot.time_slot}>
                        {slot.time_slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {loadingSlots && (
                <div className="text-center py-2">
                  <div className="text-blue-400 text-sm">Loading available slots...</div>
                </div>
              )}
              
              {availableSlots.length === 0 && sessionForm.preferredDate && !loadingSlots && (
                <div className="text-center py-2">
                  <div className="text-gray-400 text-sm">No available slots for this date</div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Message (Optional)</label>
                <textarea
                  value={sessionForm.message}
                  onChange={(e) => setSessionForm({...sessionForm, message: e.target.value})}
                  className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none text-white touch-manipulation resize-none"
                  rows={2}
                  placeholder="Any specific concerns or goals for this session..."
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleSessionRequest}
                  disabled={!sessionForm.preferredDate || !sessionForm.preferredTime}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors touch-manipulation min-h-[44px]"
                >
                  Book Session
                </button>
                <button
                  onClick={() => setShowSessionForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors touch-manipulation min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Component */}
      {showChat && selectedChatRequest && (
        <Chat
          requestId={selectedChatRequest.id}
          currentUserId={user?.id || 0}
          currentUserRole="member"
          onClose={() => {
            setShowChat(false);
            setSelectedChatRequest(null);
          }}
        />
      )}
    </div>
  );
};
