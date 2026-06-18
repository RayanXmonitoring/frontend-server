'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Menu, Person, Settings, Logout } from '@mui/icons-material';
import { logout } from '@/lib/firebase/auth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Header({ toggleSidebar, isMobile }) {
  const { userData, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const { success, error } = await logout();
    if (success) {
      toast.success('Logout berhasil');
      router.push('/login');
    } else {
      toast.error('Gagal logout: ' + error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm px-4 md:px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800 dark:text-white">
            {userData?.displayName || 'User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {role === 'admin' ? 'Administrator' : 
             role === 'reseller' ? 'Reseller' : 
             'User'}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {userData?.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {userData?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userData?.email}
                  </p>
                </div>
                <button 
                  onClick={() => router.push('/profile')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <Person className="w-4 h-4" />
                  <span>Profil</span>
                </button>
                <button 
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Pengaturan</span>
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition-colors flex items-center space-x-2"
                >
                  <Logout className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
