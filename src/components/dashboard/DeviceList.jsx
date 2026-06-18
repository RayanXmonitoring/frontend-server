'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDevice } from '@/lib/firebase/firestore';
import { toast } from 'react-hot-toast';
import { MoreVert, Delete, Visibility } from '@mui/icons-material';

export default function DeviceList({ devices }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'offline':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'lost':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleDelete = async (deviceId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus perangkat ini?')) return;
    
    const { success, error } = await deleteDevice(deviceId);
    if (success) {
      toast.success('Perangkat berhasil dihapus');
      router.refresh();
    } else {
      toast.error('Gagal menghapus perangkat: ' + error);
    }
  };

  if (devices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Belum ada perangkat yang terhubung</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
              Nama Perangkat
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
              Terakhir Aktif
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {devices.map((device) => (
            <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {device.deviceName || 'Perangkat Tanpa Nama'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {device.deviceId}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                  {device.status === 'online' ? '🟢 Online' : 
                   device.status === 'offline' ? '🔴 Offline' : 
                   '🟡 Lost Mode'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {device.lastSeen ? new Date(device.lastSeen).toLocaleString('id-ID') : '-'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/devices/${device.id}`)}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Visibility />
                  </button>
                  <button
                    onClick={() => handleDelete(device.id)}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Delete />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
              }
