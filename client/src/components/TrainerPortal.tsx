import { useState } from 'react';
import { User } from '../types';
import { useToast } from './Toast';

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

const TrainerDashboard = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
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
          <h3 className="text-lg font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Today's Sessions</h3>
          <i className="fas fa-calendar-day text-pink-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">8</p>
        <p className="text-gray-300">3 remaining</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-green-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Active Clients</h3>
          <i className="fas fa-users text-green-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">24</p>
        <p className="text-gray-300">3 new this week</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-blue-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>This Week</h3>
          <i className="fas fa-chart-line text-blue-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">32</p>
        <p className="text-gray-300">Sessions completed</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-orange-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-400" style={{ fontFamily: 'Orbitron, monospace' }}>Rating</h3>
          <i className="fas fa-star text-orange-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">4.8</p>
        <p className="text-gray-300">Average rating</p>
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
        {[
          { time: '9:00 AM', client: 'John Smith', type: 'Strength Training', duration: '60 min' },
          { time: '10:30 AM', client: 'Sarah Davis', type: 'HIIT', duration: '45 min' },
          { time: '2:00 PM', client: 'Mike Johnson', type: 'Cardio', duration: '60 min' }
        ].map((session, index) => (
          <div key={index} className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">{session.time} - {session.client}</h4>
              <p className="text-gray-300">{session.type} • {session.duration}</p>
            </div>
            <button 
              onClick={() => showToast(`Session with ${session.client} confirmed`, 'success')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Start Session
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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
  const [requests, setRequests] = useState([
    { id: 1, client: 'John Smith', type: 'Personal Training', date: '2024-01-20', time: '10:00 AM', status: 'pending' },
    { id: 2, client: 'Sarah Davis', type: 'HIIT Session', date: '2024-01-21', time: '2:00 PM', status: 'pending' },
    { id: 3, client: 'Mike Johnson', type: 'Strength Training', date: '2024-01-22', time: '9:00 AM', status: 'pending' }
  ]);

  const handleRequest = (id: number, action: 'approve' | 'reject') => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
    ));
    showToast(`Request ${action === 'approve' ? 'approved' : 'rejected'}`, 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Client Booking Requests</h3>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">{request.client}</h4>
                  <p className="text-gray-300">{request.type} • {request.date} at {request.time}</p>
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
            </div>
          ))}
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
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-pink-400 mb-4">This Week vs Last Week Sessions</h3>
      <div className="bg-gray-900 p-8 rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-chart-bar text-6xl text-pink-400 mb-4"></i>
            <h4 className="text-xl font-bold mb-2">Analytics Dashboard</h4>
            <p className="text-gray-300">Session analytics and performance metrics</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>This Week:</span>
                <span className="text-green-400">32 sessions</span>
              </div>
              <div className="flex justify-between">
                <span>Last Week:</span>
                <span className="text-blue-400">28 sessions</span>
              </div>
              <div className="flex justify-between">
                <span>Growth:</span>
                <span className="text-pink-400">+14.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TrainerSubscription = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [autoRenew, setAutoRenew] = useState(true);

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-8 rounded-2xl max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Trainer Subscription
        </h2>
        
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-green-400 mb-4">Current Plan</h3>
            <div className="space-y-2">
              <p><strong>Plan:</strong> Professional Trainer</p>
              <p><strong>Start Date:</strong> January 1, 2024</p>
              <p><strong>End Date:</strong> December 31, 2024</p>
              <p><strong>Monthly Fee:</strong> $99</p>
              <p><strong>Status:</strong> <span className="text-green-400">Active</span></p>
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
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>
            
            <div className="flex space-x-4">
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
    </div>
  );
};
