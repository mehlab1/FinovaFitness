import { useState, useEffect } from 'react';
import { User } from '../types';

export const usePortal = () => {
  const [currentPortal, setCurrentPortal] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for saved user data and token
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setCurrentPortal(user.role);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData: { user: User; token: string }) => {
    // Use the actual user data from the database
    const user = userData.user;
    
    // Set the portal based on user role
    const portal = user.role;
    
    setCurrentUser(user);
    setCurrentPortal(portal);
    setIsAuthenticated(true);

    // Save to localStorage
    localStorage.setItem('currentPortal', portal);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', userData.token);

    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPortal(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('currentPortal');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
