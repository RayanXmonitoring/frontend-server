'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Header({ toggleSidebar }) {
  const { userData, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <span className="text-2xl">☰</span>
        </button>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800 dark:text-white">
            {userData?.displayName || 'User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {role === 'admin' ? 'Administrator' : role === 'reseller' ? 'Reseller' : 'User'}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold hover:bg-blue-700 transition-colors"
          >
            {userData?.displayName?.charAt(0) || 'U'}
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium">{userData?.displayName}</p>
                <p className="text-xs text-gray-500">{userData?.email}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Profil
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Pengaturan
              </button>
              <hr className="my-1" />
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition-colors">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
