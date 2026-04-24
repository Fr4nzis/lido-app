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
    <div className="wrapper">

      {/* SFONDO */}
      <div className="bg" />

      {/* ONDA MINIMALE */}
      <div
        className="wave"
        style={{
          transform:
            fase === 'entrata'
              ? 'translateY(100%)'
              : fase === 'uscita'
              ? 'translateY(-120%)'
              : 'translateY(0%)',
        }}
      >
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none">
          <path
            d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,60 1440,80 L1440,0 L0,0 Z"
            className="wavePath"
          />
        </svg>
      </div>

      {/* CONTENUTO */}
      <div className={`center ${fase === 'visibile' ? 'show' : ''}`}>

        <div className="logoBox">
          <Image
            src="/Logo_del_Lido_Arcobaleno.png"
            alt="Logo"
            width={200}
            height={200}
            priority
          />
        </div>

        <div className="line" />

        <p className="text">Benvenuto</p>
      </div>

      <style jsx>{`
        .wrapper {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
        }

        .bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #001220, #003d5c);
        }

        /* ONDA */
        .wave {
          position: absolute;
          bottom: 0;
          width: 100%;
          transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .wavePath {
          fill: #001220;
          animation: waveDrift 6s ease-in-out infinite;
        }

        /* CENTRO */
        .center {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.96);
          opacity: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }

        .center.show {
          animation: fadeIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* LOGO */
        .logoBox {
          transform: translateY(12px);
          opacity: 0;
        }

        .center.show .logoBox {
          animation: rise 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* LINEA */
        .line {
          width: 60px;
          height: 1px;
          background: rgba(201,168,76,0.6);
          opacity: 0;
        }

        .center.show .line {
          animation: fadeIn 1s ease forwards;
          animation-delay: 0.3s;
        }

        /* TESTO */
        .text {
          font-size: 0.7rem;
          letter-spacing: 0.35em;
          color: rgba(201,168,76,0.5);
          opacity: 0;
        }

        .center.show .text {
          animation: fadeIn 1s ease forwards;
          animation-delay: 0.5s;
        }

        /* ANIMAZIONI */

        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes rise {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes waveDrift {
          0%,100% {
            d: path("M0,80 C360,120 720,40 1080,80 C1260,100 1380,60 1440,80 L1440,0 L0,0 Z");
          }
          50% {
            d: path("M0,80 C360,40 720,120 1080,80 C1260,60 1380,100 1440,80 L1440,0 L0,0 Z");
          }
        }
      `}</style>
    </div>
  );
}