'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dashboard,
  Devices,
  PhotoLibrary,
  Sms,
  Monitor,
  AdminPanelSettings,
  People,
  VpnKey,
  Settings,
  Assessment,
  Logout,
  Menu,
  Close
} from '@mui/icons-material';
import { logout } from '@/lib/firebase/auth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar({ isOpen, setIsOpen, isMobile }) {
  const pathname = usePathname();
  const { role } = useAuth();
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

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: ['admin', 'reseller', 'user'],
    },
    {
      title: 'Perangkat',
      icon: <Devices />,
      path: '/devices',
      roles: ['admin', 'reseller', 'user'],
    },
    {
      title: 'Galeri',
      icon: <PhotoLibrary />,
      path: '/gallery',
      roles: ['admin', 'reseller', 'user'],
    },
    {
      title: 'Riwayat SMS',
      icon: <Sms />,
      path: '/sms',
      roles: ['admin', 'reseller', 'user'],
    },
    {
      title: 'Live Monitoring',
      icon: <Monitor />,
      path: '/monitoring',
      roles: ['admin', 'reseller'],
    },
  ];

  const adminMenuItems = [
    {
      title: 'Kelola User',
      icon: <People />,
      path: '/admin/users',
      roles: ['admin'],
    },
    {
      title: 'Manajemen Role',
      icon: <AdminPanelSettings />,
      path: '/admin/roles',
      roles: ['admin'],
    },
    {
      title: 'Perangkat Terhubung',
      icon: <Devices />,
      path: '/admin/devices',
      roles: ['admin'],
    },
    {
      title: 'Penggunaan Lisensi',
      icon: <Assessment />,
      path: '/admin/licenses',
      roles: ['admin'],
    },
    {
      title: 'Enrollment PIN',
      icon: <VpnKey />,
      path: '/admin/enrollment',
      roles: ['admin'],
    },
    {
      title: 'Pengaturan Sistem',
      icon: <Settings />,
      path: '/admin/settings',
      roles: ['admin'],
    },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const NavItem = ({ item }) => {
    if (!item.roles.includes(role)) return null;
    
    return (
      <Link
        href={item.path}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive(item.path)
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        onClick={() => isMobile && setIsOpen(false)}
      >
        <span className="text-xl flex-shrink-0">{item.icon}</span>
        {isOpen && <span className="font-medium truncate">{item.title}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isMobile ? 'fixed w-64' : 'relative w-64'
        } bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 flex flex-col z-50 h-full`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📱</span>
            <h1 className={`font-bold text-xl text-blue-600 dark:text-blue-400 ${!isOpen && 'hidden'}`}>
              Device Monitor
            </h1>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden"
          >
            <Close />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}

          {role === 'admin' && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                <h3 className={`text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  !isOpen && 'sr-only'
                }`}>
                  Administrator
                </h3>
              </div>
              {adminMenuItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200"
            >
              <span className="text-xl flex-shrink-0"><Logout /></span>
              {isOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
