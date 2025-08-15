import { useState, useEffect } from 'react';
import { User } from '../types';
import { useToast } from './Toast';
import { trainerApi } from '../services/api/trainerApi';
import { TrainerProfile } from './trainer/TrainerProfile';
import { TrainerDashboard } from './trainer/TrainerDashboard';
import { TrainerSchedule } from './trainer/TrainerSchedule';
import { SessionNotes } from './trainer/SessionNotes';
import { TrainerAnalytics } from './trainer/TrainerAnalytics';
import { TrainerAnnouncements } from './trainer/TrainerAnnouncements';
import { TrainerSubscription } from './trainer/TrainerSubscription';

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
      case 'profile':
        return <TrainerProfile user={user} showToast={showToast} />;
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
            { id: 'profile', icon: 'fas fa-user-edit', label: 'Edit Profile', color: 'text-cyan-400' },
            { id: 'schedule', icon: 'fas fa-calendar', label: 'My Schedule', color: 'text-blue-400' },
            { id: 'client-requests', icon: 'fas fa-user-friends', label: 'Client Requests', color: 'text-green-400' },
            { id: 'notes', icon: 'fas fa-sticky-note', label: 'Session Details', color: 'text-purple-400' },
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

// ClientRequests component (keeping this one as it's not in a separate file yet)
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
      // Map frontend action to backend action
      const backendAction = action === 'approve' ? 'accept' : 'reject';
      
      await trainerApi.updateRequest(id, backendAction);
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: action === 'approve' ? 'confirmed' : 'rejected' } : req
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          CLIENT REQUESTS
        </h1>
        <p className="text-gray-300">Manage client booking requests and approvals.</p>
      </div>

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
                    <h4 className="font-bold text-white">{request.requester_name || 'Unknown Client'}</h4>
                    <p className="text-gray-300">
                      {request.request_type ? request.request_type.replace('_', ' ') : 'Training Session'} • {request.preferred_date || 'TBD'} at {request.preferred_time || 'TBD'}
                    </p>
                    <div className="text-sm text-gray-400 mt-2 space-y-1">
                      {request.end_time && (
                        <p>Duration: {request.preferred_time} - {request.end_time}</p>
                      )}
                      {request.price && (
                        <p>Session Price: ${request.price}</p>
                      )}
                      {request.requester_phone && (
                        <p>Phone: {request.requester_phone}</p>
                      )}
                    </div>
                    {request.message && (
                      <p className="text-sm text-gray-400 mt-2">"{request.message}"</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {request.is_member ? 'Member' : 'Non-member'} • {request.requester_email || 'No email'}
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
