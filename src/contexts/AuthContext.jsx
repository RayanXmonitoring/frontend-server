'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    setLoading(false);

    if (session?.user) {
      setUser(session.user);
      setUserData(session.user.userData);
      setRole(session.user.role || 'user');

      // Check if user is suspended
      if (session.user.userData?.isSuspended) {
        signOut({ redirect: false });
        setUser(null);
        setUserData(null);
        setRole(null);
        router.push('/login?error=Akun Anda telah ditangguhkan');
      }
    } else {
      setUser(null);
      setUserData(null);
      setRole(null);
    }
  }, [session, status, router]);

  const value = {
    user,
    userData,
    role,
    loading,
    isAuthenticated: !!user && !userData?.isSuspended,
    isAdmin: role === 'admin',
    isReseller: role === 'reseller',
    isUser: role === 'user',
  };

  return (
    <AuthContext.Provider value={value}>
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
