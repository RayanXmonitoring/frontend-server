'use client';

import { useState, useEffect } from 'react';
import { getDevices, listenDevices, updateDeviceStatus, deleteDevice } from '@/lib/firebase/firestore';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useDevices = () => {
  const { user, role, isAuthenticated } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    lost: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setDevices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userId = role === 'admin' ? null : user.uid;

    // Real-time listener
    const unsubscribe = listenDevices(userId, (deviceList) => {
      setDevices(deviceList);
      calculateStats(deviceList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, role, isAuthenticated]);

  const calculateStats = (deviceList) => {
    const total = deviceList.length;
    const online = deviceList.filter((d) => d.status === 'online').length;
    const offline = deviceList.filter((d) => d.status === 'offline').length;
    const lost = deviceList.filter((d) => d.status === 'lost').length;
    setStats({ total, online, offline, lost });
  };

  const refreshDevices = async () => {
    setLoading(true);
    try {
      const userId = role === 'admin' ? null : user?.uid;
      const { devices: deviceList, error: fetchError } = await getDevices(userId);
      
      if (fetchError) {
        toast.error('Gagal refresh data: ' + fetchError);
        setError(fetchError);
        return;
      }

      setDevices(deviceList);
      calculateStats(deviceList);
      setError(null);
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (deviceId, newStatus) => {
    try {
      const { success, error } = await updateDeviceStatus(deviceId, newStatus);
      if (success) {
        toast.success('Status perangkat berhasil diupdate');
        await refreshDevices();
        return { success: true, error: null };
      } else {
        toast.error('Gagal update status: ' + error);
        return { success: false, error };
      }
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
      return { success: false, error: error.message };
    }
  };

  const removeDevice = async (deviceId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus perangkat ini?')) {
      return { success: false, error: 'Dibatalkan oleh user' };
    }

    try {
      const { success, error } = await deleteDevice(deviceId);
      if (success) {
        toast.success('Perangkat berhasil dihapus');
        await refreshDevices();
        return { success: true, error: null };
      } else {
        toast.error('Gagal hapus perangkat: ' + error);
        return { success: false, error };
      }
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
      return { success: false, error: error.message };
    }
  };

  const getDeviceById = (deviceId) => {
    return devices.find(d => d.id === deviceId || d.deviceId === deviceId);
  };

  const getDevicesByStatus = (status) => {
    return devices.filter(d => d.status === status);
  };

  const getOnlineDevices = () => getDevicesByStatus('online');
  const getOfflineDevices = () => getDevicesByStatus('offline');
  const getLostDevices = () => getDevicesByStatus('lost');

  return {
    devices,
    stats,
    loading,
    error,
    refreshDevices,
    updateStatus,
    removeDevice,
    getDeviceById,
    getDevicesByStatus,
    getOnlineDevices,
    getOfflineDevices,
    getLostDevices,
  };
};
