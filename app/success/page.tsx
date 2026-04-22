'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCarrelloStore } from '@/lib/store';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get('tipo');
  const modalita = searchParams.get('modalita');
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
  const isLettino = modalita === 'lettino';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: '#0a0a0a' }}>

      {/* Logo */}
      <div className="mb-6">
        <img
          src="/Logo_del_Lido_Arcobaleno.png"
          alt="Lido Arcobaleno Gate 1"
          style={{ width: '140px', objectFit: 'contain' }}
        />
      </div>

      {/* Icona successo */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'rgba(22,163,74,0.15)', border: '2px solid rgba(22,163,74,0.3)' }}>
        <span className="text-5xl">✅</span>
      </div>

      <h1 className="text-3xl font-black mb-2" style={{ color: '#c9a84c' }}>
        {isOrdine ? 'Ordine confermato!' : 'Prenotazione confermata!'}
      </h1>

      <p className="text-lg mb-6 max-w-xs" style={{ color: '#888' }}>
        {isOrdine
          ? isLettino
            ? 'Il tuo ordine è in preparazione. Ti raggiungiamo presto al lettino!'
            : 'Il tuo ordine è in preparazione. Puoi ritirarlo al bancone quando vuoi!'
          : 'Il tuo ombrellone è prenotato. Ti aspettiamo!'
        }
      </p>

      {/* Box info */}
      <div className="rounded-2xl p-5 mb-8 w-full max-w-sm"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,168,76,0.2)' }}>
        {isOrdine ? (
          isLettino ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏖️</span>
              <div className="text-left">
                <p className="font-bold" style={{ color: '#c9a84c' }}>
                  Consegna al lettino
                </p>
                <p className="text-sm" style={{ color: '#666' }}>
                  Il tuo ordine arriverà presto da te
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏪</span>
              <div className="text-left">
                <p className="font-bold" style={{ color: '#c9a84c' }}>
                  Ritiro al bancone
                </p>
                <p className="text-sm" style={{ color: '#666' }}>
                  Vieni a ritirare il tuo ordine quando è pronto
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-3xl">⛱️</span>
            <div className="text-left">
              <p className="font-bold" style={{ color: '#c9a84c' }}>
                Ombrellone prenotato
              </p>
              <p className="text-sm" style={{ color: '#666' }}>
                Presenta la conferma all'ingresso
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pulsanti */}
      <div className="w-full max-w-sm space-y-3">
        <Link href={isOrdine ? '/menu' : '/prenota'}>
          <button className="w-full py-4 rounded-2xl font-bold text-base mb-3"
            style={{ backgroundColor: '#c9a84c', color: '#0a0a0a' }}>
            {isOrdine ? '🍹 Aggiungi altri prodotti' : '⛱️ Altra prenotazione'}
          </button>
        </Link>
        <Link href="/">
          <button className="w-full py-4 rounded-2xl font-bold text-base"
            style={{ backgroundColor: '#1a1a1a', color: '#c9a84c', border: '2px solid #c9a84c' }}>
            🏠 Torna alla home
          </button>
        </Link>
      </div>

      {contatore > 0 && (
        <p className="mt-6 text-sm" style={{ color: '#444' }}>
          Redirect automatico in {contatore}s...
        </p>
      )}
    </div>
  );
}