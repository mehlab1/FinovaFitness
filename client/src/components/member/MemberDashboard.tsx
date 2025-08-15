import { useState, useEffect } from 'react';
import { User } from '../../types';
import { memberApi } from '../../services/api';

interface MemberDashboardProps {
  user: User | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const MemberDashboard = ({ user, showToast }: MemberDashboardProps) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await memberApi.getDashboard();
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

  const profile = dashboardData?.profile || {};
  const upcomingBookings = dashboardData?.upcomingBookings || [];
  const recentVisits = dashboardData?.recentVisits || [];
  const loyaltyStats = dashboardData?.loyaltyStats || {};

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          MEMBER DASHBOARD
        </h1>
        <p className="text-gray-300">Welcome back, {user?.name}! Ready for your fitness journey?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="metric-card p-6 rounded-xl border-pink-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Loyalty Points</h3>
            <i className="fas fa-gem text-pink-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">{profile.loyalty_points || 0}</p>
          <p className="text-gray-300">{loyaltyStats.total_transactions || 0} transactions</p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-orange-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-orange-400" style={{ fontFamily: 'Orbitron, monospace' }}>Streak</h3>
            <i className="fas fa-fire text-orange-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">{profile.streak_days || 0}</p>
          <p className="text-gray-300">day streak</p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-green-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Bookings</h3>
            <i className="fas fa-calendar-check text-green-400 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-white">{upcomingBookings.length}</p>
          <p className="text-gray-300">upcoming</p>
        </div>
        
        <div className="metric-card p-6 rounded-xl border-blue-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Last Visit</h3>
            <i className="fas fa-clock text-blue-400 text-2xl"></i>
          </div>
          <p className="text-sm font-bold text-white">
            {profile.last_gym_visit 
              ? new Date(profile.last_gym_visit).toLocaleDateString()
              : 'No visits yet'
            }
          </p>
          <p className="text-gray-300">gym visit</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { icon: 'fas fa-calendar-plus', title: 'BOOK CLASS', description: 'Reserve your spot', color: 'border-pink-400' },
          { icon: 'fas fa-user-ninja', title: 'FIND TRAINER', description: 'Get personal training', color: 'border-blue-400' },
          { icon: 'fas fa-dumbbell', title: 'VIEW SCHEDULE', description: 'See workout plan', color: 'border-green-400' }
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
        <h3 className="text-xl font-bold text-pink-400 mb-4">Upcoming Bookings</h3>
        <div className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No upcoming bookings</p>
          ) : (
            upcomingBookings.slice(0, 3).map((booking: any, index: number) => (
              <div key={index} className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">
                    {booking.type === 'training' ? 'Training Session' : (booking.type_display || 'Booking')}
                  </h4>
                  <p className="text-gray-300">
                    {booking.type === 'training' ? 'Training Session' : (booking.type_display || 'Booking')} • {new Date(booking.session_date).toLocaleDateString()} at {booking.start_time}
                  </p>
                  {booking.trainer_first_name && (
                    <p className="text-sm text-gray-400">
                      with {booking.trainer_first_name} {booking.trainer_last_name}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'confirmed' ? 'bg-green-600 text-white' : 
                      booking.status === 'pending' ? 'bg-yellow-600 text-white' : 
                      booking.status === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    {booking.type === 'training' && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-pink-600 text-white">
                        Training
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
