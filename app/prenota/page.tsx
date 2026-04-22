'use client';

import { useState, useEffect } from 'react';
import type { Ombrellone } from '@/types';

interface OmbrelloneSelezionato {
  ombrellone: Ombrellone;
  lettini: number;
}

const PREZZO_LETTINO_EXTRA = 5.00;
const MAX_LETTINI = 3;

// Posizioni ombrelloni sulla foto reale (percentuali x,y rispetto all'immagine)
// Zona A — ombrelloni bianchi sinistra (file diagonali vicino mare)
// Zona B — ombrelloni bianchi centro
// Zona C — ombrelloni blu destra
// Zona D — ombrelloni paglia in basso
const OMBRELLONI_LAYOUT = [
  // ZONA A — file diagonali sinistra vicino mare
  { codice: 'A1',  x: 7,  y: 12, zona: 'A' },
  { codice: 'A2',  x: 14, y: 12, zona: 'A' },
  { codice: 'A3',  x: 21, y: 12, zona: 'A' },
  { codice: 'A4',  x: 7,  y: 20, zona: 'A' },
  { codice: 'A5',  x: 14, y: 20, zona: 'A' },
  { codice: 'A6',  x: 21, y: 20, zona: 'A' },
  { codice: 'A7',  x: 7,  y: 28, zona: 'A' },
  { codice: 'A8',  x: 14, y: 28, zona: 'A' },
  { codice: 'A9',  x: 21, y: 28, zona: 'A' },
  { codice: 'A10', x: 7,  y: 36, zona: 'A' },
  { codice: 'A11', x: 14, y: 36, zona: 'A' },
  { codice: 'A12', x: 21, y: 36, zona: 'A' },
  { codice: 'A13', x: 7,  y: 44, zona: 'A' },
  { codice: 'A14', x: 14, y: 44, zona: 'A' },
  { codice: 'A15', x: 21, y: 44, zona: 'A' },

  // ZONA B — centro sinistra bianchi
  { codice: 'B1',  x: 30, y: 12, zona: 'B' },
  { codice: 'B2',  x: 37, y: 12, zona: 'B' },
  { codice: 'B3',  x: 44, y: 12, zona: 'B' },
  { codice: 'B4',  x: 30, y: 20, zona: 'B' },
  { codice: 'B5',  x: 37, y: 20, zona: 'B' },
  { codice: 'B6',  x: 44, y: 20, zona: 'B' },
  { codice: 'B7',  x: 30, y: 28, zona: 'B' },
  { codice: 'B8',  x: 37, y: 28, zona: 'B' },
  { codice: 'B9',  x: 44, y: 28, zona: 'B' },
  { codice: 'B10', x: 30, y: 36, zona: 'B' },
  { codice: 'B11', x: 37, y: 36, zona: 'B' },
  { codice: 'B12', x: 44, y: 36, zona: 'B' },
  { codice: 'B13', x: 30, y: 44, zona: 'B' },
  { codice: 'B14', x: 37, y: 44, zona: 'B' },
  { codice: 'B15', x: 44, y: 44, zona: 'B' },

  // ZONA C — destra bianchi e blu
  { codice: 'C1',  x: 55, y: 12, zona: 'C' },
  { codice: 'C2',  x: 62, y: 12, zona: 'C' },
  { codice: 'C3',  x: 69, y: 12, zona: 'C' },
  { codice: 'C4',  x: 76, y: 12, zona: 'C' },
  { codice: 'C5',  x: 83, y: 12, zona: 'C' },
  { codice: 'C6',  x: 90, y: 12, zona: 'C' },
  { codice: 'C7',  x: 55, y: 20, zona: 'C' },
  { codice: 'C8',  x: 62, y: 20, zona: 'C' },
  { codice: 'C9',  x: 69, y: 20, zona: 'C' },
  { codice: 'C10', x: 76, y: 20, zona: 'C' },
  { codice: 'C11', x: 83, y: 20, zona: 'C' },
  { codice: 'C12', x: 90, y: 20, zona: 'C' },
  { codice: 'C13', x: 55, y: 28, zona: 'C' },
  { codice: 'C14', x: 62, y: 28, zona: 'C' },
  { codice: 'C15', x: 69, y: 28, zona: 'C' },
  { codice: 'C16', x: 76, y: 28, zona: 'C' },
  { codice: 'C17', x: 83, y: 28, zona: 'C' },
  { codice: 'C18', x: 90, y: 28, zona: 'C' },
  { codice: 'C19', x: 55, y: 36, zona: 'C' },
  { codice: 'C20', x: 62, y: 36, zona: 'C' },
  { codice: 'C21', x: 69, y: 36, zona: 'C' },
  { codice: 'C22', x: 76, y: 36, zona: 'C' },
  { codice: 'C23', x: 83, y: 36, zona: 'C' },
  { codice: 'C24', x: 90, y: 36, zona: 'C' },
  { codice: 'C25', x: 55, y: 44, zona: 'C' },
  { codice: 'C26', x: 62, y: 44, zona: 'C' },
  { codice: 'C27', x: 69, y: 44, zona: 'C' },
  { codice: 'C28', x: 76, y: 44, zona: 'C' },
  { codice: 'C29', x: 83, y: 44, zona: 'C' },
  { codice: 'C30', x: 90, y: 44, zona: 'C' },

  // ZONA D — paglia basso destra
  { codice: 'D1',  x: 63, y: 70, zona: 'D' },
  { codice: 'D2',  x: 70, y: 70, zona: 'D' },
  { codice: 'D3',  x: 77, y: 70, zona: 'D' },
  { codice: 'D4',  x: 84, y: 70, zona: 'D' },
  { codice: 'D5',  x: 91, y: 70, zona: 'D' },
  { codice: 'D6',  x: 63, y: 78, zona: 'D' },
  { codice: 'D7',  x: 70, y: 78, zona: 'D' },
  { codice: 'D8',  x: 77, y: 78, zona: 'D' },
  { codice: 'D9',  x: 84, y: 78, zona: 'D' },
  { codice: 'D10', x: 91, y: 78, zona: 'D' },
  { codice: 'D11', x: 63, y: 86, zona: 'D' },
  { codice: 'D12', x: 70, y: 86, zona: 'D' },
  { codice: 'D13', x: 77, y: 86, zona: 'D' },
  { codice: 'D14', x: 84, y: 86, zona: 'D' },
  { codice: 'D15', x: 91, y: 86, zona: 'D' },
];

export default function PrenotaPage() {
  const [data, setData] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [ombrelloniDB, setOmbrelloniDB] = useState<Ombrellone[]>([]);
  const [selezionati, setSelezionati] = useState<OmbrelloneSelezionato[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [errore, setErrore] = useState('');
  const [tooltip, setTooltip] = useState<{ codice: string; prezzo: number; stato: string } | null>(null);

  useEffect(() => {
    if (!data) return;
    setSelezionati([]);
    setLoadingMap(true);
    async function caricaDisponibilita() {
      try {
        const res = await fetch(`/api/disponibilita?data=${data}`);
        const json = await res.json();
        setOmbrelloniDB(json.ombrelloni);
      } catch {
        console.error('Errore caricamento disponibilità');
      } finally {
        setLoadingMap(false);
      }
    }
    caricaDisponibilita();
  }, [data]);

  function getStatoOmbrellone(codice: string) {
    if (selezionati.find((s) => s.ombrellone.codice === codice)) return 'selezionato';
    const dbOm = ombrelloniDB.find((o) => o.codice === codice);
    return dbOm?.stato ?? 'disponibile';
  }

  function getOmbrelloneDB(codice: string) {
    return ombrelloniDB.find((o) => o.codice === codice);
  }

  function handleClickOmbrellone(codice: string) {
    const stato = getStatoOmbrellone(codice);
    if (stato === 'occupato' || stato === 'bloccato') return;
    const dbOm = getOmbrelloneDB(codice);
    if (!dbOm) return;

    const esistente = selezionati.find((s) => s.ombrellone.codice === codice);
    if (esistente) {
      setSelezionati(selezionati.filter((s) => s.ombrellone.codice !== codice));
    } else {
      setSelezionati([...selezionati, { ombrellone: dbOm, lettini: 2 }]);
    }
  }

  function cambiaLettini(id: string, delta: number) {
    setSelezionati(selezionati.map((s) => {
      if (s.ombrellone.id !== id) return s;
      const nuovi = Math.max(1, Math.min(MAX_LETTINI, s.lettini + delta));
      return { ...s, lettini: nuovi };
    }));
  }

  function calcolaPrezzoOmbrellone(s: OmbrelloneSelezionato) {
    const extra = Math.max(0, s.lettini - 2) * PREZZO_LETTINO_EXTRA;
    return s.ombrellone.prezzo + extra;
  }

  function calcolaTotale() {
    return selezionati.reduce((sum, s) => sum + calcolaPrezzoOmbrellone(s), 0);
  }

  async function handlePrenota() {
    if (selezionati.length === 0) { setErrore('Seleziona almeno un ombrellone.'); return; }
    if (!nome.trim()) { setErrore('Inserisci il tuo nome.'); return; }
    setErrore('');
    setLoading(true);

    try {
      const prenotazioneIds: string[] = [];
      for (const s of selezionati) {
        const blockRes = await fetch('/api/prenotazioni', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ombrellone_id: s.ombrellone.id,
            data,
            nome_cliente: nome,
            email_cliente: email || null,
            lettini: s.lettini,
            totale: calcolaPrezzoOmbrellone(s),
          }),
        });
        if (!blockRes.ok) {
          const err = await blockRes.json();
          throw new Error(`Ombrellone ${s.ombrellone.codice}: ${err.message}`);
        }
        const { prenotazione_id } = await blockRes.json();
        prenotazioneIds.push(prenotazione_id);
      }

      const stripeRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'prenotazione',
          riferimento_id: prenotazioneIds[0],
          riferimento_ids: prenotazioneIds,
          items: selezionati.map((s) => ({
            nome: `Ombrellone ${s.ombrellone.codice} (${s.lettini} lettini) — ${data}`,
            prezzo: calcolaPrezzoOmbrellone(s),
            qty: 1,
          })),
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

  // Colori per stato
  const COLORI_STATO = {
    disponibile: { fill: 'rgba(255,255,255,0.9)', stroke: '#c9a84c', text: '#0a0a0a', glow: 'rgba(201,168,76,0.6)' },
    occupato:    { fill: 'rgba(255,59,48,0.85)',  stroke: '#ff3b30', text: '#ffffff', glow: 'rgba(255,59,48,0.6)' },
    bloccato:    { fill: 'rgba(255,149,0,0.85)',  stroke: '#ff9500', text: '#ffffff', glow: 'rgba(255,149,0,0.6)' },
    selezionato: { fill: 'rgba(52,199,89,0.9)',   stroke: '#34c759', text: '#ffffff', glow: 'rgba(52,199,89,0.8)' },
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ height: '54px' }} />

      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <h1 className="text-2xl font-black" style={{ color: '#c9a84c' }}>
          Prenota Ombrellone
        </h1>
        <p style={{ color: '#666', fontSize: '0.8rem' }}>
          Tocca gli ombrelloni sulla mappa per selezionarli
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Data */}
        <div className="rounded-2xl p-4"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <label className="block text-sm font-bold mb-2" style={{ color: '#c9a84c' }}>
            📅 Seleziona la data
          </label>
          <input
            type="date"
            value={data}
            min={oggi}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-4 py-3 rounded-xl font-semibold"
            style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#e8e8e8' }}
          />
        </div>

        {/* Legenda */}
        <div className="flex gap-3 flex-wrap px-1">
          {Object.entries(COLORI_STATO).map(([stato, c]) => (
            <div key={stato} className="flex items-center gap-1.5">
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%',
                backgroundColor: c.fill, border: `2px solid ${c.stroke}`,
              }} />
              <span style={{ fontSize: '0.68rem', color: '#666', fontWeight: 600 }}>
                {stato.charAt(0).toUpperCase() + stato.slice(1)}
              </span>
            </div>
          ))}
        </div>

        {/* MAPPA CON FOTO REALE */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid #2a2a2a', position: 'relative' }}>

          {loadingMap ? (
            <div className="flex items-center justify-center"
              style={{ height: '400px', backgroundColor: '#1a1a1a' }}>
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
                  style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
                <p style={{ color: '#555', fontSize: '0.8rem' }}>Caricamento mappa...</p>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%' }}>
              {/* Foto reale del lido */}
              <img
                src="/sfondo_gate1.png"
                alt="Lido Arcobaleno Gate 1"
                style={{
                  width: '100%',
                  display: 'block',
                  opacity: 0.85,
                }}
              />

              {/* Overlay scuro per leggibilità */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)',
                pointerEvents: 'none',
              }} />

              {/* Ombrelloni interattivi sovrapposti */}
              <svg
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {OMBRELLONI_LAYOUT.map((layout) => {
                  const stato = getStatoOmbrellone(layout.codice);
                  const c = COLORI_STATO[stato as keyof typeof COLORI_STATO] || COLORI_STATO.disponibile;
                  const isSelezionabile = stato !== 'occupato' && stato !== 'bloccato';
                  const isSelezionato = stato === 'selezionato';
                  const isDisponibile = stato === 'disponibile';
                  const { x, y } = layout;

                  return (
                    <g
                      key={layout.codice}
                      onClick={() => handleClickOmbrellone(layout.codice)}
                      onMouseEnter={() => {
                        const dbOm = getOmbrelloneDB(layout.codice);
                        if (dbOm) setTooltip({ codice: layout.codice, prezzo: dbOm.prezzo, stato });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{ cursor: isSelezionabile ? 'pointer' : 'not-allowed' }}
                    >
                      {/* Glow effect */}
                      {(isSelezionato || !isDisponibile) && (
                        <circle
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill={c.glow}
                          opacity="0.3"
                          style={{ filter: 'blur(1px)' }}
                        />
                      )}

                      {/* Cerchio principale ombrellone */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelezionato ? "3" : "2.5"}
                        fill={c.fill}
                        stroke={c.stroke}
                        strokeWidth={isSelezionato ? "0.8" : "0.5"}
                        style={{
                          transition: 'all 0.3s ease',
                          filter: isSelezionato ? `drop-shadow(0 0 2px ${c.stroke})` : 'none',
                        }}
                      />

                      {/* Icona ombrellone dentro il cerchio */}
                      {isDisponibile ? (
                        /* Chiuso — linea verticale */
                        <line
                          x1={x} y1={y - 1.5}
                          x2={x} y2={y + 1.5}
                          stroke={c.stroke}
                          strokeWidth="0.6"
                          strokeLinecap="round"
                        />
                      ) : isSelezionato ? (
                        /* Selezionato — checkmark */
                        <path
                          d={`M ${x - 1.2} ${y} L ${x - 0.3} ${y + 0.9} L ${x + 1.2} ${y - 0.8}`}
                          fill="none"
                          stroke="white"
                          strokeWidth="0.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : stato === 'occupato' ? (
                        /* Occupato — X */
                        <>
                          <line x1={x - 1} y1={y - 1} x2={x + 1} y2={y + 1}
                            stroke="white" strokeWidth="0.6" strokeLinecap="round" />
                          <line x1={x + 1} y1={y - 1} x2={x - 1} y2={y + 1}
                            stroke="white" strokeWidth="0.6" strokeLinecap="round" />
                        </>
                      ) : (
                        /* Bloccato — orologio */
                        <circle cx={x} cy={y} r="1"
                          fill="none" stroke="white" strokeWidth="0.4" />
                      )}

                      {/* Codice ombrellone */}
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fontSize="1.6"
                        fontWeight="bold"
                        fill={c.stroke}
                        fontFamily="sans-serif"
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                          paintOrder: 'stroke',
                          stroke: 'rgba(0,0,0,0.6)',
                          strokeWidth: '0.4px',
                        }}
                      >
                        {layout.codice}
                      </text>

                      {/* Anello pulsante per selezionato */}
                      {isSelezionato && (
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="none"
                          stroke={c.stroke}
                          strokeWidth="0.5"
                          strokeDasharray="1.5,1"
                          style={{ animation: 'spinEllipse 3s linear infinite' }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Label zone */}
              <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                {['A', 'B', 'C', 'D'].map((zona, i) => (
                  <div key={zona} style={{
                    display: 'inline-block',
                    marginRight: '6px',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#c9a84c',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(201,168,76,0.3)',
                  }}>
                    Zona {zona}
                  </div>
                ))}
              </div>

              {/* Tooltip */}
              {tooltip && (
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  color: '#c9a84c',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid rgba(201,168,76,0.3)',
                  backdropFilter: 'blur(8px)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}>
                  {tooltip.codice} — €{tooltip.prezzo?.toFixed(2)}/giorno — {tooltip.stato}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ombrelloni selezionati */}
        {selezionati.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(52,199,89,0.3)' }}>
            <div className="px-4 py-3"
              style={{ backgroundColor: 'rgba(52,199,89,0.1)', borderBottom: '1px solid rgba(52,199,89,0.2)' }}>
              <p className="font-bold text-sm" style={{ color: '#34c759' }}>
                ✅ {selezionati.length} ombrellone{selezionati.length > 1 ? 'i' : ''} selezionato{selezionati.length > 1 ? 'i' : ''}
              </p>
            </div>

            {selezionati.map((s) => (
              <div key={s.ombrellone.id}
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
                <div>
                  <p className="font-bold" style={{ color: '#e8e8e8' }}>
                    ⛱️ Ombrellone {s.ombrellone.codice} — Zona {s.ombrellone.zona}
                  </p>
                  <p style={{ color: '#c9a84c', fontSize: '0.8rem', fontWeight: 600 }}>
                    €{calcolaPrezzoOmbrellone(s).toFixed(2)}
                    {s.lettini > 2 && (
                      <span style={{ color: '#888', fontSize: '0.72rem' }}>
                        {' '}(+€{((s.lettini - 2) * PREZZO_LETTINO_EXTRA).toFixed(2)} lettino extra)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span style={{ color: '#666', fontSize: '0.75rem' }}>🛏️</span>
                  <button
                    onClick={() => cambiaLettini(s.ombrellone.id, -1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                    style={{ backgroundColor: '#2a2a2a', color: '#888', fontSize: '1rem' }}>
                    −
                  </button>
                  <span className="w-5 text-center font-black" style={{ color: '#e8e8e8' }}>
                    {s.lettini}
                  </span>
                  <button
                    onClick={() => cambiaLettini(s.ombrellone.id, 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                    style={{ backgroundColor: '#c9a84c', color: '#0a0a0a', fontSize: '1rem' }}>
                    +
                  </button>
                  <button
                    onClick={() => setSelezionati(selezionati.filter((x) => x.ombrellone.id !== s.ombrellone.id))}
                    style={{ color: '#ef4444', fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px' }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <div className="px-4 py-3 flex justify-between items-center"
              style={{ backgroundColor: '#1a1a1a' }}>
              <span className="font-bold" style={{ color: '#888' }}>Totale</span>
              <span className="text-xl font-black" style={{ color: '#c9a84c' }}>
                €{calcolaTotale().toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="rounded-2xl p-5 space-y-3"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <h2 className="font-bold" style={{ color: '#c9a84c' }}>Dati prenotazione</h2>
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#888' }}>
              Nome e cognome <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Mario Rossi"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#e8e8e8' }}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#888' }}>
              Email <span style={{ color: '#555', fontSize: '0.75rem' }}>(per conferma)</span>
            </label>
            <input
              type="email"
              placeholder="mario@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#e8e8e8' }}
            />
          </div>
        </div>

        {errore && (
          <div className="p-3 rounded-xl text-sm text-center"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            ⚠️ {errore}
          </div>
        )}

        <button
          onClick={handlePrenota}
          disabled={loading || selezionati.length === 0}
          className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
          style={{
            backgroundColor: selezionati.length === 0 ? '#2a2a2a' : '#c9a84c',
            color: selezionati.length === 0 ? '#555' : '#0a0a0a',
          }}>
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#0a0a0a', borderTopColor: 'transparent' }} />
              <span>Attendere...</span>
            </>
          ) : (
            <>🔒 {selezionati.length === 0
              ? 'Seleziona un ombrellone'
              : `Prenota ${selezionati.length} ombrellone${selezionati.length > 1 ? 'i' : ''} — €${calcolaTotale().toFixed(2)}`
            }</>
          )}
        </button>

        <p className="text-center text-xs pb-4" style={{ color: '#444' }}>
          Il posto verrà bloccato per 10 minuti durante il pagamento.
        </p>
      </div>

      <style>{`
        @keyframes spinEllipse {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </div>
  );
}