'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [fase, setFase] = useState<'idle' | 'out' | 'in'>('idle');
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) {
      setDisplayChildren(children);
      return;
    }

    // Fase uscita
    setFase('out');

    const t1 = setTimeout(() => {
      // Aggiorna contenuto
      setDisplayChildren(children);
      setFase('in');
      prevPathname.current = pathname;
    }, 180);

    const t2 = setTimeout(() => {
      setFase('idle');
    }, 380);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, children]);

  return (
    <div
      style={{
        opacity: fase === 'out' ? 0 : 1,
        transform: fase === 'out'
          ? 'translateY(6px)'
          : fase === 'in'
          ? 'translateY(4px)'
          : 'translateY(0)',
        transition: fase === 'out'
          ? 'opacity 180ms cubic-bezier(0.4, 0, 1, 1), transform 180ms cubic-bezier(0.4, 0, 1, 1)'
          : fase === 'in'
          ? 'opacity 200ms cubic-bezier(0, 0, 0.2, 1), transform 200ms cubic-bezier(0, 0, 0.2, 1)'
          : 'none',
      }}
    >
      {displayChildren}
    </div>
  );
}