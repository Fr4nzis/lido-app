'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Ordine, StatoOrdine } from '@/types';

const STATO_CONFIG = {
  in_attesa:       { label: 'In attesa',       color: 'text-gray-600',  bg: 'bg-gray-100',  emoji: '⏳' },
  in_preparazione: { label: 'In preparazione', color: 'text-amber-700', bg: 'bg-amber-100', emoji: '👨‍🍳' },
  pronto:          { label: 'Pronto',          color: 'text-green-700', bg: 'bg-green-100', emoji: '✅' },
  consegnato:      { label: 'Consegnato',      color: 'text-blue-700',  bg: 'bg-blue-100',  emoji: '🏖️' },
  annullato:       { label: 'Annullato',       color: 'text-red-700',   bg: 'bg-red-100',   emoji: '❌' },
};

export default function StaffPage() {
  const [autenticato, setAutenticato] = useState(false);
  const [password, setPassword] = useState('');
  const [erroreLogin, setErroreLogin] = useState('');
  const [ordini, setOrdini] = useState<Ordine[]>([]);
  const [filtroStato, setFiltroStato] = useState<StatoOrdine | 'tutti'>('in_preparazione');
  const [loading, setLoading] = useState(true);

  function handleLogin() {
    if (password === 'lido2024') {
      setAutenticato(true);
    } else {
      setErroreLogin('Password non corretta');
    }
  }

  useEffect(() => {
    if (!autenticato) return;

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
      .channel('ordini-staff')
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
  }, [autenticato]);

  async function aggiornaStato(ordineId: string, nuovoStato: StatoOrdine) {
    await supabase.from('ordini').update({ stato: nuovoStato }).eq('id', ordineId);
  }

  const ordiniFiltrati = filtroStato === 'tutti'
    ? ordini
    : ordini.filter((o) => o.stato === filtroStato);

  const contaPerStato = (stato: StatoOrdine) => ordini.filter((o) => o.stato === stato).length;

  if (!autenticato) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="card p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">👨‍💼</div>
            <h1 className="text-2xl font-black text-gray-800">Staff Login</h1>
            <p className="text-gray-500 text-sm">Dashboard Lido Azzurro</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Password staff"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {erroreLogin && (
              <p className="text-red-500 text-sm text-center">⚠️ {erroreLogin}</p>
            )}
            <button onClick={handleLogin} className="w-full btn-primary">
              Accedi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-sky-600 text-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">Dashboard Staff</h1>
            <p className="text-sky-200 text-sm">
              {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-sky-700 rounded-xl px-3 py-2 text-center">
              <p className="text-2xl font-black">{contaPerStato('in_preparazione')}</p>
              <p className="text-xs text-sky-300">In prep.</p>
            </div>
            <div className="bg-sky-700 rounded-xl px-3 py-2 text-center">
              <p className="text-2xl font-black">{contaPerStato('pronto')}</p>
              <p className="text-xs text-sky-300">Pronti</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 px-5 py-3 bg-white border-b border-gray-100">
        {(['tutti', 'in_preparazione', 'pronto', 'consegnato'] as const).map((stato) => (
          <button
            key={stato}
            onClick={() => setFiltroStato(stato)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filtroStato === stato ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {stato === 'tutti'
              ? `Tutti (${ordini.length})`
              : `${STATO_CONFIG[stato].emoji} ${STATO_CONFIG[stato].label} (${contaPerStato(stato)})`
            }
          </button>
        ))}
      </div>

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Caricamento ordini...</p>
          </div>
        ) : ordiniFiltrati.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🌴</div>
            <p>Nessun ordine in questa categoria</p>
          </div>
        ) : (
          ordiniFiltrati.map((ordine) => {
            const cfg = STATO_CONFIG[ordine.stato];
            return (
              <div key={ordine.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-sky-100 text-sky-700 font-black text-lg px-3 py-1 rounded-xl">
                      {ordine.lettino}
                    </div>
                    {ordine.nome_cliente && (
                      <span className="text-gray-600 text-sm">{ordine.nome_cliente}</span>
                    )}
                  </div>
                  <span className={`badge ${cfg.bg} ${cfg.color}`}>
                    {cfg.emoji} {cfg.label}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {(ordine.prodotti as any[]).map((p, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        <span className="font-semibold text-sky-600">×{p.qty}</span> {p.nome}
                      </span>
                      <span className="text-gray-500">€{(p.prezzo_unitario * p.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {new Date(ordine.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">€{Number(ordine.totale).toFixed(2)}</span>
                    {ordine.stato === 'in_preparazione' && (
                      <button
                        onClick={() => aggiornaStato(ordine.id, 'pronto')}
                        className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl"
                      >
                        ✅ Segna pronto
                      </button>
                    )}
                    {ordine.stato === 'pronto' && (
                      <button
                        onClick={() => aggiornaStato(ordine.id, 'consegnato')}
                        className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl"
                      >
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
    </div>
  );
}