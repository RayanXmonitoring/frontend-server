'use client';

import { Devices, CheckCircle, Cancel, Warning } from '@mui/icons-material';

export default function DeviceStats({ stats }) {
  const statItems = [
    {
      title: 'Total Perangkat',
      value: stats.total,
      icon: <Devices className="text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Online',
      value: stats.online,
      icon: <CheckCircle className="text-green-600 dark:text-green-400" />,
      bg: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Offline',
      value: stats.offline,
      icon: <Cancel className="text-red-600 dark:text-red-400" />,
      bg: 'bg-red-100 dark:bg-red-900',
    },
    {
      title: 'Lost Mode',
      value: stats.lost,
      icon: <Warning className="text-yellow-600 dark:text-yellow-400" />,
      bg: 'bg-yellow-100 dark:bg-yellow-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.title}</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2">
                {item.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${item.bg}`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
