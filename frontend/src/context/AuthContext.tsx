/* oxlint-disable react/only-export-components */
import React, { useState, useEffect } from 'react';
import type { User, Household } from '../types';
import { api } from '../api';
import { AuthContext, useAuth } from './authContextDef';

export type { AuthContextType } from './authContextDef';
export { useAuth };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [isGuestDemo, setIsGuestDemo] = useState<boolean>(() => {
    return localStorage.getItem('gharkagod_is_guest') === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem('gharkagod_token');
    localStorage.removeItem('gharkagod_is_guest');
    setUser(null);
    setHousehold(null);
    setIsGuestDemo(false);
  };

  const refreshHousehold = async () => {
    try {
      const households = await api.listHouseholds();
      if (households && households.length > 0) {
        setHousehold(households[0]);
      } else {
        setHousehold(null);
      }
    } catch {
      // Ignore on unauthenticated
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('gharkagod_token');
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
          await refreshHousehold();
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (token: string, loggedUser: User) => {
    localStorage.setItem('gharkagod_token', token);
    localStorage.removeItem('gharkagod_is_guest');
    setUser(loggedUser);
    setIsGuestDemo(false);
    await refreshHousehold();
  };

  const startGuestMode = async () => {
    setIsLoading(true);
    try {
      const res = await api.startGuestDemo();
      localStorage.setItem('gharkagod_token', res.access_token);
      localStorage.setItem('gharkagod_is_guest', 'true');
      setUser(res.user);
      setHousehold(res.household);
      setIsGuestDemo(true);
    } catch (err) {
      console.error('Failed to initialize guest demo session', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        household,
        isGuestDemo,
        isLoading,
        login,
        logout,
        setHousehold,
        startGuestMode,
        refreshHousehold,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
