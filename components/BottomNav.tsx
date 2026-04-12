'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/menu',    label: 'Ordina',  emoji: '🍹' },
  { href: '/cart',    label: 'Carrello', emoji: '🛒' },
  { href: '/prenota', label: 'Prenota', emoji: '⛱️' },
  { href: '/info',    label: 'Info',    emoji: 'ℹ️' },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith('/staff')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const attivo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                attivo ? 'text-sky-500' : 'text-gray-400'
              }`}
            >
              <span className={`text-xl leading-none transition-transform ${attivo ? 'scale-110' : ''}`}>
                {item.emoji}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}