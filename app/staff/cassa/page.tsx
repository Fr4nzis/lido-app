'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Ombrellone, Prenotazione } from '@/types';

export default function StaffCassaPage() {
  const router = useRouter();
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);
  const [ombrelloni, setOmbrelloni] = useState<Ombrellone[]>([]);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [selezionato, setSelezionato] = useState<Ombrellone | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [tab, setTab] = useState<'mappa' | 'lista'>('mappa');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [successo, setSuccesso] = useState('');
  const [errore, setErrore] = useState('');

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
  }, [data]);

  async function caricaDati() {
    setLoadingMap(true);
    try {
      const res = await fetch(`/api/disponibilita?data=${data}`);
      const json = await res.json();
      setOmbrelloni(json.ombrelloni);

      const { data: pren, error: prenError } = await supabase
  .from('prenotazioni')
  .select(`
    *,
    ombrelloni (
      codice,
      zona
    )
  `)
  .eq('data', data)
  .in('stato', ['prenotato', 'bloccato'])
  .order('created_at', { ascending: false });

if (prenError) console.error('Errore prenotazioni:', prenError);

      if (pren) setPrenotazioni(pren as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMap(false);
    }
  }

  async function handlePrenotaManuale() {
    if (!selezionato) return;
    if (!nome.trim()) { setErrore('Inserisci il nome del cliente.'); return; }
    setErrore('');
    setLoading(true);

    try {
      // Crea prenotazione direttamente come "prenotato" senza pagamento
      const supabaseAdmin = (await import('@/lib/supabase')).supabase;

      const { data: ombrellone } = await supabaseAdmin
        .from('ombrelloni')
        .select('prezzo')
        .eq('id', selezionato.id)
        .single();

      const { error } = await supabaseAdmin
        .from('prenotazioni')
        .insert({
          ombrellone_id: selezionato.id,
          data,
          nome_cliente: nome,
          email_cliente: email || null,
          stato: 'prenotato',
          totale: ombrellone?.prezzo ?? 0,
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

  const COLORI: Record<string, { fill: string; stroke: string; text: string }> = {
    disponibile: { fill: '#1a1a1a', stroke: '#c9a84c', text: '#c9a84c' },
    occupato:    { fill: '#3a0a0a', stroke: '#ef4444', text: '#ef4444' },
    bloccato:    { fill: '#3a2a00', stroke: '#f59e0b', text: '#f59e0b' },
    selezionato: { fill: '#1a2a1a', stroke: '#16a34a', text: '#16a34a' },
  };

  const getStato = (o: Ombrellone) => {
    if (selezionato?.id === o.id) return 'selezionato';
    return o.stato ?? 'disponibile';
  };

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
          <p style={{ color: '#666', fontSize: '0.75rem' }}>
            Prenotazioni lettini
          </p>
        </div>
        <button onClick={handleLogout}
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ backgroundColor: '#2a2a2a', color: '#888' }}>
          Esci
        </button>
      </div>

      {/* Seleziona data */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <input
          type="date"
          value={data}
          min={oggi}
          onChange={(e) => { setData(e.target.value); setSelezionato(null); }}
          className="w-full px-4 py-2.5 rounded-xl font-semibold"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#c9a84c' }}
        />
      </div>

      {/* Tab mappa / lista */}
      <div className="flex px-5 py-3 gap-2"
        style={{ borderBottom: '1px solid #2a2a2a' }}>
        <button
          onClick={() => setTab('mappa')}
          className="flex-1 py-2 rounded-xl text-sm font-bold"
          style={{
            backgroundColor: tab === 'mappa' ? '#c9a84c' : '#1a1a1a',
            color: tab === 'mappa' ? '#0a0a0a' : '#666',
          }}>
          🗺️ Mappa
        </button>
        <button
          onClick={() => setTab('lista')}
          className="flex-1 py-2 rounded-xl text-sm font-bold"
          style={{
            backgroundColor: tab === 'lista' ? '#c9a84c' : '#1a1a1a',
            color: tab === 'lista' ? '#0a0a0a' : '#666',
          }}>
          📋 Lista prenotazioni
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
        <div className="px-5 py-4 space-y-4">

          {/* Legenda */}
          <div className="flex gap-4 flex-wrap">
            {Object.entries(COLORI).map(([stato, c]) => (
              <div key={stato} className="flex items-center gap-1.5 text-xs" style={{ color: '#888' }}>
                <div className="w-4 h-4 rounded-sm border"
                  style={{ backgroundColor: c.fill, borderColor: c.stroke }} />
                <span className="capitalize">{stato}</span>
              </div>
            ))}
          </div>

          {/* Mappa SVG */}
          {loadingMap ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#111', border: '1px solid #2a2a2a' }}>
              <div className="py-1.5 text-center text-xs font-bold tracking-widest"
                style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
                🌊 MARE
              </div>
              <svg viewBox="0 0 100 100" className="w-full" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#111" />
                {ombrelloni.map((o) => {
                  const stato = getStato(o);
                  const c = COLORI[stato] || COLORI.disponibile;
                  const isSelezionabile = stato !== 'occupato' && stato !== 'bloccato';
                  return (
                    <g key={o.id}
                      onClick={() => {
                        if (!isSelezionabile) return;
                        setSelezionato(o);
                        setShowForm(true);
                        setErrore('');
                      }}
                      style={{ cursor: isSelezionabile ? 'pointer' : 'not-allowed' }}>
                      <line x1={o.x} y1={o.y - 2} x2={o.x} y2={o.y + 3.5}
                        stroke={c.stroke} strokeWidth="0.8" />
                      <rect x={o.x - 3.5} y={o.y + 2.5} width="3" height="1.5"
                        rx="0.5" fill={c.fill} stroke={c.stroke} strokeWidth="0.3" />
                      <rect x={o.x + 0.5} y={o.y + 2.5} width="3" height="1.5"
                        rx="0.5" fill={c.fill} stroke={c.stroke} strokeWidth="0.3" />
                      <ellipse cx={o.x} cy={o.y - 1.5} rx="4" ry="2.5"
                        fill={c.fill} stroke={c.stroke} strokeWidth="0.6" />
                      <text x={o.x} y={o.y - 1} textAnchor="middle"
                        fontSize="1.8" fontWeight="bold" fill={c.text}>
                        {o.codice}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Form prenotazione manuale */}
          {showForm && selezionato && (
            <div className="rounded-2xl p-5 space-y-3"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,168,76,0.3)' }}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold" style={{ color: '#c9a84c' }}>
                  ⛱️ Ombrellone {selezionato.codice}
                </h2>
                <span className="font-black" style={{ color: '#c9a84c' }}>
                  €{selezionato.prezzo.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: '#888' }}>
                  Nome cliente <span style={{ color: '#ef4444' }}>*</span>
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
                  Email <span style={{ color: '#555', fontSize: '0.75rem' }}>(facoltativo)</span>
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

              <div className="p-3 rounded-xl text-sm"
                style={{ backgroundColor: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c' }}>
                💡 Prenotazione manuale — il cliente pagherà fisicamente alla cassa
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowForm(false); setSelezionato(null); setErrore(''); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: '#2a2a2a', color: '#888' }}>
                  Annulla
                </button>
                <button
                  onClick={handlePrenotaManuale}
                  disabled={loading}
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
                    style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                    ✅ Prenotato
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}