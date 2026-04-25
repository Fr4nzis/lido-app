'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

const PAGE_ORDER = ['/', '/menu', '/ordini', '/prenota', '/info'];

function getPageIndex(pathname: string): number {
  const base = '/' + pathname.split('/')[1];
  const idx = PAGE_ORDER.indexOf(base);
  return idx === -1 ? 0 : idx;
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Teniamo solo 2 snapshot: current e next
  const [snapshot, setSnapshot] = useState<{
    current: React.ReactNode;
    next: React.ReactNode | null;
    direction: 'left' | 'right';
    phase: 'idle' | 'animating';
  }>({
    current: children,
    next: null,
    direction: 'left',
    phase: 'idle',
  });

  const prevPathname = useRef(pathname);
  const prevChildren = useRef(children);

  // Drag state
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    locked: false,
    isHorizontal: false,
  });

  // Animazione
  const rafRef = useRef<number>(0);
  const currentXRef = useRef(0); // posizione corrente pannello current
  const isDraggingRef = useRef(false);

  const W = () => containerRef.current?.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 390);

  // Aggiorna pannelli con transform diretto
  const setPanelX = (currentX: number, dir: 'left' | 'right') => {
    const w = W();
    const nextX = dir === 'left' ? currentX + w : currentX - w;

    const currentPanel = containerRef.current?.querySelector('[data-panel="current"]') as HTMLElement;
    const nextPanel = containerRef.current?.querySelector('[data-panel="next"]') as HTMLElement;

    if (!currentPanel) return;

    const distCurrent = Math.abs(currentX / w);
    const distNext = Math.abs(nextX / w);

    const scaleCurrent = 1 - Math.min(distCurrent, 1) * 0.06;
    const scaleNext = 1 - Math.min(distNext, 1) * 0.06;
    const opacityCurrent = 1 - Math.min(distCurrent, 1) * 0.2;
    const opacityNext = 1 - Math.min(distNext, 1) * 0.2;

    currentPanel.style.transform = `translate3d(${currentX}px, 0, 0) scale(${scaleCurrent})`;
    currentPanel.style.opacity = String(opacityCurrent);

    if (nextPanel) {
      nextPanel.style.transform = `translate3d(${nextX}px, 0, 0) scale(${scaleNext})`;
      nextPanel.style.opacity = String(opacityNext);
    }

    currentXRef.current = currentX;
  };

  // Spring animation
  const springTo = useCallback((target: number, dir: 'left' | 'right', onDone?: () => void) => {
    const stiffness = 320;
    const damping = 30;
    const mass = 1;
    let vel = drag.current.velocity * 80;
    let pos = currentXRef.current;

    cancelAnimationFrame(rafRef.current);

    const step = () => {
      const force = -stiffness * (pos - target);
      const damp = -damping * vel;
      vel += ((force + damp) / mass) * (1 / 60);
      pos += vel * (1 / 60);

      setPanelX(pos, dir);

      if (Math.abs(pos - target) < 0.3 && Math.abs(vel) < 0.3) {
        setPanelX(target, dir);
        onDone?.();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  // Quando pathname cambia da Link click
  useEffect(() => {
    if (pathname === prevPathname.current) {
      // Aggiorna solo contenuto corrente
      setSnapshot(s => ({ ...s, current: children }));
      prevChildren.current = children;
      return;
    }

    // Non fare niente se stiamo già draggando (gestito dal pointer up)
    if (isDraggingRef.current) return;

    const prevIdx = getPageIndex(prevPathname.current);
    const nextIdx = getPageIndex(pathname);
    const dir = nextIdx >= prevIdx ? 'left' : 'right';
    const w = W();

    // Mostra subito next fuori schermo
    setSnapshot({
      current: prevChildren.current,
      next: children,
      direction: dir,
      phase: 'animating',
    });

    currentXRef.current = 0;

    // Anima dopo render
    setTimeout(() => {
      const target = dir === 'left' ? -w : w;
      springTo(target, dir, () => {
        prevPathname.current = pathname;
        prevChildren.current = children;
        currentXRef.current = 0;
        setSnapshot({
          current: children,
          next: null,
          direction: dir,
          phase: 'idle',
        });
      });
    }, 16);
  }, [pathname, children, springTo]);

  // POINTER EVENTS
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [data-no-swipe]')) return;
    if (snapshot.phase === 'animating') return;

    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      lastX: e.clientX,
      lastTime: Date.now(),
      velocity: 0,
      locked: false,
      isHorizontal: false,
    };

    containerRef.current?.setPointerCapture(e.pointerId);
  }, [snapshot.phase]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) return;

    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;

    if (!drag.current.locked) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      drag.current.isHorizontal = Math.abs(dx) > Math.abs(dy);
      drag.current.locked = true;
    }

    if (!drag.current.isHorizontal) return;
    e.preventDefault();

    // Velocità
    const now = Date.now();
    const dt = now - drag.current.lastTime;
    if (dt > 0) drag.current.velocity = (e.clientX - drag.current.lastX) / dt;
    drag.current.lastX = e.clientX;
    drag.current.lastTime = now;
    drag.current.dx = dx;

    const currentPageIdx = getPageIndex(pathname);
    const canGoLeft = currentPageIdx < PAGE_ORDER.length - 1;
    const canGoRight = currentPageIdx > 0;

    // Resistenza se non c'è pagina in quella direzione
    let offset = dx;
    if (dx < 0 && !canGoLeft) offset = dx * 0.2;
    if (dx > 0 && !canGoRight) offset = dx * 0.2;

    // Mostra next page se inizia drag
    if (!snapshot.next && Math.abs(dx) > 10) {
      const dir = dx < 0 ? 'left' : 'right';
      if ((dir === 'left' && canGoLeft) || (dir === 'right' && canGoRight)) {
        const nextPath = dir === 'left'
          ? PAGE_ORDER[currentPageIdx + 1]
          : PAGE_ORDER[currentPageIdx - 1];

        isDraggingRef.current = true;
        router.prefetch(nextPath);
      }
    }

    setPanelX(offset, dx < 0 ? 'left' : 'right');
  }, [pathname, snapshot.next, router]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    isDraggingRef.current = false;

    const { dx, velocity } = drag.current;
    const w = W();
    const currentPageIdx = getPageIndex(pathname);

    const distThreshold = w * 0.28;
    const velThreshold = 0.35;

    const shouldGoLeft = (dx < -distThreshold || velocity < -velThreshold) && currentPageIdx < PAGE_ORDER.length - 1;
    const shouldGoRight = (dx > distThreshold || velocity > velThreshold) && currentPageIdx > 0;

    if (shouldGoLeft) {
      const nextPath = PAGE_ORDER[currentPageIdx + 1];
      const target = -w;

      setSnapshot(s => ({
        ...s,
        next: s.next,
        direction: 'left',
        phase: 'animating',
      }));

      springTo(target, 'left', () => {
        router.push(nextPath);
      });

    } else if (shouldGoRight) {
      const prevPath = PAGE_ORDER[currentPageIdx - 1];
      const target = w;

      setSnapshot(s => ({
        ...s,
        direction: 'right',
        phase: 'animating',
      }));

      springTo(target, 'right', () => {
        router.push(prevPath);
      });

    } else {
      // Snap back con spring
      springTo(0, dx < 0 ? 'left' : 'right', () => {
        setSnapshot(s => ({ ...s, next: null, phase: 'idle' }));
      });
    }
  }, [pathname, router, springTo]);

  const w = W();
  const nextStartX = snapshot.direction === 'left' ? w : -w;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        touchAction: 'pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Pannello corrente */}
      <div
        data-panel="current"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          willChange: 'transform, opacity',
          transformOrigin: 'center center',
          zIndex: 2,
        }}
      >
        {snapshot.current}
      </div>

      {/* Pannello prossimo — fuori schermo */}
      {snapshot.next && (
        <div
          data-panel="next"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            minHeight: '100vh',
            transform: `translate3d(${nextStartX}px, 0, 0) scale(0.94)`,
            opacity: 0.8,
            willChange: 'transform, opacity',
            transformOrigin: 'center center',
            zIndex: 1,
          }}
        >
          {snapshot.next}
        </div>
      )}
    </div>
  );
}