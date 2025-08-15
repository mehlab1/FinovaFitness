import { useState, useEffect } from 'react';

interface TrainerAnnouncementsProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const TrainerAnnouncements = ({ showToast }: TrainerAnnouncementsProps) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          TRAINER ANNOUNCEMENTS
        </h1>
        <p className="text-gray-300">View gym announcements and important updates.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Announcements Overview</h3>
        <p className="text-gray-300">Announcements functionality coming soon...</p>
      </div>
    </div>
  );
};
