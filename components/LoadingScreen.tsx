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
          background: 'linear-gradient(180deg, #060d14 0%, #0a1f2e 15%, #0d3348 35%, #0a4d6e 55%, #0077a8 75%, #00a0cc 90%, #00b4e6 100%)',
          zIndex: 2,
        }}
      >
        {/* Riflesso luce in alto */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          right: '20%',
          height: '30%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Bordo onda superiore */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '70px' }}>
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none"
            style={{ width: '100%', height: '100%' }}>
            <path
              d="M0,35 C240,70 480,0 720,35 C960,70 1200,0 1440,35 L1440,0 L0,0 Z"
              fill="#060d14"
            />
          </svg>
        </div>

        {/* Bordo onda inferiore — si fonde con lo sfondo della pagina */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px' }}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none"
            style={{ width: '100%', height: '100%' }}>
            <path
              d="M0,50 C180,100 360,0 540,50 C720,100 900,0 1080,50 C1260,100 1380,20 1440,50 L1440,100 L0,100 Z"
              fill="#0a0a0a"
            />
            <path
              d="M0,70 C300,30 600,90 900,60 C1100,40 1300,75 1440,65 L1440,100 L0,100 Z"
              fill="rgba(10,10,10,0.6)"
            />
          </svg>
        </div>

        {/* Bolle */}
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${5 + (i % 4) * 7}px`,
            height: `${5 + (i % 4) * 7}px`,
            borderRadius: '50%',
            backgroundColor: `rgba(255,255,255,${0.04 + (i % 3) * 0.02})`,
            left: `${5 + i * 9}%`,
            top: `${15 + (i % 5) * 12}%`,
            animation: `bubble ${2 + i * 0.2}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}

        {/* Particelle dorate */}
        {[...Array(6)].map((_, i) => (
          <div key={`gold-${i}`} style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            backgroundColor: `rgba(201,168,76,${0.3 + i * 0.1})`,
            left: `${15 + i * 14}%`,
            top: `${30 + (i % 3) * 15}%`,
            animation: `particle ${3 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}

        {/* CONTENUTO CENTRALE */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          opacity: fase === 'visibile' ? 1 : 0,
          transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          width: '100%',
          textAlign: 'center',
        }}>
          {/* Logo con glow oro */}
          <div style={{
            animation: fase === 'visibile' ? 'floatLogo 4s ease-in-out infinite' : 'none',
            filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.25)) drop-shadow(0 0 40px rgba(201,168,76,0.1))',
          }}>
            <img
              src="/Logo_del_Lido_Arcobaleno.png"
              alt="Lido Arcobaleno Gate 1"
              style={{ width: '220px', objectFit: 'contain' }}
            />
          </div>

          {/* Separatore oro animato */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.9), transparent)',
            animation: fase === 'visibile' ? 'expandLine 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' : 'none',
            width: '0px',
          }} />

          {/* Dots oro */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                width: i === 2 ? '8px' : '5px',
                height: i === 2 ? '8px' : '5px',
                borderRadius: '50%',
                backgroundColor: '#c9a84c',
                animation: `dotWave 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.14}s`,
                opacity: 0.8,
                boxShadow: '0 0 6px rgba(201,168,76,0.5)',
              }} />
            ))}
          </div>

          {/* Testo benvenuto */}
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
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.05; }
          50% { transform: translateY(-16px) scale(1.06); opacity: 0.1; }
        }
        @keyframes particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-12px) scale(1.5); opacity: 0.8; }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes dotWave {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-7px); opacity: 1; }
        }
        @keyframes expandLine {
          from { width: 0px; }
          to { width: 80px; }
        }
      `}</style>
    </div>
  );
}