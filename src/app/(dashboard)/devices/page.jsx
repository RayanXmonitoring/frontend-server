'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDevices, updateDeviceStatus } from '@/lib/firebase/firestore';
import { toast } from 'react-hot-toast';
import { Search, FilterList, Refresh, Devices as DevicesIcon } from '@mui/icons-material';

export default function DevicesPage() {
  const { user, role } = useAuth();
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      setFilteredDevices(deviceList);
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = devices;
    
    if (searchTerm) {
      result = result.filter(device => 
        device.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.deviceId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(device => device.status === statusFilter);
    }
    
    setFilteredDevices(result);
  }, [searchTerm, statusFilter, devices]);

  const handleStatusChange = async (deviceId, newStatus) => {
    const { success, error } = await updateDeviceStatus(deviceId, newStatus);
    if (success) {
      toast.success('Status perangkat berhasil diupdate');
      fetchDevices();
    } else {
      toast.error('Gagal update status: ' + error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      online: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      offline: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      lost: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    const labels = {
      online: '🟢 Online',
      offline: '🔴 Offline',
      lost: '🟡 Lost Mode'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Manajemen Perangkat
        </h1>
        <button
          onClick={fetchDevices}
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          <Refresh className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari perangkat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FilterList className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Semua Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="lost">Lost Mode</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {filteredDevices.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <DevicesIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tidak ada perangkat yang sesuai dengan filter' 
                  : 'Belum ada perangkat yang terhubung'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                          {device.deviceName || 'Perangkat Tanpa Nama'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          ID: {device.deviceId}
                        </p>
                      </div>
                      {getStatusBadge(device.status)}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <p>📱 {device.platform || 'Unknown'}</p>
                      <p>📅 Terdaftar: {device.registeredAt ? new Date(device.registeredAt).toLocaleDateString('id-ID') : '-'}</p>
                      <p>🕐 Terakhir: {device.lastSeen ? new Date(device.lastSeen).toLocaleString('id-ID') : '-'}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <select
                        value={device.status}
                        onChange={(e) => handleStatusChange(device.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="lost">Lost Mode</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
  }
