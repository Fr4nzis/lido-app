'use client';

import { useState, useEffect } from 'react';
import type { Ombrellone } from '@/types';

const COLORI = {
  disponibile: { fill: '#ffffff', stroke: '#94a3b8', text: '#374151' },
  occupato:    { fill: '#fecaca', stroke: '#ef4444', text: '#dc2626' },
  bloccato:    { fill: '#fde68a', stroke: '#f59e0b', text: '#92400e' },
  selezionato: { fill: '#bae6fd', stroke: '#0ea5e9', text: '#0369a1' },
};

export default function PrenotaPage() {
  const [data, setData] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [ombrelloni, setOmbrelloni] = useState<Ombrellone[]>([]);
  const [selezionato, setSelezionato] = useState<Ombrellone | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [errore, setErrore] = useState('');

  useEffect(() => {
    if (!data) return;
    setSelezionato(null);
    setLoadingMap(true);
    async function caricaDisponibilita() {
      try {
        const res = await fetch(`/api/disponibilita?data=${data}`);
        const json = await res.json();
        setOmbrelloni(json.ombrelloni);
      } catch {
        console.error('Errore caricamento disponibilità');
      } finally {
        setLoadingMap(false);
      }
    }
    caricaDisponibilita();
  }, [data]);

  async function handlePrenota() {
    if (!selezionato) { setErrore('Seleziona un ombrellone dalla mappa.'); return; }
    if (!nome.trim()) { setErrore('Inserisci il tuo nome.'); return; }
    setErrore('');
    setLoading(true);
    try {
      const blockRes = await fetch('/api/prenotazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ombrellone_id: selezionato.id,
          data,
          nome_cliente: nome,
          email_cliente: email || null,
        }),
      });
      if (!blockRes.ok) {
        const err = await blockRes.json();
        throw new Error(err.message || 'Ombrellone non più disponibile');
      }
      const { prenotazione_id } = await blockRes.json();

      const stripeRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'prenotazione',
          riferimento_id: prenotazione_id,
          items: [{
            nome: `Ombrellone ${selezionato.codice} — ${data}`,
            prezzo: selezionato.prezzo,
            qty: 1,
          }],
        }),
      });
      if (!stripeRes.ok) throw new Error('Errore Stripe');
      const { url } = await stripeRes.json();
      window.location.href = url;
    } catch (err: any) {
      setErrore(err.message || 'Errore durante la prenotazione. Riprova.');
      setLoading(false);
    }
  }

  const oggi = new Date().toISOString().split('T')[0];

  const getStato = (o: Ombrellone) => {
    if (selezionato?.id === o.id) return 'selezionato';
    return o.stato ?? 'disponibile';
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <h1 className="text-2xl font-black text-gray-800">Prenota Ombrellone</h1>
        <p className="text-gray-500 text-sm">Scegli il tuo posto sulla mappa</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="card p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📅 Seleziona la data
          </label>
          <input
            type="date"
            value={data}
            min={oggi}
            onChange={(e) => setData(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div className="card p-4">
          <h2 className="font-bold text-gray-700 mb-3 text-sm">Mappa ombrelloni</h2>
          {loadingMap ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm">Caricamento mappa...</p>
              </div>
            </div>
          ) : (
            <div className="relative w-full">
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                {Object.entries(COLORI).map(([stato, colori]) => (
                  <div key={stato} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: colori.fill, borderColor: colori.stroke }} />
                    <span className="capitalize">{stato}</span>
                  </div>
                ))}
              </div>
              <div className="bg-sky-50 rounded-2xl overflow-hidden border border-sky-100">
                <div className="bg-sky-400/20 py-1.5 flex items-center justify-center">
                  <span className="text-xs font-semibold text-sky-700 tracking-widest">🌊 MARE</span>
                </div>
                <svg viewBox="0 0 100 100" className="w-full" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="#fefce8" />
                  {ombrelloni.map((o) => {
                    const stato = getStato(o);
                    const c = COLORI[stato];
                    const isSelezionabile = stato !== 'occupato' && stato !== 'bloccato';
                    return (
                      <g
                        key={o.id}
                        onClick={() => isSelezionabile && setSelezionato(o)}
                        style={{ cursor: isSelezionabile ? 'pointer' : 'not-allowed' }}
                      >
                        <line x1={o.x} y1={o.y - 2} x2={o.x} y2={o.y + 3.5} stroke={c.stroke} strokeWidth="0.8" />
                        <rect x={o.x - 3.5} y={o.y + 2.5} width="3" height="1.5" rx="0.5" fill={c.fill} stroke={c.stroke} strokeWidth="0.3" />
                        <rect x={o.x + 0.5} y={o.y + 2.5} width="3" height="1.5" rx="0.5" fill={c.fill} stroke={c.stroke} strokeWidth="0.3" />
                        <ellipse cx={o.x} cy={o.y - 1.5} rx="4" ry="2.5" fill={c.fill} stroke={c.stroke} strokeWidth="0.6" />
                        <text x={o.x} y={o.y - 1} textAnchor="middle" fontSize="1.8" fontWeight="bold" fill={c.text}>
                          {o.codice}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Tocca un ombrellone bianco per selezionarlo
              </p>
            </div>
          )}
        </div>

        {selezionato && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⛱️</div>
              <div>
                <p className="font-bold text-sky-800">Ombrellone {selezionato.codice} — Zona {selezionato.zona}</p>
                <p className="text-sky-600 font-semibold">€{selezionato.prezzo.toFixed(2)}/giorno</p>
              </div>
            </div>
          </div>
        )}

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-800">Dati prenotazione</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome e cognome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Mario Rossi"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-gray-400 text-xs">(per ricevere conferma)</span>
            </label>
            <input
              type="email"
              placeholder="mario@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>

        {errore && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
            ⚠️ {errore}
          </div>
        )}

        <button
          onClick={handlePrenota}
          disabled={loading || !selezionato}
          className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Attendere...</span>
            </>
          ) : (
            <>
              <span>🔒</span>
              <span>{selezionato ? `Prenota — €${selezionato.prezzo.toFixed(2)}` : 'Seleziona un ombrellone'}</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          Il posto verrà bloccato per 10 minuti durante il pagamento.
        </p>
      </div>
    </div>
  );
}