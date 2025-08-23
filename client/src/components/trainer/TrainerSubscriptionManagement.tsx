import React, { useState, useEffect } from 'react';
import { 
  getPendingSubscriptions, 
  getTrainerSubscriptions,
  getTrainerSubscriptionStats,
  approveSubscriptionRequest,
  rejectSubscriptionRequest,
  type PendingSubscription,
  type TrainerSubscription,
  type SubscriptionStats
} from '../../services/api/trainerSubscriptionApi';
import { useToast } from '../Toast';

interface TrainerSubscriptionManagementProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const TrainerSubscriptionManagement: React.FC<TrainerSubscriptionManagementProps> = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'stats'>('pending');
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<TrainerSubscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingSubscriptions();
    } else if (activeTab === 'all') {
      loadAllSubscriptions();
    } else {
      loadStats();
    }
  }, [activeTab, statusFilter]);

  const loadPendingSubscriptions = async () => {
    try {
      setLoading(true);
      const subscriptions = await getPendingSubscriptions();
      setPendingSubscriptions(subscriptions);
    } catch (error) {
      showToast('Failed to load pending subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAllSubscriptions = async () => {
    try {
      setLoading(true);
      const subscriptions = await getTrainerSubscriptions(statusFilter || undefined);
      setAllSubscriptions(subscriptions);
    } catch (error) {
      showToast('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await getTrainerSubscriptionStats();
      setStats(statsData);
    } catch (error) {
      showToast('Failed to load statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubscription = async (subscriptionId: number, notes?: string) => {
    try {
      setLoading(true);
      const result = await approveSubscriptionRequest(subscriptionId, notes);
      showToast(result.message, 'success');
      // Refresh data
      if (activeTab === 'pending') {
        loadPendingSubscriptions();
      } else if (activeTab === 'all') {
        loadAllSubscriptions();
      } else {
        loadStats();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to approve subscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubscription = async (subscriptionId: number, reason?: string) => {
    try {
      setLoading(true);
      const result = await rejectSubscriptionRequest(subscriptionId, reason);
      showToast(result.message, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to reject subscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      paused: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatTimeAgo = (hours: number) => {
    if (hours < 1) return 'Less than 1 hour ago';
    if (hours < 24) return `${Math.floor(hours)} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Subscription Management
          </h1>
          <p className="text-gray-400 mt-2">
            Manage member subscription requests and track your training business
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-clock mr-2"></i>
            Pending Requests
            {pendingSubscriptions.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {pendingSubscriptions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-list mr-2"></i>
            All Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-chart-bar mr-2"></i>
            Statistics
          </button>
        </div>

        {/* Pending Requests Tab */}
        {activeTab === 'pending' && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : pendingSubscriptions.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-check-circle text-4xl text-green-600 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Pending Requests</h3>
                <p className="text-gray-500">All subscription requests have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="bg-gray-800 rounded-lg p-6 border border-yellow-500/30">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{subscription.plan_name}</h3>
                        <p className="text-purple-400 font-semibold">${subscription.monthly_price}/month</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(subscription.status)}
                        <p className="text-sm text-gray-400 mt-1">
                          {formatTimeAgo(subscription.hours_since_request)}
                        </p>
                      </div>
                    </div>

                    {/* Member Info */}
                    <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">
                            {subscription.member_first_name[0]}{subscription.member_last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {subscription.member_first_name} {subscription.member_last_name}
                          </p>
                          <p className="text-sm text-gray-400">{subscription.member_email}</p>
                          {subscription.member_phone && (
                            <p className="text-sm text-gray-400">{subscription.member_phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>Membership Status: {subscription.membership_status || 'N/A'}</p>
                        <p>Member Since: {subscription.membership_start_date ? new Date(subscription.membership_start_date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>

                    {/* Plan Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Sessions</p>
                        <p className="text-white font-medium">{subscription.sessions_per_month} per month</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Duration</p>
                        <p className="text-white font-medium">{subscription.session_duration} minutes</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Type</p>
                        <p className="text-white font-medium capitalize">{subscription.session_type}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproveSubscription(subscription.id)}
                        disabled={loading}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-all"
                      >
                        <i className="fas fa-check mr-2"></i>
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectSubscription(subscription.id)}
                        disabled={loading}
                        className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Subscriptions Tab */}
        {activeTab === 'all' && (
          <div>
            {/* Status Filter */}
            <div className="mb-6">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : allSubscriptions.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-list text-4xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Subscriptions Found</h3>
                <p className="text-gray-500">No subscriptions match your current filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{subscription.plan_name}</h3>
                        <p className="text-purple-400 font-semibold">${subscription.monthly_price}/month</p>
                      </div>
                      {getStatusBadge(subscription.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Member</p>
                        <p className="text-white font-medium">
                          {subscription.member_first_name} {subscription.member_last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Sessions Remaining</p>
                        <p className="text-white font-medium">{subscription.sessions_remaining}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Completed Sessions</p>
                        <p className="text-white font-medium">{subscription.completed_sessions}</p>
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
                      {subscription.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveSubscription(subscription.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectSubscription(subscription.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-users text-white"></i>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Subscriptions</p>
                        <p className="text-white font-bold text-xl">{stats.total_subscriptions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-clock text-white"></i>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Pending Requests</p>
                        <p className="text-white font-bold text-xl">{stats.pending_requests}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-check-circle text-white"></i>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Active Subscriptions</p>
                        <p className="text-white font-bold text-xl">{stats.active_subscriptions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-dollar-sign text-white"></i>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-white font-bold text-xl">${stats.total_revenue || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-purple-400">
                    <i className="fas fa-history mr-2"></i>
                    Recent Activity
                  </h3>
                  {stats.recent_activity.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No recent activity</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recent_activity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                              <i className="fas fa-user text-white text-xs"></i>
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {activity.first_name} {activity.last_name}
                              </p>
                              <p className="text-gray-400 text-sm">{activity.plan_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(activity.status)}
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-chart-bar text-4xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Statistics Available</h3>
                <p className="text-gray-500">Statistics will appear once you have subscription data.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
