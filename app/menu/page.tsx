'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCarrelloStore } from '@/lib/store';
import type { Prodotto, Categoria } from '@/types';

const CATEGORIE = [
  { id: 'bar' as Categoria,      label: 'Bar',      emoji: '☕' },
  { id: 'cucina' as Categoria,   label: 'Cucina',   emoji: '🍽️' },
  { id: 'cocktail' as Categoria, label: 'Cocktail', emoji: '🍹' },
  { id: 'snack' as Categoria,    label: 'Snack',    emoji: '🍟' },
];

export default function MenuPage() {
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [categoriaAttiva, setCategoriaAttiva] = useState<Categoria>('bar');
  const [loading, setLoading] = useState(true);
  const { items, aggiungi, aumentaQty, diminuisciQty } = useCarrelloStore();

  useEffect(() => {
    async function caricaProdotti() {
      const { data, error } = await supabase
        .from('prodotti')
        .select('*')
        .eq('disponibile', true)
        .order('ordinamento');
      if (!error && data) setProdotti(data);
      setLoading(false);
    }
    caricaProdotti();
  }, []);

  const prodottiFiltrati = prodotti.filter((p) => p.categoria === categoriaAttiva);
  const getQty = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="px-5 py-4">
          <h1 className="text-2xl font-black text-gray-800">Menu</h1>
          <p className="text-gray-500 text-sm">Ordina direttamente dal lettino</p>
        </div>
        <div className="flex overflow-x-auto px-5 pb-3 gap-2">
          {CATEGORIE.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAttiva(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                categoriaAttiva === cat.id
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            </div>
          ))
        ) : prodottiFiltrati.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">😴</div>
            <p>Nessun prodotto in questa categoria</p>
          </div>
        ) : (
          prodottiFiltrati.map((prodotto) => {
            const qty = getQty(prodotto.id);
            return (
              <div key={prodotto.id} className="card p-4">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-3xl">
                    {CATEGORIE.find((c) => c.id === prodotto.categoria)?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{prodotto.nome}</h3>
                    {prodotto.descrizione && (
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{prodotto.descrizione}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sky-600 font-bold text-lg">
                        €{prodotto.prezzo.toFixed(2)}
                      </span>
                      {qty === 0 ? (
                        <button
                          onClick={() => aggiungi(prodotto)}
                          className="bg-sky-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold active:scale-95 transition-transform"
                        >
                          + Aggiungi
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 bg-sky-50 rounded-full px-2 py-1">
                          <button
                            onClick={() => diminuisciQty(prodotto.id)}
                            className="w-7 h-7 bg-sky-500 text-white rounded-full text-lg font-bold flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="text-sky-700 font-bold w-4 text-center">{qty}</span>
                          <button
                            onClick={() => aumentaQty(prodotto.id)}
                            className="w-7 h-7 bg-sky-500 text-white rounded-full text-lg font-bold flex items-center justify-center"
                          >
                            +
                          </button>
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
    </div>
  );
}