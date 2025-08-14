import { useState, useEffect } from 'react';
import { User } from '../types';
import { useToast } from './Toast';

import { adminApi, MemberStats, SessionStats, getRevenueStats, RevenueStats } from '../services/api/adminApi';
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [facilityStatus, setFacilityStatus] = useState<{ [key: string]: 'open' | 'maintenance' | 'closed' }>({});

  const facilities = ['Gym Floor', 'Pool', 'Sauna', 'Boxing Ring', 'Yoga Studio', 'Cardio Zone'];
  const timeSlots = ['6:00 AM', '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];

  const toggleFacilityStatus = (facility: string, time: string) => {
    const key = `${facility}-${time}`;
    const currentStatus = facilityStatus[key] || 'open';
    const nextStatus = currentStatus === 'open' ? 'maintenance' : currentStatus === 'maintenance' ? 'closed' : 'open';
    setFacilityStatus({ ...facilityStatus, [key]: nextStatus });
    showToast(`${facility} at ${time} set to ${nextStatus}`, 'info');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <label className="text-lg font-semibold">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
        />
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Master Booking Calendar - {selectedDate}</h3>
        <div className="overflow-x-auto minimal-scroll">
          <div className="min-w-full">
            <div className="grid grid-cols-9 gap-2 mb-4">
              <div className="font-bold text-center p-2">Facility</div>
              {timeSlots.map(time => (
                <div key={time} className="font-bold text-center p-2 text-orange-400">{time}</div>
              ))}
            </div>
            
            {facilities.map(facility => (
              <div key={facility} className="grid grid-cols-9 gap-2 mb-2">
                <div className="font-semibold p-2 text-center">{facility}</div>
                {timeSlots.map(time => {
                  const key = `${facility}-${time}`;
                  const status = facilityStatus[key] || 'open';
                  return (
                    <button
                      key={`${facility}-${time}`}
                      onClick={() => toggleFacilityStatus(facility, time)}
                      className={`p-2 rounded text-center text-sm font-semibold transition-all duration-300 ${
                        status === 'open' 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : status === 'maintenance'
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {status === 'open' ? 'Open' : status === 'maintenance' ? 'Maint.' : 'Closed'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
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
