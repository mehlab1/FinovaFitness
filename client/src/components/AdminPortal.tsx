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
      case 'subscription':
        return <SubscriptionManagement showToast={showToast} />;
      default:
        return <AdminDashboard user={user} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="sidebar w-64 h-screen fixed left-0 top-0 p-6">
        <div className="flex items-center space-x-3 mb-8">
          <i className="fas fa-dumbbell text-2xl text-orange-400 neon-glow"></i>
          <h1 className="text-xl font-bold text-orange-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            FINOVA FITNESS
          </h1>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-orange-400' },
            { id: 'members', icon: 'fas fa-users', label: 'Member Directory', color: 'text-blue-400' },
            { id: 'staff', icon: 'fas fa-user-tie', label: 'Staff Management', color: 'text-green-400' },
            { id: 'bookings', icon: 'fas fa-calendar-alt', label: 'Bookings & Facilities', color: 'text-pink-400' },
            { id: 'plans', icon: 'fas fa-tags', label: 'Plans & Pricing', color: 'text-purple-400' },
            { id: 'loyalty', icon: 'fas fa-gift', label: 'Loyalty & Referrals', color: 'text-blue-400' },
            { id: 'rewards', icon: 'fas fa-trophy', label: 'Consistency Rewards', color: 'text-green-400' },
            { id: 'analytics', icon: 'fas fa-chart-line', label: 'Analytics', color: 'text-pink-400' },
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
        <div className="bg-gray-900 p-8 rounded-lg">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <i className="fas fa-chart-bar text-4xl text-orange-400 mb-4"></i>
              <h4 className="text-lg font-bold mb-2">Revenue Chart</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Jan:</span>
                  <span className="text-green-400">$45,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Feb:</span>
                  <span className="text-green-400">$52,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Mar:</span>
                  <span className="text-green-400">$48,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Facility Usage</h3>
        <div className="bg-gray-900 p-8 rounded-lg">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <i className="fas fa-calendar-week text-4xl text-blue-400 mb-4"></i>
              <h4 className="text-lg font-bold mb-2">Usage Heatmap</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Peak Hours:</span>
                  <span className="text-pink-400">6-8 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Occupancy:</span>
                  <span className="text-blue-400">73%</span>
                </div>
                <div className="flex justify-between">
                  <span>Most Used:</span>
                  <span className="text-green-400">Cardio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Churn Rate</h3>
        <div className="bg-gray-900 p-8 rounded-lg">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <i className="fas fa-chart-line text-4xl text-pink-400 mb-4"></i>
              <h4 className="text-lg font-bold mb-2">Churn Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="text-red-400">2.1%</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Month:</span>
                  <span className="text-red-400">2.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Trend:</span>
                  <span className="text-green-400">↓ Improving</span>
                </div>
              </div>
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
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-orange-400 mb-4">Add Staff Member</h3>
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
  const [newPlan, setNewPlan] = useState({ name: '', duration: '', price: '', perks: '' });

  const plans = [
    { id: 1, name: 'Monthly', duration: '1 month', price: '$79', perks: '24/7 access, All classes, 2 guest passes' },
    { id: 2, name: 'Quarterly', duration: '3 months', price: '$199', perks: '24/7 access, All classes, 3 guest passes, 2 PT sessions' },
    { id: 3, name: 'Yearly', duration: '12 months', price: '$599', perks: '24/7 access, All classes, 5 guest passes, 2 PT sessions/month' }
  ];

  const handleAddPlan = () => {
    if (newPlan.name && newPlan.duration && newPlan.price && newPlan.perks) {
      showToast(`${newPlan.name} plan created successfully`, 'success');
      setNewPlan({ name: '', duration: '', price: '', perks: '' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-orange-400">Plans & Pricing</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Create New Plan
        </button>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Plan Name</th>
                <th className="text-left p-3">Duration</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Perks</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="table-row">
                  <td className="p-3 font-semibold">{plan.name}</td>
                  <td className="p-3">{plan.duration}</td>
                  <td className="p-3 text-green-400 font-bold">{plan.price}</td>
                  <td className="p-3 text-gray-300">{plan.perks}</td>
                  <td className="p-3">
                    <button
                      onClick={() => showToast(`Editing ${plan.name} plan`, 'info')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => showToast(`${plan.name} plan disabled`, 'info')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                    >
                      Disable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-orange-400 mb-4">Create New Plan</h3>
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
                placeholder="Price (e.g., $79)"
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
  <div className="animate-fade-in space-y-6">
    {/* Analytics Tables */}
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-orange-400">Analytics Overview</h3>
        <button
          onClick={() => showToast('CSV export initiated', 'success')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Export CSV
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-blue-400 mb-3">Revenue by Location</h4>
          <div className="space-y-2">
            <div className="flex justify-between bg-gray-900 p-3 rounded">
              <span>Downtown</span>
              <span className="text-green-400">$15,240</span>
            </div>
            <div className="flex justify-between bg-gray-900 p-3 rounded">
              <span>Uptown</span>
              <span className="text-green-400">$12,800</span>
            </div>
            <div className="flex justify-between bg-gray-900 p-3 rounded">
              <span>Midtown</span>
              <span className="text-green-400">$18,950</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold text-green-400 mb-3">Top Performing Trainers</h4>
          <div className="space-y-2">
            <div className="flex justify-between bg-gray-900 p-3 rounded">
              <span>Sarah Johnson</span>
              <span className="text-blue-400">$3,240</span>
            </div>
            <div className="flex justify-between bg-gray-900 p-3 rounded">
              <span>Mike Chen</span>
              <span className="text-blue-400">$2,890</span>
            </div>
            <div className="flex justify-between bg-gray-900 p-3 rounded">
              <span>Alex Rodriguez</span>
              <span className="text-blue-400">$2,650</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Member Insights */}
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-orange-400 mb-4">Member Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">92%</div>
          <div className="text-sm text-gray-400">Member Satisfaction</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">4.2</div>
          <div className="text-sm text-gray-400">Avg Sessions/Week</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-pink-400">76%</div>
          <div className="text-sm text-gray-400">Goal Achievement Rate</div>
        </div>
      </div>
    </div>
  </div>
);

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
