import { useState } from 'react';
import { User } from '../types';
import { useToast } from './Toast';
import { TrainerLayout } from '../layouts/TrainerLayout';
import { TrainerDashboard } from './trainer/TrainerDashboard';
import { ClientRequests } from './trainer/ClientRequests';

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
      case 'client-requests':
        return <ClientRequests showToast={showToast} />;
      case 'schedule':
        return <TrainerSchedule showToast={showToast} />;
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
    <TrainerLayout
      user={user}
      onLogout={onLogout}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderPage()}
    </TrainerLayout>
  );
};

// Placeholder components for other pages (these would be broken down further)
const TrainerSchedule = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
  <div className="animate-fade-in">
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-blue-400 mb-4">My Schedule</h3>
      <p className="text-gray-300">Schedule management coming soon...</p>
    </div>
  </div>
);

const SessionNotes = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
  <div className="animate-fade-in">
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-purple-400 mb-4">Session Notes</h3>
      <p className="text-gray-300">Session notes management coming soon...</p>
    </div>
  </div>
);

const TrainerAnalytics = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
  <div className="animate-fade-in">
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-orange-400 mb-4">Analytics</h3>
      <p className="text-gray-300">Analytics dashboard coming soon...</p>
    </div>
  </div>
);

const TrainerAnnouncements = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
  <div className="animate-fade-in">
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-yellow-400 mb-4">Announcements</h3>
      <p className="text-gray-300">Announcements coming soon...</p>
    </div>
  </div>
);

const TrainerSubscription = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
  <div className="animate-fade-in">
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-blue-400 mb-4">Subscription</h3>
      <p className="text-gray-300">Subscription management coming soon...</p>
    </div>
  </div>
);
