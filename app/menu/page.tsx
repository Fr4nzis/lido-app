'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCarrelloStore } from '@/lib/store';
import type { Prodotto, Categoria } from '@/types';

const CATEGORIE = [
  { id: 'bar' as Categoria,      label: 'Bar',      emoji: '☕', color: '#c9a84c' },
  { id: 'cucina' as Categoria,   label: 'Cucina',   emoji: '🍽️', color: '#f97316' },
  { id: 'cocktail' as Categoria, label: 'Cocktail', emoji: '🍹', color: '#8b5cf6' },
  { id: 'snack' as Categoria,    label: 'Snack',    emoji: '🍟', color: '#ef4444' },
];

const GUSTI_GRANITA = [
  { nome: 'Limone', emoji: '🍋' },
  { nome: 'Fragola', emoji: '🍓' },
  { nome: 'Pesca', emoji: '🍑' },
  { nome: 'Mandorla', emoji: '🌰' },
  { nome: 'Caffè', emoji: '☕' },
  { nome: 'Menta', emoji: '🌿' },
  { nome: 'Anguria', emoji: '🍉' },
  { nome: 'Mango', emoji: '🥭' },
  { nome: 'Cocco', emoji: '🥥' },
  { nome: 'Lampone', emoji: '🫐' },
];

const ALLERGENI_EMOJI: Record<string, string> = {
  glutine: '🌾',
  lattosio: '🥛',
  uova: '🥚',
  latte: '🥛',
  pesce: '🐟',
  molluschi: '🦑',
  crostacei: '🦐',
  soia: '🫘',
  sesamo: '🌱',
  solfiti: '🍷',
  arachidi: '🥜',
  fruttasecca: '🌰',
};

const EMOJI_PRODOTTI: Record<string, string> = {
  'Acqua Naturale': '💧',
  'Acqua Frizzante': '💧',
  'Coca Cola': '🥤',
  'Succo di Frutta': '🧃',
  'Birra': '🍺',
  'Caffè': '☕',
  'Granita': '🧊',
  'Toast': '🥪',
  'Piadina': '🌯',
  'Focaccia': '🫓',
  'Insalata di Mare': '🦑',
  'Poke Bowl': '🍱',
  'Hot Dog': '🌭',
  'Spritz': '🍊',
  'Mojito': '🌿',
  'Gin Tonic': '🫧',
  'Sex on the Beach': '🏖️',
  'Pina Colada': '🥥',
  'Virgin Mojito': '🥤',
  'Patatine': '🍟',
  'Nachos': '🌽',
  'Bruschette': '🍅',
};

export default function MenuPage() {
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [categoriaAttiva, setCategoriaAttiva] = useState<Categoria>('bar');
  const [loading, setLoading] = useState(true);
  const [dettaglio, setDettaglio] = useState<Prodotto | null>(null);
  const [gustoSelezionato, setGustoSelezionato] = useState('Limone');
  const { items, aggiungi, aumentaQty, diminuisciQty } = useCarrelloStore();

  useEffect(() => {
    async function caricaProdotti() {
      try {
        const { data, error } = await supabase
          .from('prodotti')
          .select('*')
          .eq('disponibile', true)
          .order('ordinamento');
        if (error) throw error;
        if (data) setProdotti(data);
      } catch (err) {
        console.error('Errore caricamento prodotti:', err);
      } finally {
        setLoading(false);
      }
    }
    caricaProdotti();
  }, []);

  const prodottiFiltrati = prodotti.filter((p) => p.categoria === categoriaAttiva);
  const getQty = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;
  const isGranita = (nome: string) => nome.toLowerCase().includes('granita');
  const catAttiva = CATEGORIE.find((c) => c.id === categoriaAttiva);

  function handleAggiungi(prodotto: Prodotto) {
    if (isGranita(prodotto.nome)) {
      setDettaglio(prodotto);
    } else {
      aggiungi(prodotto);
    }
  }

  function aggiungiGranita() {
    if (!dettaglio) return;
    aggiungi({ ...dettaglio, nome: `Granita ${gustoSelezionato}` });
    setDettaglio(null);
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ height: '54px' }} />

      {/* Header */}
      <div className="sticky z-20" style={{ top: '54px', backgroundColor: '#0a0a0a', borderBottom: '1px solid #2a2a2a' }}>
        <div className="px-5 py-3">
          <h1 className="text-2xl font-black" style={{ color: '#c9a84c' }}>Menu</h1>
          <p style={{ color: '#666', fontSize: '0.8rem' }}>Ordina direttamente dal lettino</p>
        </div>

        {/* Tabs categorie */}
        <div className="flex overflow-x-auto px-5 pb-3 gap-2" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIE.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAttiva(cat.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                backgroundColor: categoriaAttiva === cat.id ? cat.color : '#1a1a1a',
                color: categoriaAttiva === cat.id ? '#0a0a0a' : '#666',
                border: categoriaAttiva === cat.id ? 'none' : '1px solid #2a2a2a',
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista prodotti */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
              style={{ backgroundColor: '#1a1a1a', height: '100px' }} />
          ))
        ) : prodottiFiltrati.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">😴</div>
            <p style={{ color: '#555' }}>Nessun prodotto disponibile</p>
          </div>
        ) : (
          prodottiFiltrati.map((prodotto) => {
            const qty = getQty(prodotto.id);
            const emoji = EMOJI_PRODOTTI[prodotto.nome] || catAttiva?.emoji || '🍽️';

            return (
              <div
                key={prodotto.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#1a1a1a',
                  border: qty > 0 ? `1px solid ${catAttiva?.color}` : '1px solid #2a2a2a',
                  boxShadow: qty > 0 ? `0 0 12px ${catAttiva?.color}30` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div className="flex gap-0">
                  {/* Immagine/emoji prodotto */}
                  <button
                    onClick={() => setDettaglio(prodotto)}
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: '90px',
                      height: '90px',
                      background: prodotto.immagine_url
                        ? 'none'
                        : `linear-gradient(135deg, rgba(${catAttiva?.color === '#c9a84c' ? '201,168,76' : catAttiva?.color === '#f97316' ? '249,115,22' : catAttiva?.color === '#8b5cf6' ? '139,92,246' : '239,68,68'},0.15), rgba(${catAttiva?.color === '#c9a84c' ? '201,168,76' : catAttiva?.color === '#f97316' ? '249,115,22' : catAttiva?.color === '#8b5cf6' ? '139,92,246' : '239,68,68'},0.05))`,
                      fontSize: '2.5rem',
                    }}
                  >
                    {prodotto.immagine_url ? (
                      <img
                        src={prodotto.immagine_url}
                        alt={prodotto.nome}
                        style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                      />
                    ) : (
                      emoji
                    )}
                  </button>

                  {/* Info prodotto */}
                  <div className="flex-1 p-3 min-w-0">
                    <button onClick={() => setDettaglio(prodotto)} className="text-left w-full">
                      <h3 className="font-bold truncate" style={{ color: '#e8e8e8', fontSize: '0.95rem' }}>
                        {prodotto.nome}
                      </h3>
                      {prodotto.descrizione && (
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#666' }}>
                          {prodotto.descrizione}
                        </p>
                      )}
                      {/* Allergeni preview */}
                      {prodotto.allergeni && prodotto.allergeni.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {prodotto.allergeni.slice(0, 3).map((a) => (
                            <span key={a} style={{ fontSize: '0.7rem' }}>
                              {ALLERGENI_EMOJI[a] || '⚠️'}
                            </span>
                          ))}
                          {prodotto.allergeni.length > 3 && (
                            <span style={{ fontSize: '0.65rem', color: '#555' }}>
                              +{prodotto.allergeni.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-black" style={{ color: catAttiva?.color || '#c9a84c', fontSize: '1.1rem' }}>
                        €{prodotto.prezzo.toFixed(2)}
                      </span>

                      {qty === 0 ? (
                        <button
                          onClick={() => handleAggiungi(prodotto)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold"
                          style={{ backgroundColor: catAttiva?.color || '#c9a84c', color: '#0a0a0a' }}
                        >
                          + Aggiungi
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${catAttiva?.color}20` }}>
                          <button
                            onClick={() => diminuisciQty(prodotto.id)}
                            className="w-6 h-6 rounded-full flex items-center justify-center font-bold"
                            style={{ backgroundColor: catAttiva?.color || '#c9a84c', color: '#0a0a0a', fontSize: '1rem' }}
                          >−</button>
                          <span className="font-bold w-4 text-center" style={{ color: catAttiva?.color || '#c9a84c' }}>
                            {qty}
                          </span>
                          <button
                            onClick={() => aumentaQty(prodotto.id)}
                            className="w-6 h-6 rounded-full flex items-center justify-center font-bold"
                            style={{ backgroundColor: catAttiva?.color || '#c9a84c', color: '#0a0a0a', fontSize: '1rem' }}
                          >+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal dettaglio prodotto */}
      {dettaglio && (
        <div
          className="fixed inset-0 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100 }}
          onClick={() => setDettaglio(null)}
        >
          <div
            className="w-full rounded-t-3xl"
            style={{
              backgroundColor: '#1a1a1a',
              maxWidth: '480px',
              maxHeight: '85vh',
              overflowY: 'auto',
              paddingBottom: '100px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex flex-col items-center pt-4 pb-2 cursor-pointer"
              onClick={() => setDettaglio(null)}>
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#333' }} />
              <p style={{ color: '#555', fontSize: '0.7rem', marginTop: '4px' }}>chiudi</p>
            </div>

            {/* Immagine grande */}
            <div className="mx-4 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                height: '160px',
                background: dettaglio.immagine_url ? 'none' : `linear-gradient(135deg, #2a2a2a, #1a1a1a)`,
                fontSize: '5rem',
              }}>
              {dettaglio.immagine_url ? (
                <img src={dettaglio.immagine_url} alt={dettaglio.nome}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                EMOJI_PRODOTTI[dettaglio.nome] || '🍽️'
              )}
            </div>

            <div className="px-5 pt-4 pb-2">
              {/* Nome e prezzo */}
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-black" style={{ color: '#c9a84c', flex: 1 }}>
                  {dettaglio.nome}
                </h2>
                <span className="text-2xl font-black ml-3" style={{ color: '#c9a84c' }}>
                  €{dettaglio.prezzo.toFixed(2)}
                </span>
              </div>

              {/* Descrizione */}
              {dettaglio.descrizione && (
                <p className="text-sm mb-4" style={{ color: '#888', lineHeight: 1.5 }}>
                  {dettaglio.descrizione}
                </p>
              )}

              {/* Allergeni */}
              {dettaglio.allergeni && dettaglio.allergeni.length > 0 && (
                <div className="mb-4 p-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: '#ef4444' }}>
                    ⚠️ Allergeni:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dettaglio.allergeni.map((a) => (
                      <span key={a} className="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                        style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {ALLERGENI_EMOJI[a] || '⚠️'} {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gusti granita */}
              {isGranita(dettaglio.nome) && (
                <div className="mb-4">
                  <p className="text-sm font-bold mb-3" style={{ color: '#c9a84c' }}>
                    🧊 Scegli il gusto:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {GUSTI_GRANITA.map((gusto) => (
                      <button
                        key={gusto.nome}
                        onClick={() => setGustoSelezionato(gusto.nome)}
                        className="px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                        style={{
                          backgroundColor: gustoSelezionato === gusto.nome ? '#c9a84c' : '#2a2a2a',
                          color: gustoSelezionato === gusto.nome ? '#0a0a0a' : '#888',
                          border: gustoSelezionato === gusto.nome ? 'none' : '1px solid #333',
                        }}
                      >
                        <span>{gusto.emoji}</span>
                        <span>{gusto.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pulsante aggiungi */}
              <button
                onClick={isGranita(dettaglio.nome) ? aggiungiGranita : () => { aggiungi(dettaglio); setDettaglio(null); }}
                className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                style={{ backgroundColor: '#c9a84c', color: '#0a0a0a' }}
              >
                <span>🛒</span>
                <span>
                  {isGranita(dettaglio.nome)
                    ? `Aggiungi Granita ${gustoSelezionato}`
                    : `Aggiungi al carrello`
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}