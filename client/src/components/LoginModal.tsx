import { useState } from 'react';
import { portals } from '../data/mockData';

interface LoginModalProps {
  isOpen: boolean;
  portalId: string;
  onClose: () => void;
  onLogin: (portal: string, credentials: { username: string; password: string }) => void;
}

export const LoginModal = ({ isOpen, portalId, onClose, onLogin }: LoginModalProps) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const portal = portals.find(p => p.id === portalId);
  if (!portal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onLogin(portalId, credentials);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass-card p-8 rounded-2xl max-w-md w-full mx-4 animate-bounce-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-1">
            <i className={`${portal.icon} text-4xl mb-4 neon-glow ${portal.color}`}></i>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
              {portal.name} Login
            </h2>
            <p className="text-gray-300">Enter your credentials to continue</p>
          </div>
          <button 
            onClick={onClose} 
            className="close-button text-gray-300 hover:text-white p-2 rounded-lg ml-4"
            title="Close"
          >
            <span className="text-xl font-bold leading-none" aria-hidden="true">×</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email or Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
              placeholder="Enter your email or username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold hover-glow transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
