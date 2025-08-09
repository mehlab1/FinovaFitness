import { useState, useEffect } from 'react';
import { User } from '../../types';
import { trainerApi } from '../../services/api';

interface TrainerDashboardProps {
  user: User | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const TrainerDashboard = ({ user, showToast }: TrainerDashboardProps) => {
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
