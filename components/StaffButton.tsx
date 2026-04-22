'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StaffButton() {
  const pathname = usePathname();

  if (pathname.startsWith('/staff')) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2"
      style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid #2a2a2a' }}
    >
      {/* Logo */}
      <Link href="/">
        <img
          src="/Logo_del_Lido_Arcobaleno.png"
          alt="Lido Arcobaleno Gate 1"
          style={{ height: '52px', objectFit: 'contain' }}
        />
      </Link>

      {/* Pulsante Staff */}
      <Link href="/staff/login">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ border: '1px solid #c9a84c', color: '#c9a84c' }}
        >
          <span style={{ fontSize: '0.9rem' }}>👤</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Staff</span>
        </div>
      </Link>
    </div>
  );
}