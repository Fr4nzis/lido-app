'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

const PAGE_ORDER = ['/', '/menu', '/ordini', '/prenota', '/info'];

function getIdx(path: string) {
  const base = '/' + path.split('/')[1];
  const i = PAGE_ORDER.indexOf(base);
  return i === -1 ? 0 : i;
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Teniamo una cache dei contenuti per ogni pagina
  const cache = useRef<Record<string, React.ReactNode>>({});
  const [, forceRender] = useState(0);

  // Aggiorna cache
  cache.current[pathname] = children;

  // Pagina attiva e quella precedente
  const activeRef = useRef(pathname);
  const prevRef = useRef<string | null>(null);
  const dirRef = useRef<'left' | 'right'>('left');
  const animatingRef = useRef(false);

  // Offset corrente
  const offsetRef = useRef(0);
  const velRef = useRef(0);
  const rafRef = useRef(0);

  const W = useCallback(() =>
    ref.current?.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 390)
  , []);

  // Aggiorna transform dei pannelli
  const apply = useCallback((offset: number) => {
    const w = W();
    const active = ref.current?.querySelector<HTMLElement>('[data-active="true"]');
    const prev = ref.current?.querySelector<HTMLElement>('[data-active="false"]');

    if (active) {
      const d = Math.min(Math.abs(offset / w), 1);
      active.style.transform = `translate3d(${offset}px,0,0) scale(${1 - d * 0.05})`;
      active.style.opacity = String(1 - d * 0.15);
    }

    if (prev) {
      const prevOffset = dirRef.current === 'left' ? offset + w : offset - w;
      const d = Math.min(Math.abs(prevOffset / w), 1);
      prev.style.transform = `translate3d(${prevOffset}px,0,0) scale(${1 - d * 0.05})`;
      prev.style.opacity = String(1 - d * 0.15);
    }

    offsetRef.current = offset;
  }, [W]);

  // Spring verso target
  const springTo = useCallback((target: number, onDone?: () => void) => {
    cancelAnimationFrame(rafRef.current);
    let vel = velRef.current;
    let pos = offsetRef.current;

    const step = () => {
      const f = -300 * (pos - target);
      const d = -28 * vel;
      vel += (f + d) / 1 * (1 / 60);
      pos += vel * (1 / 60);
      apply(pos);

      if (Math.abs(pos - target) < 0.4 && Math.abs(vel) < 0.4) {
        apply(target);
        velRef.current = 0;
        onDone?.();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [apply]);

  // Pathname cambia → anima
  useEffect(() => {
    if (pathname === activeRef.current) return;
    if (animatingRef.current) {
      activeRef.current = pathname;
      prevRef.current = null;
      offsetRef.current = 0;
      forceRender(n => n + 1);
      return;
    }

    const prevIdx = getIdx(activeRef.current);
    const nextIdx = getIdx(pathname);
    dirRef.current = nextIdx >= prevIdx ? 'left' : 'right';

    prevRef.current = activeRef.current;
    activeRef.current = pathname;
    animatingRef.current = true;
    offsetRef.current = 0;
    velRef.current = 0;

    forceRender(n => n + 1);

    // Piccolo delay per render
    setTimeout(() => {
      const w = W();
      const target = dirRef.current === 'left' ? -w : w;

      // Posiziona active fuori schermo
      offsetRef.current = dirRef.current === 'left' ? w : -w;
      apply(offsetRef.current);

      requestAnimationFrame(() => {
        springTo(0, () => {
          animatingRef.current = false;
          prevRef.current = null;
          velRef.current = 0;
          forceRender(n => n + 1);
        });
      });
    }, 16);
  }, [pathname, apply, springTo, W]);

  // DRAG
  const dragRef = useRef({
    on: false,
    startX: 0,
    startY: 0,
    locked: false,
    isH: false,
    lastX: 0,
    lastT: 0,
  });

  const onDown = useCallback((e: React.PointerEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('button,a,input,select,textarea,[data-no-swipe]')) return;
    if (animatingRef.current) return;

    dragRef.current = {
      on: true,
      startX: e.clientX,
      startY: e.clientY,
      locked: false,
      isH: false,
      lastX: e.clientX,
      lastT: Date.now(),
    };
    velRef.current = 0;
    ref.current?.setPointerCapture(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.on) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      d.isH = Math.abs(dx) > Math.abs(dy) * 1.2;
      d.locked = true;
    }

    if (!d.isH) return;
    e.preventDefault();

    const now = Date.now();
    const dt = now - d.lastT;
    if (dt > 0) velRef.current = (e.clientX - d.lastX) / dt;
    d.lastX = e.clientX;
    d.lastT = now;

    const curIdx = getIdx(pathname);
    let offset = dx;
    if (dx < 0 && curIdx >= PAGE_ORDER.length - 1) offset = dx * 0.15;
    if (dx > 0 && curIdx <= 0) offset = dx * 0.15;

    // Mostra pagina adiacente se non già caricata
    if (Math.abs(dx) > 15) {
      const dir = dx < 0 ? 'left' : 'right';
      if (dir === 'left' && curIdx < PAGE_ORDER.length - 1) {
        const np = PAGE_ORDER[curIdx + 1];
        if (!prevRef.current) {
          prevRef.current = np;
          dirRef.current = 'left';
          forceRender(n => n + 1);
        }
      } else if (dir === 'right' && curIdx > 0) {
        const pp = PAGE_ORDER[curIdx - 1];
        if (!prevRef.current) {
          prevRef.current = pp;
          dirRef.current = 'right';
          forceRender(n => n + 1);
        }
      }
    }

    apply(offset);
  }, [pathname, apply]);

  const onUp = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.on) return;
    d.on = false;

    const dx = e.clientX - d.startX;
    const w = W();
    const vel = velRef.current;
    const curIdx = getIdx(pathname);

    const distOk = Math.abs(dx) > w * 0.28;
    const velOk = Math.abs(vel) > 0.35;

    if ((dx < 0 && (distOk || velOk)) && curIdx < PAGE_ORDER.length - 1) {
      const next = PAGE_ORDER[curIdx + 1];
      animatingRef.current = true;
      springTo(-w, () => {
        animatingRef.current = false;
        prevRef.current = null;
        velRef.current = 0;
        router.push(next);
      });
    } else if ((dx > 0 && (distOk || velOk)) && curIdx > 0) {
      const prev = PAGE_ORDER[curIdx - 1];
      animatingRef.current = true;
      springTo(w, () => {
        animatingRef.current = false;
        prevRef.current = null;
        velRef.current = 0;
        router.push(prev);
      });
    } else {
      springTo(0, () => {
        prevRef.current = null;
        forceRender(n => n + 1);
      });
    }
  }, [pathname, router, springTo, W]);

  // Render
  const activePath = activeRef.current;
  const prevPath = prevRef.current;
  const w = W();

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        touchAction: 'pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* Pagina attiva */}
      <div
        data-active="true"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          willChange: 'transform',
          transformOrigin: 'center center',
          zIndex: 2,
        }}
      >
        {cache.current[activePath] || children}
      </div>

      {/* Pagina adiacente */}
      {prevPath && cache.current[prevPath] && (
        <div
          data-active="false"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            minHeight: '100vh',
            transform: `translate3d(${dirRef.current === 'left' ? w : -w}px,0,0) scale(0.95)`,
            opacity: 0.85,
            willChange: 'transform',
            transformOrigin: 'center center',
            zIndex: 1,
          }}
        >
          {cache.current[prevPath]}
        </div>
      )}
    </div>
  );
}