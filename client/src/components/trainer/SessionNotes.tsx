import { useState, useEffect } from 'react';
import { trainerApi } from '../../services/api/trainerApi';

interface SessionNotesProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SessionNotes = ({ showToast }: SessionNotesProps) => {
  const [notesData, setNotesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotesData();
  }, []);

  const fetchNotesData = async () => {
    try {
      const data = await trainerApi.getSessionNotes();
      setNotesData(data);
    } catch (error) {
      console.error('Failed to fetch session notes:', error);
      showToast('Failed to load session notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading session notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          SESSION NOTES
        </h1>
        <p className="text-gray-300">Manage and review client session notes and progress.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Session Notes Overview</h3>
        <p className="text-gray-300">Session notes functionality coming soon...</p>
      </div>
    </div>
  );
};
