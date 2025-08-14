import React from 'react';

interface DeactivatedPortalProps {
  userName: string;
  userRole: string;
}

export const DeactivatedPortal: React.FC<DeactivatedPortalProps> = ({ userName, userRole }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center animate-fade-in">
        {/* Lock Icon */}
        <div className="mb-6">
          <i className="fas fa-lock text-6xl text-red-500 mb-4"></i>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-red-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Account Deactivated
        </h1>
        
        {/* Message */}
        <div className="space-y-4 mb-6">
          <p className="text-gray-300 text-lg">
            Hello <span className="text-orange-400 font-semibold">{userName}</span>,
          </p>
          <p className="text-gray-300">
            Your {userRole.replace('_', ' ')} portal access has been temporarily suspended.
          </p>
          <p className="text-gray-300">
            Please contact the administrator to reactivate your account.
          </p>
        </div>
        
        {/* Contact Info */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-orange-400 font-semibold mb-2">Contact Administrator</h3>
          <p className="text-gray-300 text-sm">
            Email: admin@finovafitness.com<br />
            Phone: (555) 123-4567<br />
            Office Hours: Mon-Fri 9:00 AM - 6:00 PM
          </p>
        </div>
        
        {/* Additional Info */}
        <div className="text-gray-400 text-sm">
          <p>
            If you believe this is an error, please contact support immediately.
          </p>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={() => {
            // Clear any stored tokens/session
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to main page
            window.location.href = '/';
          }}
          className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Return to Main Page
        </button>
      </div>
    </div>
  );
};
