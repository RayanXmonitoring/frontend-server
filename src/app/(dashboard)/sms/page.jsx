'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSMSHistory } from '@/lib/firebase/firestore';
import { toast } from 'react-hot-toast';
import { Search, Phone, CalendarToday, Sms as SmsIcon, Refresh } from '@mui/icons-material';

export default function SMSPage() {
  const { user, role } = useAuth();
  const [smsList, setSmsList] = useState([]);
  const [filteredSms, setFilteredSms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

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
    let result = smsList;
    
    if (searchTerm) {
      result = result.filter(sms =>
        sms.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sms.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sms.receiver?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(sms => sms.type === typeFilter);
    }
    
    setFilteredSms(result);
  }, [searchTerm, typeFilter, smsList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Riwayat SMS
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total: {smsList.length} pesan
          </span>
          <button
            onClick={fetchSMS}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <Refresh className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari SMS (pengirim/penerima/isi)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Semua Tipe</option>
            <option value="incoming">📩 Masuk</option>
            <option value="outgoing">📤 Keluar</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {filteredSms.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <SmsIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || typeFilter !== 'all'
                  ? 'Tidak ada SMS yang sesuai dengan filter'
                  : 'Belum ada riwayat SMS'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSms.map((sms) => (
                <div
                  key={sms.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
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
                  
                  <div className="ml-8 space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-gray-500">Dari:</span> {sms.sender || '-'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-gray-500">Ke:</span> {sms.receiver || '-'}
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
        </>
      )}
    </div>
  );
}
