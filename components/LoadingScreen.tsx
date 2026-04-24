'use client';

import { useEffect, useState } from 'react';

type Fase = 'entrata' | 'visibile' | 'uscita' | 'finito';

export default function LoadingScreen() {
  const [fase, setFase] = useState<Fase>('entrata');

  useEffect(() => {
    const t1 = setTimeout(() => setFase('visibile'), 100);
    const t2 = setTimeout(() => setFase('uscita'), 2400);
    const t3 = setTimeout(() => setFase('finito'), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (fase === 'finito') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ pointerEvents: fase === 'uscita' ? 'none' : 'all' }}
    >
      {/* Onda principale */}
      <div
        style={{
          position: 'absolute',
          left: '-5%',
          right: '-5%',
          height: '200vh',
          top: fase === 'entrata'
            ? '-200vh'
            : fase === 'uscita'
            ? '-200vh'
            : '-10vh',
          transition: fase === 'entrata'
            ? 'top 1.3s cubic-bezier(0.16, 1, 0.3, 1)'
            : fase === 'uscita'
            ? 'top 1.3s cubic-bezier(0.7, 0, 0.84, 0) 0.1s'
            : 'none',
          background:
            'linear-gradient(180deg, #001220 0%, #003d5c 20%, #006994 50%, #0099cc 75%, #00b4e6 100%)',
          zIndex: 2,
        }}
      >
        {/* Bordo onda superiore */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px' }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none"
            style={{ width: '100%', height: '100%' }}>
            <path
              d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,0 L0,0 Z"
              fill="#001220"
            />
          </svg>
        </div>

        {/* Bordo onda inferiore */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px' }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
            style={{ width: '100%', height: '100%' }}>
            <path
              d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z"
              fill="#0a0a0a"
            />
          </svg>
        </div>

        {/* Bolle */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${8 + (i % 3) * 10}px`,
            height: `${8 + (i % 3) * 10}px`,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.06)',
            left: `${8 + i * 11}%`,
            top: `${20 + (i % 4) * 12}%`,
            animation: `bubble ${2 + i * 0.25}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}

        {/* CONTENUTO — perfettamente centrato */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          width: '100%',
          opacity: fase === 'visibile' ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          {/* Logo */}
          <div style={{
            animation: fase === 'visibile' ? 'floatLogo 3s ease-in-out infinite' : 'none',
            filter: 'drop-shadow(0 0 25px rgba(201,168,76,0.3))',
          }}>
            <img
              src="/Logo_del_Lido_Arcobaleno.png"
              alt="Lido Arcobaleno Gate 1"
              style={{ width: '230px', objectFit: 'contain' }}
            />
          </div>

          {/* Separatore oro */}
          <div style={{
            width: '80px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.8), transparent)',
          }} />

          {/* Dots */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                width: i === 2 ? '8px' : '5px',
                height: i === 2 ? '8px' : '5px',
                borderRadius: '50%',
                backgroundColor: '#c9a84c',
                animation: `dotWave 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.12}s`,
                opacity: 0.8,
              }} />
            ))}
          </div>

          {/* Benvenuto */}
          <p style={{
            color: 'rgba(201,168,76,0.55)',
            fontSize: '0.68rem',
            letterSpacing: '0.45em',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}>
            Benvenuto
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bubble {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.06; }
          50% { transform: translateY(-18px) scale(1.08); opacity: 0.12; }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes dotWave {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-7px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}