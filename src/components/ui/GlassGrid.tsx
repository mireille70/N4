import { useEffect, useRef, useState } from 'react';

const CELL = 64; // px — grid square size

/**
 * Background grid whose squares turn to glass when the pointer is actually on
 * them (CSS :hover per square), then fade slowly, leaving a short trail.
 * Squares covered by content don't react — the content takes the pointer.
 * Place inside a positioned parent; it fills it.
 */
export function GlassGrid({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cols: 0, rows: 0 });

  // size the grid to the parent
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDims({ cols: Math.ceil(el.clientWidth / CELL), rows: Math.ceil(el.clientHeight / CELL) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`glass-grid pointer-events-none absolute inset-0 grid ${className ?? ''}`}
      style={{ gridTemplateColumns: `repeat(${dims.cols}, ${CELL}px)`, gridAutoRows: `${CELL}px` }}
      aria-hidden="true"
    >
      {Array.from({ length: dims.cols * dims.rows }, (_, i) => <span key={i} />)}
    </div>
  );
}
