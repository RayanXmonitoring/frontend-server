'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

// Custom hook untuk autentikasi dengan NextAuth
export const useAuth = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    setLoading(false);

    if (status === 'authenticated' && session?.user) {
      setUser(session.user);
      setUserData(session.user.userData);
      setRole(session.user.role || 'user');
    } else {
      setUser(null);
      setUserData(null);
      setRole(null);
    }
  }, [session, status]);

  // Login function
  const login = async (email, password, redirectTo = '/dashboard') => {
    try {
      setLoading(true);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Login gagal: ' + result.error);
        return { success: false, error: result.error };
      }

      if (result?.ok) {
        toast.success('Login berhasil!');
        router.push(redirectTo);
        router.refresh();
        return { success: true, error: null };
      }

      return { success: false, error: 'Login gagal' };
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (redirectTo = '/login') => {
    try {
      setLoading(true);
      await signOut({ redirect: false });
      setUser(null);
      setUserData(null);
      setRole(null);
      toast.success('Logout berhasil');
      router.push(redirectTo);
      router.refresh();
      return { success: true, error: null };
    } catch (error) {
      toast.error('Gagal logout: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    if (!role) return false;
    if (role === 'admin') return true; // Admin has all access
    return role === requiredRole;
  };

  // Check if user has any of the roles
  const hasAnyRole = (requiredRoles) => {
    if (!role) return false;
    if (role === 'admin') return true;
    return requiredRoles.includes(role);
  };

  return {
    // States
    user,
    userData,
    role,
    loading,
    isAuthenticated: status === 'authenticated' && !userData?.isSuspended,
    isAdmin: role === 'admin',
    isReseller: role === 'reseller',
    isUser: role === 'user',
    isSuspended: userData?.isSuspended || false,
    status,

    // Methods
    login,
    logout,
    hasRole,
    hasAnyRole,
  };
};

// Hook untuk mendapatkan session saja
export const useAuthSession = () => {
  const { data: session, status } = useSession();
  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    role: session?.user?.role,
  };
};

// Hook untuk proteksi route
export const useRequireAuth = (redirectTo = '/login') => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  return { isAuthenticated, loading };
};

// Hook untuk proteksi role
export const useRequireRole = (requiredRole, redirectTo = '/dashboard') => {
  const { role, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (role !== requiredRole && role !== 'admin') {
        toast.error('Akses ditolak. Anda tidak memiliki izin.');
        router.push(redirectTo);
      }
    }
  }, [role, isAuthenticated, loading, router, requiredRole, redirectTo]);

  return { role, isAuthenticated, loading };
};

// Hook untuk proteksi multiple roles
export const useRequireAnyRole = (requiredRoles, redirectTo = '/dashboard') => {
  const { role, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (role !== 'admin' && !requiredRoles.includes(role)) {
        toast.error('Akses ditolak. Anda tidak memiliki izin.');
        router.push(redirectTo);
      }
    }
  }, [role, isAuthenticated, loading, router, requiredRoles, redirectTo]);

  return { role, isAuthenticated, loading };
};
