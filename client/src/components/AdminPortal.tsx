import { useState } from 'react';
import { User } from '../types';
import { useToast } from './Toast';
import { memberStats, staffMembers } from '../data/mockData';

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
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-800 pr-2">
            <nav className="space-y-2 pb-4">
              {[
                { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-orange-400' },
                { id: 'members', icon: 'fas fa-users', label: 'Member Directory', color: 'text-blue-400' },
                { id: 'staff', icon: 'fas fa-user-tie', label: 'Staff Management', color: 'text-green-400' },
                { id: 'bookings', icon: 'fas fa-calendar-alt', label: 'Bookings & Facilities', color: 'text-pink-400' },
                { id: 'plans', icon: 'fas fa-tags', label: 'Plans & Pricing', color: 'text-purple-400' },
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

const AdminDashboard = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
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
        <p className="text-2xl font-bold text-white">{memberStats.totalMembers}</p>
        <p className="text-gray-300">+5% this month</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-green-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Active Plans</h3>
          <i className="fas fa-id-card text-green-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">{memberStats.activePlans}</p>
        <p className="text-gray-300">93% retention</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-blue-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Sessions Today</h3>
          <i className="fas fa-calendar-day text-blue-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">{memberStats.sessionsToday}</p>
        <p className="text-gray-300">+12% vs yesterday</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-pink-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Revenue Today</h3>
          <i className="fas fa-dollar-sign text-pink-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">${memberStats.revenueToday}</p>
        <p className="text-gray-300">+8% vs avg</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-purple-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-purple-400" style={{ fontFamily: 'Orbitron, monospace' }}>Points Redeemed</h3>
          <i className="fas fa-star text-purple-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">{memberStats.pointsRedeemedToday}</p>
        <p className="text-gray-300">Today</p>
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
              <span className="text-2xl font-bold text-green-400">$145,000</span>
            </div>
            <div className="space-y-3">
              {[
                { month: 'Jan', revenue: 45000, color: 'bg-green-500' },
                { month: 'Feb', revenue: 52000, color: 'bg-blue-500' },
                { month: 'Mar', revenue: 48000, color: 'bg-purple-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-300 w-8">{item.month}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div 
                      className={`${item.color} h-3 rounded-full transition-all duration-1000`}
                      style={{ width: `${(item.revenue / 52000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-green-400">${item.revenue.toLocaleString()}</span>
                </div>
              ))}
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
              <span className="text-lg font-bold text-pink-400">6-8 PM</span>
            </div>
            <div className="space-y-3">
              {[
                { facility: 'Cardio', usage: 85, color: 'bg-pink-500' },
                { facility: 'Weights', usage: 72, color: 'bg-blue-500' },
                { facility: 'Pool', usage: 45, color: 'bg-cyan-500' },
                { facility: 'Classes', usage: 68, color: 'bg-purple-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-300 w-16">{item.facility}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div 
                      className={`${item.color} h-3 rounded-full transition-all duration-1000`}
                      style={{ width: `${item.usage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-blue-400">{item.usage}%</span>
                </div>
              ))}
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
              <span className="text-2xl font-bold text-red-400">2.1%</span>
            </div>
            <div className="space-y-3">
              {[
                { month: 'Jan', rate: 2.8, color: 'bg-red-500' },
                { month: 'Feb', rate: 2.5, color: 'bg-orange-500' },
                { month: 'Mar', rate: 2.1, color: 'bg-yellow-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-300 w-8">{item.month}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div 
                      className={`${item.color} h-3 rounded-full transition-all duration-1000`}
                      style={{ width: `${(item.rate / 3) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-red-400">{item.rate}%</span>
                </div>
              ))}
            </div>
            <div className="text-center pt-2">
              <span className="text-sm text-green-400 font-semibold">↓ Improving Trend</span>
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
  </div>
);

const MemberDirectory = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const members = [
    { id: 1, name: 'John Smith', email: 'john@email.com', plan: 'Quarterly', lastVisit: '2024-01-15', status: 'Active' },
    { id: 2, name: 'Sarah Davis', email: 'sarah@email.com', plan: 'Monthly', lastVisit: '2024-01-14', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@email.com', plan: 'Yearly', lastVisit: '2024-01-13', status: 'Active' },
    { id: 4, name: 'Emma Wilson', email: 'emma@email.com', plan: 'Monthly', lastVisit: '2024-01-10', status: 'Paused' },
    { id: 5, name: 'David Brown', email: 'david@email.com', plan: 'Quarterly', lastVisit: '2024-01-12', status: 'Active' }
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = !filterPlan || member.plan === filterPlan;
    const matchesStatus = !filterStatus || member.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      {/* Filters */}
      <div className="glass-card p-6 rounded-2xl mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
            />
          </div>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
          >
            <option value="">All Plans</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Member Directory</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Last Visit</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="table-row">
                  <td className="p-3 font-semibold">{member.name}</td>
                  <td className="p-3 text-gray-300">{member.email}</td>
                  <td className="p-3">{member.plan}</td>
                  <td className="p-3 text-gray-300">{member.lastVisit}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      member.status === 'Active' 
                        ? 'bg-green-600 text-white' 
                        : member.status === 'Paused'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => showToast(`Viewing ${member.name}'s profile`, 'info')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors mr-2"
                    >
                      View/Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StaffManagement = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', contact: '' });

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.role && newStaff.contact) {
      showToast(`${newStaff.name} added as ${newStaff.role}`, 'success');
      setNewStaff({ name: '', role: '', contact: '' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-orange-400">Staff Management</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Add Staff Member
        </button>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((staff) => (
                <tr key={staff.id} className="table-row">
                  <td className="p-3 font-semibold">{staff.name}</td>
                  <td className="p-3">{staff.role}</td>
                  <td className="p-3 text-gray-300">{staff.contact}</td>
                  <td className="p-3">
                    <button
                      onClick={() => showToast(`Editing ${staff.name}'s details`, 'info')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => showToast(`${staff.name} removed from staff`, 'info')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-400">Add Staff Member</h3>
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
                placeholder="Staff name"
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
              <select
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              >
                <option value="">Select role</option>
                <option value="Personal Trainer">Personal Trainer</option>
                <option value="Nutritionist">Nutritionist</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Manager">Manager</option>
              </select>
              <input
                type="text"
                placeholder="Contact (email or phone)"
                value={newStaff.contact}
                onChange={(e) => setNewStaff({ ...newStaff, contact: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-orange-400 focus:outline-none"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleAddStaff}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Add Staff
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
        <div className="overflow-x-auto">
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
    { id: 1, name: 'Basic Monthly', duration: '1 month', price: 'PKR 22,000', originalPrice: 'PKR 25,000', perks: '24/7 access, All classes, 2 guest passes', status: 'active' },
    { id: 2, name: 'Premium Quarterly', duration: '3 months', price: 'PKR 55,000', originalPrice: 'PKR 66,000', perks: '24/7 access, All classes, 3 guest passes, 2 PT sessions', status: 'active' },
    { id: 3, name: 'Elite Yearly', duration: '12 months', price: 'PKR 165,000', originalPrice: 'PKR 198,000', perks: '24/7 access, All classes, 5 guest passes, 2 PT sessions/month', status: 'active' },
    { id: 4, name: 'Student Plan', duration: '6 months', price: 'PKR 45,000', originalPrice: 'PKR 60,000', perks: '24/7 access, All classes, Student ID required', status: 'active' },
    { id: 5, name: 'Family Plan', duration: '12 months', price: 'PKR 220,000', originalPrice: 'PKR 264,000', perks: 'Up to 4 family members, All classes, 10 guest passes', status: 'active' }
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
