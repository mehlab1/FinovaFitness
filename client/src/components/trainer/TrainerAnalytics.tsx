import { useState, useEffect } from 'react';
import { trainerApi } from '../../services/api/trainerApi';

interface TrainerAnalyticsProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const TrainerAnalytics = ({ showToast }: TrainerAnalyticsProps) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const data = await trainerApi.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      showToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          TRAINER ANALYTICS
        </h1>
        <p className="text-gray-300">View detailed analytics and performance metrics.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Analytics Overview</h3>
        <p className="text-gray-300">Analytics functionality coming soon...</p>
      </div>
    </div>
  );
};
