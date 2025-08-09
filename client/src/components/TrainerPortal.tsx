import { useState, useEffect } from 'react';
import { User } from '../types';
import { useToast } from './Toast';
import { trainerApi } from '../services/api';

interface TrainerPortalProps {
  user: User | null;
  onLogout: () => void;
}

export const TrainerPortal = ({ user, onLogout }: TrainerPortalProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { showToast } = useToast();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <TrainerDashboard user={user} showToast={showToast} />;
      case 'schedule':
        return <TrainerSchedule showToast={showToast} />;
      case 'client-requests':
        return <ClientRequests showToast={showToast} />;
      case 'notes':
        return <SessionNotes showToast={showToast} />;
      case 'analytics':
        return <TrainerAnalytics showToast={showToast} />;
      case 'announcements':
        return <TrainerAnnouncements showToast={showToast} />;
      case 'subscription':
        return <TrainerSubscription showToast={showToast} />;
      default:
        return <TrainerDashboard user={user} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="sidebar w-64 h-screen fixed left-0 top-0 p-6">
        <div className="flex items-center space-x-3 mb-8">
          <i className="fas fa-dumbbell text-2xl text-pink-400 neon-glow"></i>
          <h1 className="text-xl font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            FINOVA FITNESS
          </h1>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-pink-400' },
            { id: 'schedule', icon: 'fas fa-calendar', label: 'My Schedule', color: 'text-blue-400' },
            { id: 'client-requests', icon: 'fas fa-user-friends', label: 'Client Requests', color: 'text-green-400' },
            { id: 'notes', icon: 'fas fa-sticky-note', label: 'Session Notes', color: 'text-purple-400' },
            { id: 'analytics', icon: 'fas fa-chart-bar', label: 'Analytics', color: 'text-orange-400' },
            { id: 'announcements', icon: 'fas fa-bullhorn', label: 'Announcements', color: 'text-yellow-400' },
            { id: 'subscription', icon: 'fas fa-credit-card', label: 'Subscription', color: 'text-blue-400' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-pink-400 hover:bg-opacity-10 transition-all ${
                currentPage === item.id ? 'bg-pink-400 bg-opacity-20' : ''
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
              <div className="text-sm text-gray-300">Trainer: {user?.name}</div>
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

const TrainerDashboard = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await trainerApi.getDashboard();
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

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const upcomingSessions = dashboardData?.upcomingSessions || [];
  const clientRequests = dashboardData?.clientRequests || [];
  const todayEarnings = dashboardData?.todayEarnings || 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          TRAINER DASHBOARD
        </h1>
        <p className="text-gray-300">Welcome back, {user?.name}! Here's your training overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="metric-card p-6 rounded-xl border-pink-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Total Sessions</h3>
            <i className="fas fa-calendar-day text-pink-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total_sessions || 0}</p>
          <p className="text-gray-300">{stats.completed_sessions || 0} completed</p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-green-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Active Clients</h3>
            <i className="fas fa-users text-green-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">{stats.active_clients || 0}</p>
          <p className="text-gray-300">{stats.new_clients || 0} new this month</p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-blue-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Earnings</h3>
            <i className="fas fa-chart-line text-blue-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">PKR {todayEarnings.toLocaleString()}</p>
          <p className="text-gray-300">Today's earnings</p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-orange-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-orange-400" style={{ fontFamily: 'Orbitron, monospace' }}>Rating</h3>
            <i className="fas fa-star text-orange-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">{stats.average_rating ? parseFloat(stats.average_rating).toFixed(1) : '0.0'}</p>
          <p className="text-gray-300">{stats.total_ratings || 0} reviews</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { icon: 'fas fa-calendar-check', title: 'VIEW SCHEDULE', description: 'Check today\'s appointments', color: 'border-blue-400' },
          { icon: 'fas fa-user-plus', title: 'NEW CLIENT', description: 'Add a new client', color: 'border-green-400' },
          { icon: 'fas fa-sticky-note', title: 'SESSION NOTES', description: 'Update client progress', color: 'border-purple-400' }
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

      {/* Upcoming Sessions */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Upcoming Sessions</h3>
        <div className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No upcoming sessions</p>
          ) : (
            upcomingSessions.slice(0, 3).map((session: any, index: number) => (
              <div key={index} className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">
                    {session.start_time} - {session.first_name && session.last_name 
                      ? `${session.first_name} ${session.last_name}` 
                      : 'Demo Session'}
                  </h4>
                  <p className="text-gray-300">{session.session_type.replace('_', ' ')} • {new Date(session.session_date).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => showToast(`Session confirmed`, 'success')}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Start Session
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TrainerSchedule = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>({});

  const timeSlots = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];

  const toggleAvailability = (time: string) => {
    const key = `${selectedDate}-${time}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    showToast(`${time} marked as ${availability[key] ? 'available' : 'unavailable'}`, 'info');
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
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-pink-400 focus:outline-none"
          />
        </div>
        
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-pink-400 mb-4">Schedule for {selectedDate}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {timeSlots.map((time) => {
              const key = `${selectedDate}-${time}`;
              const isAvailable = availability[key];
              return (
                <button
                  key={time}
                  onClick={() => toggleAvailability(time)}
                  className={`p-4 rounded-lg text-center transition-all duration-300 ${
                    isAvailable 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <div className="text-sm font-semibold">{time}</div>
                  <div className="text-xs mt-1">
                    {isAvailable ? 'Unavailable' : 'Available'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientRequests = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await trainerApi.getRequests();
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        showToast('Failed to load client requests', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [showToast]);

  const handleRequest = async (id: number, action: 'approve' | 'reject') => {
    try {
      const requestData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        trainer_response: action === 'approve' ? 'Request approved' : 'Request rejected',
        approved_date: action === 'approve' ? new Date().toISOString().split('T')[0] : null,
        approved_time: action === 'approve' ? '10:00' : null,
        session_price: action === 'approve' ? 75.00 : null
      };
      
      await trainerApi.updateRequest(id, requestData);
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: requestData.status } : req
      ));
      
      showToast(`Request ${action === 'approve' ? 'approved' : 'rejected'}`, 'success');
    } catch (error) {
      console.error('Failed to update request:', error);
      showToast('Failed to update request', 'error');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Client Booking Requests</h3>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No client requests</p>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">{request.requester_name}</h4>
                    <p className="text-gray-300">
                      {request.request_type.replace('_', ' ')} • {request.preferred_date} at {request.preferred_time}
                    </p>
                    {request.message && (
                      <p className="text-sm text-gray-400 mt-1">"{request.message}"</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {request.is_member ? 'Member' : 'Non-member'} • {request.requester_email}
                    </p>
                  </div>
                <div className="flex space-x-2">
                  {request.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleRequest(request.id, 'approve')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequest(request.id, 'reject')}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-4 py-2 rounded-lg font-semibold ${
                      request.status === 'approved' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const SessionNotes = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const sessions = [
    { id: 1, client: 'John Smith', date: '2024-01-15', type: 'Strength Training' },
    { id: 2, client: 'Sarah Davis', date: '2024-01-14', type: 'HIIT' },
    { id: 3, client: 'Mike Johnson', date: '2024-01-13', type: 'Cardio' }
  ];

  const handleSaveNote = (sessionId: number) => {
    showToast('Session notes saved!', 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="space-y-6">
        {sessions.map((session) => (
          <div key={session.id} className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-pink-400 mb-4">
              {session.client} - {session.date}
            </h3>
            <p className="text-gray-300 mb-4">{session.type}</p>
            <textarea
              value={notes[session.id] || ''}
              onChange={(e) => setNotes({ ...notes, [session.id]: e.target.value })}
              placeholder="Add session notes, progress, observations..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-pink-400 focus:outline-none"
              rows={4}
            />
            <button
              onClick={() => handleSaveNote(session.id)}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Save Notes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrainerAnalytics = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
  <div className="animate-fade-in">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-pink-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
        Analytics Dashboard
      </h2>
    </div>

    {/* Analytics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="metric-card p-6 rounded-xl border-green-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Total Sessions</h3>
          <i className="fas fa-calendar-check text-green-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">156</p>
        <p className="text-gray-300">This month</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-blue-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Client Retention</h3>
          <i className="fas fa-users text-blue-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">94%</p>
        <p className="text-gray-300">+2.3% from last month</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-purple-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-purple-400" style={{ fontFamily: 'Orbitron, monospace' }}>Average Rating</h3>
          <i className="fas fa-star text-purple-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">4.8</p>
        <p className="text-gray-300">From 127 reviews</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-orange-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-400" style={{ fontFamily: 'Orbitron, monospace' }}>Revenue</h3>
          <i className="fas fa-dollar-sign text-orange-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">PKR 45,600</p>
        <p className="text-gray-300">This month</p>
      </div>
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Sessions Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Weekly Sessions Trend</h3>
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
                <span className="text-sm">This Week</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
                <span className="text-sm">Last Week</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="flex items-center">
                <div className="w-12 text-sm text-gray-400">{day}</div>
                <div className="flex-1 flex space-x-2">
                  <div 
                    className="bg-green-400 rounded"
                    style={{ 
                      width: `${Math.random() * 60 + 20}%`, 
                      height: '20px' 
                    }}
                  ></div>
                  <div 
                    className="bg-blue-400 rounded"
                    style={{ 
                      width: `${Math.random() * 60 + 20}%`, 
                      height: '20px' 
                    }}
                  ></div>
                </div>
                <div className="w-16 text-right text-sm">
                  <div className="text-green-400">{Math.floor(Math.random() * 8 + 4)}</div>
                  <div className="text-blue-400">{Math.floor(Math.random() * 8 + 4)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client Progress Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Client Progress</h3>
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="space-y-4">
            {[
              { name: 'John Smith', progress: 85, goal: 'Weight Loss' },
              { name: 'Sarah Davis', progress: 72, goal: 'Muscle Gain' },
              { name: 'Mike Johnson', progress: 93, goal: 'Endurance' },
              { name: 'Lisa Park', progress: 68, goal: 'Strength' }
            ].map((client, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{client.name}</span>
                  <span className="text-gray-400">{client.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full"
                    style={{ width: `${client.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400">{client.goal}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Performance Metrics */}
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-pink-400 mb-4">Performance Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
          <div className="text-sm text-gray-300">Session Completion Rate</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">24</div>
          <div className="text-sm text-gray-300">Active Clients</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">156</div>
          <div className="text-sm text-gray-300">Total Sessions This Month</div>
        </div>
      </div>
    </div>
  </div>
);

const TrainerSubscription = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'John Smith',
      plan: 'Quarterly',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      status: 'active',
      sessionsRemaining: 8,
      totalSessions: 12,
      price: 'PKR 55,000'
    },
    {
      id: 2,
      name: 'Sarah Davis',
      plan: 'Monthly',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'active',
      sessionsRemaining: 3,
      totalSessions: 8,
      price: 'PKR 22,000'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      plan: 'Yearly',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'paused',
      sessionsRemaining: 45,
      totalSessions: 48,
      price: 'PKR 165,000'
    },
    {
      id: 4,
      name: 'Lisa Park',
      plan: 'Monthly',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      status: 'cancelled',
      sessionsRemaining: 0,
      totalSessions: 8,
      price: 'PKR 22,000'
    }
  ]);

  const handleSubscriptionAction = (clientId: number, action: 'pause' | 'cancel' | 'resume') => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        let newStatus = client.status;
        if (action === 'pause') newStatus = 'paused';
        else if (action === 'cancel') newStatus = 'cancelled';
        else if (action === 'resume') newStatus = 'active';
        
        return { ...client, status: newStatus };
      }
      return client;
    }));
    
    showToast(`Client subscription ${action}d successfully`, 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-pink-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Client Subscriptions
        </h2>
        <p className="text-gray-300">Manage your clients' subscription plans and sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{client.name}</h3>
                <p className="text-gray-300">{client.plan} Plan</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBg(client.status)} text-white`}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Start Date:</span>
                <span className="text-white">{client.startDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">End Date:</span>
                <span className="text-white">{client.endDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price:</span>
                <span className="text-green-400 font-semibold">{client.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sessions:</span>
                <span className="text-blue-400">{client.sessionsRemaining}/{client.totalSessions}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(((client.totalSessions - client.sessionsRemaining) / client.totalSessions) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full"
                  style={{ width: `${((client.totalSessions - client.sessionsRemaining) / client.totalSessions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {client.status === 'active' ? (
                <>
                  <button
                    onClick={() => handleSubscriptionAction(client.id, 'pause')}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => handleSubscriptionAction(client.id, 'cancel')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : client.status === 'paused' ? (
                <>
                  <button
                    onClick={() => handleSubscriptionAction(client.id, 'resume')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => handleSubscriptionAction(client.id, 'cancel')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleSubscriptionAction(client.id, 'resume')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrainerAnnouncements = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
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
      title: 'Trainer Meeting',
      message: 'Monthly trainer meeting this Friday at 3 PM',
      priority: 'medium',
      date: '2024-01-18',
      target: 'trainers'
    },
    {
      id: 3,
      title: 'Holiday Schedule',
      message: 'Gym will be closed on Independence Day',
      priority: 'high',
      date: '2024-01-15',
      target: 'all'
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
        <h2 className="text-2xl font-bold text-pink-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
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
