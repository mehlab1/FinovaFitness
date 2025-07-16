import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { usePortal } from './hooks/usePortal';
import { useToast } from './components/Toast';
import { PortalSelection } from './components/PortalSelection';
import { LoginModal } from './components/LoginModal';
import { BookingModal } from './components/BookingModal';
import { AIChat } from './components/AIChat';
import { PublicPortal } from './components/PublicPortal';
import { MemberPortal } from './components/MemberPortal';
import { TrainerPortal } from './components/TrainerPortal';
import { NutritionistPortal } from './components/NutritionistPortal';
import { AdminPortal } from './components/AdminPortal';
import { FrontDeskPortal } from './components/FrontDeskPortal';
import { Toast } from './components/Toast';

function App() {
  const { currentPortal, currentUser, isAuthenticated, login, logout, switchPortal } = usePortal();
  const { toast, showToast, hideToast } = useToast();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<string>('');

  const handlePortalSelect = (portalId: string) => {
    if (portalId === 'public') {
      switchPortal('public');
    } else {
      setSelectedPortal(portalId);
      setShowLoginModal(true);
    }
  };

  const handleLogin = (portal: string, credentials: { username: string; password: string }) => {
    const success = login(portal, credentials);
    if (success) {
      showToast('Login successful!', 'success');
      setShowLoginModal(false);
    } else {
      showToast('Login failed. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
  };

  const handleBookingSuccess = (message: string) => {
    showToast(message, 'success');
    setShowBookingModal(false);
  };

  const renderPortal = () => {
    if (!currentPortal) {
      return <PortalSelection onSelectPortal={handlePortalSelect} />;
    }

    switch (currentPortal) {
      case 'public':
        return (
          <PublicPortal 
            onLogin={() => handlePortalSelect('member')} 
            onBookClass={() => setShowBookingModal(true)}
          />
        );
      case 'member':
        return <MemberPortal user={currentUser} onLogout={handleLogout} />;
      case 'trainer':
        return <TrainerPortal user={currentUser} onLogout={handleLogout} />;
      case 'nutritionist':
        return <NutritionistPortal user={currentUser} onLogout={handleLogout} />;
      case 'admin':
        return <AdminPortal user={currentUser} onLogout={handleLogout} />;
      case 'frontdesk':
        return <FrontDeskPortal user={currentUser} onLogout={handleLogout} />;
      default:
        return <PortalSelection onSelectPortal={handlePortalSelect} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
          {renderPortal()}
          
          {/* Modals */}
          <LoginModal
            isOpen={showLoginModal}
            portalId={selectedPortal}
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
          />
          
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onSuccess={handleBookingSuccess}
          />
          
          {/* AI Chat */}
          <AIChat portal={currentPortal || 'public'} />
          
          {/* Toast Notifications */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={hideToast}
            />
          )}
        </div>
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
