'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCarrelloStore } from '@/lib/store';

const LETTINI = [
  'A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','A12',
  'B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12',
  'C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12',
  'C13','C14','C15','C16','C17','C18','C19','C20','C21','C22','C23','C24',
  'D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14','D15',
];

const COSTO_CONSEGNA = 0.50;

function CartPage() {
  const searchParams = useSearchParams();
  const {
    items, totale, totaleItems,
    aumentaQty, diminuisciQty,
    lettino, nomeCliente, modalita,
    setLettino, setNomeCliente, setModalita,
  } = useCarrelloStore();

  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    const cancelled = searchParams.get('cancelled');
    if (cancelled === 'true') {
      fetch('/api/ordini/cancella', { method: 'POST' });
    }
  }, [searchParams]);

  const costoConsegna = modalita === 'lettino' ? COSTO_CONSEGNA : 0;
  const totaleFinale = totale() + costoConsegna;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ backgroundColor: '#0a0a0a' }}>
        <div style={{ height: '54px' }} />
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold" style={{ color: '#c9a84c' }}>Carrello vuoto</h2>
        <p className="mt-2" style={{ color: '#666' }}>Aggiungi qualcosa dal menu!</p>
        <Link href="/menu">
          <button className="mt-6 px-8 py-3 rounded-2xl font-bold"
            style={{ backgroundColor: '#c9a84c', color: '#0a0a0a' }}>
            Vai al menu
          </button>
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
          totale: totaleFinale,
          modalita,
        }),
      });
      if (!ordineRes.ok) throw new Error('Errore ordine');
      const { ordine_id } = await ordineRes.json();

      const stripeRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'ordine',
          riferimento_id: ordine_id,
          modalita,
          items: [
            ...items.map((i) => ({
              nome: i.nome,
              prezzo: i.prezzo,
              qty: i.qty,
            })),
            ...(costoConsegna > 0 ? [{
              nome: 'Servizio consegna al lettino',
              prezzo: COSTO_CONSEGNA,
              qty: 1,
            }] : []),
          ],
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
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ height: '54px' }} />

      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid #2a2a2a' }}>
        <Link href="/menu">
          <span style={{ color: '#c9a84c', fontSize: '1.3rem' }}>←</span>
        </Link>
        <div>
          <h1 className="text-xl font-black" style={{ color: '#c9a84c' }}>Il tuo ordine</h1>
          <p style={{ color: '#666', fontSize: '0.75rem' }}>{totaleItems()} prodotti selezionati</p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Lista prodotti */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
          {items.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-3"
              style={{ borderBottom: '1px solid #1a1a1a', backgroundColor: '#1a1a1a' }}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: '#e8e8e8' }}>{item.nome}</p>
                <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                  €{(item.prezzo * item.qty).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => diminuisciQty(item.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: '#2a2a2a', color: '#888' }}>−</button>
                <span className="w-5 text-center font-bold" style={{ color: '#e8e8e8' }}>{item.qty}</span>
                <button
                  onClick={() => aumentaQty(item.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: '#c9a84c', color: '#0a0a0a' }}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-2xl p-5 space-y-4"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <h2 className="font-bold text-lg" style={{ color: '#c9a84c' }}>Dettagli ordine</h2>

          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#888' }}>
              Numero lettino <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={lettino}
              onChange={(e) => setLettino(e.target.value)}
              className="w-full px-4 py-3 rounded-xl font-semibold"
              style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#e8e8e8' }}
            >
              <option value="">— Seleziona il tuo lettino —</option>
              {LETTINI.map((l) => (
                <option key={l} value={l}>Lettino {l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#888' }}>
              Nome <span style={{ color: '#555', fontSize: '0.75rem' }}>(facoltativo)</span>
            </label>
            <input
              type="text"
              placeholder="Il tuo nome"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="w-full px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#e8e8e8' }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#888' }}>
              Modalità consegna
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'lettino', label: 'Al lettino', emoji: '🏖️', costo: '+€0.50' },
                { id: 'bancone', label: 'Al bancone', emoji: '🏪', costo: 'Gratis' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setModalita(opt.id as 'lettino' | 'bancone')}
                  className="p-3 rounded-xl flex flex-col items-center gap-1 transition-all"
                  style={{
                    border: modalita === opt.id ? '2px solid #c9a84c' : '2px solid #2a2a2a',
                    backgroundColor: modalita === opt.id ? 'rgba(201,168,76,0.1)' : '#2a2a2a',
                  }}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-sm font-bold"
                    style={{ color: modalita === opt.id ? '#c9a84c' : '#666' }}>
                    {opt.label}
                  </span>
                  <span className="text-xs"
                    style={{ color: modalita === opt.id ? '#c9a84c' : '#555' }}>
                    {opt.costo}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Totale */}
        <div className="rounded-2xl p-5"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <div className="flex justify-between text-sm mb-2" style={{ color: '#666' }}>
            <span>Subtotale ({totaleItems()} prodotti)</span>
            <span>€{totale().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-3" style={{ color: '#666' }}>
            <span>Consegna</span>
            <span style={{ color: costoConsegna === 0 ? '#16a34a' : '#c9a84c' }}>
              {costoConsegna === 0 ? 'Gratis' : `€${costoConsegna.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3"
            style={{ borderTop: '1px solid #2a2a2a' }}>
            <span className="text-lg font-bold" style={{ color: '#e8e8e8' }}>Totale</span>
            <span className="text-2xl font-black" style={{ color: '#c9a84c' }}>
              €{totaleFinale.toFixed(2)}
            </span>
          </div>
        </div>

        {errore && (
          <div className="p-3 rounded-xl text-sm text-center"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            ⚠️ {errore}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
          style={{
            backgroundColor: loading ? '#666' : '#c9a84c',
            color: '#0a0a0a',
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Preparazione pagamento...</span>
            </>
          ) : (
            <>🔒 Paga €{totaleFinale.toFixed(2)}</>
          )}
        </button>

        <p className="text-center text-xs pb-4" style={{ color: '#444' }}>
          Pagamento sicuro con Stripe.
        </p>
      </div>
    </div>
  );
}

export default function CartPageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
      </div>
    }>
      <CartPage />
    </Suspense>
  );
}