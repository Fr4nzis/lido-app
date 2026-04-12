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
        <div className="bg-sky-500 text-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3 active:scale-95 transition-transform">
          <div className="relative">
            <span className="text-xl">🛒</span>
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {items}
            </span>
          </div>
          <span className="font-bold text-sm">Vai al carrello</span>
          <span className="font-black">€{totale().toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}