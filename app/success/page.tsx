'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCarrelloStore } from '@/lib/store';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get('tipo');
  const { svuota } = useCarrelloStore();
  const [contatore, setContatore] = useState(5);

  useEffect(() => {
    if (tipo === 'ordine') svuota();
  }, [tipo, svuota]);

  useEffect(() => {
    if (contatore <= 0) return;
    const timer = setTimeout(() => setContatore((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [contatore]);

  const isOrdine = tipo === 'ordine';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <span className="text-5xl">✅</span>
      </div>

      <h1 className="text-3xl font-black text-gray-800 mb-2">
        {isOrdine ? 'Ordine confermato!' : 'Prenotazione confermata!'}
      </h1>

      <p className="text-gray-500 text-lg mb-6 max-w-xs">
        {isOrdine
          ? 'Il tuo ordine è in preparazione. Ti raggiungiamo al lettino!'
          : 'Il tuo ombrellone è prenotato. Ti aspettiamo!'}
      </p>

      <div className={`rounded-2xl p-5 mb-8 w-full max-w-sm ${
        isOrdine ? 'bg-amber-50 border border-amber-200' : 'bg-sky-50 border border-sky-200'
      }`}>
        {isOrdine ? (
          <div className="flex items-center gap-2 text-amber-700">
            <span className="text-2xl">👨‍🍳</span>
            <div className="text-left">
              <p className="font-bold">In preparazione</p>
              <p className="text-sm">Riceverai il tuo ordine al lettino</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sky-700">
            <span className="text-2xl">⛱️</span>
            <div className="text-left">
              <p className="font-bold">Ombrellone prenotato</p>
              <p className="text-sm">Presenta la conferma all'ingresso</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Link href={isOrdine ? '/menu' : '/prenota'} className="btn-primary w-full block text-center">
          {isOrdine ? '🍹 Aggiungi altri prodotti' : '⛱️ Altra prenotazione'}
        </Link>
        <Link href="/" className="btn-secondary w-full block text-center">
          🏠 Torna alla home
        </Link>
      </div>

      {contatore > 0 && (
        <p className="text-gray-400 text-sm mt-6">
          Redirect automatico in {contatore}s...
        </p>
      )}
    </div>
  );
}