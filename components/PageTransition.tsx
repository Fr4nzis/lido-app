'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const PAGE_ORDER = ['/', '/menu', '/ordini', '/prenota', '/info'];

function getDirection(from: string, to: string): 'left' | 'right' {
  const fromBase = '/' + from.split('/')[1];
  const toBase = '/' + to.split('/')[1];
  const fromIndex = PAGE_ORDER.indexOf(fromBase);
  const toIndex = PAGE_ORDER.indexOf(toBase);
  if (fromIndex === -1 || toIndex === -1) return 'left';
  return toIndex > fromIndex ? 'left' : 'right';
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pages, setPages] = useState<{
    current: React.ReactNode;
    next: React.ReactNode | null;
  }>({ current: children, next: null });
  const [phase, setPhase] = useState<'idle' | 'sliding'>('idle');
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) {
      setPages((p) => ({ ...p, current: children }));
      return;
    }

    const dir = getDirection(prevPathname.current, pathname);
    setDirection(dir);

    // Prepara la nuova pagina fuori dallo schermo
    setPages((p) => ({ current: p.current, next: children }));
    setPhase('idle');

    // Piccolo delay per assicurarsi che il DOM sia pronto
    const t1 = setTimeout(() => {
      setPhase('sliding');
    }, 20);

    // Fine animazione
    const t2 = setTimeout(() => {
      setPages({ current: children, next: null });
      setPhase('idle');
      prevPathname.current = pathname;
    }, 380);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, children]);

  const slideAmount = direction === 'left' ? '-100%' : '100%';
  const enterFrom = direction === 'left' ? '100%' : '-100%';

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Pagina corrente — esce */}
      <div
        style={{
          position: phase === 'sliding' ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          transform: phase === 'sliding' ? `translateX(${slideAmount})` : 'translateX(0)',
          transition: phase === 'sliding'
            ? 'transform 360ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'none',
          willChange: phase === 'sliding' ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
        }}
      >
        {pages.current}
      </div>

      {/* Nuova pagina — entra */}
      {pages.next && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: phase === 'sliding'
              ? 'translateX(0)'
              : `translateX(${enterFrom})`,
            transition: phase === 'sliding'
              ? 'transform 360ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              : 'none',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        >
          {pages.next}
        </div>
      )}
    </div>
  );
}