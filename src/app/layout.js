import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Device Monitoring Dashboard',
  description: 'Monitor and manage all connected devices',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
