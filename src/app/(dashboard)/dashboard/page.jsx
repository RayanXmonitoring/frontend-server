'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDevices } from '@/lib/firebase/firestore';
import DeviceStats from '@/components/dashboard/DeviceStats';
import DeviceList from '@/components/dashboard/DeviceList';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { user, role, userData } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    lost: 0,
  });

  useEffect(() => {
    fetchDevices();
  }, [user]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const userId = role === 'admin' ? null : user.uid;
      const { devices: deviceList, error } = await getDevices(userId);
      
      if (error) {
        toast.error('Gagal mengambil data perangkat: ' + error);
        return;
      }

      setDevices(deviceList);
      calculateStats(deviceList);
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (deviceList) => {
    const total = deviceList.length;
    const online = deviceList.filter((d) => d.status === 'online').length;
    const offline = deviceList.filter((d) => d.status === 'offline').length;
    const lost = deviceList.filter((d) => d.status === 'lost').length;
    setStats({ total, online, offline, lost });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {userData?.displayName || 'User'}!
        </div>
      </div>

      <DeviceStats stats={stats} />

      <div className="dashboard-card">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Daftar Perangkat
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <DeviceList devices={devices} />
        )}
      </div>
    </div>
  );
}
