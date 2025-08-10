import { useState, useEffect } from 'react';
import { User } from '../types';
import { facilities, exercises } from '../data/mockData';
import { useToast } from './Toast';
import { memberApi } from '../services/api/memberApi';

interface MemberPortalProps {
  user: User | null;
  onLogout: () => void;
}

export const MemberPortal = ({ user, onLogout }: MemberPortalProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { showToast } = useToast();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} showToast={showToast} />;
      case 'profile':
        return <Profile user={user} showToast={showToast} />;
      case 'membership':
        return <Membership user={user} showToast={showToast} />;
      case 'workout':
        return <WorkoutSchedule showToast={showToast} />;
      case 'trainers':
        return <TrainersTab showToast={showToast} />;
      case 'nutritionists':
        return <NutritionistsTab showToast={showToast} />;
      case 'facilities':
        return <FacilitiesBooking showToast={showToast} />;
      case 'store':
        return <MemberStore showToast={showToast} />;
      case 'loyalty':
        return <LoyaltyReferrals user={user} showToast={showToast} />;
      case 'announcements':
        return <MemberAnnouncements showToast={showToast} />;
      case 'reviews':
        return <Reviews showToast={showToast} />;
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
      <div className="ml-64 flex-1">
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
        
        <div className="p-6">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

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
  }, [showToast]);

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    setTopUpLoading(true);
    try {
      const result = await memberApi.topUpBalance(parseFloat(topUpAmount));
      showToast('Balance topped up successfully!', 'success');
      setTopUpAmount('');
      setShowBalanceModal(false);
      
      // Refresh dashboard data to get updated balance
      const data = await memberApi.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Top-up failed:', error);
      showToast('Failed to top up balance', 'error');
    } finally {
      setTopUpLoading(false);
    }
  };

  const refreshDashboardData = async () => {
    try {
      const data = await memberApi.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  };

  const openBalanceModal = async () => {
    await refreshDashboardData();
    setShowBalanceModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTransactionTypeColor = (type: string) => {
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
  };

  const getTransactionTypeIcon = (type: string) => {
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
  };

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

  const profile = dashboardData?.profile || {};
  const currentPlan = dashboardData?.currentPlan || {};
  const loyaltyStats = dashboardData?.loyaltyStats || {};
  const referralCount = dashboardData?.referralCount || 0;
  const workoutStats = dashboardData?.workoutStats || {};

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
              {dashboardData?.balance?.current_balance ? formatCurrency(dashboardData.balance.current_balance) : '$0.00'}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl w-full max-w-sm mx-auto shadow-2xl border border-gray-700/50 animate-slideUp overflow-hidden transform transition-all duration-300 hover:scale-[1.02] max-h-[85vh]">
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
                  onClick={() => setShowBalanceModal(false)}
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
                      {dashboardData?.balance?.current_balance ? formatCurrency(parseFloat(dashboardData.balance.current_balance)) : '$0.00'}
                    </p>
                    <div className="flex justify-center space-x-3 text-xs">
                      <div className="text-center">
                        <p className="text-purple-200 opacity-60">Earned</p>
                        <p className="text-white font-medium">{dashboardData?.balance?.total_earned ? formatCurrency(parseFloat(dashboardData.balance.total_earned)) : '$0.00'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-purple-200 opacity-60">Spent</p>
                        <p className="text-white font-medium">{dashboardData?.balance?.total_spent ? formatCurrency(parseFloat(dashboardData.balance.total_spent)) : '$0.00'}</p>
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
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null,
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

const Membership = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [autoRenew, setAutoRenew] = useState(true);
  const [membershipData, setMembershipData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planChangeDetails, setPlanChangeDetails] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        const data = await memberApi.getDashboard();
        setMembershipData(data);
      } catch (error) {
        console.error('Failed to fetch membership data:', error);
        showToast('Failed to load membership data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipData();
  }, []);

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
    try {
      const data = await memberApi.confirmPlanChange({
        requestId,
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
        setMembershipData(updatedData);
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
              <p><strong>Status:</strong> <span className="text-green-400">Active</span></p>
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
              <button
                onClick={() => showToast('Subscription paused for 30 days', 'info')}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Pause Subscription
              </button>
              <button
                onClick={() => showToast('Subscription cancelled. You can reactivate anytime.', 'info')}
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
    </div>
  );
};

const WorkoutSchedule = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumn, setNewColumn] = useState('');

  const workoutData: { [key: string]: { [key: string]: string[] } } = {
    Monday: {
      Shoulders: ['Military Press', 'Lateral Raises', 'Front Raises'],
      Chest: ['Bench Press', 'Push-ups', 'Dumbbell Flyes'],
      Biceps: ['Barbell Curls', 'Hammer Curls', 'Preacher Curls']
    },
    Tuesday: {
      Back: ['Pull-ups', 'Deadlifts', 'Rows'],
      Triceps: ['Dips', 'Skull Crushers', 'Tricep Extensions'],
      Legs: ['Squats', 'Lunges', 'Calf Raises']
    },
    Wednesday: {
      Chest: ['Incline Bench Press', 'Decline Bench Press', 'Cable Flyes', 'Dumbbell Press', 'Push-ups'],
      Shoulders: ['Military Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes', 'Arnold Press'],
      Biceps: ['Barbell Curls', 'Hammer Curls', 'Preacher Curls', 'Concentration Curls', 'Incline Curls'],
      Triceps: ['Dips', 'Skull Crushers', 'Tricep Extensions', 'Overhead Extensions', 'Rope Pushdowns'],
      Back: ['Pull-ups', 'Deadlifts', 'Rows', 'Lat Pulldowns', 'Face Pulls'],
      Legs: ['Squats', 'Lunges', 'Calf Raises', 'Leg Press', 'Romanian Deadlifts']
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddColumn = () => {
    if (newColumn.trim() && expandedDay) {
      if (workoutData[expandedDay]) {
        workoutData[expandedDay][newColumn] = [];
      }
      setNewColumn('');
      setShowAddColumn(false);
      showToast(`Added new muscle group: ${newColumn}`, 'success');
    }
  };

  const handleAddExercise = (day: string, muscleGroup: string) => {
    const exerciseName = prompt(`Add exercise for ${muscleGroup}:`);
    if (exerciseName && workoutData[day] && workoutData[day][muscleGroup]) {
      workoutData[day][muscleGroup].push(exerciseName);
      showToast(`Added exercise: ${exerciseName}`, 'success');
    }
  };

  const getAISuggestion = (day: string) => {
    if (day === 'Monday' || day === 'Tuesday') {
      return { message: 'Perfect plan for your goals and BMI!', color: 'text-green-400', bgColor: 'bg-green-500' };
    } else if (day === 'Wednesday') {
      return { message: 'This is not healthy! Please consult professional help.', color: 'text-red-400', bgColor: 'bg-red-500' };
    }
    return { message: 'Good workout plan!', color: 'text-blue-400', bgColor: 'bg-blue-500' };
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Weekly Workout Schedule
        </h2>
        
        {/* Weekly Overview */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <div className="grid grid-cols-7 gap-4">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                className={`p-4 rounded-lg text-center transition-all duration-300 ${
                  expandedDay === day 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="font-bold">{day}</div>
                <div className="text-sm opacity-75">
                  {workoutData[day as keyof typeof workoutData] ? 
                    Object.keys(workoutData[day as keyof typeof workoutData]).length + ' groups' : 
                    'No plan'
                  }
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Day View */}
        {expandedDay && workoutData[expandedDay as keyof typeof workoutData] && (
          <div className="glass-card p-6 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-400">{expandedDay} Workout</h3>
              <button
                onClick={() => setShowAddColumn(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Add Muscle Group
              </button>
            </div>

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
                  {Object.entries(workoutData[expandedDay as keyof typeof workoutData]).map(([muscleGroup, exercises]) => (
                    <tr key={muscleGroup} className="border-b border-gray-700">
                      <td className="p-3 font-semibold text-green-400">{muscleGroup}</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {exercises.map((exercise, index) => (
                            <div key={index} className="text-gray-300">• {exercise}</div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleAddExercise(expandedDay, muscleGroup)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          <i className="fas fa-plus mr-1"></i>Add Exercise
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Suggestions Bar */}
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
          </div>
        )}

        {/* Add Column Modal */}
        {showAddColumn && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
            <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-green-400">Add Muscle Group</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newColumn}
                  onChange={(e) => setNewColumn(e.target.value)}
                  placeholder="Muscle group name"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddColumn}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                  >
                    Add Group
                  </button>
                  <button
                    onClick={() => setShowAddColumn(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<{ [key: string]: boolean }>({});

  const handleReserve = (facility: string, time: string) => {
    const key = `${facility}-${time}`;
    setBookings({ ...bookings, [key]: true });
    showToast(`${facility} reserved for ${time}`, 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-lg font-semibold">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
          />
        </div>
        
        <div className="space-y-6">
          {facilities.map((facility) => (
            <div key={facility.id} className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-blue-400 mb-4">{facility.name}</h3>
              <p className="text-gray-300 mb-4">Capacity: {facility.capacity} people</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {facility.timeSlots.map((time) => {
                  const key = `${facility.name}-${time}`;
                  const isBooked = bookings[key];
                  return (
                    <button
                      key={time}
                      onClick={() => !isBooked && handleReserve(facility.name, time)}
                      className={`facility-slot p-4 rounded-lg text-center transition-all duration-300 ${
                        isBooked 
                          ? 'reserved cursor-not-allowed' 
                          : 'available hover:scale-105'
                      }`}
                      disabled={isBooked}
                    >
                      <div className="text-sm font-semibold">{time}</div>
                      <div className="text-xs mt-1">
                        {isBooked ? 'Reserved' : 'Available'}
                      </div>
                    </button>
                  );
                })}
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

const Reviews = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const bookings = [
    { id: 1, date: '2024-01-15', type: 'Personal Training', trainer: 'Sarah Johnson' },
    { id: 2, date: '2024-01-12', type: 'Facility Booking', facility: 'Pool' },
    { id: 3, date: '2024-01-10', type: 'Personal Training', trainer: 'Mike Chen' },
    { id: 4, date: '2024-01-08', type: 'Nutrition Consultation', nutritionist: 'Dr. Emily Wilson' }
  ];

  const handleReview = (booking: any) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const submitReview = () => {
    showToast('Thank you for your review!', 'success');
    setShowReviewModal(false);
    setRating(5);
    setComment('');
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Booking History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Details</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="table-row">
                  <td className="p-3">{booking.date}</td>
                  <td className="p-3">{booking.type}</td>
                  <td className="p-3">
                    {booking.trainer || booking.facility || booking.nutritionist}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleReview(booking)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-green-400 mb-4">Leave a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-600'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={submitReview}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TrainersTab = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await memberApi.getTrainers();
        setTrainers(data);
      } catch (error) {
        console.error('Failed to fetch trainers:', error);
        showToast('Failed to load trainers', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, [showToast]);

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
          <p className="text-gray-300">Loading trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Our Trainers
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.length === 0 ? (
          <p className="text-gray-400 text-center py-4 col-span-full">No trainers available</p>
        ) : (
          trainers.map((trainer) => (
            <div key={trainer.id} className="glass-card p-6 rounded-2xl text-center hover-glow transition-all duration-300">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-400">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                  alt={`${trainer.first_name} ${trainer.last_name}`} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-xl font-bold text-blue-400 mb-2">
                {trainer.first_name} {trainer.last_name}
              </h3>
              <p className="text-green-400 mb-2">
                {trainer.specialization?.[0] || 'Personal Trainer'}
              </p>
              <p className="text-gray-300 text-sm mb-2">
                {trainer.bio || 'Experienced fitness professional'}
              </p>
              <p className="text-yellow-400 text-sm mb-4">
                ⭐ {trainer.average_rating ? parseFloat(trainer.average_rating).toFixed(1) : '5.0'} 
                ({trainer.total_ratings || 0} reviews)
              </p>
              <button
                onClick={() => setSelectedTrainer(trainer)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Book Session
              </button>
            </div>
          ))
        )}
      </div>

      {/* Trainer Schedule Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-400">{selectedTrainer.name}'s Schedule</h3>
              <button onClick={() => setSelectedTrainer(null)} className="close-button text-gray-300 hover:text-white p-2 rounded-lg" title="Close">
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-300 mb-4">{selectedTrainer.bio}</p>
              <div>
                <h4 className="font-bold text-green-400 mb-2">Available Times:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTrainer.schedule.map((time: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        showToast(`Booked session with ${selectedTrainer.name} at ${time}`, 'success');
                        setSelectedTrainer(null);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      {time}
                    </button>
                  ))}
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

const NutritionistsTab = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [selectedNutritionist, setSelectedNutritionist] = useState<any>(null);
  const [showDietForm, setShowDietForm] = useState(false);
  const [dietForm, setDietForm] = useState({
    fitnessGoal: '',
    currentWeight: '',
    targetWeight: '',
    budget: '',
    dietaryRestrictions: ''
  });

  const nutritionists = [
    {
      id: '1',
      name: 'Dr. Emily Wilson',
      specialty: 'Sports Nutrition',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      bio: 'Dr. Wilson specializes in sports nutrition and performance optimization.',
      schedule: ['11:00 AM', '4:00 PM', '6:00 PM']
    },
    {
      id: '2',
      name: 'Dr. Maria Garcia',
      specialty: 'Weight Management',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      bio: 'Dr. Garcia focuses on sustainable weight management and healthy eating habits.',
      schedule: ['10:00 AM', '3:00 PM', '5:30 PM']
    }
  ];

  const handleDietRequest = () => {
    showToast('Diet plan request submitted successfully!', 'success');
    setShowDietForm(false);
    setDietForm({
      fitnessGoal: '',
      currentWeight: '',
      targetWeight: '',
      budget: '',
      dietaryRestrictions: ''
    });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Our Nutritionists
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nutritionists.map((nutritionist) => (
          <div key={nutritionist.id} className="glass-card p-6 rounded-2xl text-center hover-glow transition-all duration-300">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-400">
              <img src={nutritionist.image} alt={nutritionist.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">{nutritionist.name}</h3>
            <p className="text-green-400 mb-2">{nutritionist.specialty}</p>
            <p className="text-gray-300 text-sm mb-4">{nutritionist.bio}</p>
            <button
              onClick={() => setShowDietForm(true)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Request Diet Plan
            </button>
          </div>
        ))}
      </div>

      {/* Diet Plan Request Modal */}
      {showDietForm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-400">Request Diet Plan</h3>
              <button onClick={() => setShowDietForm(false)} className="close-button text-gray-300 hover:text-white p-2 rounded-lg" title="Close">
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fitness Goal</label>
                <select
                  value={dietForm.fitnessGoal}
                  onChange={(e) => setDietForm({...dietForm, fitnessGoal: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Select Goal</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="performance">Performance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  value={dietForm.currentWeight}
                  onChange={(e) => setDietForm({...dietForm, currentWeight: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  value={dietForm.targetWeight}
                  onChange={(e) => setDietForm({...dietForm, targetWeight: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="65"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Budget (PKR)</label>
                <input
                  type="number"
                  value={dietForm.budget}
                  onChange={(e) => setDietForm({...dietForm, budget: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dietary Restrictions</label>
                <textarea
                  value={dietForm.dietaryRestrictions}
                  onChange={(e) => setDietForm({...dietForm, dietaryRestrictions: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="Any allergies or dietary preferences..."
                  rows={3}
                ></textarea>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleDietRequest}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowDietForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
