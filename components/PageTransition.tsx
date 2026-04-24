'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

// Ordine delle pagine nella bottom nav
const PAGE_ORDER = ['/', '/menu', '/ordini', '/prenota', '/info'];

function getDirection(from: string, to: string): 'left' | 'right' {
  const fromBase = '/' + from.split('/')[1];
  const toBase = '/' + to.split('/')[1];
  const fromIndex = PAGE_ORDER.indexOf(fromBase);
  const toIndex = PAGE_ORDER.indexOf(toBase);
  if (fromIndex === -1 || toIndex === -1) return 'right';
  return toIndex > fromIndex ? 'left' : 'right';
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) {
      setDisplayChildren(children);
      return;
    }

    const dir = getDirection(prevPathname.current, pathname);
    setDirection(dir);
    setAnimating(true);
    setPhase('exit');

    const t1 = setTimeout(() => {
      setDisplayChildren(children);
      setPhase('enter');
      prevPathname.current = pathname;
    }, 160);

    const t2 = setTimeout(() => {
      setPhase('idle');
      setAnimating(false);
    }, 340);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, children]);

  const getTransform = () => {
    if (phase === 'exit') {
      return direction === 'left' ? 'translateX(-12px)' : 'translateX(12px)';
    }
    if (phase === 'enter') {
      return direction === 'left' ? 'translateX(12px)' : 'translateX(-12px)';
    }
    return 'translateX(0)';
  };

  return (
    <div
      style={{
        opacity: phase === 'idle' ? 1 : 0,
        transform: getTransform(),
        transition: phase === 'idle'
          ? 'none'
          : phase === 'exit'
          ? 'opacity 160ms cubic-bezier(0.4, 0, 1, 1), transform 160ms cubic-bezier(0.4, 0, 1, 1)'
          : 'opacity 200ms cubic-bezier(0, 0, 0.2, 1), transform 200ms cubic-bezier(0, 0, 0.2, 1)',
        willChange: animating ? 'opacity, transform' : 'auto',
      }}
    >
      {displayChildren}
    </div>
  );
}