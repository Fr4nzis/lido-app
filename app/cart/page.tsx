'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCarrelloStore } from '@/lib/store';

const LETTINI = [
  'A1','A2','A3','A4','A5','A6',
  'B1','B2','B3','B4','B5','B6',
  'C1','C2','C3','C4','C5','C6',
  'D1','D2','D3','D4','D5','D6',
  'E1','E2','E3','E4','E5','E6',
];

export default function CartPage() {
  const {
    items, totale, totaleItems,
    aumentaQty, diminuisciQty,
    lettino, nomeCliente, modalita,
    setLettino, setNomeCliente, setModalita,
  } = useCarrelloStore();

  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700">Carrello vuoto</h2>
        <p className="text-gray-400 mt-2">Aggiungi qualcosa dal menu!</p>
        <Link href="/menu" className="btn-primary mt-6 inline-block">
          Vai al menu
        </Link>
      </div>
    );
  }

  async function handleCheckout() {
    setErrore('');
    if (!lettino) {
      setErrore('Seleziona il numero del tuo lettino per continuare.');
      return;
    }
    setLoading(true);
    try {
      const ordineRes = await fetch('/api/ordini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lettino,
          nome_cliente: nomeCliente || null,
          prodotti: items.map((i) => ({
            id: i.id,
            nome: i.nome,
            qty: i.qty,
            prezzo_unitario: i.prezzo,
          })),
          totale: totale(),
          modalita,
        }),
      });
      if (!ordineRes.ok) throw new Error('Errore nella creazione ordine');
      const { ordine_id } = await ordineRes.json();

      const stripeRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'ordine',
          riferimento_id: ordine_id,
          items: items.map((i) => ({
            nome: i.nome,
            prezzo: i.prezzo,
            qty: i.qty,
          })),
        }),
      });
      if (!stripeRes.ok) throw new Error('Errore Stripe');
      const { url } = await stripeRes.json();
      window.location.href = url;
    } catch (err) {
      setErrore('Si è verificato un errore. Riprova.');
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <Link href="/menu" className="text-gray-400 text-2xl">←</Link>
        <div>
          <h1 className="text-xl font-black text-gray-800">Il tuo ordine</h1>
          <p className="text-gray-500 text-sm">{totaleItems()} prodotti selezionati</p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="card divide-y divide-gray-50">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{item.nome}</p>
                <p className="text-sky-600 font-medium text-sm">
                  €{(item.prezzo * item.qty).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => diminuisciQty(item.id)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-600"
                >
                  −
                </button>
                <span className="w-5 text-center font-bold text-gray-800">{item.qty}</span>
                <button
                  onClick={() => aumentaQty(item.id)}
                  className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-lg font-bold text-white"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-800 text-lg">Dettagli ordine</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numero lettino <span className="text-red-500">*</span>
            </label>
            <select
              value={lettino}
              onChange={(e) => setLettino(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">— Seleziona il tuo lettino —</option>
              {LETTINI.map((l) => (
                <option key={l} value={l}>Lettino {l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome <span className="text-gray-400 text-xs">(facoltativo)</span>
            </label>
            <input
              type="text"
              placeholder="Il tuo nome"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modalità consegna
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'lettino', label: 'Al lettino', emoji: '🏖️' },
                { id: 'bancone', label: 'Al bancone', emoji: '🏪' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setModalita(opt.id as 'lettino' | 'bancone')}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                    modalita === opt.id
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex justify-between items-center text-gray-600 text-sm mb-2">
            <span>Subtotale ({totaleItems()} prodotti)</span>
            <span>€{totale().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 text-sm mb-3">
            <span>Servizio al lettino</span>
            <span className="text-green-600">Gratis</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Totale</span>
            <span className="text-2xl font-black text-sky-600">€{totale().toFixed(2)}</span>
          </div>
        </div>

        {errore && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
            ⚠️ {errore}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Preparazione pagamento...</span>
            </>
          ) : (
            <>
              <span>🔒</span>
              <span>Paga €{totale().toFixed(2)}</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          Pagamento sicuro con Stripe.
        </p>
      </div>
    </div>
  );
}