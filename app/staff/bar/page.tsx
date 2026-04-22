'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Ordine, StatoOrdine } from '@/types';

const STATO_CONFIG = {
  in_attesa:       { label: 'In attesa',       color: '#888',    bg: 'rgba(136,136,136,0.1)', emoji: '⏳' },
  in_preparazione: { label: 'In preparazione', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  emoji: '👨‍🍳' },
  pronto:          { label: 'Pronto',          color: '#16a34a', bg: 'rgba(22,163,74,0.1)',   emoji: '✅' },
  consegnato:      { label: 'Consegnato',      color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  emoji: '🏖️' },
  annullato:       { label: 'Annullato',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   emoji: '❌' },
};

export default function StaffBarPage() {
  const router = useRouter();
  const [ordini, setOrdini] = useState<Ordine[]>([]);
  const [filtro, setFiltro] = useState<StatoOrdine | 'tutti'>('in_preparazione');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'ordini' | 'riepilogo'>('ordini');

  useEffect(() => {
    const ruolo = sessionStorage.getItem('staff_ruolo');
    if (ruolo !== 'bar') {
      router.push('/staff/login');
      return;
    }

    async function caricaOrdini() {
      const { data } = await supabase
        .from('ordini')
        .select('*')
        .neq('stato', 'in_attesa')
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) setOrdini(data);
      setLoading(false);
    }
    caricaOrdini();

    const channel = supabase
      .channel('ordini-bar')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ordini' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrdini((prev) => [payload.new as Ordine, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrdini((prev) =>
              prev.map((o) => o.id === payload.new.id ? payload.new as Ordine : o)
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  async function aggiornaStato(ordineId: string, nuovoStato: StatoOrdine) {
  // Aggiorna subito la UI senza aspettare Supabase
  setOrdini((prev) =>
    prev.map((o) => o.id === ordineId ? { ...o, stato: nuovoStato } : o)
  );
  // Poi salva nel database
  await supabase.from('ordini').update({ stato: nuovoStato }).eq('id', ordineId);
}

  function handleLogout() {
    sessionStorage.clear();
    router.push('/staff/login');
  }

  const ordiniFiltrati = filtro === 'tutti'
    ? ordini
    : ordini.filter((o) => o.stato === filtro);

  const contaPerStato = (stato: StatoOrdine) =>
    ordini.filter((o) => o.stato === stato).length;

  // Riepilogo totale ordini
  const totaleOrdini = ordini
    .filter((o) => o.stato !== 'annullato')
    .reduce((sum, o) => sum + Number(o.totale), 0);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
        <div>
          <h1 className="text-lg font-black" style={{ color: '#c9a84c' }}>
            👨‍🍳 Dashboard Barista
          </h1>
          <p style={{ color: '#666', fontSize: '0.75rem' }}>
            {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="text-center px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-lg font-black" style={{ color: '#f59e0b' }}>
                {contaPerStato('in_preparazione')}
              </p>
              <p style={{ fontSize: '0.6rem', color: '#888' }}>In prep.</p>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' }}>
              <p className="text-lg font-black" style={{ color: '#16a34a' }}>
                {contaPerStato('pronto')}
              </p>
              <p style={{ fontSize: '0.6rem', color: '#888' }}>Pronti</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ backgroundColor: '#2a2a2a', color: '#888' }}>
            Esci
          </button>
        </div>
      </div>

      {/* Tab ordini / riepilogo */}
      <div className="flex px-5 py-3 gap-2"
        style={{ borderBottom: '1px solid #2a2a2a' }}>
        <button
          onClick={() => setTab('ordini')}
          className="flex-1 py-2 rounded-xl text-sm font-bold"
          style={{
            backgroundColor: tab === 'ordini' ? '#c9a84c' : '#1a1a1a',
            color: tab === 'ordini' ? '#0a0a0a' : '#666',
          }}>
          📋 Ordini
        </button>
        <button
          onClick={() => setTab('riepilogo')}
          className="flex-1 py-2 rounded-xl text-sm font-bold"
          style={{
            backgroundColor: tab === 'riepilogo' ? '#c9a84c' : '#1a1a1a',
            color: tab === 'riepilogo' ? '#0a0a0a' : '#666',
          }}>
          📊 Riepilogo
        </button>
      </div>

      {tab === 'ordini' ? (
        <>
          {/* Filtri stato */}
          <div className="flex overflow-x-auto gap-2 px-5 py-3"
            style={{ scrollbarWidth: 'none' }}>
            {(['tutti', 'in_preparazione', 'pronto', 'consegnato'] as const).map((stato) => (
              <button
                key={stato}
                onClick={() => setFiltro(stato)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold"
                style={{
                  backgroundColor: filtro === stato ? '#c9a84c' : '#1a1a1a',
                  color: filtro === stato ? '#0a0a0a' : '#666',
                  border: filtro === stato ? 'none' : '1px solid #2a2a2a',
                }}>
                {stato === 'tutti'
                  ? `Tutti (${ordini.length})`
                  : `${STATO_CONFIG[stato].emoji} ${STATO_CONFIG[stato].label} (${contaPerStato(stato)})`
                }
              </button>
            ))}
          </div>

          {/* Lista ordini */}
          <div className="px-5 py-2 space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                  style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
                <p style={{ color: '#555' }}>Caricamento...</p>
              </div>
            ) : ordiniFiltrati.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">🌴</div>
                <p style={{ color: '#555' }}>Nessun ordine</p>
              </div>
            ) : (
              ordiniFiltrati.map((ordine) => {
                const cfg = STATO_CONFIG[ordine.stato];
                return (
                  <div key={ordine.id} className="rounded-2xl p-4"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
  {ordine.modalita === 'lettino' ? (
    <>
      <div className="px-3 py-1 rounded-xl font-black text-lg"
        style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
        🏖️ {ordine.lettino}
      </div>
      {ordine.nome_cliente && (
        <span style={{ color: '#888', fontSize: '0.85rem' }}>
          {ordine.nome_cliente}
        </span>
      )}
    </>
  ) : (
    <div className="px-3 py-1 rounded-xl flex items-center gap-2"
      style={{ backgroundColor: 'rgba(201,168,76,0.15)' }}>
      <span style={{ color: '#c9a84c', fontWeight: 900, fontSize: '0.9rem' }}>
        🏪 RITIRO AL BANCONE
      </span>
      {ordine.nome_cliente && (
        <span style={{ color: '#e8e8e8', fontWeight: 700, fontSize: '0.85rem' }}>
          — {ordine.nome_cliente}
        </span>
      )}
    </div>
  )}
</div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.emoji} {cfg.label}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3">
                      {(ordine.prodotti as any[]).map((p, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span style={{ color: '#e8e8e8' }}>
                            <span style={{ color: '#c9a84c', fontWeight: 800 }}>×{p.qty}</span> {p.nome}
                          </span>
                          <span style={{ color: '#666' }}>
                            €{(p.prezzo_unitario * p.qty).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2"
                      style={{ borderTop: '1px solid #2a2a2a' }}>
                      <div className="flex items-center gap-2">
                        <span style={{ color: '#555', fontSize: '0.72rem' }}>
                          {new Date(ordine.created_at).toLocaleTimeString('it-IT', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {ordine.modalita === 'lettino' && (
                          <span className="px-2 py-0.5 rounded-full text-xs"
                            style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
                            🏖️ Al lettino
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: '#e8e8e8' }}>
                          €{Number(ordine.totale).toFixed(2)}
                        </span>
                        {ordine.stato === 'in_preparazione' && (
                          <button
                            onClick={() => aggiornaStato(ordine.id, 'pronto')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold"
                            style={{ backgroundColor: '#16a34a', color: 'white' }}>
                            ✅ Pronto
                          </button>
                        )}
                        {ordine.stato === 'pronto' && (
                          <button
                            onClick={() => aggiornaStato(ordine.id, 'consegnato')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold"
                            style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                            🏖️ Consegnato
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Tab Riepilogo */
        <div className="px-5 py-4 space-y-4">
          <div className="rounded-2xl p-5"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,168,76,0.2)' }}>
            <h2 className="font-bold mb-4" style={{ color: '#c9a84c' }}>
              📊 Riepilogo ordini oggi
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl text-center"
                style={{ backgroundColor: '#2a2a2a' }}>
                <p className="text-2xl font-black" style={{ color: '#c9a84c' }}>
                  {ordini.filter(o => o.stato !== 'annullato').length}
                </p>
                <p style={{ color: '#666', fontSize: '0.75rem' }}>Ordini totali</p>
              </div>
              <div className="p-3 rounded-xl text-center"
                style={{ backgroundColor: '#2a2a2a' }}>
                <p className="text-2xl font-black" style={{ color: '#c9a84c' }}>
                  €{totaleOrdini.toFixed(2)}
                </p>
                <p style={{ color: '#666', fontSize: '0.75rem' }}>Incasso totale</p>
              </div>
            </div>

            {/* Lista ordini con nome e lettino */}
            <div className="space-y-2">
              <p className="text-sm font-bold mb-2" style={{ color: '#888' }}>
                Ultimi ordini:
              </p>
              {ordini.filter(o => o.stato !== 'annullato').slice(0, 20).map((ordine) => (
                <div key={ordine.id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: '#2a2a2a' }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black" style={{ color: '#c9a84c' }}>
                        {ordine.lettino}
                      </span>
                      {ordine.nome_cliente && (
                        <span style={{ color: '#888', fontSize: '0.8rem' }}>
                          — {ordine.nome_cliente}
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#555', fontSize: '0.7rem' }}>
                      {new Date(ordine.created_at).toLocaleTimeString('it-IT', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: '#e8e8e8' }}>
                      €{Number(ordine.totale).toFixed(2)}
                    </p>
                    <p style={{ color: STATO_CONFIG[ordine.stato].color, fontSize: '0.7rem' }}>
                      {STATO_CONFIG[ordine.stato].emoji} {STATO_CONFIG[ordine.stato].label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}