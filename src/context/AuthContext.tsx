import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default quick-switch demo identities
const DEMO_ACCOUNTS: Record<UserRole, { email: string; name: string; department: string }> = {
  citizen: {
    email: 'citizen@civicsignal.org',
    name: 'Sarah Jenkins',
    department: 'Resident - Ward 4',
  },
  staff: {
    email: 'staff@civicsignal.org',
    name: 'Marcus Vance',
    department: 'Public Works & Infrastructure',
  },
  admin: {
    email: 'admin@civicsignal.org',
    name: 'Elena Rostova',
    department: 'City Operations Director',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const clearNotification = () => setNotification(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem('civicsignal_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          // Sync with server in background
          api.getMe().then((res) => {
            if (res.user) {
              setUser(res.user);
              localStorage.setItem('civicsignal_user', JSON.stringify(res.user));
            }
          }).catch(() => {});
        } else {
          // Default to citizen demo account for instant out-of-the-box exploration
          const demoUser: User = {
            id: 'user-citizen-1',
            email: DEMO_ACCOUNTS.citizen.email,
            name: DEMO_ACCOUNTS.citizen.name,
            role: 'citizen',
            department: DEMO_ACCOUNTS.citizen.department,
            createdAt: new Date().toISOString(),
          };
          setUser(demoUser);
          localStorage.setItem('civicsignal_user', JSON.stringify(demoUser));
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string) => {
    const res = await api.login(email);
    setUser(res.user);
    localStorage.setItem('civicsignal_user', JSON.stringify(res.user));
    showNotification(`Signed in as ${res.user.name} (${res.user.role.toUpperCase()})`, 'success');
  };

  const register = async (email: string, name: string) => {
    const res = await api.register(email, name, 'citizen');
    setUser(res.user);
    localStorage.setItem('civicsignal_user', JSON.stringify(res.user));
    showNotification(`Account created! Welcome to CivicSignal, ${res.user.name}.`, 'success');
  };

  const updateProfile = async (updates: Partial<User>) => {
    const res = await api.updateProfile(updates);
    setUser(res.user);
    localStorage.setItem('civicsignal_user', JSON.stringify(res.user));
    showNotification('Profile updated successfully!', 'success');
    return res.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civicsignal_user');
    showNotification('You have been logged out.', 'info');
  };

  const switchRole = async (targetRole: UserRole) => {
    const target = DEMO_ACCOUNTS[targetRole];
    try {
      const { users } = await api.getUsers();
      const matched = users.find((u) => u.role === targetRole);
      const switchedUser: User = matched || {
        id: `user-${targetRole}-1`,
        email: target.email,
        name: target.name,
        role: targetRole,
        department: target.department,
        createdAt: new Date().toISOString(),
      };
      setUser(switchedUser);
      localStorage.setItem('civicsignal_user', JSON.stringify(switchedUser));
      showNotification(`Switched role to ${targetRole.toUpperCase()}: ${switchedUser.name}`, 'info');
    } catch (e) {
      const fallback: User = {
        id: `user-${targetRole}-1`,
        email: target.email,
        name: target.name,
        role: targetRole,
        department: target.department,
        createdAt: new Date().toISOString(),
      };
      setUser(fallback);
      localStorage.setItem('civicsignal_user', JSON.stringify(fallback));
      showNotification(`Switched role to ${targetRole.toUpperCase()}`, 'info');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        logout,
        switchRole,
        notification,
        showNotification,
        clearNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
