import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import CartButton from '@/components/CartButton';
import StaffButton from '@/components/StaffButton';
import LoadingScreen from '@/components/LoadingScreen';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lido Arcobaleno Gate 1',
  description: 'Ordina, prenota, goditi il mare',
  icons: {
    icon: '/Logo_del_Lido_Arcobaleno.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={`${inter.className}`} style={{ backgroundColor: '#0a0a0a' }}>
        <LoadingScreen />
        <StaffButton />
        <main className="min-h-screen pb-20">
          {children}
        </main>
        <CartButton />
        <BottomNav />
      </body>
    </html>
  );
}