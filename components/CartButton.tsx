'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCarrelloStore } from '@/lib/store';

export default function CartButton() {
  const pathname = usePathname();
  const { totaleItems, totale } = useCarrelloStore();
  const items = totaleItems();

  if (items === 0 || pathname === '/cart' || pathname.startsWith('/staff')) {
    return null;
  }

  return (
    <Link href="/cart">
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl"
          style={{
            backgroundColor: '#c9a84c',
            boxShadow: '0 8px 24px rgba(201,168,76,0.4)',
            color: '#0a0a0a',
          }}>
          <div className="relative">
            <span className="text-xl">🛒</span>
            <span className="absolute -top-2 -right-2 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#0a0a0a', fontSize: '0.6rem' }}>
              {items}
            </span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Vai al carrello</span>
          <span style={{ fontWeight: 900 }}>€{totale().toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}