'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import socketClient from '@/lib/socket/client';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketClient.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect to socket
    socketRef.current = socketClient.connect(user.uid);
    
    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      setReconnectAttempts(0);
      console.log('✅ Socket connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    };

    const handleConnectError = (err) => {
      setError(err.message);
      setReconnectAttempts(prev => prev + 1);
      console.error('⚠️ Socket connection error:', err);
      
      if (reconnectAttempts >= 5) {
        toast.error('Gagal terhubung ke server monitoring');
      }
    };

    const handleReconnect = (attempt) => {
      setReconnectAttempts(attempt);
      console.log(`🔄 Socket reconnected after ${attempt} attempts`);
    };

    // Register events
    socketClient.on('connect', handleConnect);
    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('connect_error', handleConnectError);
    socketClient.on('reconnect', handleReconnect);

    // Cleanup
    return () => {
      socketClient.off('connect', handleConnect);
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('connect_error', handleConnectError);
      socketClient.off('reconnect', handleReconnect);
      
      if (socketRef.current) {
        socketClient.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user, isAuthenticated]);

  // Emit event
  const emit = useCallback((event, data) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot emit event, socket not connected');
      return false;
    }
    return socketClient.emit(event, data);
  }, [isConnected]);

  // Listen to event
  const on = useCallback((event, callback) => {
    return socketClient.on(event, callback);
  }, []);

  // Remove listener
  const off = useCallback((event, callback) => {
    return socketClient.off(event, callback);
  }, []);

  // Start monitoring device
  const startMonitoring = useCallback((deviceId) => {
    if (!isConnected) {
      toast.error('Socket tidak terhubung');
      return false;
    }
    return emit('start-monitoring', { deviceId, userId: user?.uid });
  }, [isConnected, emit, user]);

  // Stop monitoring device
  const stopMonitoring = useCallback((deviceId) => {
    if (!isConnected) {
      toast.error('Socket tidak terhubung');
      return false;
    }
    return emit('stop-monitoring', { deviceId });
  }, [isConnected, emit]);

  // Request screen stream
  const requestScreenStream = useCallback((deviceId) => {
    if (!isConnected) {
      toast.error('Socket tidak terhubung');
      return false;
    }
    return emit('request-screen', { deviceId });
  }, [isConnected, emit]);

  return {
    isConnected,
    reconnectAttempts,
    error,
    emit,
    on,
    off,
    startMonitoring,
    stopMonitoring,
    requestScreenStream,
    socket: socketRef.current,
  };
};

// Hook untuk live monitoring
export const useLiveMonitoring = (deviceId) => {
  const { isConnected, startMonitoring, stopMonitoring, on, off } = useSocket();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [screenData, setScreenData] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deviceId || !isConnected) return;

    // Listen for screen stream
    const handleScreenStream = (data) => {
      setScreenData(data);
    };

    // Listen for device status
    const handleDeviceStatus = (data) => {
      setDeviceStatus(data);
    };

    // Listen for errors
    const handleError = (data) => {
      setError(data.message);
      toast.error(data.message);
    };

    on('screen-stream', handleScreenStream);
    on('device-status', handleDeviceStatus);
    on('monitoring-error', handleError);

    return () => {
      off('screen-stream', handleScreenStream);
      off('device-status', handleDeviceStatus);
      off('monitoring-error', handleError);
      if (isMonitoring) {
        stopMonitoring(deviceId);
      }
    };
  }, [deviceId, isConnected, on, off, stopMonitoring]);

  const start = useCallback(() => {
    if (!deviceId) {
      toast.error('Device ID tidak valid');
      return false;
    }
    const success = startMonitoring(deviceId);
    if (success) {
      setIsMonitoring(true);
      setError(null);
      toast.success('Memulai monitoring');
    }
    return success;
  }, [deviceId, startMonitoring]);

  const stop = useCallback(() => {
    const success = stopMonitoring(deviceId);
    if (success) {
      setIsMonitoring(false);
      setScreenData(null);
      toast.info('Monitoring dihentikan');
    }
    return success;
  }, [deviceId, stopMonitoring]);

  const toggle = useCallback(() => {
    if (isMonitoring) {
      return stop();
    } else {
      return start();
    }
  }, [isMonitoring, start, stop]);

  return {
    isConnected,
    isMonitoring,
    screenData,
    deviceStatus,
    error,
    start,
    stop,
    toggle,
  };
};
