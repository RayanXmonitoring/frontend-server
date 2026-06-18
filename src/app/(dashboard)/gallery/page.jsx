'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getGalleryItems } from '@/lib/firebase/firestore';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function GalleryPage() {
  const { user, role } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('all');

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
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return '🖼️';
    if (type?.startsWith('video/')) return '🎬';
    if (type?.startsWith('audio/')) return '🎵';
    return '📄';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Galeri Perangkat
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square relative bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {item.url ? (
                  <img
                    src={item.url}
                    alt={item.filename || 'File'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">{getFileIcon(item.type)}</span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {item.filename || 'File tanpa nama'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
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

      {!loading && items.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400">Belum ada file media yang diizinkan</p>
        </div>
      )}
    </div>
  );
                  }
