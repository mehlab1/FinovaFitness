import { useState, useEffect } from 'react';
import { trainerApi } from '../../services/api/trainerApi';

interface TrainerScheduleProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const TrainerSchedule = ({ showToast }: TrainerScheduleProps) => {
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      const data = await trainerApi.getSchedule();
      setScheduleData(data);
    } catch (error) {
      console.error('Failed to fetch schedule data:', error);
      showToast('Failed to load schedule data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          TRAINER SCHEDULE
        </h1>
        <p className="text-gray-300">View and manage your training schedule and availability.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Schedule Overview</h3>
        <p className="text-gray-300">Schedule management functionality coming soon...</p>
      </div>
    </div>
  );
};
