'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

const PAGE_ORDER = ['/', '/menu', '/ordini', '/prenota', '/info'];

function getPageIndex(pathname: string): number {
  const base = '/' + pathname.split('/')[1];
  const idx = PAGE_ORDER.indexOf(base);
  return idx === -1 ? 0 : idx;
}

interface PageState {
  content: React.ReactNode;
  index: number;
  pathname: string;
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Stato pagine
  const [pages, setPages] = useState<PageState[]>([
    { content: children, index: getPageIndex(pathname), pathname }
  ]);
  const [activeIdx, setActiveIdx] = useState(0); // indice nell'array pages

  // Stato drag
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    isHorizontal: false,
    directionLocked: false,
  });

  // Stato animazione (RAF)
  const animRef = useRef<number>(0);
  const offsetRef = useRef(0); // offset corrente in px
  const targetOffsetRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const widthRef = useRef(0);

  // Pannelli DOM refs
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Aggiorna larghezza
  useEffect(() => {
    const update = () => {
      widthRef.current = containerRef.current?.offsetWidth || window.innerWidth;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Sync pagine quando pathname cambia da Link/router
  useEffect(() => {
    const currentPage = pages[activeIdx];
    if (currentPage?.pathname === pathname) {
      // Aggiorna solo il contenuto
      setPages(prev => prev.map((p, i) =>
        i === activeIdx ? { ...p, content: children } : p
      ));
      return;
    }

    const newPageIdx = getPageIndex(pathname);
    const currentPageIdx = getPageIndex(currentPage?.pathname || '/');
    const goingRight = newPageIdx > currentPageIdx;

    // Aggiungi nuova pagina
    const newPage: PageState = {
      content: children,
      index: newPageIdx,
      pathname,
    };

    if (goingRight) {
      // Nuova pagina a destra
      setPages(prev => {
        const next = [...prev, newPage];
        const newActiveIdx = next.length - 1;
        animateTo(-widthRef.current, newActiveIdx, next);
        return next;
      });
    } else {
      // Nuova pagina a sinistra
      setPages(prev => {
        const next = [newPage, ...prev];
        // Sposta offset per non fare salto visivo
        offsetRef.current -= widthRef.current;
        applyTransforms(offsetRef.current, next, 0);
        animateTo(0, 0, next);
        return next;
      });
    }
  }, [pathname, children]);

  // Applica transforms a tutti i pannelli
  const applyTransforms = useCallback((
    offset: number,
    pagesArr: PageState[],
    newActiveIdx?: number
  ) => {
    const W = widthRef.current;
    const active = newActiveIdx ?? activeIdx;

    pagesArr.forEach((_, i) => {
      const panel = panelRefs.current[i];
      if (!panel) return;

      // Posizione base del pannello
      const baseX = (i - active) * W;
      const x = baseX + offset;

      // Normalizza distanza dal centro [-1, 1]
      const dist = Math.abs(x / W);
      const clampedDist = Math.min(dist, 1);

      // Scale: centro=1, lati=0.92
      const scale = 1 - clampedDist * 0.08;

      // Opacity: centro=1, lati=0.75
      const opacity = 1 - clampedDist * 0.25;

      // Parallasse leggero per pannelli non attivi
      const parallaxX = i !== active ? x * 0.12 : 0;

      panel.style.transform = `translate3d(${x + parallaxX}px, 0, 0) scale(${scale})`;
      panel.style.opacity = String(opacity);
      panel.style.zIndex = i === active ? '2' : '1';
    });
  }, [activeIdx]);

  // Animazione spring verso target
  const animateTo = useCallback((
    targetOffset: number,
    newActiveIdx: number,
    pagesArr?: PageState[]
  ) => {
    const pgs = pagesArr || pages;
    targetOffsetRef.current = targetOffset;
    isAnimatingRef.current = true;

    cancelAnimationFrame(animRef.current);

    // Spring params
    const stiffness = 280;
    const damping = 28;
    const mass = 1;

    let velocity = dragRef.current.velocity * 0.3; // eredita velocità dal drag
    let position = offsetRef.current;

    const step = () => {
      const force = -stiffness * (position - targetOffset);
      const dampingForce = -damping * velocity;
      const acceleration = (force + dampingForce) / mass;

      velocity += acceleration * (1 / 60);
      position += velocity * (1 / 60);

      // Convergenza
      const diff = Math.abs(position - targetOffset);
      const velAbs = Math.abs(velocity);

      if (diff < 0.5 && velAbs < 0.5) {
        position = targetOffset;
        isAnimatingRef.current = false;
        offsetRef.current = 0;

        // Cleanup: rimuovi pagine non necessarie
        setActiveIdx(newActiveIdx);
        setPages(prev => {
          const cleaned = prev.filter((_, i) => i === newActiveIdx);
          return [{ ...prev[newActiveIdx] }];
        });
        return;
      }

      offsetRef.current = position;
      applyTransforms(position, pgs, newActiveIdx);
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
  }, [pages, applyTransforms]);

  // POINTER EVENTS
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isAnimatingRef.current) return;
    // Ignora se viene da input, button, select, ecc.
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [data-no-swipe]')) return;

    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      lastX: e.clientX,
      lastTime: Date.now(),
      velocity: 0,
      isHorizontal: false,
      directionLocked: false,
    };

    containerRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.active) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    // Lock direzione dopo 8px
    if (!drag.directionLocked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      drag.isHorizontal = Math.abs(dx) > Math.abs(dy);
      drag.directionLocked = true;
    }

    if (!drag.isHorizontal) return;

    e.preventDefault();

    // Velocità istantanea
    const now = Date.now();
    const dt = now - drag.lastTime;
    if (dt > 0) {
      drag.velocity = (e.clientX - drag.lastX) / dt;
    }
    drag.lastX = e.clientX;
    drag.lastTime = now;
    drag.currentX = e.clientX;

    const offset = dx;
    offsetRef.current = offset;
    applyTransforms(offset, pages, activeIdx);
  }, [pages, activeIdx, applyTransforms]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;

    const dx = drag.currentX - drag.startX;
    const W = widthRef.current;
    const velocity = drag.velocity;
    const currentPageOrder = PAGE_ORDER.indexOf('/' + pathname.split('/')[1]);

    // Soglie
    const distThreshold = W * 0.25;
    const velThreshold = 0.4;

    const shouldGoNext = dx < -distThreshold || velocity < -velThreshold;
    const shouldGoPrev = dx > distThreshold || velocity > velThreshold;

    if (shouldGoNext && currentPageOrder < PAGE_ORDER.length - 1) {
      // Vai alla pagina successiva
      const nextPath = PAGE_ORDER[currentPageOrder + 1];
      router.push(nextPath);
    } else if (shouldGoPrev && currentPageOrder > 0) {
      // Vai alla pagina precedente
      const prevPath = PAGE_ORDER[currentPageOrder - 1];
      router.push(prevPath);
    } else {
      // Snap back
      dragRef.current.velocity = velocity * 1000;
      animateTo(0, activeIdx);
    }
  }, [pathname, router, activeIdx, animateTo]);

  // Applica transform iniziale
  useEffect(() => {
    applyTransforms(offsetRef.current, pages, activeIdx);
  }, [pages, activeIdx]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        touchAction: 'pan-y',
        userSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {pages.map((page, i) => (
        <div
          key={page.pathname + i}
          ref={el => { panelRefs.current[i] = el; }}
          style={{
            position: i === activeIdx ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            minHeight: '100vh',
            willChange: 'transform, opacity',
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
          }}
        >
          {page.content}
        </div>
      ))}
    </div>
  );
}