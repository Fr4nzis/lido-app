'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCarrelloStore } from '@/lib/store';
import type { Ordine, StatoOrdine } from '@/types';
import Link from 'next/link';

const STATO_STEPS: { stato: StatoOrdine; label: string; emoji: string; desc: string }[] = [
  { stato: 'in_preparazione', label: 'In preparazione', emoji: '👨‍🍳', desc: 'Il barista sta preparando il tuo ordine' },
  { stato: 'pronto',          label: 'Pronto',          emoji: '✅', desc: 'Il tuo ordine è pronto!' },
  { stato: 'consegnato',      label: 'Consegnato',      emoji: '🏖️', desc: 'Ordine consegnato. Buon appetito!' },
];

const STATO_INDEX: Record<string, number> = {
  in_preparazione: 0,
  pronto: 1,
  consegnato: 2,
};

export default function OrdiniPage() {
  const { lettino } = useCarrelloStore();
  const [ordini, setOrdini] = useState<Ordine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lettino) {
      setLoading(false);
      return;
    }

    // Carica ordini recenti del lettino (ultimi 2 ore)
    async function caricaOrdini() {
      const dueOreFA = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('ordini')
        .select('*')
        .eq('lettino', lettino)
        .neq('stato', 'in_attesa')
        .neq('stato', 'annullato')
        .gte('created_at', dueOreFA)
        .order('created_at', { ascending: false });

      if (data) setOrdini(data);
      setLoading(false);
    }
    caricaOrdini();

    // Realtime — aggiornamenti in tempo reale
    const channel = supabase
      .channel('ordini-cliente')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ordini' },
        (payload) => {
          setOrdini((prev) =>
            prev.map((o) => o.id === payload.new.id ? payload.new as Ordine : o)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [lettino]);

  if (!lettino) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <div style={{ height: '54px' }} />
        <div className="flex flex-col items-center justify-center px-6 text-center"
          style={{ minHeight: '60vh' }}>
          <div className="text-5xl mb-4">🏖️</div>
          <h2 className="text-xl font-black mb-2" style={{ color: '#c9a84c' }}>
            Nessun lettino selezionato
          </h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>
            Scansiona il QR del tuo lettino per vedere i tuoi ordini
          </p>
          <Link href="/menu">
            <button className="px-6 py-3 rounded-2xl font-bold"
              style={{ backgroundColor: '#c9a84c', color: '#0a0a0a' }}>
              Vai al menu
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ height: '54px' }} />

      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <h1 className="text-2xl font-black" style={{ color: '#c9a84c' }}>
          I tuoi ordini
        </h1>
        <p style={{ color: '#666', fontSize: '0.8rem' }}>
          🏖️ Lettino {lettino} — aggiornamento in tempo reale
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
              style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
            <p style={{ color: '#555' }}>Caricamento ordini...</p>
          </div>
        ) : ordini.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🌊</div>
            <p className="font-bold mb-2" style={{ color: '#c9a84c' }}>
              Nessun ordine recente
            </p>
            <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '24px' }}>
              Gli ordini degli ultimi 2 ore appariranno qui
            </p>
            <Link href="/menu">
              <button className="px-6 py-3 rounded-2xl font-bold"
                style={{ backgroundColor: '#c9a84c', color: '#0a0a0a' }}>
                🍹 Ordina qualcosa
              </button>
            </Link>
          </div>
        ) : (
          ordini.map((ordine) => {
            const statoIndex = STATO_INDEX[ordine.stato] ?? 0;

            return (
              <div key={ordine.id} className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid #2a2a2a' }}>

                {/* Header ordine */}
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
                  <div>
                    <p style={{ color: '#888', fontSize: '0.72rem' }}>
                      {new Date(ordine.created_at).toLocaleTimeString('it-IT', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <p className="font-bold" style={{ color: '#e8e8e8' }}>
                      {ordine.modalita === 'lettino' ? '🏖️ Al lettino' : '🏪 Ritiro al bancone'}
                    </p>
                  </div>
                  <span className="font-black text-lg" style={{ color: '#c9a84c' }}>
                    €{Number(ordine.totale).toFixed(2)}
                  </span>
                </div>

                {/* Prodotti */}
                <div className="px-4 py-3" style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
                  {(ordine.prodotti as any[]).map((p, i) => (
                    <div key={i} className="flex justify-between text-sm mb-1">
                      <span style={{ color: '#e8e8e8' }}>
                        <span style={{ color: '#c9a84c', fontWeight: 800 }}>×{p.qty}</span> {p.nome}
                      </span>
                      <span style={{ color: '#666' }}>€{(p.prezzo_unitario * p.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Tracker stato */}
                <div className="px-4 py-4" style={{ backgroundColor: '#111' }}>
                  <div className="flex items-center justify-between relative">

                    {/* Linea di progresso */}
                    <div className="absolute left-0 right-0 top-5 mx-8"
                      style={{ height: '2px', backgroundColor: '#2a2a2a', zIndex: 0 }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: '#c9a84c',
                        width: statoIndex === 0 ? '0%' : statoIndex === 1 ? '50%' : '100%',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>

                    {STATO_STEPS.map((step, i) => {
                      const completato = i <= statoIndex;
                      const corrente = i === statoIndex;

                      return (
                        <div key={step.stato}
                          className="flex flex-col items-center gap-1 relative"
                          style={{ zIndex: 1, flex: 1 }}>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                            style={{
                              backgroundColor: completato ? '#c9a84c' : '#2a2a2a',
                              border: corrente ? '3px solid #e8c97a' : '2px solid transparent',
                              transition: 'all 0.3s ease',
                              boxShadow: corrente ? '0 0 12px rgba(201,168,76,0.5)' : 'none',
                            }}>
                            {step.emoji}
                          </div>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: corrente ? 800 : 600,
                            color: completato ? '#c9a84c' : '#555',
                            textAlign: 'center',
                            lineHeight: 1.2,
                          }}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Messaggio stato corrente */}
                  <div className="mt-4 p-3 rounded-xl text-center"
                    style={{ backgroundColor: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <p style={{ color: '#c9a84c', fontSize: '0.82rem', fontWeight: 600 }}>
                      {STATO_STEPS[statoIndex]?.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}