import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/toaster';
import { usePortal } from './hooks/usePortal';
import { useToast } from './components/Toast';
import { PortalSelection } from './components/PortalSelection';
import { SignInModal } from './components/SignInModal';
import { BookingModal } from './components/BookingModal';
import { AIChat } from './components/AIChat';
import { WebsitePortal } from './components/PublicPortal';
import { MemberPortal } from './components/MemberPortal';
import { TrainerPortal } from './components/TrainerPortal';
import { NutritionistPortal } from './components/NutritionistPortal';
import { AdminPortal } from './components/AdminPortal';
import { FrontDeskPortal } from './components/FrontDeskPortal';
import { Toast } from './components/Toast';
import { DeactivatedPortal } from './components/DeactivatedPortal';

function App() {
  const { currentPortal, currentUser, isAuthenticated, login, logout, switchPortal } = usePortal();
  const { toast, showToast, hideToast } = useToast();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleSignIn = (userData: { user: any; token: string }) => {
    // Use the login function from usePortal hook
    login(userData);
    
    // Show success message
    showToast(`Welcome back, ${userData.user.first_name}!`, 'success');
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
    // Debug logging
    console.log('renderPortal called with:', { currentPortal, currentUser });
    if (currentUser) {
      console.log('Current user details:', {
        id: currentUser.id,
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        role: currentUser.role,
        is_active: currentUser.is_active
      });
    }

    // If no portal is selected, default to website portal
    if (!currentPortal) {
      return (
        <WebsitePortal 
          onSignIn={() => setShowSignInModal(true)} 
          onBookClass={() => setShowBookingModal(true)}
        />
      );
    }

    // Check if user is deactivated
    if (currentUser && !currentUser.is_active) {
      console.log('User is deactivated, showing DeactivatedPortal');
      return (
        <DeactivatedPortal 
          userName={`${currentUser.first_name} ${currentUser.last_name}`}
          userRole={currentUser.role}
        />
      );
    }

    switch (currentPortal) {
      case 'website':
        return (
          <WebsitePortal 
            onSignIn={() => setShowSignInModal(true)} 
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
      case 'front_desk':
        return <FrontDeskPortal user={currentUser} onLogout={handleLogout} />;
      default:
        return (
          <WebsitePortal 
            onLogin={() => handlePortalSelect('member')} 
            onBookClass={() => setShowBookingModal(true)}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
          {renderPortal()}
          
          {/* Modals */}
          <SignInModal
            isOpen={showSignInModal}
            onClose={() => setShowSignInModal(false)}
            onSignIn={handleSignIn}
          />
          
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onSuccess={handleBookingSuccess}
          />
          
          {/* AI Chat */}
          <AIChat portal={currentPortal || 'website'} />
          
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
