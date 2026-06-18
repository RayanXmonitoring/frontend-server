'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSMSHistory } from '@/lib/firebase/firestore';
import { toast } from 'react-hot-toast';
import { Search, Phone, CalendarToday } from '@mui/icons-material';

export default function SMSPage() {
  const { user, role } = useAuth();
  const [smsList, setSmsList] = useState([]);
  const [filteredSms, setFilteredSms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSMS();
  }, [user]);

  const fetchSMS = async () => {
    setLoading(true);
    try {
      const { smsList: smsData, error } = await getSMSHistory();
      
      if (error) {
        toast.error('Gagal mengambil riwayat SMS: ' + error);
        return;
      }

      setSmsList(smsData);
      setFilteredSms(smsData);
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = smsList.filter(sms =>
        sms.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sms.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sms.receiver?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSms(filtered);
    } else {
      setFilteredSms(smsList);
    }
  }, [searchTerm, smsList]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Riwayat SMS
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Total: {smsList.length} pesan
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari SMS (pengirim/penerima/isi)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSms.map((sms) => (
            <div
              key={sms.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <Phone className="text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-800 dark:text-white">
                    {sms.sender || 'Unknown'}
                  </span>
                  {sms.type === 'incoming' ? (
                    <span className="text-sm text-green-600 dark:text-green-400">📩 Masuk</span>
                  ) : (
                    <span className="text-sm text-blue-600 dark:text-blue-400">📤 Keluar</span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarToday className="w-4 h-4 mr-1" />
                  {sms.createdAt ? new Date(sms.createdAt).toLocaleString('id-ID') : '-'}
                </div>
              </div>
              
              <div className="ml-8">
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  <span className="text-sm text-gray-500">Dari:</span> {sms.sender || '-'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  <span className="text-sm text-gray-500">Ke:</span> {sms.receiver || '-'}
                </p>
                <p className="text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mt-2">
                  {sms.message || 'Tidak ada pesan'}
                </p>
                {sms.deviceId && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Perangkat: {sms.deviceId}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredSms.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Tidak ada SMS yang sesuai dengan pencarian' : 'Belum ada riwayat SMS'}
          </p>
        </div>
      )}
    </div>
  );
            }
