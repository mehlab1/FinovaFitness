import { useState, useEffect } from 'react';
import { User } from '../types';

export const usePortal = () => {
  const [currentPortal, setCurrentPortal] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for saved portal and user data
    const savedPortal = localStorage.getItem('currentPortal');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedPortal && savedUser) {
      setCurrentPortal(savedPortal);
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (portal: string, credentials: { username: string; password: string }) => {
    // Mock login - in real app, this would make an API call
    const mockUser: User = {
      id: '1',
      name: credentials.username || 'John Doe',
      email: 'john@example.com',
      role: portal as any,
      membershipPlan: portal === 'member' ? 'Quarterly' : undefined,
      loyaltyPoints: portal === 'member' ? 1247 : undefined,
      consistencyStreak: portal === 'member' ? 90 : undefined,
      referralCount: portal === 'member' ? 5 : undefined
    };

    setCurrentUser(mockUser);
    setCurrentPortal(portal);
    setIsAuthenticated(true);

    // Save to localStorage
    localStorage.setItem('currentPortal', portal);
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPortal(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('currentPortal');
    localStorage.removeItem('currentUser');
  };

  const switchPortal = (portal: string) => {
    setCurrentPortal(portal);
    localStorage.setItem('currentPortal', portal);
  };

  return {
    currentPortal,
    currentUser,
    isAuthenticated,
    login,
    logout,
    switchPortal
  };
};
