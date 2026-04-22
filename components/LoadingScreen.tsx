'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Fase = 'entrata' | 'visibile' | 'uscita' | 'finito';

export default function LoadingScreen() {
  const [fase, setFase] = useState<Fase>('entrata');

  useEffect(() => {
    const t1 = setTimeout(() => setFase('visibile'), 100);
    const t2 = setTimeout(() => setFase('uscita'), 2200);
    const t3 = setTimeout(() => setFase('finito'), 3400);

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
          top:
            fase === 'entrata'
              ? '-200vh'
              : fase === 'uscita'
              ? '-200vh'
              : '-20vh',
          transition: 'top 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          background:
            'linear-gradient(180deg, #001220 0%, #003d5c 20%, #006994 50%, #0099cc 75%, #00b4e6 100%)',
          zIndex: 2,
        }}
      >
        {/* Bordo onda superiore */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
          }}
        >
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path
              d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,0 L0,0 Z"
              fill="#001220"
            />
          </svg>
        </div>

        {/* Bordo onda inferiore */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
          }}
        >
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path
              d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z"
              fill="#0a0a0a"
            />
          </svg>
        </div>

        {/* Bolle */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              width: `${8 + (i % 3) * 10}px`,
              height: `${8 + (i % 3) * 10}px`,
              left: `${8 + i * 11}%`,
              top: `${20 + (i % 4) * 12}%`,
              animationDuration: `${2 + i * 0.25}s`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}

        {/* CONTENUTO CENTRALE */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            opacity: fase === 'visibile' ? 1 : 0,
            transition: 'opacity 0.6s ease',
            width: '100%',
          }}
        >
          {/* Logo */}
          <div className={fase === 'visibile' ? 'logoFloat' : ''}>
            <Image
              src="/Logo_del_Lido_Arcobaleno.png"
              alt="Lido Arcobaleno Gate 1"
              width={230}
              height={230}
              style={{
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 25px rgba(201,168,76,0.3))',
              }}
              priority
            />
          </div>

          {/* Linea oro */}
          <div className="goldLine" />

          {/* Punti */}
          <div className="dots">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="dot" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>

          {/* Testo */}
          <p className="welcomeText">Benvenuto</p>
        </div>
      </div>

      {/* STILI */}
      <style jsx>{`
        .bubble {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.06);
          animation-name: bubble;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .logoFloat {
          animation: floatLogo 3s ease-in-out infinite;
        }

        .goldLine {
          width: 80px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(201, 168, 76, 0.8),
            transparent
          );
        }

        .dots {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #c9a84c;
          animation: dotWave 1.2s ease-in-out infinite;
          opacity: 0.7;
        }

        .dot:nth-child(3) {
          width: 7px;
          height: 7px;
        }

        .welcomeText {
          color: rgba(201, 168, 76, 0.5);
          font-size: 0.68rem;
          letter-spacing: 0.4em;
          font-weight: 700;
          text-transform: uppercase;
        }

        @keyframes bubble {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.06;
          }
          50% {
            transform: translateY(-18px) scale(1.08);
            opacity: 0.12;
          }
        }

        @keyframes floatLogo {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.02);
          }
        }

        @keyframes dotWave {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-7px);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}