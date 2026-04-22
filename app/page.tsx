'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCarrelloStore } from '@/lib/store';

function HomeContent() {
  const searchParams = useSearchParams();
  const { setLettino, lettino } = useCarrelloStore();
  const [ora, setOra] = useState('');

  useEffect(() => {
    const spot = searchParams.get('spot');
    if (spot) setLettino(spot.toUpperCase());
  }, [searchParams, setLettino]);

  useEffect(() => {
    function aggiornaOra() {
      setOra(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    }
    aggiornaOra();
    const timer = setInterval(aggiornaOra, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ height: '54px' }} />

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ minHeight: '40vh' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #001a2e 0%, #003d5c 40%, #1a1208 100%)',
        }} />

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px' }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
            style={{ width: '100%', height: '100%' }}>
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill="#0a0a0a" />
          </svg>
        </div>

        <div className="relative flex flex-col items-center justify-center text-center px-6 py-12">
          <img
            src="/Logo_del_Lido_Arcobaleno.png"
            alt="Lido Arcobaleno Gate 1"
            style={{ width: '180px', objectFit: 'contain', marginBottom: '16px' }}
          />
          {lettino && (
            <div className="mb-3 px-4 py-2 rounded-full text-sm font-bold"
              style={{
                backgroundColor: 'rgba(201,168,76,0.2)',
                border: '1px solid rgba(201,168,76,0.4)',
                color: '#c9a84c',
              }}>
              🏖️ Lettino {lettino}
            </div>
          )}
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Ordina, prenota, goditi il mare
          </p>
          {ora && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '8px' }}>
              🕐 {ora}
            </p>
          )}
        </div>
      </div>

      {/* AZIONI */}
      <div className="px-5 pb-8 space-y-3">
        <Link href="/menu">
          <div className="p-5 flex items-center gap-4 rounded-2xl mb-3"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #1f1a0f 100%)',
              border: '1px solid rgba(201,168,76,0.25)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))' }}>
              🍹
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg" style={{ color: '#c9a84c' }}>Ordina dal lettino</h3>
              <p style={{ color: '#666', fontSize: '0.82rem' }}>Bar, cucina, cocktail — consegnati da te</p>
            </div>
            <span style={{ color: '#333', fontSize: '1.3rem' }}>›</span>
          </div>
        </Link>

        <Link href="/prenota">
          <div className="p-5 flex items-center gap-4 rounded-2xl mb-3"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0f1a1f 100%)',
              border: '1px solid rgba(0,153,204,0.25)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(0,153,204,0.2), rgba(0,153,204,0.05))' }}>
              ⛱️
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg" style={{ color: '#0099cc' }}>Prenota ombrellone</h3>
              <p style={{ color: '#666', fontSize: '0.82rem' }}>Scegli il tuo posto sulla mappa</p>
            </div>
            <span style={{ color: '#333', fontSize: '1.3rem' }}>›</span>
          </div>
        </Link>

        <Link href="/ordini">
          <div className="p-5 flex items-center gap-4 rounded-2xl mb-3"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0f1a0f 100%)',
              border: '1px solid rgba(22,163,74,0.25)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.2), rgba(22,163,74,0.05))' }}>
              📋
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg" style={{ color: '#16a34a' }}>I tuoi ordini</h3>
              <p style={{ color: '#666', fontSize: '0.82rem' }}>Traccia i tuoi ordini in tempo reale</p>
            </div>
            <span style={{ color: '#333', fontSize: '1.3rem' }}>›</span>
          </div>
        </Link>

        <Link href="/info">
          <div className="p-5 flex items-center gap-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #1a1a1a 100%)',
              border: '1px solid #2a2a2a',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}>
              🌊
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg" style={{ color: '#e8e8e8' }}>Scopri il lido</h3>
              <p style={{ color: '#666', fontSize: '0.82rem' }}>Servizi, orari e dove siamo</p>
            </div>
            <span style={{ color: '#333', fontSize: '1.3rem' }}>›</span>
          </div>
        </Link>

        {/* Orari */}
        <div className="p-4 rounded-2xl mt-2"
          style={{
            background: 'linear-gradient(135deg, #1a1208 0%, #0f0f0f 100%)',
            border: '1px solid rgba(201,168,76,0.15)',
          }}>
          <p className="text-center text-xs font-bold mb-3"
            style={{ color: '#555', letterSpacing: '0.1em' }}>
            ORARI DI OGGI
          </p>
          <div className="flex justify-between items-center">
            {[
              { label: 'Apertura', val: '09:00' },
              { label: 'Cucina', val: '12-15' },
              { label: 'Chiusura', val: '20:00' },
            ].map((o, i) => (
              <div key={i} className="text-center flex-1">
                <p style={{ fontSize: '0.6rem', color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {o.label}
                </p>
                <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#c9a84c' }}>
                  {o.val}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}