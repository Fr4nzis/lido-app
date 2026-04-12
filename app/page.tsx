'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCarrelloStore } from '@/lib/store';

export default function HomePage() {
  const searchParams = useSearchParams();
  const { setLettino, lettino } = useCarrelloStore();

  useEffect(() => {
    const spot = searchParams.get('spot');
    if (spot) {
      setLettino(spot.toUpperCase());
    }
  }, [searchParams, setLettino]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-[55vh] overflow-hidden bg-sky-900">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/30 via-transparent to-sky-950/80" />
        <div className="relative h-full flex flex-col items-center justify-end pb-8 px-6 text-white text-center">
          {lettino && (
            <div className="mb-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
              🏖️ Lettino <span className="font-bold">{lettino}</span>
            </div>
          )}
          <h1 className="text-4xl font-black tracking-tight drop-shadow-lg">
            Lido Azzurro
          </h1>
          <p className="mt-2 text-sky-100 text-lg font-light">
            Il mare a portata di tap
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl -mt-6 relative z-10 px-5 pt-8 pb-6">
        {!lettino && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-amber-700 text-sm font-medium">
              📍 Scansiona il QR sul tuo lettino oppure selezionalo al checkout
            </p>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-800 mb-5">Cosa vuoi fare?</h2>

        <div className="space-y-3">
          <Link href="/menu">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🍹</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">Ordina dal lettino</h3>
                <p className="text-gray-500 text-sm mt-0.5">Bar, cucina, cocktail</p>
              </div>
              <div className="text-gray-300 text-xl">›</div>
            </div>
          </Link>

          <Link href="/prenota">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">⛱️</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">Prenota ombrellone</h3>
                <p className="text-gray-500 text-sm mt-0.5">Scegli il tuo posto sulla mappa</p>
              </div>
              <div className="text-gray-300 text-xl">›</div>
            </div>
          </Link>

          <Link href="/info">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🌊</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">Scopri il lido</h3>
                <p className="text-gray-500 text-sm mt-0.5">Servizi, orari e dove siamo</p>
              </div>
              <div className="text-gray-300 text-xl">›</div>
            </div>
          </Link>
        </div>

        <div className="mt-6 bg-sky-50 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">APERTURA</p>
              <p className="text-lg font-bold text-sky-600">09:00</p>
            </div>
            <div className="h-8 w-px bg-sky-200" />
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">CUCINA</p>
              <p className="text-lg font-bold text-sky-600">12-15</p>
            </div>
            <div className="h-8 w-px bg-sky-200" />
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">CHIUSURA</p>
              <p className="text-lg font-bold text-sky-600">20:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}