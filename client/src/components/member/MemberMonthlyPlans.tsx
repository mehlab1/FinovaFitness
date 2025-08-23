import React, { useState, useEffect } from 'react';
import { 
  getAvailableMonthlyPlans, 
  getMemberSubscriptions,
  requestSubscription,
  cancelSubscription,
  type AvailableMonthlyPlan,
  type MemberSubscription
} from '../../services/api/memberMonthlyPlanApi';
import { useToast } from '../Toast';

interface MemberMonthlyPlansProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  user: any;
}

export const MemberMonthlyPlans: React.FC<MemberMonthlyPlansProps> = ({ showToast, user }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'subscriptions'>('browse');
  const [availablePlans, setAvailablePlans] = useState<AvailableMonthlyPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<MemberSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    trainer_name: '',
    price_min: '',
    price_max: '',
    session_type: ''
  });

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'browse') {
      loadAvailablePlans();
    } else {
      loadSubscriptions();
    }
  }, [activeTab, filters]);

  const loadAvailablePlans = async () => {
    try {
      setLoading(true);
      const plans = await getAvailableMonthlyPlans(user.id, {
        trainer_name: filters.trainer_name || undefined,
        price_min: filters.price_min ? parseFloat(filters.price_min) : undefined,
        price_max: filters.price_max ? parseFloat(filters.price_max) : undefined,
        session_type: filters.session_type || undefined
      });
      setAvailablePlans(plans);
    } catch (error) {
      showToast('Failed to load available plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const subs = await getMemberSubscriptions(user.id);
      setSubscriptions(subs);
    } catch (error) {
      showToast('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubscription = async (planId: number) => {
    try {
      setLoading(true);
      const result = await requestSubscription(user.id, planId);
      showToast(result.message, 'success');
      // Refresh data
      if (activeTab === 'browse') {
        loadAvailablePlans();
      } else {
        loadSubscriptions();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to request subscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: number, reason?: string) => {
    try {
      setLoading(true);
      const result = await cancelSubscription(user.id, subscriptionId, reason);
      showToast(result.message, 'success');
      loadSubscriptions();
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel subscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      case 'expired': return 'text-gray-400';
      case 'paused': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      paused: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Monthly Training Plans
          </h1>
          <p className="text-gray-400 mt-2">
            Browse available training plans and manage your subscriptions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'browse'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-search mr-2"></i>
            Browse Plans
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'subscriptions'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-list mr-2"></i>
            My Subscriptions
          </button>
        </div>

        {/* Browse Plans Tab */}
        {activeTab === 'browse' && (
          <div>
            {/* Filters */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">
                <i className="fas fa-filter mr-2"></i>
                Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Trainer Name
                  </label>
                  <input
                    type="text"
                    placeholder="Search trainers..."
                    value={filters.trainer_name}
                    onChange={(e) => setFilters({ ...filters, trainer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="Min price..."
                    value={filters.price_min}
                    onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="Max price..."
                    value={filters.price_max}
                    onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Session Type
                  </label>
                  <select
                    value={filters.session_type}
                    onChange={(e) => setFilters({ ...filters, session_type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Types</option>
                    <option value="personal">Personal</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : availablePlans.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Plans Found</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later for new plans.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePlans.map((plan) => (
                  <div key={plan.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all">
                    {/* Plan Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{plan.plan_name}</h3>
                        <p className="text-purple-400 font-semibold">${plan.monthly_price}/month</p>
                      </div>
                      {plan.is_subscribed && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                          Subscribed
                        </span>
                      )}
                    </div>

                    {/* Trainer Info */}
                    <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">
                            {plan.trainer_first_name[0]}{plan.trainer_last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {plan.trainer_first_name} {plan.trainer_last_name}
                          </p>
                          {plan.specialization && (
                            <p className="text-sm text-gray-400">{plan.specialization}</p>
                          )}
                        </div>
                      </div>
                      {plan.rating && (
                        <div className="flex items-center text-yellow-400">
                          <i className="fas fa-star mr-1"></i>
                          <span className="text-sm">{plan.rating}/5</span>
                        </div>
                      )}
                    </div>

                    {/* Plan Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sessions:</span>
                        <span className="text-white">{plan.sessions_per_month} per month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{plan.session_duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white capitalize">{plan.session_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Available:</span>
                        <span className="text-white">
                          {plan.max_subscribers - plan.active_subscriptions} spots left
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {plan.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{plan.description}</p>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleRequestSubscription(plan.id)}
                      disabled={plan.is_subscribed || plan.max_subscribers <= plan.active_subscriptions || loading}
                      className={`w-full py-2 px-4 rounded-md font-medium transition-all ${
                        plan.is_subscribed
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : plan.max_subscribers <= plan.active_subscriptions
                          ? 'bg-red-600 text-white cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg'
                      }`}
                    >
                      {plan.is_subscribed ? (
                        <i className="fas fa-check mr-2"></i>
                      ) : plan.max_subscribers <= plan.active_subscriptions ? (
                        <i className="fas fa-times mr-2"></i>
                      ) : (
                        <i className="fas fa-plus mr-2"></i>
                      )}
                      {plan.is_subscribed 
                        ? 'Already Subscribed' 
                        : plan.max_subscribers <= plan.active_subscriptions 
                        ? 'Fully Booked' 
                        : 'Request Subscription'
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-list text-4xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Subscriptions</h3>
                <p className="text-gray-500">You haven't subscribed to any plans yet.</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-all"
                >
                  Browse Plans
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{subscription.plan_name}</h3>
                        <p className="text-purple-400 font-semibold">${subscription.monthly_price}/month</p>
                      </div>
                      {getStatusBadge(subscription.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Trainer</p>
                        <p className="text-white font-medium">
                          {subscription.trainer_first_name} {subscription.trainer_last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Sessions Remaining</p>
                        <p className="text-white font-medium">{subscription.sessions_remaining}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Start Date</p>
                        <p className="text-white font-medium">
                          {new Date(subscription.subscription_start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        <p>Total Paid: ${subscription.total_paid}</p>
                        <p>Payment Date: {new Date(subscription.payment_date).toLocaleDateString()}</p>
                      </div>
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => handleCancelSubscription(subscription.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
