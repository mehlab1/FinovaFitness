import { useState } from 'react';
import { User } from '../types';

interface TrainerLayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const TrainerLayout = ({ user, onLogout, children, currentPage, onPageChange }: TrainerLayoutProps) => {
  const navigationItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-pink-400' },
    { id: 'schedule', icon: 'fas fa-calendar', label: 'My Schedule', color: 'text-blue-400' },
    { id: 'client-requests', icon: 'fas fa-user-friends', label: 'Client Requests', color: 'text-green-400' },
    { id: 'notes', icon: 'fas fa-sticky-note', label: 'Session Notes', color: 'text-purple-400' },
    { id: 'analytics', icon: 'fas fa-chart-bar', label: 'Analytics', color: 'text-orange-400' },
    { id: 'announcements', icon: 'fas fa-bullhorn', label: 'Announcements', color: 'text-yellow-400' },
    { id: 'subscription', icon: 'fas fa-credit-card', label: 'Subscription', color: 'text-blue-400' }
  ];

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
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
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
          {children}
        </div>
      </div>
    </div>
  );
};
