'use client';

import { useState, useEffect } from 'react';
import { getDevices, listenDevices } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

export const useDevices = () => {
  const { user, role } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setDevices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userId = role === 'admin' ? null : user.uid;

    // Real-time listener
    const unsubscribe = listenDevices(userId, (deviceList) => {
      setDevices(deviceList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, role]);

  return { devices, loading, error };
};
