import { createContext, useContext } from 'react';
import type { User, Household } from '../types';

export interface AuthContextType {
  user: User | null;
  household: Household | null;
  isGuestDemo: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
  setHousehold: (h: Household | null) => void;
  startGuestMode: () => Promise<void>;
  refreshHousehold: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
