'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, TeacherProfile, Classroom, UserRole } from '@walikelas/types';
import { apiClient } from './api';
import {
  fetchCurrentUser,
  logout as apiLogout,
  devLogin as apiDevLogin,
} from '@walikelas/api-client';

interface AuthContextType {
  user: User | null;
  profile: TeacherProfile | null;
  classrooms: Classroom[];
  activeClassroom: Classroom | null;
  setActiveClassroom: (classroom: Classroom | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => void;
  devLogin: (role?: UserRole, email?: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeClassroom, setActiveClassroomState] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setActiveClassroom = useCallback((classroom: Classroom | null) => {
    setActiveClassroomState(classroom);
    if (typeof window !== 'undefined') {
      if (classroom) {
        localStorage.setItem('wk_active_classroom_id', classroom.id);
      } else {
        localStorage.removeItem('wk_active_classroom_id');
      }
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const data = await fetchCurrentUser(apiClient);
      setUser(data.user);
      setProfile(data.profile);
      setClassrooms(data.classrooms || []);

      if (data.classrooms && data.classrooms.length > 0) {
        const savedId =
          typeof window !== 'undefined' ? localStorage.getItem('wk_active_classroom_id') : null;
        const matching = data.classrooms.find((c) => c.id === savedId) || data.classrooms[0];
        setActiveClassroomState(matching || null);
      } else {
        setActiveClassroomState(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
      setClassrooms([]);
      setActiveClassroomState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const loginWithGoogle = useCallback(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4006/api/v1';
    window.location.href = `${apiBase}/auth/google`;
  }, []);

  const devLogin = useCallback(
    async (role?: UserRole, email?: string, name?: string) => {
      setIsLoading(true);
      try {
        const data = await apiDevLogin(apiClient, { role, email, name });
        setUser(data.user);
        setProfile(data.profile);
        setClassrooms(data.classrooms || []);
        if (data.classrooms && data.classrooms.length > 0) {
          setActiveClassroom(data.classrooms[0] || null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [setActiveClassroom],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiLogout(apiClient);
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setProfile(null);
      setClassrooms([]);
      setActiveClassroom(null);
      setIsLoading(false);
      window.location.href = '/';
    }
  }, [setActiveClassroom]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        classrooms,
        activeClassroom,
        setActiveClassroom,
        isLoading,
        isAuthenticated: !!user,
        loginWithGoogle,
        devLogin,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
