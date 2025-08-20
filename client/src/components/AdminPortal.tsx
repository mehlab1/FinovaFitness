import { useState, useEffect } from 'react';
import { User } from '../types';
import { useToast } from './Toast';

import { adminApi, MemberStats, SessionStats, getRevenueStats, RevenueStats } from '../services/api/adminApi';
import { adminFacilitiesApi } from '../services/api/facilitiesApi';
import { 
  Facility, 
  CreateFacilityData, 
  UpdateFacilityData,
  FacilitySchedule,
  FacilitySlot,
  FacilityBooking,
  FacilityAnalytics,
  WaitlistEntry
} from '../services/api/facilitiesApi';
import { RevenueDashboard } from './RevenueDashboard';
import { RevenueManagement } from './RevenueManagement';

interface AdminPortalProps {
  user: User | null;
  onLogout: () => void;
}

export const AdminPortal = ({ user, onLogout }: AdminPortalProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { showToast } = useToast();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard user={user} showToast={showToast} />;
      case 'members':
        return <MemberDirectory showToast={showToast} />;
      case 'staff':
        return <StaffManagement showToast={showToast} />;
      case 'bookings':
        return <BookingsManagement showToast={showToast} />;
      case 'plans':
        return <PlansManagement showToast={showToast} />;
      case 'revenue':
        return <RevenueManagement showToast={showToast} />;
      case 'loyalty':
        return <LoyaltyManagement showToast={showToast} />;
      case 'rewards':
        return <RewardsManagement showToast={showToast} />;
      case 'analytics':
        return <AdminAnalytics showToast={showToast} />;
      case 'announcements':
        return <AnnouncementsManagement showToast={showToast} />;
      case 'subscription':
        return <SubscriptionManagement showToast={showToast} />;
      default:
        return <AdminDashboard user={user} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="sidebar w-64 h-screen fixed left-0 top-0 p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-6 flex-shrink-0">
          <i className="fas fa-dumbbell text-2xl text-orange-400 neon-glow"></i>
          <h1 className="text-xl font-bold text-orange-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            FINOVA FITNESS
          </h1>
        </div>
        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto enhanced-scroll pr-2">
            <nav className="space-y-2 pb-4">
              {[
                { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-orange-400' },
                { id: 'members', icon: 'fas fa-users', label: 'Member Directory', color: 'text-blue-400' },
                { id: 'staff', icon: 'fas fa-user-tie', label: 'Staff Management', color: 'text-green-400' },
                { id: 'bookings', icon: 'fas fa-calendar-alt', label: 'Bookings & Facilities', color: 'text-pink-400' },
                { id: 'plans', icon: 'fas fa-tags', label: 'Plans & Pricing', color: 'text-purple-400' },
                { id: 'revenue', icon: 'fas fa-dollar-sign', label: 'Revenue Management', color: 'text-green-400' },
                { id: 'loyalty', icon: 'fas fa-gift', label: 'Loyalty & Referrals', color: 'text-blue-400' },
                { id: 'rewards', icon: 'fas fa-trophy', label: 'Consistency Rewards', color: 'text-green-400' },
                { id: 'analytics', icon: 'fas fa-chart-line', label: 'Analytics', color: 'text-pink-400' },
                { id: 'announcements', icon: 'fas fa-bullhorn', label: 'Announcements', color: 'text-yellow-400' },
                { id: 'subscription', icon: 'fas fa-cogs', label: 'Subscription Management', color: 'text-purple-400' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-orange-400 hover:bg-opacity-10 transition-all ${
                    currentPage === item.id ? 'bg-orange-400 bg-opacity-20' : ''
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
            <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
              <div className="text-sm text-gray-300">Admin: {user?.name}</div>
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

const AdminDashboard = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [memberStats, setMemberStats] = useState<MemberStats>({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    newMembersThisMonth: 0,
  });
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    sessionsToday: 0,
    sessionsThisMonth: 0,
    sessionsThisYear: 0,
    totalSessions: 0,
    trainerSessionBreakdown: [],
    sessionTypeBreakdown: [],
    recentSessions: [],
  });
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showRevenueDashboard, setShowRevenueDashboard] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [memberStatsData, sessionStatsData, revenueStatsData] = await Promise.all([
          adminApi.getMemberStats(),
          adminApi.getSessionStats(),
          getRevenueStats()
        ]);
        setMemberStats(memberStatsData);
        setSessionStats(sessionStatsData);
        setRevenueStats(revenueStatsData);
      } catch (error) {
        console.error('Error fetching stats:', error);
        showToast('Failed to load dashboard statistics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-orange-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          ADMIN DASHBOARD
        </h1>
        <p className="text-gray-300">Welcome back, {user?.name}! Here's your gym overview.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="metric-card p-6 rounded-xl border-orange-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-orange-400" style={{ fontFamily: 'Orbitron, monospace' }}>Total Members</h3>
            <i className="fas fa-users text-orange-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : memberStats.totalMembers}
          </p>
          <p className="text-gray-300">
            {loading ? 'Loading...' : `${memberStats.newMembersThisMonth} new this month`}
          </p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-green-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Active Members</h3>
            <i className="fas fa-id-card text-green-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : memberStats.activeMembers}
          </p>
          <p className="text-gray-300">
            {loading ? 'Loading...' : `${Math.round((memberStats.activeMembers / memberStats.totalMembers) * 100)}% active`}
          </p>
        </div>
        
        <div 
          className="metric-card p-6 rounded-xl border-blue-400 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
          onClick={() => setShowSessionsModal(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Sessions Today</h3>
            <i className="fas fa-calendar-day text-blue-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : sessionStats.sessionsToday}
          </p>
          <p className="text-gray-300">
            {loading ? 'Loading...' : `${sessionStats.sessionsThisMonth} this month`}
          </p>
        </div>
        
        <div 
          className="metric-card p-6 rounded-xl border-pink-400 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20"
          onClick={() => setShowRevenueDashboard(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Revenue Today</h3>
            <i className="fas fa-dollar-sign text-pink-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : revenueStats ? `$${revenueStats.todayRevenue.toFixed(2)}` : '$0.00'}
          </p>
          <p className="text-gray-300">
            {loading ? 'Loading...' : revenueStats ? `${revenueStats.todayTransactions} transactions` : '0 transactions'}
          </p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-purple-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-purple-400" style={{ fontFamily: 'Orbitron, monospace' }}>Points Redeemed</h3>
            <i className="fas fa-star text-purple-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">-</p>
          <p className="text-gray-300">-</p>
        </div>
      </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Monthly Revenue</h3>
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Total Revenue</span>
              <span className="text-2xl font-bold text-green-400">-</span>
            </div>
            <div className="space-y-3">
              <div className="text-center text-gray-400">No data available</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Facility Usage</h3>
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Peak Hours</span>
              <span className="text-lg font-bold text-pink-400">-</span>
            </div>
            <div className="space-y-3">
              <div className="text-center text-gray-400">No data available</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Churn Rate</h3>
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Current Rate</span>
              <span className="text-2xl font-bold text-red-400">-</span>
            </div>
            <div className="space-y-3">
              <div className="text-center text-gray-400">No data available</div>
            </div>
            <div className="text-center pt-2">
              <span className="text-sm text-gray-400">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { icon: 'fas fa-user-plus', title: 'ADD MEMBER', description: 'Register new member', color: 'border-blue-400' },
        { icon: 'fas fa-calendar-check', title: 'MANAGE BOOKINGS', description: 'View all bookings', color: 'border-green-400' },
        { icon: 'fas fa-cog', title: 'SYSTEM SETTINGS', description: 'Configure gym settings', color: 'border-purple-400' },
        { icon: 'fas fa-file-export', title: 'EXPORT REPORTS', description: 'Generate reports', color: 'border-orange-400' }
      ].map((action, index) => (
        <button
          key={index}
          onClick={() => showToast(`${action.title} clicked!`, 'info')}
          className={`glass-card p-6 rounded-xl hover-glow transition-all duration-300 group ${action.color}`}
        >
          <i className={`${action.icon} text-3xl mb-4 group-hover:animate-pulse-glow`}></i>
          <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>{action.title}</h3>
          <p className="text-gray-300">{action.description}</p>
        </button>
      ))}
    </div>

    {/* Revenue Dashboard Modal */}
    {showRevenueDashboard && (
      <RevenueDashboard onClose={() => setShowRevenueDashboard(false)} />
    )}

    {/* Sessions Modal */}
    {showSessionsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-gray-900 w-full max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                  SESSIONS OVERVIEW
                </h2>
                <p className="text-blue-100 mt-1">Detailed session statistics and breakdown</p>
              </div>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="text-white hover:text-blue-200 text-2xl transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {/* Session Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6 rounded-xl border-blue-400">
                <h3 className="text-lg font-bold text-blue-400 mb-2">Today</h3>
                <p className="text-3xl font-bold text-white">{sessionStats.sessionsToday}</p>
                <p className="text-gray-300">sessions</p>
              </div>
              <div className="glass-card p-6 rounded-xl border-green-400">
                <h3 className="text-lg font-bold text-green-400 mb-2">This Month</h3>
                <p className="text-3xl font-bold text-white">{sessionStats.sessionsThisMonth}</p>
                <p className="text-gray-300">sessions</p>
              </div>
              <div className="glass-card p-6 rounded-xl border-purple-400">
                <h3 className="text-lg font-bold text-purple-400 mb-2">This Year</h3>
                <p className="text-3xl font-bold text-white">{sessionStats.sessionsThisYear}</p>
                <p className="text-gray-300">sessions</p>
              </div>
              <div className="glass-card p-6 rounded-xl border-orange-400">
                <h3 className="text-lg font-bold text-orange-400 mb-2">Total</h3>
                <p className="text-3xl font-bold text-white">{sessionStats.totalSessions}</p>
                <p className="text-gray-300">sessions</p>
              </div>
            </div>

            {/* Trainer Breakdown */}
            <div className="glass-card p-6 rounded-2xl mb-8">
              <h3 className="text-xl font-bold text-blue-400 mb-4">Sessions by Trainer</h3>
              <div className="space-y-3">
                {sessionStats.trainerSessionBreakdown.map((trainer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-user-tie text-white"></i>
                      </div>
                      <span className="text-white font-medium">{trainer.trainerName}</span>
                    </div>
                    <span className="text-xl font-bold text-blue-400">{trainer.sessionsCount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Type Breakdown */}
            <div className="glass-card p-6 rounded-2xl mb-8">
              <h3 className="text-xl font-bold text-green-400 mb-4">Sessions by Type</h3>
              <div className="space-y-3">
                {sessionStats.sessionTypeBreakdown.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-dumbbell text-white"></i>
                      </div>
                      <span className="text-white font-medium">{type.type}</span>
                    </div>
                    <span className="text-xl font-bold text-green-400">{type.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {sessionStats.recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-calendar-check text-white"></i>
                      </div>
                      <div>
                        <p className="text-white font-medium">{session.clientName}</p>
                        <p className="text-gray-400 text-sm">
                          {session.sessionDate} • {session.sessionType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{session.trainerName}</p>
                      <p className="text-gray-400 text-sm">{session.startTime} - {session.endTime}</p>
                    </div>
                  </div>
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

const MemberDirectory = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    membership_plan_id: ''
  });

  // Fetch members and membership plans from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch members
        const allUsers = await adminApi.getAllUsers();
        const memberUsers = allUsers.filter((user: any) => user.role === 'member');
        setMembers(memberUsers);
        
        // Fetch membership plans
        try {
          const plansResponse = await fetch('http://localhost:3001/api/members/plans');
          if (plansResponse.ok) {
            const plansData = await plansResponse.json();
            setMembershipPlans(plansData.plans || []);
          }
        } catch (error) {
          console.error('Error fetching membership plans:', error);
          setMembershipPlans([]);
        }
        
      } catch (error) {
        console.error('Error fetching members:', error);
        showToast('Failed to load members', 'error');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAddModal) {
        setShowAddModal(false);
        setNewMember({ first_name: '', last_name: '', email: '', phone: '', membership_plan_id: '' });
      }
    };

    if (showAddModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showAddModal]);

  const handleAddMember = async () => {
    if (newMember.first_name && newMember.last_name && newMember.email) {
      try {
        // Create member data
        const memberData = {
          email: newMember.email,
          password: 'defaultPassword123', // Default password that member can change later
          first_name: newMember.first_name,
          last_name: newMember.last_name,
          phone: newMember.phone,
          membership_plan_id: newMember.membership_plan_id ? parseInt(newMember.membership_plan_id) : undefined
        };
        
        // Create the member in the database
        await adminApi.createMember(memberData);
        
        // Refresh the members list
        const allUsers = await adminApi.getAllUsers();
        const memberUsers = allUsers.filter((user: any) => user.role === 'member');
        setMembers(memberUsers);
        
        // Reset form and close modal
        setNewMember({ first_name: '', last_name: '', email: '', phone: '', membership_plan_id: '' });
        setShowAddModal(false);
        
        showToast(`${newMember.first_name} ${newMember.last_name} added successfully`, 'success');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        showToast(`Failed to add member: ${errorMessage}`, 'error');
      }
    } else {
      showToast('Please fill in all required fields', 'error');
    }
  };

  const handleDeactivateMember = async (memberId: number, memberName: string) => {
    try {
      await adminApi.deactivateStaffMember(memberId);
      
      // Refresh the members list
      const allUsers = await adminApi.getAllUsers();
      const memberUsers = allUsers.filter((user: any) => user.role === 'member');
      setMembers(memberUsers);
      
      showToast(`${memberName} deactivated successfully`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to deactivate member: ${errorMessage}`, 'error');
    }
  };

  const handleReactivateMember = async (memberId: number, memberName: string) => {
    try {
      await adminApi.reactivateStaffMember(memberId);
      
      // Refresh the members list
      const allUsers = await adminApi.getAllUsers();
      const memberUsers = allUsers.filter((user: any) => user.role === 'member');
      setMembers(memberUsers);
      
      showToast(`${memberName} reactivated successfully`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to reactivate member: ${errorMessage}`, 'error');
    }
  };

  const handleDeleteMember = async (memberId: number, memberName: string) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY DELETE ${memberName}? This action cannot be undone and will remove all their data from the system.`)) {
      try {
        await adminApi.deleteStaffMember(memberId);
        
        // Refresh the members list
        const allUsers = await adminApi.getAllUsers();
        const memberUsers = allUsers.filter((user: any) => user.role === 'member');
        setMembers(memberUsers);
        
        showToast(`${memberName} deleted permanently`, 'success');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        showToast(`Failed to delete member: ${errorMessage}`, 'error');
      }
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = !filterPlan || 
      (filterPlan === 'no_plan' ? !member.membership_type : member.membership_type === filterPlan);
    const matchesStatus = !filterStatus || 
      (filterStatus === 'Active' ? (member.is_active && member.subscription_status !== 'paused') : 
       filterStatus === 'Paused' ? member.subscription_status === 'paused' :
       filterStatus === 'Inactive' ? !member.is_active : true);
    return matchesSearch && matchesPlan && matchesStatus;
  });



  // Get unique membership types for filter
  const membershipTypes = Array.from(new Set(members.map(member => member.membership_type).filter(Boolean)));

  return (
    <div className="animate-fade-in">
      {/* Enhanced Header with Stats Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Member Directory</h1>
            <p className="text-gray-400">Manage and monitor all gym members</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3"
          >
            <i className="fas fa-plus-circle text-lg"></i>
            <span>Add New Member</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl border-l-4 border-blue-500 hover:border-blue-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Members</p>
                <p className="text-3xl font-bold text-white">{members.length}</p>
              </div>
              <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
                <i className="fas fa-users text-2xl text-blue-400"></i>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border-l-4 border-green-500 hover:border-green-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Members</p>
                <p className="text-3xl font-bold text-white">{members.filter(m => m.is_active && m.subscription_status !== 'paused').length}</p>
              </div>
              <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                <i className="fas fa-user-check text-2xl text-green-400"></i>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border-l-4 border-yellow-500 hover:border-yellow-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Paused Members</p>
                <p className="text-3xl font-bold text-white">{members.filter(m => m.subscription_status === 'paused').length}</p>
              </div>
              <div className="bg-yellow-500 bg-opacity-20 p-3 rounded-full">
                <i className="fas fa-pause text-2xl text-yellow-400"></i>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border-l-4 border-red-500 hover:border-red-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Inactive Members</p>
                <p className="text-3xl font-bold text-white">{members.filter(m => !m.is_active).length}</p>
              </div>
              <div className="bg-red-500 bg-opacity-20 p-3 rounded-full">
                <i className="fas fa-user-times text-2xl text-red-400"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Controls */}
      <div className="glass-card p-6 rounded-2xl mb-6 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                          <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 min-w-32"
            >
              <option value="">All Plans</option>
              <option value="no_plan">No Plan</option>
              {membershipTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
              
                          <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 min-w-32"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Inactive">Inactive</option>
            </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  showInactive ? 'bg-orange-500' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${
                    showInactive ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </div>
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Show Inactive & Paused</span>
            </label>
            
            <button
              onClick={async () => {
                try {
                  const allUsers = await adminApi.getAllUsers();
                  const memberUsers = allUsers.filter((user: any) => user.role === 'member');
                  setMembers(memberUsers);
                  showToast('Member list refreshed', 'success');
                } catch (error) {
                  showToast('Failed to refresh member list', 'error');
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3"
            >
              <i className="fas fa-sync-alt"></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Members Table */}
      <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Member Directory</h3>
          <div className="text-sm text-gray-400">
            Showing {filteredMembers.filter(member => showInactive || (member.is_active && member.subscription_status !== 'paused')).length} of {filteredMembers.length} members
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-t-transparent mb-4"></div>
            <p className="text-gray-400 text-lg">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="bg-gray-800/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-3xl text-gray-500"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No members found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or add a new member to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <i className="fas fa-plus mr-2"></i>
              Add First Member
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-700/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-gray-700/50">
                    <th className="text-left p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Member</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Membership</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                                  {filteredMembers
                  .filter(member => showInactive || (member.is_active && member.subscription_status !== 'paused'))
                  .map((member, index) => (
                    <tr key={member.id} className={`hover:bg-gray-800/30 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-900/10'}`}>
                      {/* Member Info */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-xs text-gray-400">ID: {member.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm text-white">{member.email}</div>
                          <div className="text-xs text-gray-400">
                            {member.phone ? (
                              <span className="flex items-center">
                                <i className="fas fa-phone mr-2 text-gray-500"></i>
                                {member.phone}
                              </span>
                            ) : (
                              <span className="text-gray-500">No phone</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Membership */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {member.membership_type ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              member.membership_type === 'vip' 
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                                : member.membership_type === 'premium'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            }`}>
                              {member.membership_type}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                              No Plan
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            member.subscription_status === 'paused' ? 'bg-yellow-400' :
                            member.is_active ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.subscription_status === 'paused'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : member.is_active 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {member.subscription_status === 'paused' ? 'Paused' :
                             member.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => showToast(`Editing ${member.first_name} ${member.last_name}'s details`, 'info')}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2"
                          >
                            <i className="fas fa-edit"></i>
                            <span>Edit</span>
                          </button>
                          
                          {member.is_active ? (
                            <button
                              onClick={() => handleDeactivateMember(member.id, `${member.first_name} ${member.last_name}`)}
                              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-500/50 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2"
                            >
                              <i className="fas fa-pause"></i>
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivateMember(member.id, `${member.first_name} ${member.last_name}`)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-500/50 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2"
                            >
                              <i className="fas fa-play"></i>
                              <span>Reactivate</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteMember(member.id, `${member.first_name} ${member.last_name}`)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2"
                            title="Permanently delete member"
                          >
                            <i className="fas fa-trash"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Add Member Modal - Mobile Friendly */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => {
            setShowAddModal(false);
            setNewMember({ first_name: '', last_name: '', email: '', phone: '', membership_plan_id: '' });
          }}
        >
          <div 
            className="glass-card p-4 sm:p-6 rounded-2xl w-full max-w-sm sm:max-w-md border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-user-plus text-lg sm:text-xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Add New Member</h3>
              <p className="text-sm text-gray-400">Create a new gym membership account</p>
            </div>
            
            {/* Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <i className="fas fa-user mr-2 text-orange-400 text-xs"></i>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newMember.first_name}
                    onChange={(e) => setNewMember({...newMember, first_name: e.target.value})}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 text-sm"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <i className="fas fa-user mr-2 text-orange-400 text-xs"></i>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={newMember.last_name}
                    onChange={(e) => setNewMember({...newMember, last_name: e.target.value})}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 text-sm"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <i className="fas fa-envelope mr-2 text-blue-400 text-xs"></i>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 text-sm"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <i className="fas fa-phone mr-2 text-green-400 text-xs"></i>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 text-sm"
                  placeholder="Enter phone number (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <i className="fas fa-crown mr-2 text-yellow-400 text-xs"></i>
                  Membership Plan
                </label>
                <select
                  value={newMember.membership_plan_id}
                  onChange={(e) => setNewMember({...newMember, membership_plan_id: e.target.value})}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 text-sm"
                >
                  <option value="">Select a membership plan</option>
                  {membershipPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ${(parseFloat(plan.price) / 100).toFixed(2)} ({plan.duration_months === 0 ? 'Single Day' : plan.duration_months === 1 ? 'Monthly' : plan.duration_months === 3 ? 'Quarterly' : plan.duration_months === 12 ? 'Yearly' : `${plan.duration_months} months`})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewMember({ first_name: '', last_name: '', email: '', phone: '', membership_plan_id: '' });
                }}
                className="w-full sm:w-auto px-6 py-2.5 text-gray-300 hover:text-white transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Member
              </button>
            </div>
            
            {/* Info */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-start space-x-2">
                <i className="fas fa-info-circle text-blue-400 mt-0.5 text-xs"></i>
                <div className="text-xs text-gray-400">
                  <p className="font-medium text-gray-300 mb-1">Default Password:</p>
                  <p><code className="bg-gray-700 px-1.5 py-0.5 rounded text-orange-400 text-xs">defaultPassword123</code></p>
                  <p className="mt-1">Member can change this after first login</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StaffManagement = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', contact: '' });
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  // Fetch staff members from database
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        setLoading(true);
        const allUsers = await adminApi.getAllUsers();
        
        // Filter users to show only staff members (excluding members and admin)
        const staffUsers = allUsers.filter((user: any) => 
          user.role !== 'member' && user.role !== 'admin'
        );
        
        setStaffMembers(staffUsers);
      } catch (error) {
        console.error('Error fetching staff members:', error);
        showToast('Failed to load staff members', 'error');
        setStaffMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMembers();
  }, [showToast]);

  const handleAddStaff = async () => {
    if (newStaff.name && newStaff.role && newStaff.contact) {
      try {
        // Parse the name into first and last name
        const [firstName, ...lastNameParts] = newStaff.name.trim().split(' ');
        const lastName = lastNameParts.join(' ') || firstName;
        
        // Create staff member data
        const staffData = {
          email: newStaff.contact,
          password: 'defaultPassword123', // Default password that staff can change later
          first_name: firstName,
          last_name: lastName,
          role: newStaff.role,
          phone: '', // Could be added to the form if needed
        };
        
        // Create the staff member in the database
        await adminApi.createStaffMember(staffData);
        
        // Refresh the staff members list
        const allUsers = await adminApi.getAllUsers();
        const staffUsers = allUsers.filter((user: any) => 
          user.role !== 'member' && user.role !== 'admin'
        );
        setStaffMembers(staffUsers);
        
      showToast(`${newStaff.name} added as ${newStaff.role}`, 'success');
      setNewStaff({ name: '', role: '', contact: '' });
      setShowAddModal(false);
      } catch (error) {
        console.error('Error creating staff member:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        showToast(`Failed to create staff member: ${errorMessage}`, 'error');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Enhanced Header with Stats Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Staff Management</h1>
            <p className="text-gray-400">Manage and monitor all gym staff members</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3"
          >
            <i className="fas fa-user-plus text-lg"></i>
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl border-l-4 border-blue-500 hover:border-blue-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Staff</p>
                <p className="text-3xl font-bold text-white">{staffMembers.length}</p>
              </div>
              <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
                <i className="fas fa-users text-2xl text-blue-400"></i>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border-l-4 border-green-500 hover:border-green-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Staff</p>
                <p className="text-3xl font-bold text-white">{staffMembers.filter(staff => staff.is_active).length}</p>
              </div>
              <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                <i className="fas fa-user-check text-2xl text-green-400"></i>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border-l-4 border-red-500 hover:border-red-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Inactive Staff</p>
                <p className="text-3xl font-bold text-white">{staffMembers.filter(staff => !staff.is_active).length}</p>
              </div>
              <div className="bg-red-500 bg-opacity-20 p-3 rounded-full">
                <i className="fas fa-user-times text-2xl text-red-400"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="glass-card p-6 rounded-2xl mb-6 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  showInactive ? 'bg-orange-500' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${
                    showInactive ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </div>
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Show Inactive Staff</span>
            </label>
          </div>
          
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const allUsers = await adminApi.getAllUsers();
                const staffUsers = allUsers.filter((user: any) => 
                  user.role !== 'member' && user.role !== 'admin'
                );
                setStaffMembers(staffUsers);
                showToast('Staff list refreshed', 'success');
              } catch (error) {
                showToast('Failed to refresh staff list', 'error');
              } finally {
                setLoading(false);
              }
            }}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Enhanced Staff Table */}
      <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Staff Directory</h3>
          <div className="text-sm text-gray-400">
            Showing {staffMembers.filter(staff => showInactive || staff.is_active).length} of {staffMembers.length} staff members
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-t-transparent mb-4"></div>
            <p className="text-gray-400 text-lg">Loading staff members...</p>
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="bg-gray-800/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-user-tie text-3xl text-gray-500"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No staff members found</h3>
            <p className="text-gray-500 mb-6">Add your first staff member to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <i className="fas fa-plus mr-2"></i>
              Add First Staff Member
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-700/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-gray-700/50">
                    <th className="text-left p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Staff Member</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {staffMembers
                    .filter((staff) => showInactive || staff.is_active)
                    .map((staff, index) => (
                    <tr key={staff.id} className={`hover:bg-gray-800/30 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-900/10'} ${!staff.is_active ? 'opacity-75' : ''}`}>
                      {/* Staff Info */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm">
                              {staff.first_name.charAt(0)}{staff.last_name.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {staff.first_name} {staff.last_name}
                            </div>
                            <div className="text-xs text-gray-400">ID: {staff.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            staff.role === 'trainer' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : staff.role === 'nutritionist'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : staff.role === 'front_desk'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
                          }`}>
                            {staff.role.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="text-sm text-white">{staff.email}</div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            staff.is_active ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            staff.is_active 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {staff.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => showToast(`Editing ${staff.first_name} ${staff.last_name}'s details`, 'info')}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2"
                          >
                            <i className="fas fa-edit"></i>
                            <span>Edit</span>
                          </button>
                          
                          {staff.is_active ? (
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to deactivate ${staff.first_name} ${staff.last_name}?`)) {
                                  try {
                                    await adminApi.deactivateStaffMember(staff.id);
                                    // Refresh the staff list
                                    const allUsers = await adminApi.getAllUsers();
                                    const staffUsers = allUsers.filter((user: any) => 
                                      user.role !== 'member' && user.role !== 'admin'
                                    );
                                    setStaffMembers(staffUsers);
                                    showToast(`${staff.first_name} ${staff.last_name} deactivated successfully`, 'success');
                                  } catch (error) {
                                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                    showToast(`Failed to deactivate staff member: ${errorMessage}`, 'error');
                                  }
                                }
                              }}
                              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-500/50 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2"
                            >
                              <i className="fas fa-pause"></i>
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  await adminApi.reactivateStaffMember(staff.id);
                                  // Refresh the staff list
                                  const allUsers = await adminApi.getAllUsers();
                                  const staffUsers = allUsers.filter((user: any) => 
                                    user.role !== 'member' && user.role !== 'admin'
                                  );
                                  setStaffMembers(staffUsers);
                                  showToast(`${staff.first_name} ${staff.last_name} reactivated successfully`, 'success');
                                } catch (error) {
                                  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                  showToast(`Failed to reactivate staff member: ${errorMessage}`, 'error');
                                }
                              }}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-500/50 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2"
                            >
                              <i className="fas fa-play"></i>
                              <span>Reactivate</span>
                            </button>
                          )}
                          
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to PERMANENTLY DELETE ${staff.first_name} ${staff.last_name}? This action cannot be undone and will remove all their data from the system.`)) {
                                try {
                                  await adminApi.deleteStaffMember(staff.id);
                                  // Refresh the staff list
                                  const allUsers = await adminApi.getAllUsers();
                                  const staffUsers = allUsers.filter((user: any) => 
                                    user.role !== 'member' && user.role !== 'admin'
                                  );
                                  setStaffMembers(staffUsers);
                                  showToast(`${staff.first_name} ${staff.last_name} deleted permanently`, 'success');
                                } catch (error) {
                                  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                  showToast(`Failed to delete staff member: ${errorMessage}`, 'error');
                                }
                              }
                            }}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2"
                            title="Permanently delete staff member"
                          >
                            <i className="fas fa-trash"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Add Staff Modal - Mobile Friendly */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowAddModal(false)}>
          <div className="glass-card p-4 sm:p-6 rounded-2xl max-w-sm sm:max-w-md w-full border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-user-tie text-lg sm:text-xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Add New Staff Member</h3>
              <p className="text-sm text-gray-400">Create a new gym staff account</p>
            </div>
            
            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <i className="fas fa-user mr-2 text-orange-400 text-xs"></i>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter first and last name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <i className="fas fa-briefcase mr-2 text-blue-400 text-xs"></i>
                  Staff Role *
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 text-sm"
                >
                  <option value="">Select a role</option>
                  <option value="trainer">Personal Trainer</option>
                  <option value="nutritionist">Nutritionist</option>
                  <option value="front_desk">Front Desk Staff</option>
                  <option value="public">Public User</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <i className="fas fa-envelope mr-2 text-green-400 text-xs"></i>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newStaff.contact}
                  onChange={(e) => setNewStaff({ ...newStaff, contact: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 text-sm"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 text-gray-300 hover:text-white transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Staff Member
              </button>
            </div>
            
            {/* Info */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-start space-x-2">
                <i className="fas fa-info-circle text-orange-400 mt-0.5 text-xs"></i>
                <div className="text-xs text-gray-400">
                  <p className="font-medium text-gray-300 mb-1">Default Password:</p>
                  <p><code className="bg-gray-700 px-1.5 py-0.5 rounded text-orange-400 text-xs">defaultPassword123</code></p>
                  <p className="mt-1">Staff member should change this after first login</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingsManagement = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [activeTab, setActiveTab] = useState('facilities');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showSchedulesModal, setShowSchedulesModal] = useState(false);
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      console.log('Fetching facilities...');
      const data = await adminFacilitiesApi.getAllFacilities();
      console.log('Facilities data received:', data);
      setFacilities(data || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      showToast('Failed to fetch facilities', 'error');
      setFacilities([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacility = async (facilityData: CreateFacilityData) => {
    try {
      await adminFacilitiesApi.createFacility(facilityData);
      showToast('Facility created successfully', 'success');
      setShowCreateModal(false);
      fetchFacilities();
    } catch (error) {
      console.error('Error creating facility:', error);
      showToast('Failed to create facility', 'error');
    }
  };

  const handleEditFacility = async (id: number, facilityData: CreateFacilityData) => {
    try {
      await adminFacilitiesApi.updateFacility(id, facilityData);
      showToast('Facility updated successfully', 'success');
      setShowEditModal(false);
      setSelectedFacility(null);
      fetchFacilities();
    } catch (error) {
      console.error('Error updating facility:', error);
      showToast('Failed to update facility', 'error');
    }
  };

  const handleDeleteFacility = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this facility?')) {
      try {
        await adminFacilitiesApi.deleteFacility(id);
        showToast('Facility deactivated successfully', 'success');
        fetchFacilities();
      } catch (error) {
        console.error('Error deleting facility:', error);
        showToast('Failed to deactivate facility', 'error');
      }
    }
  };

  const tabs = [
    { id: 'facilities', label: 'Facilities Management', icon: 'fas fa-building' },
    { id: 'schedules', label: 'Schedule Management', icon: 'fas fa-calendar-alt' },
    { id: 'slots', label: 'Slot Management', icon: 'fas fa-clock' },
    { id: 'bookings', label: 'Bookings Overview', icon: 'fas fa-list' },
    { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'facilities':
  return (
          <FacilitiesManager
            facilities={facilities}
            loading={loading}
            onCreateFacility={handleCreateFacility}
            onEditFacility={handleEditFacility}
            onDeleteFacility={handleDeleteFacility}
          />
        );
      case 'schedules':
        return <ScheduleManager facilities={facilities} />;
      case 'slots':
        return <SlotManager facilities={facilities} />;
      case 'bookings':
        return <BookingsOverview />;
      case 'analytics':
        return <AnalyticsOverview facilities={facilities} />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Bookings & Facilities Management
        </h2>
        <p className="text-gray-400 mb-6 text-lg leading-relaxed">
          Manage gym facilities, schedules, time slots, and monitor booking analytics with our comprehensive system
        </p>
            </div>
            
      {/* Tab Navigation */}
      <div className="glass-card p-6 rounded-2xl mb-8 border border-gray-700/50">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
                    <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 border border-orange-500/50'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 hover:text-white border border-gray-600/50 hover:border-orange-500/30'
              }`}
            >
              <i className={`${tab.icon} text-lg transition-transform group-hover:rotate-12`}></i>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-600/20 rounded-xl animate-pulse"></div>
              )}
                    </button>
            ))}
          </div>
        </div>

      {/* Tab Content */}
      <div className="glass-card p-8 rounded-2xl border border-gray-700/50 shadow-xl">
        {renderTabContent()}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <FacilityModal
          facility={{}}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateFacility}
        />
      )}

      {showEditModal && selectedFacility && (
        <FacilityModal
          facility={selectedFacility}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFacility(null);
          }}
          onSubmit={(data) => handleEditFacility(selectedFacility.id, data)}
        />
      )}

      {showSchedulesModal && selectedFacility && (
        <ScheduleModal
          facility={selectedFacility}
          onClose={() => {
            setShowSchedulesModal(false);
            setSelectedFacility(null);
          }}
        />
      )}

      {showSlotsModal && selectedFacility && (
        <SlotModal
          facility={selectedFacility}
          onClose={() => {
            setShowSlotsModal(false);
            setSelectedFacility(null);
          }}
        />
      )}

      {showBookingsModal && (
        <BookingsModal
          onClose={() => setShowBookingsModal(false)}
        />
      )}

      {showAnalyticsModal && selectedFacility && (
        <AnalyticsModal
          facility={selectedFacility}
          onClose={() => {
            setShowAnalyticsModal(false);
            setSelectedFacility(null);
          }}
        />
      )}
    </div>
  );
};

const PlansManagement = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', duration: '', price: '', perks: '', discount: '' });
  const [newDiscount, setNewDiscount] = useState({ name: '', code: '', percentage: '', validUntil: '', conditions: '' });

  const plans = [
    { id: 1, name: 'Drop-In', duration: 'per visit', price: 'PKR 7,000', originalPrice: 'PKR 7,000', perks: 'Single day access, All equipment, Locker room access', status: 'active' },
    { id: 2, name: 'Monthly', duration: '1 month', price: 'PKR 22,000', originalPrice: 'PKR 22,000', perks: '24/7 access, All classes, 2 guest passes, Sauna/Steam access', status: 'active' },
    { id: 3, name: 'Quarterly', duration: '3 months', price: 'PKR 55,000', originalPrice: 'PKR 55,000', perks: '24/7 access, All classes, 3 guest passes, 2 PT sessions, Sauna/Steam access', status: 'active' },
    { id: 4, name: 'Yearly', duration: '12 months', price: 'PKR 165,000', originalPrice: 'PKR 165,000', perks: '24/7 access, All classes, 5 guest passes, 2 PT sessions/month, Nutrition consultation', status: 'active' }
  ];

  const discounts = [
    { id: 1, name: 'New Year Special', code: 'NEWYEAR2024', percentage: '20%', validUntil: '2024-02-29', conditions: 'New members only', status: 'active' },
    { id: 2, name: 'Student Discount', code: 'STUDENT15', percentage: '15%', validUntil: '2024-12-31', conditions: 'Valid student ID required', status: 'active' },
    { id: 3, name: 'Referral Bonus', code: 'REFER10', percentage: '10%', validUntil: '2024-06-30', conditions: 'Both referrer and referee get discount', status: 'active' }
  ];

  const handleAddPlan = () => {
    if (newPlan.name && newPlan.duration && newPlan.price && newPlan.perks) {
      showToast(`${newPlan.name} plan created successfully`, 'success');
      setNewPlan({ name: '', duration: '', price: '', perks: '', discount: '' });
      setShowAddModal(false);
    }
  };

  const handleAddDiscount = () => {
    if (newDiscount.name && newDiscount.code && newDiscount.percentage) {
      showToast(`${newDiscount.name} discount created successfully`, 'success');
      setNewDiscount({ name: '', code: '', percentage: '', validUntil: '', conditions: '' });
      setShowDiscountModal(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-orange-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Plans & Pricing Management
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Create New Plan
          </button>
          <button
            onClick={() => setShowDiscountModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Create Discount
          </button>
        </div>
      </div>

      {/* Plans Section */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Membership Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Active</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{plan.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-green-400 font-bold">{plan.price}</span>
                </div>
                {plan.originalPrice !== plan.price && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Original:</span>
                    <span className="text-red-400 line-through">{plan.originalPrice}</span>
                  </div>
                )}
                <div className="text-sm text-gray-300 mt-2">{plan.perks}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => showToast(`Editing ${plan.name}`, 'info')}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => showToast(`${plan.name} disabled`, 'info')}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Disable
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discounts Section */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Active Discounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <div key={discount.id} className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-white">{discount.name}</h4>
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Active</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Code:</span>
                  <span className="text-yellow-400 font-mono">{discount.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Discount:</span>
                  <span className="text-green-400 font-bold">{discount.percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Valid Until:</span>
                  <span className="text-white">{discount.validUntil}</span>
                </div>
                <div className="text-sm text-gray-300 mt-2">{discount.conditions}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => showToast(`Editing ${discount.name}`, 'info')}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => showToast(`${discount.name} disabled`, 'info')}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Disable
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-400">Create New Plan</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                title="Close"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Plan name"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Duration (e.g., 1 month, 3 months)"
                value={newPlan.duration}
                onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Price (e.g., PKR 22,000)"
                value={newPlan.price}
                onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
              <textarea
                placeholder="Perks (comma separated)"
                value={newPlan.perks}
                onChange={(e) => setNewPlan({ ...newPlan, perks: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
                rows={3}
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleAddPlan}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Create Plan
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50" onClick={() => setShowDiscountModal(false)}>
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-400">Create New Discount</h3>
              <button 
                onClick={() => setShowDiscountModal(false)} 
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                title="Close"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Discount name"
                value={newDiscount.name}
                onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Discount code"
                value={newDiscount.code}
                onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Percentage (e.g., 20%)"
                value={newDiscount.percentage}
                onChange={(e) => setNewDiscount({ ...newDiscount, percentage: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
              <input
                type="date"
                placeholder="Valid until"
                value={newDiscount.validUntil}
                onChange={(e) => setNewDiscount({ ...newDiscount, validUntil: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
              <textarea
                placeholder="Conditions"
                value={newDiscount.conditions}
                onChange={(e) => setNewDiscount({ ...newDiscount, conditions: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
                rows={2}
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleAddDiscount}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Create Discount
                </button>
                <button
                  onClick={() => setShowDiscountModal(false)}
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

const LoyaltyManagement = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [rules, setRules] = useState({
    checkInPoints: 10,
    bookingPoints: 25,
    referralPoints: 100
  });

  const handleSaveRules = () => {
    showToast('Loyalty rules updated successfully', 'success');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Rule Settings */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Loyalty Point Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Points per Check-in</label>
            <input
              type="number"
              value={rules.checkInPoints}
              onChange={(e) => setRules({ ...rules, checkInPoints: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Points per Booking</label>
            <input
              type="number"
              value={rules.bookingPoints}
              onChange={(e) => setRules({ ...rules, bookingPoints: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Referral Bonus Points</label>
            <input
              type="number"
              value={rules.referralPoints}
              onChange={(e) => setRules({ ...rules, referralPoints: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSaveRules}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Save Rules
        </button>
      </div>

      {/* Referral Report */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Referral Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">456</div>
            <div className="text-sm text-gray-400">Total Invites</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">123</div>
            <div className="text-sm text-gray-400">Successful Conversions</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-pink-400">27%</div>
            <div className="text-sm text-gray-400">Conversion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RewardsManagement = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [thresholds, setThresholds] = useState({
    streak30: 'STREAK30',
    streak60: 'STREAK60',
    streak90: 'STREAK90'
  });

  const handleSaveThresholds = () => {
    showToast('Consistency reward thresholds updated', 'success');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Threshold Settings */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Consistency Reward Thresholds</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">30-Day Streak Voucher</label>
              <input
                type="text"
                value={thresholds.streak30}
                onChange={(e) => setThresholds({ ...thresholds, streak30: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">60-Day Streak Voucher</label>
              <input
                type="text"
                value={thresholds.streak60}
                onChange={(e) => setThresholds({ ...thresholds, streak60: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="md:w-1/2">
            <label className="block text-sm font-medium mb-2">90-Day Streak Voucher</label>
            <input
              type="text"
              value={thresholds.streak90}
              onChange={(e) => setThresholds({ ...thresholds, streak90: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSaveThresholds}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Save Thresholds
        </button>
      </div>

      {/* Current Rewards */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Configured Rewards</h3>
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="font-bold text-green-400">30-Day Streak</h4>
              <p className="text-gray-300">Voucher Code: {thresholds.streak30}</p>
            </div>
            <span className="text-sm text-gray-400">10% off next purchase</span>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="font-bold text-blue-400">60-Day Streak</h4>
              <p className="text-gray-300">Voucher Code: {thresholds.streak60}</p>
            </div>
            <span className="text-sm text-gray-400">Free personal training session</span>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="font-bold text-pink-400">90-Day Streak</h4>
              <p className="text-gray-300">Voucher Code: {thresholds.streak90}</p>
            </div>
            <span className="text-sm text-gray-400">One month free extension</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminAnalytics = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
  <div className="animate-fade-in">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-orange-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
        Analytics Dashboard
      </h2>
    </div>

    {/* Analytics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="metric-card p-6 rounded-xl border-green-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Total Revenue</h3>
          <i className="fas fa-dollar-sign text-green-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">PKR 2.4M</p>
        <p className="text-gray-300">This quarter</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-blue-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>New Members</h3>
          <i className="fas fa-user-plus text-blue-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">156</p>
        <p className="text-gray-300">This month</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-purple-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-purple-400" style={{ fontFamily: 'Orbitron, monospace' }}>Churn Rate</h3>
          <i className="fas fa-chart-line text-purple-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">2.1%</p>
        <p className="text-gray-300">-0.3% from last month</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-orange-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-400" style={{ fontFamily: 'Orbitron, monospace' }}>Avg Session</h3>
          <i className="fas fa-clock text-orange-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">67 min</p>
        <p className="text-gray-300">Per member</p>
      </div>
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Revenue Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Monthly Revenue Trend</h3>
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="space-y-4">
            {[
              { month: 'Jan', revenue: 450000, growth: '+12%' },
              { month: 'Feb', revenue: 520000, growth: '+15%' },
              { month: 'Mar', revenue: 480000, growth: '-8%' },
              { month: 'Apr', revenue: 580000, growth: '+21%' },
              { month: 'May', revenue: 620000, growth: '+7%' },
              { month: 'Jun', revenue: 680000, growth: '+10%' }
            ].map((data, index) => (
              <div key={data.month} className="flex items-center">
                <div className="w-12 text-sm text-gray-400">{data.month}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full"
                      style={{ width: `${(data.revenue / 700000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right">
                  <div className="text-sm text-white">PKR {(data.revenue / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-green-400">{data.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member Demographics */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Member Demographics</h3>
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="space-y-4">
            {[
              { age: '18-25', percentage: 25, color: 'from-pink-400 to-red-400' },
              { age: '26-35', percentage: 35, color: 'from-blue-400 to-purple-400' },
              { age: '36-45', percentage: 28, color: 'from-green-400 to-blue-400' },
              { age: '46+', percentage: 12, color: 'from-yellow-400 to-orange-400' }
            ].map((demo, index) => (
              <div key={demo.age} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{demo.age} years</span>
                  <span className="text-gray-400">{demo.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${demo.color} h-2 rounded-full`}
                    style={{ width: `${demo.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Performance Metrics */}
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-orange-400 mb-4">Performance Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">94%</div>
          <div className="text-sm text-gray-300">Member Retention</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">4.8</div>
          <div className="text-sm text-gray-300">Avg Rating</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">78%</div>
          <div className="text-sm text-gray-300">Facility Utilization</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-orange-400 mb-2">156</div>
          <div className="text-sm text-gray-300">Active Trainers</div>
        </div>
      </div>
    </div>

    {/* Export Section */}
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-orange-400">Export Reports</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => showToast('Revenue report exported', 'success')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Export Revenue
          </button>
          <button
            onClick={() => showToast('Member report exported', 'success')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Export Members
          </button>
          <button
            onClick={() => showToast('Analytics report exported', 'success')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Export Analytics
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AnnouncementsManagement = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'New Equipment Arrival',
      message: 'We have new cardio machines arriving next week!',
      target: 'all',
      priority: 'high',
      date: '2024-01-20',
      status: 'active'
    },
    {
      id: 2,
      title: 'Trainer Meeting',
      message: 'Monthly trainer meeting this Friday at 3 PM',
      target: 'trainers',
      priority: 'medium',
      date: '2024-01-18',
      status: 'active'
    },
    {
      id: 3,
      title: 'Holiday Schedule',
      message: 'Gym will be closed on Independence Day',
      target: 'all',
      priority: 'high',
      date: '2024-01-15',
      status: 'active'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    target: 'all',
    priority: 'medium'
  });

  const handleCreateAnnouncement = () => {
    const announcement = {
      id: announcements.length + 1,
      ...newAnnouncement,
      date: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setAnnouncements([...announcements, announcement]);
    setShowCreateModal(false);
    setNewAnnouncement({ title: '', message: '', target: 'all', priority: 'medium' });
    showToast('Announcement created successfully', 'success');
  };

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    showToast('Announcement deleted', 'success');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTargetColor = (target: string) => {
    switch (target) {
      case 'all': return 'bg-blue-500';
      case 'trainers': return 'bg-green-500';
      case 'nutritionists': return 'bg-purple-500';
      case 'members': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-orange-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
            Announcements Management
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Create Announcement
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTargetColor(announcement.target)} text-white`}>
                    {announcement.target.charAt(0).toUpperCase() + announcement.target.slice(1)}
                  </span>
                  <span className={`text-sm font-semibold ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{announcement.message}</p>
                <p className="text-sm text-gray-400">Posted: {announcement.date}</p>
              </div>
              <button
                onClick={() => handleDeleteAnnouncement(announcement.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-400">Create New Announcement</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                title="Close"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Announcement title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
              <textarea
                placeholder="Announcement message"
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
                rows={3}
              />
              <select
                value={newAnnouncement.target}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              >
                <option value="all">All Staff & Members</option>
                <option value="trainers">Trainers Only</option>
                <option value="nutritionists">Nutritionists Only</option>
                <option value="members">Members Only</option>
              </select>
              <select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="flex space-x-4">
                <button
                  onClick={handleCreateAnnouncement}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
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

const SubscriptionManagement = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [gymSettings, setGymSettings] = useState({
    location1: true,
    location2: true,
    location3: false,
    monthlyPlan: true,
    quarterlyPlan: true,
    yearlyPlan: true
  });

  const handleToggleGym = (gym: keyof typeof gymSettings) => {
    setGymSettings(prev => ({ ...prev, [gym]: !prev[gym] }));
    showToast(`${gym} ${gymSettings[gym] ? 'disabled' : 'enabled'}`, 'info');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Gym Locations */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Gym Locations</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Downtown Location</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gymSettings.location1}
                onChange={() => handleToggleGym('location1')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Uptown Location</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gymSettings.location2}
                onChange={() => handleToggleGym('location2')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Midtown Location</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gymSettings.location3}
                onChange={() => handleToggleGym('location3')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Plan Management */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Plan Availability</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Monthly Plan</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gymSettings.monthlyPlan}
                onChange={() => handleToggleGym('monthlyPlan')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Quarterly Plan</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gymSettings.quarterlyPlan}
                onChange={() => handleToggleGym('quarterlyPlan')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Yearly Plan</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gymSettings.yearlyPlan}
                onChange={() => handleToggleGym('yearlyPlan')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const FacilitiesManager = ({ 
  facilities, 
  loading,
  onCreateFacility, 
  onEditFacility, 
  onDeleteFacility 
}: {
  facilities: Facility[];
  loading: boolean;
  onCreateFacility: (data: CreateFacilityData) => void;
  onEditFacility: (id: number, data: CreateFacilityData) => void;
  onDeleteFacility: (id: number) => void;
}) => {
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
  };

  const handleDelete = (id: number) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteFacility(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Facilities Management
          </h3>
          <p className="text-gray-400 mt-1">Manage and configure gym facilities</p>
        </div>
        <button
          onClick={() => setEditingFacility({} as Facility)}
          className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-orange-500/25"
        >
          <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Facility
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin mx-auto"></div>
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-400 mt-4 text-lg font-medium">Loading facilities...</p>
        </div>
      )}

      {/* Facilities Grid */}
      {!loading && facilities && facilities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <div 
              key={facility.id} 
              className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 backdrop-blur-sm"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  facility.is_active 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    facility.is_active ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  {facility.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Facility Header */}
              <div className="mb-4">
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors duration-300">
                  {facility.name}
                </h4>
                <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-medium rounded-lg border border-orange-500/30">
                  {facility.category}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">{facility.description}</p>
              
              {/* Facility Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="text-gray-400 text-sm">📍 Location</span>
                  <span className="text-white font-medium">{facility.location}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="text-gray-400 text-sm">⏱️ Duration</span>
                  <span className="text-white font-medium">{facility.default_duration_minutes} min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="text-gray-400 text-sm">👥 Capacity</span>
                  <span className="text-white font-medium">{facility.max_capacity} people</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(facility)}
                  className="flex-1 group/btn inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 font-medium rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-4 h-4 transition-transform group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(facility.id!)}
                  className="flex-1 group/btn inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-medium rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-4 h-4 transition-transform group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && (!facilities || facilities.length === 0) && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Facilities Found</h3>
          <p className="text-gray-400 mb-6">Create your first facility to get started with the booking system</p>
          <button
            onClick={() => setEditingFacility({} as Facility)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-orange-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create First Facility
          </button>
        </div>
      )}

      {/* Edit/Create Facility Modal */}
      {editingFacility && (
        <FacilityModal
          facility={editingFacility}
          onClose={() => setEditingFacility(null)}
          onSubmit={(data) => {
            if (editingFacility.id) {
              onEditFacility(editingFacility.id, data);
            } else {
              onCreateFacility(data);
            }
            setEditingFacility(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl shadow-black/50">
            {/* Warning Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/30">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white text-center mb-3">Confirm Deletion</h3>
            <p className="text-gray-400 text-center mb-8 leading-relaxed">
              Are you sure you want to delete this facility? This action cannot be undone and will remove all associated data.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600/50 hover:border-gray-600/70 transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl border border-red-500/50 hover:border-red-600/50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25"
              >
                Delete Facility
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ScheduleManager = ({ facilities }: { facilities: Facility[] }) => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [schedules, setSchedules] = useState<FacilitySchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
  ];

  const handleFacilityChange = (facilityId: number) => {
    const facility = facilities.find(f => f.id === facilityId);
    setSelectedFacility(facility || null);
    if (facility) {
      // TODO: Fetch schedules for the selected facility
      setSchedules([]);
    }
  };

  const handleScheduleChange = (dayId: number, field: 'start_time' | 'end_time' | 'is_available', value: any) => {
    setSchedules(prev => {
      const existing = prev.find(s => s.day_of_week === dayId);
      if (existing) {
        return prev.map(s => 
          s.day_of_week === dayId 
            ? { ...s, [field]: value }
            : s
        );
      } else {
        return [...prev, {
          id: Date.now() + dayId, // Temporary ID for new schedules
          facility_id: selectedFacility!.id!,
          day_of_week: dayId,
          start_time: field === 'start_time' ? value : '09:00:00',
          end_time: field === 'end_time' ? value : '21:00:00',
          is_available: field === 'is_available' ? value : true
        }];
      }
    });
  };

  const saveSchedules = async () => {
    if (!selectedFacility) return;
    
    setLoading(true);
    try {
      // TODO: Call API to save schedules
      console.log('Saving schedules:', schedules);
      // await adminFacilitiesApi.updateFacilitySchedules(selectedFacility.id, schedules);
    } catch (error) {
      console.error('Error saving schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Schedule Management
          </h3>
          <p className="text-gray-400 mt-1">Configure weekly availability for each facility</p>
        </div>
        {selectedFacility && (
          <button
            onClick={saveSchedules}
            disabled={loading}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-blue-500/25 disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Schedules
              </>
            )}
          </button>
        )}
      </div>

      {/* Facility Selection */}
      <div className="relative max-w-md">
        <label className="block text-sm font-medium text-gray-400 mb-3">
          Select Facility
        </label>
        <select
          value={selectedFacility?.id || ''}
          onChange={(e) => handleFacilityChange(parseInt(e.target.value))}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer"
        >
          <option value="">Choose a facility to manage schedules...</option>
          {facilities.map(facility => (
            <option key={facility.id} value={facility.id} className="bg-gray-800 text-white">
              {facility.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-10 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Schedule Grid */}
      {selectedFacility && (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-white">
              Weekly Schedule for {selectedFacility.name}
            </h4>
          </div>
          
          <div className="space-y-4">
            {daysOfWeek.map(day => {
              const schedule = schedules.find(s => s.day_of_week === day.id);
              const dayIcons = ['🌟', '🌅', '🌤️', '☀️', '🌅', '🌤️', '🎉'];
              return (
                <div key={day.id} className="group relative p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/70">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <span className="text-2xl">{dayIcons[day.id]}</span>
                      <span className="font-semibold text-white">{day.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`available-${day.id}`}
                          checked={schedule?.is_available ?? true}
                          onChange={(e) => handleScheduleChange(day.id, 'is_available', e.target.checked)}
                          className="sr-only"
                        />
                        <label htmlFor={`available-${day.id}`} className="cursor-pointer">
                          <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                            schedule?.is_available ?? true
                              ? 'bg-green-500/20 border-green-500/50'
                              : 'bg-red-500/20 border-red-500/50'
                          }`}>
                            {(schedule?.is_available ?? true) && (
                              <svg className="w-4 h-4 text-green-400 m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </label>
                        <span className={`text-sm font-medium transition-colors duration-300 ${
                          schedule?.is_available ?? true ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {schedule?.is_available ?? true ? 'Available' : 'Closed'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Start:</span>
                          <input
                            type="time"
                            value={schedule?.start_time?.slice(0, 5) || '09:00'}
                            onChange={(e) => handleScheduleChange(day.id, 'start_time', e.target.value + ':00')}
                            disabled={!schedule?.is_available}
                            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 disabled:bg-gray-700/30 disabled:border-gray-600/30 disabled:text-gray-500"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">End:</span>
                          <input
                            type="time"
                            value={schedule?.end_time?.slice(0, 5) || '21:00'}
                            onChange={(e) => handleScheduleChange(day.id, 'end_time', e.target.value + ':00')}
                            disabled={!schedule?.is_available}
                            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 disabled:bg-gray-700/30 disabled:border-gray-600/30 disabled:text-gray-500"
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-400 min-w-[80px]">
                        {schedule?.is_available ? 
                          `${Math.round((new Date(`2000-01-01T${schedule.end_time}`).getTime() - new Date(`2000-01-01T${schedule.start_time}`).getTime()) / (1000 * 60 * 60))}h` : 
                          'Closed'
                        }
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <h5 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h5>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSchedules(daysOfWeek.map(day => ({
                    id: Date.now() + day.id,
                    facility_id: selectedFacility.id!,
                    day_of_week: day.id,
                    start_time: '09:00:00',
                    end_time: '21:00:00',
                    is_available: true
                  })));
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 font-medium rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Set all days 9 AM - 9 PM
              </button>
              <button
                onClick={() => {
                  setSchedules(daysOfWeek.map(day => ({
                    id: Date.now() + day.id,
                    facility_id: selectedFacility.id!,
                    day_of_week: day.id,
                    start_time: '09:00:00',
                    end_time: '21:00:00',
                    is_available: day.id !== 0 // Sunday closed
                  })));
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 font-medium rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Set weekdays only (Sunday closed)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Facility Selected State */}
      {!selectedFacility && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Facility</h3>
          <p className="text-gray-400">Choose a facility from the dropdown above to manage its weekly schedule</p>
        </div>
      )}
    </div>
  );
};

const SlotManager = ({ facilities }: { facilities: Facility[] }) => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSlotGenerationModal, setShowSlotGenerationModal] = useState(false);
  const [slotGenerationData, setSlotGenerationData] = useState({
    facilityId: null as number | null,
    availableDays: [1, 2, 3, 4, 5] as number[], // Default to Monday-Friday
    openingTime: '09:00',
    closingTime: '21:00',
    duration: 60,
    generationPeriod: '1',
    periodType: 'weeks' as 'days' | 'weeks' | 'months',
    startDate: new Date().toISOString().split('T')[0]
  });

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleFacilityChange = (facilityId: number) => {
    const facility = facilities.find(f => f.id === facilityId);
    setSelectedFacility(facility || null);
    setSlots([]);
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    if (selectedFacility && date) {
      try {
        // Fetch actual slots from backend for this date
        const slotsResponse = await adminFacilitiesApi.getFacilitySlots(selectedFacility.id, date);
        setSlots(slotsResponse);
      } catch (error) {
        console.error('Error fetching slots:', error);
        // Fallback to generating slots locally if API fails
        generateSlotsForDate(date);
      }
    }
  };

  const generateSlotsForDate = (date: string) => {
    if (!selectedFacility) return;

    const dayOfWeek = new Date(date).getDay();
    // TODO: Get actual schedule from backend
    const startTime = '09:00';
    const endTime = '21:00';
    const duration = selectedFacility.default_duration_minutes || 60;

    const slots = [];
    let currentTime = new Date(`2000-01-01T${startTime}`);
    const endDateTime = new Date(`2000-01-01T${endTime}`);

    while (currentTime < endDateTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000).toTimeString().slice(0, 5);
      
      slots.push({
        id: `temp-${Date.now()}-${slots.length}`,
        date,
        start_time: slotStart,
        end_time: slotEnd,
        duration: duration,
        status: 'available',
        base_price: 1000, // TODO: Get from facility pricing
        final_price: 1000,
        slot_type: 'regular',
        max_capacity: selectedFacility.max_capacity,
        current_bookings: 0
      });

      currentTime = new Date(currentTime.getTime() + duration * 60 * 1000);
    }

    setSlots(slots);
  };

  const generateSlotsForPeriod = async () => {
    if (!slotGenerationData.facilityId || slotGenerationData.availableDays.length === 0) {
      alert('Please select a facility and available days');
      return;
    }

    const facility = facilities.find(f => f.id === slotGenerationData.facilityId);
    if (!facility) return;

    setLoading(true);
    try {
      // Debug logging
      console.log('Sending slot generation data:', {
        facilityId: slotGenerationData.facilityId,
        data: {
          availableDays: slotGenerationData.availableDays,
          openingTime: slotGenerationData.openingTime,
          closingTime: slotGenerationData.closingTime,
          duration: slotGenerationData.duration,
          generationPeriod: slotGenerationData.generationPeriod,
          periodType: slotGenerationData.periodType,
          startDate: slotGenerationData.startDate
        }
      });

      // Call the backend API to generate slots
      const response = await adminFacilitiesApi.generateSlots(slotGenerationData.facilityId, {
        availableDays: slotGenerationData.availableDays,
        openingTime: slotGenerationData.openingTime,
        closingTime: slotGenerationData.closingTime,
        duration: slotGenerationData.duration,
        generationPeriod: slotGenerationData.generationPeriod,
        periodType: slotGenerationData.periodType,
        startDate: slotGenerationData.startDate
      });

      console.log('API Response:', response);
      
      // Show success message
      alert(`Successfully generated ${response.slotsGenerated} slots for ${response.facility} from ${response.dateRange.start} to ${response.dateRange.end}!`);
      
      // Close modal
      setShowSlotGenerationModal(false);
      
      // Refresh the slots view for the selected date
      if (slotGenerationData.startDate) {
        setSelectedDate(slotGenerationData.startDate);
        setSelectedFacility(facility);
        
        // Fetch actual slots from backend for this date
        try {
          const slotsResponse = await adminFacilitiesApi.getFacilitySlots(slotGenerationData.facilityId, slotGenerationData.startDate);
          setSlots(slotsResponse);
        } catch (error) {
          console.error('Error fetching slots:', error);
          // If we can't fetch slots, we'll still show success message
        }
      }
      
    } catch (error) {
      console.error('Error generating slots:', error);
      alert('Error generating slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlotsForDay = (date: string, startTime: string, endTime: string, duration: number, facility: Facility) => {
    const slots = [];
    let currentTime = new Date(`2000-01-01T${startTime}`);
    const endDateTime = new Date(`2000-01-01T${endTime}`);

    while (currentTime < endDateTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000).toTimeString().slice(0, 5);
      
      // Check if slot end time exceeds closing time
      if (new Date(`2000-01-01T${slotEnd}`) > endDateTime) {
        break;
      }
      
      slots.push({
        id: `temp-${Date.now()}-${slots.length}`,
        date,
        start_time: slotStart,
        end_time: slotEnd,
        duration: duration,
        status: 'available',
        base_price: 1000, // TODO: Get from facility pricing
        final_price: 1000,
        slot_type: 'regular',
        max_capacity: facility.max_capacity,
        current_bookings: 0
      });

      currentTime = new Date(currentTime.getTime() + duration * 60 * 1000);
    }

    return slots;
  };

  const updateSlotStatus = (slotId: string, status: string) => {
    setSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, status } : slot
    ));
  };

  const bulkUpdateSlots = (status: string) => {
    setSlots(prev => prev.map(slot => ({ ...slot, status })));
  };

  const saveSlots = async () => {
    if (!selectedFacility || !selectedDate) return;
    
    setLoading(true);
    try {
      // TODO: Call API to save slots
      console.log('Saving slots:', slots);
      // await adminFacilitiesApi.updateFacilitySlots(selectedFacility.id, selectedDate, slots);
    } catch (error) {
      console.error('Error saving slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Slot Management
          </h3>
          <p className="text-gray-400 mt-1">Generate and manage time slots for facility bookings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Reset modal data when opening
              setSlotGenerationData({
                facilityId: null,
                availableDays: [1, 2, 3, 4, 5], // Default to Monday-Friday
                openingTime: '09:00',
                closingTime: '21:00',
                duration: 60,
                generationPeriod: '1',
                periodType: 'weeks' as 'days' | 'weeks' | 'months',
                startDate: new Date().toISOString().split('T')[0]
              });
              setShowSlotGenerationModal(true);
            }}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-green-500/25"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Generate Slots
          </button>
          
          {selectedFacility && selectedDate && (
            <button
              onClick={saveSlots}
              disabled={loading}
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-purple-500/25 disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Slots
                </>
              )}
            </button>
          )}

            <button
              onClick={async () => {
                try {
                  const data = await adminFacilitiesApi.testDatabase();
                  console.log('Database test result:', data);
                  alert(`Database test: ${data.message}\nFacilities: ${data.facilitiesCount}, Slots: ${data.slotsCount}, Pricing: ${data.pricingCount}`);
                } catch (error) {
                  console.error('Database test failed:', error);
                  alert('Database test failed');
                }
              }}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-300"
            >
              Test DB
            </button>

            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/facilities/admin/test-method-binding', {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  const data = await response.json();
                  console.log('Method binding test result:', data);
                  alert(`Method binding test: ${data.message}\nMethods: ${JSON.stringify(data.methods)}\nTest call result: ${data.testCallResult}`);
                } catch (error) {
                  console.error('Method binding test failed:', error);
                  alert('Method binding test failed');
                }
              }}
              className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-xl transition-all duration-300"
            >
              Test Methods
            </button>

          {selectedFacility && (
            <button
              onClick={async () => {
                if (!selectedFacility) return;
                
                if (confirm(`Are you sure you want to clear all slots for ${selectedFacility.name}?`)) {
                  try {
                    const data = await adminFacilitiesApi.clearFacilitySlots(selectedFacility.id);
                    console.log('Clear slots result:', data);
                    alert(`Cleared ${data.slotsCleared} slots for ${selectedFacility.name}`);
                    
                    // Refresh slots display
                    if (selectedDate) {
                      handleDateChange(selectedDate);
                    }
                  } catch (error) {
                    console.error('Clear slots failed:', error);
                    alert('Failed to clear slots');
                  }
                }
              }}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-300"
            >
              Clear Slots
            </button>
          )}
        </div>
      </div>

      {/* Facility and Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Select Facility
          </label>
          <select
            value={selectedFacility?.id || ''}
            onChange={(e) => handleFacilityChange(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="">Choose a facility to manage slots...</option>
            {facilities.map(facility => (
              <option key={facility.id} value={facility.id} className="bg-gray-800 text-white">
                {facility.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-10 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            min={today}
            max={maxDate}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {slots.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white">
                Slots for {selectedDate} - {selectedFacility?.name}
              </h4>
            </div>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 font-medium rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {showBulkActions ? 'Hide' : 'Show'} Bulk Actions
            </button>
          </div>

          {showBulkActions && (
            <div className="mb-6 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
              <h5 className="font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h5>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => bulkUpdateSlots('available')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 font-medium rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Make All Available
                </button>
                <button
                  onClick={() => bulkUpdateSlots('blocked')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-medium rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Block All
                </button>
                <button
                  onClick={() => bulkUpdateSlots('maintenance')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 hover:text-yellow-300 font-medium rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Set All to Maintenance
                </button>
              </div>
            </div>
          )}

          {/* Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <div key={slot.id} className="group relative bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-800/70">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {slot.start_time} - {slot.end_time}
                    </div>
                    <div className="text-sm text-gray-400">
                      {slot.max_capacity - slot.current_bookings} spots available
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    slot.status === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    slot.status === 'booked' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    slot.status === 'blocked' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {slot.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price:</span>
                    <span className="font-medium text-white">PKR {slot.final_price}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="font-medium text-white capitalize">{slot.slot_type}</span>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Status:</label>
                    <select
                      value={slot.status}
                      onChange={(e) => updateSlotStatus(slot.id, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                    >
                      <option value="available">Available</option>
                      <option value="blocked">Blocked</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <div className="text-sm text-purple-300 flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Note:</strong> Slots are generated based on the facility's default duration ({selectedFacility?.default_duration_minutes} minutes). 
                You can modify individual slot statuses or use bulk actions to update multiple slots at once.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* No Slots State */}
      {selectedFacility && selectedDate && slots.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Slots Generated</h3>
          <p className="text-gray-400">Select a facility and date to generate time slots for booking</p>
        </div>
      )}

      {/* No Selection State */}
      {(!selectedFacility || !selectedDate) && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Select Facility & Date</h3>
          <p className="text-gray-400">Choose a facility and date from the dropdowns above to manage slots</p>
        </div>
      )}

      {/* Slot Generation Modal */}
      {showSlotGenerationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-4xl w-full border border-gray-700/50 shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Generate Time Slots</h3>
                  <p className="text-gray-400 text-sm">Create multiple time slots for a facility over a specified period</p>
                </div>
              </div>
              <button
                onClick={() => setShowSlotGenerationModal(false)}
                className="w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Instructions */}
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="text-sm text-blue-300 flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    <strong>How to generate slots:</strong> Select a facility, choose available days, set timing, and specify how many periods (days/weeks/months) to generate slots for. The system will create time slots for each selected day within the specified period.
                  </span>
                </div>
              </div>

              {/* Facility Selection */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Facility Selection
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Facility *
                    </label>
                    <select
                      value={slotGenerationData.facilityId || ''}
                      onChange={(e) => setSlotGenerationData(prev => ({ ...prev, facilityId: parseInt(e.target.value) || null }))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                    >
                      <option value="">Choose a facility...</option>
                      {facilities.map(facility => (
                        <option key={facility.id} value={facility.id} className="bg-gray-800 text-white">
                          {facility.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Slot Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="480"
                      step="15"
                      value={slotGenerationData.duration}
                      onChange={(e) => setSlotGenerationData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Available Days Selection */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Available Days
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 0, name: 'Sunday', short: 'Sun' },
                    { id: 1, name: 'Monday', short: 'Mon' },
                    { id: 2, name: 'Tuesday', short: 'Tue' },
                    { id: 3, name: 'Wednesday', short: 'Wed' },
                    { id: 4, name: 'Thursday', short: 'Thu' },
                    { id: 5, name: 'Friday', short: 'Fri' },
                    { id: 6, name: 'Saturday', short: 'Sat' }
                  ].map(day => (
                    <label key={day.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 hover:border-green-500/50 transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slotGenerationData.availableDays.includes(day.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSlotGenerationData(prev => ({
                              ...prev,
                              availableDays: [...prev.availableDays, day.id]
                            }));
                          } else {
                            setSlotGenerationData(prev => ({
                              ...prev,
                              availableDays: prev.availableDays.filter(d => d !== day.id)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-green-500 focus:ring-green-500 border-gray-600 rounded focus:ring-2 focus:ring-green-500/50"
                      />
                      <span className="text-sm font-medium text-white">{day.short}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Timing Configuration */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timing Configuration
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={slotGenerationData.openingTime}
                      onChange={(e) => setSlotGenerationData(prev => ({ ...prev, openingTime: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={slotGenerationData.closingTime}
                      onChange={(e) => setSlotGenerationData(prev => ({ ...prev, closingTime: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={slotGenerationData.startDate}
                      onChange={(e) => setSlotGenerationData(prev => ({ ...prev, startDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Generation Period */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generation Period
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Periods
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={slotGenerationData.generationPeriod}
                      onChange={(e) => setSlotGenerationData(prev => ({ ...prev, generationPeriod: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Period Type
                    </label>
                    <select
                      value={slotGenerationData.periodType}
                      onChange={(e) => setSlotGenerationData(prev => ({ ...prev, periodType: e.target.value as 'days' | 'weeks' | 'months' }))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <div className="text-sm text-green-300 flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      <strong>Example:</strong> If you select 2 weeks, slots will be generated for the next 2 weeks on the selected available days.
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation Section */}
              {(!slotGenerationData.facilityId || slotGenerationData.availableDays.length === 0) && (
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <div className="text-sm text-red-300 flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <strong>Please complete the following:</strong>
                      <ul className="mt-2 space-y-1">
                        {!slotGenerationData.facilityId && <li>• Select a facility</li>}
                        {slotGenerationData.availableDays.length === 0 && <li>• Select at least one available day</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowSlotGenerationModal(false)}
                  className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={generateSlotsForPeriod}
                  disabled={loading || !slotGenerationData.facilityId || slotGenerationData.availableDays.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl border border-green-500/50 hover:border-green-600/50 disabled:border-gray-600/50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Slots
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingsOverview = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
    
    // Set up auto-refresh every 30 seconds to keep admin view updated
    const interval = setInterval(fetchBookings, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Call API to fetch all bookings
      const response = await adminFacilitiesApi.getAllBookings();
      console.log('Fetched admin bookings:', response);
      setBookings(response);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast('Failed to load bookings', 'error');
      setBookings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const facilityMatch = selectedFacility === 'all' || booking.facility_name === selectedFacility;
    const dateMatch = !selectedDate || booking.booking_date === selectedDate;
    const statusMatch = selectedStatus === 'all' || booking.status === selectedStatus;
    return facilityMatch && dateMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-200 rounded-full animate-spin mx-auto"></div>
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto absolute top-0 left-0"></div>
        </div>
        <p className="text-gray-400 mt-4 text-lg font-medium">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Bookings Overview
          </h3>
          <p className="text-gray-400 mt-1">Monitor and manage all facility bookings</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-green-500/25"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          
          <div className="text-sm text-gray-400">
            Auto-refresh every 30s
          </div>
          
          <button
            onClick={() => {
              console.log('Current bookings state:', bookings);
              console.log('Filtered bookings:', filteredBookings);
              console.log('Bookings with cancelled status:', bookings.filter(b => b.status === 'cancelled'));
              showToast('Check console for debugging info', 'info');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Debug Bookings
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L6.293 13.293A1 1 0 016 12.586V10H3z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-white">Filters</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Facility
            </label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
            >
              <option value="all">All Facilities</option>
              <option value="Gym Floor">Gym Floor</option>
              <option value="Swimming Pool">Swimming Pool</option>
              <option value="Sauna & Steam Room">Sauna & Steam Room</option>
              <option value="Boxing Ring">Boxing Ring</option>
              <option value="Yoga Studio">Yoga Studio</option>
              <option value="Cardio Zone">Cardio Zone</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:border-green-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-400">Total Bookings</div>
          </div>
          <div className="text-3xl font-bold text-white">{filteredBookings.length}</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:border-green-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-400">Confirmed</div>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {filteredBookings.filter(b => b.status === 'confirmed').length}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:border-yellow-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-400">Pending</div>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {filteredBookings.filter(b => b.status === 'pending').length}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:border-red-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-400">Cancelled</div>
          </div>
          <div className="text-3xl font-bold text-red-400">
            {filteredBookings.filter(b => b.status === 'cancelled').length}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-400">Total Revenue</div>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            PKR {filteredBookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.price_paid, 0)}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-white">
              Bookings ({filteredBookings.length})
            </h4>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400">No bookings found matching the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {booking.first_name} {booking.last_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.email}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {booking.role}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {booking.facility_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {formatDate(booking.booking_date)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.status === 'cancelled' && booking.cancellation_reason && (
                          <span className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                            {booking.cancellation_reason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      PKR {booking.price_paid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {booking.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsOverview = ({ facilities }: { facilities: Facility[] }) => {
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [analytics, setAnalytics] = useState<FacilityAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedFacility, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Call API to fetch analytics
      // const response = await adminFacilitiesApi.getFacilityAnalytics(selectedFacility, dateRange);
      // setAnalytics(response);
      
      // Mock data for now
      setAnalytics([
        {
          date: '2024-01-15',
          total_slots: 24,
          total_bookings: 18,
          total_revenue: 18000,
          peak_hour_bookings: 12,
          off_peak_bookings: 6,
          member_bookings: 15,
          non_member_bookings: 3,
          average_utilization_percentage: 75.0
        },
        {
          date: '2024-01-16',
          total_slots: 24,
          total_bookings: 20,
          total_revenue: 20000,
          peak_hour_bookings: 14,
          off_peak_bookings: 6,
          member_bookings: 17,
          non_member_bookings: 3,
          average_utilization_percentage: 83.3
        }
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin mx-auto"></div>
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto absolute top-0 left-0"></div>
        </div>
        <p className="text-gray-400 mt-4 text-lg font-medium">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            Analytics Overview
          </h3>
          <p className="text-gray-400 mt-1">Comprehensive insights into facility performance and usage</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-indigo-500/25"
        >
          <svg className="w-5 h-5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L6.293 13.293A1 1 0 016 12.586V10H3z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-white">Filters</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Facility
            </label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
            >
              <option value="all">All Facilities</option>
              {facilities.map(facility => (
                <option key={facility.id} value={facility.name} className="bg-gray-800 text-white">
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-400">Total Revenue</div>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {formatCurrency(analytics.reduce((sum, a) => sum + a.total_revenue, 0))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:border-green-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-400">Total Bookings</div>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {analytics.reduce((sum, a) => sum + a.total_bookings, 0)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:border-yellow-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-400">Peak Hour Bookings</div>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {analytics.reduce((sum, a) => sum + a.peak_hour_bookings, 0)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-400">Member Bookings</div>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {analytics.reduce((sum, a) => sum + a.member_bookings, 0)}
          </div>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-white">
              Daily Analytics
            </h4>
          </div>
        </div>

        {analytics.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-400">No analytics data available for the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Slots
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Peak Hours
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Utilization
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {analytics.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-800/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {formatDate(day.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {day.total_slots}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {day.total_bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                      {formatCurrency(day.total_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {day.peak_hour_bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {day.member_bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        day.average_utilization_percentage >= 80 ? 'text-green-400' :
                        day.average_utilization_percentage >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {day.average_utilization_percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Revenue Trend
          </h4>
          <div className="h-64 bg-gray-800/30 rounded-xl border border-gray-700/50 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Chart will be implemented here</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-xl">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Booking Distribution
          </h4>
          <div className="h-64 bg-gray-800/30 rounded-xl border border-gray-700/50 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p>Chart will be implemented here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FacilityModal = ({ 
  facility, 
  onClose, 
  onSubmit 
}: {
  facility: Partial<Facility>;
  onClose: () => void;
  onSubmit: (data: CreateFacilityData) => void;
}) => {
  const [formData, setFormData] = useState<CreateFacilityData>({
    name: facility.name || '',
    description: facility.description || '',
    category: facility.category || '',
    default_duration_minutes: facility.default_duration_minutes || 60,
    max_capacity: facility.max_capacity || 1,
    location: facility.location || '',
    image_url: facility.image_url || '',
    is_active: facility.is_active !== undefined ? facility.is_active : true,
    base_price: 1000,
    peak_hours_start: '17:00:00',
    peak_hours_end: '21:00:00',
    peak_price_multiplier: 1.25,
    member_discount_percentage: 15.00,
    cancellation_hours: 24,
    refund_percentage: 100.00
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateFacilityData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-4xl w-full border border-gray-700/50 shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {facility.id ? 'Edit Facility' : 'Create New Facility'}
              </h3>
              <p className="text-gray-400 text-sm">
                {facility.id ? 'Update facility information and settings' : 'Add a new facility to your gym'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                  placeholder="e.g., Gym Floor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                >
                  <option value="">Select Category</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Aquatics">Aquatics</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Combat Sports">Combat Sports</option>
                  <option value="Mind & Body">Mind & Body</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Strength Training">Strength Training</option>
                  <option value="Group Classes">Group Classes</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                  placeholder="e.g., Ground Floor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Duration (minutes) *
                </label>
                <input
                  type="number"
                  required
                  min="15"
                  max="480"
                  step="15"
                  value={formData.default_duration_minutes}
                  onChange={(e) => handleChange('default_duration_minutes', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.max_capacity}
                  onChange={(e) => handleChange('max_capacity', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                placeholder="Describe the facility, equipment, and amenities..."
              />
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Status & Availability
            </h4>
            
            <div className="flex items-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="w-5 h-5 text-orange-500 focus:ring-orange-500 border-gray-600 rounded focus:ring-2 focus:ring-orange-500/50"
              />
              <label htmlFor="is_active" className="ml-3 block text-sm text-gray-300">
                Facility is active and available for booking
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl border border-orange-500/50 hover:border-orange-600/50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25"
            >
              {facility.id ? 'Update Facility' : 'Create Facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ScheduleModal = ({ facility, onClose }: { facility: Facility; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-2xl max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-orange-400">Manage Schedule - {facility.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="text-center py-12">
          <i className="fas fa-calendar text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-400">Schedule management will be implemented here</p>
        </div>
      </div>
    </div>
  );
};

const SlotModal = ({ facility, onClose }: { facility: Facility; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-2xl max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-orange-400">Manage Slots - {facility.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="text-center py-12">
          <i className="fas fa-clock text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-400">Slot management will be implemented here</p>
        </div>
      </div>
    </div>
  );
};

const BookingsModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-2xl max-w-6xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-orange-400">Bookings Overview</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="text-center py-12">
          <i className="fas fa-list text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-400">Bookings overview will be implemented here</p>
        </div>
      </div>
    </div>
  );
};

const AnalyticsModal = ({ facility, onClose }: { facility: Facility; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-2xl max-w-6xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-orange-400">Analytics - {facility.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="text-center py-12">
          <i className="fas fa-chart-line text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-400">Analytics will be implemented here</p>
        </div>
      </div>
    </div>
  );
};
