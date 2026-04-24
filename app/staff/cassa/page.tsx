'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Ombrellone, Prenotazione, FasciaOraria } from '@/types';

const FASCE: { id: FasciaOraria; label: string; orario: string; emoji: string }[] = [
  { id: 'mattina',    label: 'Mattina',         orario: '08:00 - 14:00', emoji: '🌅' },
  { id: 'pomeriggio', label: 'Pomeriggio',      orario: '14:00 - 20:00', emoji: '🌤️' },
  { id: 'giornata',   label: 'Giornata intera', orario: '08:00 - 20:00', emoji: '☀️' },
];

const OMBRELLONI_LAYOUT = [
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

const COLORI_STATO = {
  disponibile: { fill: 'rgba(255,255,255,0.9)', stroke: '#c9a84c', text: '#0a0a0a', glow: 'rgba(201,168,76,0.6)' },
  occupato:    { fill: 'rgba(255,59,48,0.85)',  stroke: '#ff3b30', text: '#ffffff', glow: 'rgba(255,59,48,0.6)' },
  bloccato:    { fill: 'rgba(255,149,0,0.85)',  stroke: '#ff9500', text: '#ffffff', glow: 'rgba(255,149,0,0.6)' },
  selezionato: { fill: 'rgba(52,199,89,0.9)',   stroke: '#34c759', text: '#ffffff', glow: 'rgba(52,199,89,0.8)' },
};

export default function StaffCassaPage() {
  const router = useRouter();
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);
  const [fascia, setFascia] = useState<FasciaOraria>('giornata');
  const [ombrelloni, setOmbrelloni] = useState<Ombrellone[]>([]);
  const [prenotazioni, setPrenotazioni] = useState<any[]>([]);
  const [selezionato, setSelezionato] = useState<Ombrellone | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [tab, setTab] = useState<'mappa' | 'lista'>('mappa');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [successo, setSuccesso] = useState('');
  const [errore, setErrore] = useState('');
  const [tooltip, setTooltip] = useState<{ codice: string; prezzo: number; stato: string } | null>(null);

  useEffect(() => {
    const ruolo = sessionStorage.getItem('staff_ruolo');
    if (ruolo !== 'cassa') {
      router.push('/staff/login');
      return;
    }
    caricaDati();
  }, [router]);

  useEffect(() => {
    caricaDati();
  }, [data, fascia]);

  async function caricaDati() {
    setLoadingMap(true);
    try {
      const res = await fetch(`/api/disponibilita?data=${data}&fascia=${fascia}`);
      const json = await res.json();
      setOmbrelloni(json.ombrelloni);

      const { data: pren } = await supabase
        .from('prenotazioni')
        .select(`*, ombrelloni(codice, zona)`)
        .eq('data', data)
        .in('stato', ['prenotato', 'bloccato'])
        .order('created_at', { ascending: false });

      if (pren) setPrenotazioni(pren);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMap(false);
    }
  }

  function getStatoOmbrellone(codice: string) {
    if (selezionato?.codice === codice) return 'selezionato';
    const dbOm = ombrelloni.find((o) => o.codice === codice);
    return dbOm?.stato ?? 'disponibile';
  }

  function getPrezzoFascia(o: Ombrellone) {
    if (fascia === 'mattina') return o.prezzo_mattina || o.prezzo;
    if (fascia === 'pomeriggio') return o.prezzo_pomeriggio || o.prezzo;
    return o.prezzo_giornata || o.prezzo;
  }

  function handleClickOmbrellone(codice: string) {
    const stato = getStatoOmbrellone(codice);
    if (stato === 'occupato' || stato === 'bloccato') return;
    const dbOm = ombrelloni.find((o) => o.codice === codice);
    if (!dbOm) return;
    setSelezionato(dbOm);
    setShowForm(true);
    setErrore('');
  }

  async function handlePrenotaManuale() {
    if (!selezionato) return;
    if (!nome.trim()) { setErrore('Inserisci il nome del cliente.'); return; }
    setErrore('');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('prenotazioni')
        .insert({
          ombrellone_id: selezionato.id,
          data,
          fascia,
          nome_cliente: nome,
          email_cliente: email || null,
          stato: 'prenotato',
          totale: getPrezzoFascia(selezionato),
          blocco_scade_il: null,
        });

      if (error) throw error;

      setSuccesso(`✅ Ombrellone ${selezionato.codice} prenotato per ${nome}!`);
      setSelezionato(null);
      setNome('');
      setEmail('');
      setShowForm(false);
      caricaDati();
      setTimeout(() => setSuccesso(''), 4000);
    } catch (err) {
      setErrore('Errore durante la prenotazione. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.clear();
    router.push('/staff/login');
  }

  const oggi = new Date().toISOString().split('T')[0];

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
        <div>
          <h1 className="text-lg font-black" style={{ color: '#c9a84c' }}>
            💰 Dashboard Cassa
          </h1>
          <p style={{ color: '#666', fontSize: '0.75rem' }}>Prenotazioni lettini</p>
        </div>
        <button onClick={handleLogout}
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ backgroundColor: '#2a2a2a', color: '#888' }}>
          Esci
        </button>
      </div>

      {/* Data e fascia */}
      <div className="px-5 py-3 space-y-3"
        style={{ borderBottom: '1px solid #2a2a2a', backgroundColor: '#111' }}>
        <input
          type="date" value={data} min={oggi}
          onChange={(e) => { setData(e.target.value); setSelezionato(null); }}
          className="w-full px-4 py-2.5 rounded-xl font-semibold"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#c9a84c' }}
        />
        <div className="grid grid-cols-3 gap-2">
          {FASCE.map((f) => (
            <button key={f.id} onClick={() => setFascia(f.id)}
              className="p-2 rounded-xl flex flex-col items-center gap-0.5"
              style={{
                border: fascia === f.id ? '2px solid #c9a84c' : '2px solid #2a2a2a',
                backgroundColor: fascia === f.id ? 'rgba(201,168,76,0.1)' : '#1a1a1a',
              }}>
              <span>{f.emoji}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: fascia === f.id ? '#c9a84c' : '#555' }}>
                {f.label}
              </span>
              <span style={{ fontSize: '0.55rem', color: fascia === f.id ? '#c9a84c' : '#444' }}>
                {f.orario}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab mappa / lista */}
      <div className="flex px-5 py-3 gap-2"
        style={{ borderBottom: '1px solid #2a2a2a' }}>
        <button onClick={() => setTab('mappa')}
          className="flex-1 py-2 rounded-xl text-sm font-bold"
          style={{
            backgroundColor: tab === 'mappa' ? '#c9a84c' : '#1a1a1a',
            color: tab === 'mappa' ? '#0a0a0a' : '#666',
          }}>
          🗺️ Mappa
        </button>
        <button onClick={() => setTab('lista')}
          className="flex-1 py-2 rounded-xl text-sm font-bold"
          style={{
            backgroundColor: tab === 'lista' ? '#c9a84c' : '#1a1a1a',
            color: tab === 'lista' ? '#0a0a0a' : '#666',
          }}>
          📋 Prenotazioni ({prenotazioni.filter(p => p.stato === 'prenotato').length})
        </button>
      </div>

      {/* Messaggi */}
      {successo && (
        <div className="mx-5 mt-3 p-3 rounded-xl text-sm text-center font-bold"
          style={{ backgroundColor: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', color: '#16a34a' }}>
          {successo}
        </div>
      )}
      {errore && (
        <div className="mx-5 mt-3 p-3 rounded-xl text-sm text-center"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
          ⚠️ {errore}
        </div>
      )}

      {tab === 'mappa' ? (
        <div className="px-4 py-4 space-y-4">

          {/* Legenda */}
          <div className="flex gap-3 flex-wrap">
            {Object.entries(COLORI_STATO).map(([stato, c]) => (
              <div key={stato} className="flex items-center gap-1.5">
                <div style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  backgroundColor: c.fill, border: `2px solid ${c.stroke}`,
                }} />
                <span style={{ fontSize: '0.68rem', color: '#666', fontWeight: 600 }}>
                  {stato.charAt(0).toUpperCase() + stato.slice(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Mappa identica al cliente */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid #2a2a2a', position: 'relative' }}>
            {loadingMap ? (
              <div className="flex items-center justify-center"
                style={{ height: '350px', backgroundColor: '#1a1a1a' }}>
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%' }}>
                <img src="/sfondo_gate1.png" alt="Lido Arcobaleno Gate 1"
                  style={{ width: '100%', display: 'block', opacity: 0.85 }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)',
                  pointerEvents: 'none',
                }} />

                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                  viewBox="0 0 100 100" preserveAspectRatio="none">
                  {OMBRELLONI_LAYOUT.map((layout) => {
                    const stato = getStatoOmbrellone(layout.codice);
                    const c = COLORI_STATO[stato as keyof typeof COLORI_STATO] || COLORI_STATO.disponibile;
                    const isSelezionabile = stato !== 'occupato' && stato !== 'bloccato';
                    const isSelezionato = stato === 'selezionato';
                    const { x, y } = layout;

                    return (
                      <g key={layout.codice}
                        onClick={() => handleClickOmbrellone(layout.codice)}
                        onMouseEnter={() => {
                          const dbOm = ombrelloni.find((o) => o.codice === layout.codice);
                          if (dbOm) setTooltip({ codice: layout.codice, prezzo: getPrezzoFascia(dbOm), stato });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{ cursor: isSelezionabile ? 'pointer' : 'not-allowed' }}>

                        {(isSelezionato || stato !== 'disponibile') && (
                          <circle cx={x} cy={y} r="3.5" fill={c.glow} opacity="0.3" />
                        )}

                        <circle cx={x} cy={y} r={isSelezionato ? "3" : "2.5"}
                          fill={c.fill} stroke={c.stroke}
                          strokeWidth={isSelezionato ? "0.8" : "0.5"}
                          style={{ transition: 'all 0.3s ease' }} />

                        {stato === 'disponibile' ? (
                          <line x1={x} y1={y - 1.5} x2={x} y2={y + 1.5}
                            stroke={c.stroke} strokeWidth="0.6" strokeLinecap="round" />
                        ) : isSelezionato ? (
                          <path d={`M ${x - 1.2} ${y} L ${x - 0.3} ${y + 0.9} L ${x + 1.2} ${y - 0.8}`}
                            fill="none" stroke="white" strokeWidth="0.7"
                            strokeLinecap="round" strokeLinejoin="round" />
                        ) : stato === 'occupato' ? (
                          <>
                            <line x1={x - 1} y1={y - 1} x2={x + 1} y2={y + 1}
                              stroke="white" strokeWidth="0.6" strokeLinecap="round" />
                            <line x1={x + 1} y1={y - 1} x2={x - 1} y2={y + 1}
                              stroke="white" strokeWidth="0.6" strokeLinecap="round" />
                          </>
                        ) : (
                          <circle cx={x} cy={y} r="1"
                            fill="none" stroke="white" strokeWidth="0.4" />
                        )}

                        <text x={x} y={y + 4} textAnchor="middle"
                          fontSize="1.6" fontWeight="bold" fill={c.stroke}
                          fontFamily="sans-serif"
                          style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.6)', strokeWidth: '0.4px' }}>
                          {layout.codice}
                        </text>

                        {isSelezionato && (
                          <circle cx={x} cy={y} r="4" fill="none"
                            stroke={c.stroke} strokeWidth="0.5"
                            strokeDasharray="1.5,1"
                            style={{ animation: 'spinEllipse 3s linear infinite' }} />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Label zone */}
                <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                  {['A', 'B', 'C', 'D'].map((zona) => (
                    <div key={zona} style={{
                      padding: '2px 8px', borderRadius: '20px',
                      backgroundColor: 'rgba(0,0,0,0.6)', color: '#c9a84c',
                      fontSize: '0.65rem', fontWeight: 700,
                      border: '1px solid rgba(201,168,76,0.3)',
                    }}>
                      {zona}
                    </div>
                  ))}
                </div>

                {tooltip && (
                  <div style={{
                    position: 'absolute', bottom: '12px', left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.85)', color: '#c9a84c',
                    padding: '6px 14px', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: 700,
                    border: '1px solid rgba(201,168,76,0.3)',
                    backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}>
                    {tooltip.codice} — €{tooltip.prezzo?.toFixed(2)} — {tooltip.stato}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form prenotazione manuale */}
          {showForm && selezionato && (
            <div className="rounded-2xl p-5 space-y-3"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,168,76,0.3)' }}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold" style={{ color: '#c9a84c' }}>
                  ⛱️ Ombrellone {selezionato.codice}
                  {' '}— {FASCE.find(f => f.id === fascia)?.emoji} {FASCE.find(f => f.id === fascia)?.label}
                </h2>
                <span className="font-black" style={{ color: '#c9a84c' }}>
                  €{getPrezzoFascia(selezionato).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: '#888' }}>
                  Nome cliente <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="text" placeholder="Mario Rossi" value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#e8e8e8' }} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: '#888' }}>
                  Email <span style={{ color: '#555', fontSize: '0.75rem' }}>(facoltativo)</span>
                </label>
                <input type="email" placeholder="mario@esempio.it" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#e8e8e8' }} />
              </div>

              <div className="p-3 rounded-xl text-sm"
                style={{ backgroundColor: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c' }}>
                💡 Prenotazione manuale — il cliente pagherà fisicamente alla cassa
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setShowForm(false); setSelezionato(null); setErrore(''); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: '#2a2a2a', color: '#888' }}>
                  Annulla
                </button>
                <button onClick={handlePrenotaManuale} disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: '#c9a84c', color: '#0a0a0a' }}>
                  {loading ? '...' : '✅ Conferma prenotazione'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Lista prenotazioni */
        <div className="px-5 py-4 space-y-3">
          {prenotazioni.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">📋</div>
              <p style={{ color: '#555' }}>Nessuna prenotazione per questa data</p>
            </div>
          ) : (
            prenotazioni.map((p: any) => (
              <div key={p.id} className="rounded-2xl p-4"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl font-black"
                      style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                      {p.ombrelloni?.codice || '—'}
                    </span>
                    <span style={{ color: '#888', fontSize: '0.8rem' }}>
                      Zona {p.ombrelloni?.zona}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
                      {FASCE.find(f => f.id === p.fascia)?.emoji} {FASCE.find(f => f.id === p.fascia)?.label || p.fascia}
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                    €{Number(p.totale).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold" style={{ color: '#e8e8e8' }}>
                      {p.nome_cliente || 'Cliente anonimo'}
                    </p>
                    {p.email_cliente && (
                      <p style={{ color: '#555', fontSize: '0.75rem' }}>{p.email_cliente}</p>
                    )}
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: p.stato === 'prenotato' ? 'rgba(22,163,74,0.1)' : 'rgba(255,149,0,0.1)',
                      color: p.stato === 'prenotato' ? '#16a34a' : '#ff9500',
                    }}>
                    {p.stato === 'prenotato' ? '✅ Prenotato' : '⏳ In attesa'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        @keyframes spinEllipse {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </div>
  );
}