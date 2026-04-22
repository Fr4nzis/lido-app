'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/',        label: 'Home',    emoji: '🏠' },
  { href: '/menu',    label: 'Ordina',  emoji: '🍹' },
  { href: '/ordini',  label: 'Ordini',  emoji: '📋' },
  { href: '/prenota', label: 'Prenota', emoji: '⛱️' },
  { href: '/info',    label: 'Info',    emoji: 'ℹ️' },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith('/staff')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50"
      style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid #2a2a2a' }}>
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const attivo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              <span className={`text-xl leading-none transition-transform ${attivo ? 'scale-110' : ''}`}>
                {item.emoji}
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: attivo ? '#c9a84c' : '#555',
              }}>
                {item.label}
              </span>
              {attivo && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2"
                  style={{ width: '28px', height: '2px', backgroundColor: '#c9a84c', borderRadius: '2px' }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}