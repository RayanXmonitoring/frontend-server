'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, getUserRole } from '@/lib/firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      setLoading(true);
      if (authUser) {
        setUser(authUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setRole(data.role || 'user');
            
            // Check if user is suspended
            if (data.isSuspended) {
              await signOut(auth);
              setUser(null);
              setUserData(null);
              setRole(null);
              router.push('/login?error=Akun Anda telah ditangguhkan');
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUserData(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const value = {
    user,
    userData,
    role,
    loading,
    isAuthenticated: !!user,
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
