'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDevices } from '@/lib/firebase/firestore';
import socketClient from '@/lib/socket/client';
import { toast } from 'react-hot-toast';
import { PlayArrow, Pause, ScreenShare, Refresh, Devices } from '@mui/icons-material';

export default function MonitoringPage() {
  const { user, role } = useAuth();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [screenData, setScreenData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchDevices();
    initializeSocket();
    
    return () => {
      if (socketClient.socket) {
        socketClient.disconnect();
      }
    };
  }, [user]);

  const initializeSocket = () => {
    socketClient.connect(user?.uid);
    
    socketClient.on('connect', () => {
      setIsConnected(true);
      toast.success('Terhubung ke server monitoring');
    });

    socketClient.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Terputus dari server monitoring');
    });

    socketClient.on('screen-stream', (data) => {
      setScreenData(data);
      if (videoRef.current && data.image) {
        videoRef.current.src = `data:image/jpeg;base64,${data.image}`;
      }
    });

    socketClient.on('device-status', (data) => {
      setDevices(prev => 
        prev.map(d => d.deviceId === data.deviceId ? { ...d, status: data.status } : d)
      );
    });
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const userId = role === 'admin' ? null : user.uid;
      const { devices: deviceList, error } = await getDevices(userId);
      
      if (error) {
        toast.error('Gagal mengambil data perangkat: ' + error);
        return;
      }

      setDevices(deviceList.filter(d => d.status === 'online'));
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startMonitoring = (device) => {
    setSelectedDevice(device);
    setIsMonitoring(true);
    socketClient.emit('start-monitoring', {
      deviceId: device.deviceId,
      userId: user.uid
    });
    toast.success(`Memulai monitoring ${device.deviceName}`);
  };

  const stopMonitoring = () => {
    if (selectedDevice) {
      socketClient.emit('stop-monitoring', {
        deviceId: selectedDevice.deviceId
      });
    }
    setIsMonitoring(false);
    setSelectedDevice(null);
    setScreenData(null);
    if (videoRef.current) {
      videoRef.current.src = '';
    }
    toast.info('Monitoring dihentikan');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Live Monitoring
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {isConnected ? 'Terhubung' : 'Terputus'}
            </span>
          </div>
          <button
            onClick={fetchDevices}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <Refresh className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Device List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-[500px] lg:h-[600px] overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Devices className="mr-2" />
            Perangkat Online
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({devices.length})
            </span>
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => startMonitoring(device)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedDevice?.deviceId === device.deviceId
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{device.deviceName || 'Unknown'}</span>
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full flex-shrink-0">
                      Online
                    </span>
                  </div>
                  <p className="text-xs opacity-75 mt-1 truncate">ID: {device.deviceId}</p>
                </button>
              ))}
            </div>
          )}
          {!loading && devices.length === 0 && (
            <div className="text-center py-8">
              <ScreenShare className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Tidak ada perangkat online
              </p>
            </div>
          )}
        </div>

        {/* Monitoring Screen */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {isMonitoring ? (
                <>
                  Monitoring: <span className="text-blue-600">{selectedDevice?.deviceName}</span>
                </>
              ) : (
                'Belum ada monitoring aktif'
              )}
            </h2>
            {isMonitoring && (
              <button
                onClick={stopMonitoring}
                className="btn-danger flex items-center space-x-2 text-sm"
              >
                <Pause className="w-4 h-4" />
                <span>Stop</span>
              </button>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg aspect-video relative flex items-center justify-center overflow-hidden">
            {isMonitoring ? (
              <img
                ref={videoRef}
                alt="Live Screen"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400 p-8">
                <ScreenShare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Pilih perangkat untuk memulai monitoring</p>
                <p className="text-sm mt-2">Pastikan perangkat online dan memberikan izin</p>
              </div>
            )}
          </div>

          {isMonitoring && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Monitoring aktif
              </span>
              <span>|</span>
              <span>📱 {selectedDevice?.deviceName}</span>
              <span>|</span>
              <span>🔄 Live streaming</span>
              <span>|</span>
              <span>⏱️ {new Date().toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
                    }
