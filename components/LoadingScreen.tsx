'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Fase = 'entrata' | 'visibile' | 'uscita' | 'finito';

export default function LoadingScreen() {
  const [fase, setFase] = useState<Fase>('entrata');

  useEffect(() => {
    const t1 = setTimeout(() => setFase('visibile'), 100);
    const t2 = setTimeout(() => setFase('uscita'), 2600);
    const t3 = setTimeout(() => setFase('finito'), 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (fase === 'finito') return null;

  return (
    <div className="wrapper">

      {/* ONDA */}
      <div
        className="waveContainer"
        style={{
          top:
            fase === 'entrata'
              ? '-200vh'
              : fase === 'uscita'
              ? '-200vh'
              : '-20vh',
        }}
      >
        <div className="gradient" />

        <svg className="waveSvg" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path
            className="wavePath"
            d="M0,100 C240,140 480,60 720,100 C960,140 1200,60 1440,100 L1440,0 L0,0 Z"
          />
        </svg>

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
      </div>

      {/* CONTENUTO CENTRALE */}
      <div className={`centerContent ${fase === 'visibile' ? 'visible' : ''}`}>

        {/* LOGO EMERSIONE */}
        <div className="logoWrapper">
          <div className="logoFloat logoReveal">
            <Image
              src="/Logo_del_Lido_Arcobaleno.png"
              alt="Lido Arcobaleno Gate 1"
              width={230}
              height={230}
              priority
            />
          </div>

          {/* MASCHERA ACQUA */}
          <div className="waveMask" />
        </div>

        {/* LINEA */}
        <div className="goldLine" />

        {/* DOTS */}
        <div className="dots">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="dot" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>

        {/* TESTO */}
        <p className="welcomeText">Benvenuto</p>
      </div>

      {/* STILI */}
      <style jsx>{`
        .wrapper {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
        }

        /* ONDA */
        .waveContainer {
          position: absolute;
          left: -5%;
          right: -5%;
          height: 200vh;
          transition: top 1.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            #001220 0%,
            #003d5c 25%,
            #006994 60%,
            #00b4e6 100%
          );
        }

        .waveSvg {
          position: absolute;
          top: 0;
          width: 100%;
          height: 200px;
        }

        .wavePath {
          fill: #001220;
          animation: waveMove 6s ease-in-out infinite;
        }

        /* CENTRO */
        .centerContent {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          opacity: 0;
          z-index: 10;
        }

        .centerContent.visible {
          animation: fadeCenter 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* LOGO WRAPPER */
        .logoWrapper {
          position: relative;
          width: 230px;
          height: 230px;
          overflow: hidden;
        }

        .logoReveal {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(50px);
          opacity: 0;
          z-index: 1;
        }

        .centerContent.visible .logoReveal {
          animation: logoRise 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .logoFloat {
          animation: floatLogo 3.5s ease-in-out infinite;
          filter: drop-shadow(0 0 25px rgba(201,168,76,0.3));
        }

        /* MASCHERA */
        .waveMask {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            #001220 0%,
            #003d5c 40%,
            #006994 70%,
            #00b4e6 100%
          );
          z-index: 2;
          animation: waterReveal 1.4s ease forwards;
        }

        /* LINEA */
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

        /* DOTS */
        .dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #c9a84c;
          animation: dotWave 1.2s ease-in-out infinite;
        }

        .dot:nth-child(3) {
          width: 7px;
          height: 7px;
        }

        /* TESTO */
        .welcomeText {
          color: rgba(201, 168, 76, 0.5);
          font-size: 0.68rem;
          letter-spacing: 0.4em;
          font-weight: 700;
        }

        /* BOLLE */
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          animation: bubble 3s ease-in-out infinite;
        }

        /* ANIMAZIONI */

        @keyframes fadeCenter {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes logoRise {
          0% {
            transform: translateY(60px);
            opacity: 0;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes waterReveal {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-110%);
          }
        }

        @keyframes waveMove {
          0% {
            d: path("M0,100 C240,140 480,60 720,100 C960,140 1200,60 1440,100 L1440,0 L0,0 Z");
          }
          50% {
            d: path("M0,100 C240,60 480,140 720,100 C960,60 1200,140 1440,100 L1440,0 L0,0 Z");
          }
          100% {
            d: path("M0,100 C240,140 480,60 720,100 C960,140 1200,60 1440,100 L1440,0 L0,0 Z");
          }
        }

        @keyframes bubble {
          0%,100% { transform: translateY(0); opacity: 0.05; }
          50% { transform: translateY(-20px); opacity: 0.12; }
        }

        @keyframes floatLogo {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes dotWave {
          0%,100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-7px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}