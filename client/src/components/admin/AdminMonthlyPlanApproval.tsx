import React, { useState, useEffect } from 'react';
import { 
  getPendingMonthlyPlans, 
  getApprovedMonthlyPlans, 
  getMonthlyPlanStats,
  approveMonthlyPlan,
  rejectMonthlyPlan,
  type MonthlyPlan,
  type MonthlyPlanStats
} from '../../services/api/adminMonthlyPlanApi';
import { useToast } from '../Toast';

interface AdminMonthlyPlanApprovalProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminMonthlyPlanApproval: React.FC<AdminMonthlyPlanApprovalProps> = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'stats'>('pending');
  const [pendingPlans, setPendingPlans] = useState<MonthlyPlan[]>([]);
  const [approvedPlans, setApprovedPlans] = useState<MonthlyPlan[]>([]);
  const [stats, setStats] = useState<MonthlyPlanStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MonthlyPlan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  // Get admin ID from localStorage (assuming it's stored there)
  const adminId = parseInt(localStorage.getItem('userId') || '1');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const data = await getPendingMonthlyPlans();
        setPendingPlans(data);
      } else if (activeTab === 'approved') {
        const data = await getApprovedMonthlyPlans();
        setApprovedPlans(data);
      } else if (activeTab === 'stats') {
        const data = await getMonthlyPlanStats();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (plan: MonthlyPlan, action: 'approve' | 'reject') => {
    setSelectedPlan(plan);
    setModalAction(action);
    setComments('');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    try {
      if (modalAction === 'approve') {
        await approveMonthlyPlan(selectedPlan.id, adminId, comments);
        showToast(`Plan "${selectedPlan.plan_name}" approved successfully!`, 'success');
      } else {
        await rejectMonthlyPlan(selectedPlan.id, adminId, comments);
        showToast(`Plan "${selectedPlan.plan_name}" rejected`, 'success');
      }
      
      setShowModal(false);
      setSelectedPlan(null);
      setComments('');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error processing action:', error);
      showToast(`Failed to ${modalAction} plan`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatTimeAgo = (hours: number) => {
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderPlanCard = (plan: MonthlyPlan, showActions = false) => (
    <div key={plan.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
            {plan.plan_name}
          </h3>
          <p className="text-gray-400 text-sm">
            by {plan.trainer_first_name} {plan.trainer_last_name}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            {formatPrice(plan.monthly_price)}
          </div>
          <div className="text-gray-400 text-sm">per month</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="text-cyan-400 font-semibold">{plan.sessions_per_month}</div>
          <div className="text-gray-400 text-sm">Sessions/month</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="text-pink-400 font-semibold">{plan.session_duration}min</div>
          <div className="text-gray-400 text-sm">Session duration</div>
        </div>
      </div>

      {plan.description && (
        <p className="text-gray-300 mb-4 text-sm">{plan.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span>Type: {plan.session_type}</span>
        <span>Max: {plan.max_subscribers} subscribers</span>
      </div>

      {plan.hours_since_created && (
        <div className="text-xs text-gray-500 mb-4">
          Created {formatTimeAgo(plan.hours_since_created)}
        </div>
      )}

      {showActions && (
        <div className="flex space-x-3">
          <button
            onClick={() => handleAction(plan, 'approve')}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-500/50 px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <i className="fas fa-check"></i>
            <span>Approve</span>
          </button>
          <button
            onClick={() => handleAction(plan, 'reject')}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <i className="fas fa-times"></i>
            <span>Reject</span>
          </button>
        </div>
      )}

      {!showActions && plan.active_subscriptions !== undefined && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-400 font-semibold">{plan.active_subscriptions}</div>
          <div className="text-gray-400 text-sm">Active subscriptions</div>
        </div>
      )}
    </div>
  );

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-400">{stats.totalPlans}</div>
            <div className="text-gray-400">Total Plans</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-yellow-400">{stats.pendingPlans}</div>
            <div className="text-gray-400">Pending Approval</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-400">{stats.approvedPlans}</div>
            <div className="text-gray-400">Approved Plans</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-cyan-400">{stats.activeSubscriptions}</div>
            <div className="text-gray-400">Active Subscriptions</div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="text-3xl font-bold text-green-400">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(stats.totalRevenue)}
          </div>
          <div className="text-gray-400">Total Revenue from Monthly Plans</div>
        </div>

        {/* Plans by Trainer */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Plans by Trainer</h3>
          <div className="space-y-3">
            {stats.plansByTrainer.map((trainer) => (
              <div key={trainer.trainer_id} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
                <span className="text-gray-300">{trainer.trainer_name}</span>
                <div className="flex space-x-4 text-sm">
                  <span className="text-green-400">{trainer.approved_plans} approved</span>
                  <span className="text-yellow-400">{trainer.pending_plans} pending</span>
                  <span className="text-red-400">{trainer.rejected_plans} rejected</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
                <div>
                  <span className="text-gray-300">{activity.plan_name}</span>
                  <span className="text-gray-500 text-sm ml-2">by {activity.trainer_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    activity.admin_approved 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {activity.admin_approved ? 'Approved' : 'Rejected'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(activity.admin_approval_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          MONTHLY PLAN APPROVAL
        </h1>
        <p className="text-gray-300">Manage trainer monthly plan approvals and view statistics.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-lg p-1">
        {[
          { id: 'pending', label: 'Pending Approval', icon: 'fas fa-clock', count: pendingPlans.length },
          { id: 'approved', label: 'Approved Plans', icon: 'fas fa-check-circle', count: approvedPlans.length },
          { id: 'stats', label: 'Statistics', icon: 'fas fa-chart-bar' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-purple-400 mb-4"></i>
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      ) : (
        <div>
          {activeTab === 'pending' && (
            <div>
              {pendingPlans.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-check-circle text-6xl text-green-400 mb-4"></i>
                  <h3 className="text-xl font-bold text-gray-300 mb-2">No Pending Plans</h3>
                  <p className="text-gray-400">All monthly plans have been reviewed!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingPlans.map((plan) => renderPlanCard(plan, true))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div>
              {approvedPlans.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-clipboard-list text-6xl text-blue-400 mb-4"></i>
                  <h3 className="text-xl font-bold text-gray-300 mb-2">No Approved Plans</h3>
                  <p className="text-gray-400">No monthly plans have been approved yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {approvedPlans.map((plan) => renderPlanCard(plan, false))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && renderStats()}
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 animate-slide-up">
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              {modalAction === 'approve' ? 'Approve' : 'Reject'} Plan
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                <span className="font-semibold">{selectedPlan.plan_name}</span> by{' '}
                <span className="font-semibold">{selectedPlan.trainer_first_name} {selectedPlan.trainer_last_name}</span>
              </p>
              <p className="text-gray-400 text-sm">
                {formatPrice(selectedPlan.monthly_price)} • {selectedPlan.sessions_per_month} sessions/month
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={`Add a comment for ${modalAction === 'approve' ? 'approval' : 'rejection'}...`}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={processing}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={processing}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 ${
                  modalAction === 'approve'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {processing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <i className={`fas fa-${modalAction === 'approve' ? 'check' : 'times'}`}></i>
                    <span>{modalAction === 'approve' ? 'Approve' : 'Reject'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
