import { useLayoutEffect, useRef, useState } from 'react';
import { A4Page } from './A4Page';
import { A4_HEIGHT, A4_WIDTH } from '../lib/constants';
import { resolveBackgroundSrc, useLibraryStore } from '../store/useLibraryStore';
import { useSelectedPage, useServiceStore } from '../store/useServiceStore';

/** Zona din mijloc: previzualizarea A4 a paginii selectate, scalata ca sa incapa. */
export function CanvasPreview() {
  const page = useSelectedPage();
  const pages = useServiceStore((s) => s.service.pages);
  const backgrounds = useLibraryStore((s) => s.backgrounds);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);

  // Recalculam scara ori de cate ori se schimba spatiul disponibil.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const padding = 48;
      const w = el.clientWidth - padding;
      const h = el.clientHeight - padding;
      if (w <= 0 || h <= 0) return;
      setScale(Math.max(0.1, Math.min(w / A4_WIDTH, h / A4_HEIGHT)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const index = page ? pages.findIndex((p) => p.id === page.id) : -1;

  return (
    <div ref={wrapRef} className="relative flex h-full items-center justify-center bg-slate-200 p-6">
      {page ? (
        <>
          <div
            style={{ width: A4_WIDTH * scale, height: A4_HEIGHT * scale }}
            className="overflow-hidden rounded-sm shadow-2xl ring-1 ring-black/10"
          >
            <div
              style={{
                width: A4_WIDTH,
                height: A4_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <A4Page page={page} backgroundSrc={resolveBackgroundSrc(backgrounds, page.backgroundId)} />
            </div>
          </div>

          <span className="absolute bottom-2 right-3 text-xs text-slate-400">
            Pagina {index + 1} din {pages.length} · A4 portret · {Math.round(scale * 100)}%
          </span>
        </>
      ) : (
        <p className="max-w-xs text-center text-sm text-slate-500">
          Selectează o pagină din stânga sau apasă <strong>Serviciu nou</strong> ca să pornești de la
          un șablon.
        </p>
      )}
    </div>
  );
}
