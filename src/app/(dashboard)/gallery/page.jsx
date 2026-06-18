'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getGalleryItems } from '@/lib/firebase/firestore';
import { toast } from 'react-hot-toast';
import { PhotoLibrary, Search, Refresh } from '@mui/icons-material';

export default function GalleryPage() {
  const { user, role } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchGallery();
  }, [user]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const { items: galleryItems, error } = await getGalleryItems();
      
      if (error) {
        toast.error('Gagal mengambil data galeri: ' + error);
        return;
      }

      setItems(galleryItems);
      setFilteredItems(galleryItems);
      
      // Extract unique device IDs
      const deviceIds = [...new Set(galleryItems.map(item => item.deviceId).filter(Boolean))];
      setDevices(deviceIds);
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = items;
    
    if (searchTerm) {
      result = result.filter(item =>
        item.filename?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDevice !== 'all') {
      result = result.filter(item => item.deviceId === selectedDevice);
    }
    
    setFilteredItems(result);
  }, [searchTerm, selectedDevice, items]);

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return '🖼️';
    if (type?.startsWith('video/')) return '🎬';
    if (type?.startsWith('audio/')) return '🎵';
    return '📄';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Galeri Perangkat
        </h1>
        <button
          onClick={fetchGallery}
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
              placeholder="Cari file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Semua Perangkat</option>
            {devices.map(deviceId => (
              <option key={deviceId} value={deviceId}>{deviceId}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <PhotoLibrary className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedDevice !== 'all'
                  ? 'Tidak ada file yang sesuai'
                  : 'Belum ada file media yang diizinkan'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="aspect-square relative bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {item.url ? (
                      <img
                        src={item.url}
                        alt={item.filename || 'File'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-6xl">{getFileIcon(item.type)}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {item.filename || 'File tanpa nama'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.deviceId || 'Perangkat tidak diketahui'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'}
                    </p>
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
