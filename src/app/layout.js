import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import SessionProviderWrapper from '@/components/providers/SessionProvider';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Device Monitoring Dashboard',
  description: 'Monitor and manage all connected devices',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
