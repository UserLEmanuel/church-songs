import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Slide } from './Slide';
import { getFormat } from '../lib/formats';
import { SMALL_FONT_WARNING } from '../lib/constants';
import { linesPerSlide, splitBody } from '../lib/splitBody';
import { resolveBackgroundSrc, useLibraryStore } from '../store/useLibraryStore';
import { useSelectedPage, useServiceStore } from '../store/useServiceStore';
import { IconWarning, IconScissors } from './icons';

/** Zona din mijloc: previzualizarea live a slide-ului selectat, scalata ca sa incapa. */
export function CanvasPreview() {
  const page = useSelectedPage();
  const pages = useServiceStore((s) => s.service.pages);
  const formatId = useServiceStore((s) => s.service.format);
  const fontId = useServiceStore((s) => s.service.font);
  const splitPage = useServiceStore((s) => s.splitPage);
  const backgrounds = useLibraryStore((s) => s.backgrounds);

  const format = getFormat(formatId);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [fontSize, setFontSize] = useState(format.fontMax);

  const handleFontSize = useCallback((px: number) => setFontSize(px), []);

  // Recalculam scara ori de cate ori se schimba spatiul disponibil sau formatul.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      // Trebuie sa corespunda cu clasa de padding de mai jos (p-3 pe telefon, p-7 in rest).
      const padding = window.innerWidth < 768 ? 24 : 56;
      const w = el.clientWidth - padding;
      const h = el.clientHeight - padding;
      if (w <= 0 || h <= 0) return;
      setScale(Math.max(0.05, Math.min(w / format.width, h / format.height)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [format.width, format.height]);

  const index = page ? pages.findIndex((p) => p.id === page.id) : -1;
  // Avertizam doar cand chiar exista text: o pagina goala nu e o problema.
  const tooSmall = page && fontSize < SMALL_FONT_WARNING && (page.body?.trim().length ?? 0) > 0;
  // Cate pagini ar rezulta daca utilizatorul accepta impartirea.
  const chunks = tooSmall ? splitBody(page.body ?? '', linesPerSlide(format)) : null;

  return (
    <div ref={wrapRef} className="relative flex h-full items-center justify-center bg-canvas p-3 md:p-7">
      {page ? (
        <>
          <div
            style={{ width: format.width * scale, height: format.height * scale }}
            className="overflow-hidden rounded shadow-[0_18px_50px_-12px_rgba(34,30,46,0.45)] ring-1 ring-black/10"
          >
            <div
              style={{
                width: format.width,
                height: format.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <Slide
                page={page}
                backgroundSrc={resolveBackgroundSrc(backgrounds, page.backgroundId)}
                formatId={formatId}
                fontId={fontId}
                onFontSize={handleFontSize}
              />
            </div>
          </div>

          {/* Avertisment cand textul a fost micsorat sub pragul de lizibilitate. */}
          {tooSmall && (
            <div className="absolute bottom-3 left-1/2 flex max-w-md -translate-x-1/2 items-start gap-2.5 rounded-lg border border-gold/30 bg-gold-soft px-3 py-2 shadow-sm">
              <span className="mt-0.5 shrink-0 text-gold">
                <IconWarning size={16} />
              </span>
              <p className="text-xs leading-snug text-ink-muted">
                Textul a fost micșorat la <strong className="text-ink">{fontSize}px</strong> ca să
                încapă — greu de citit pe proiector.
                {chunks && (
                  <button
                    type="button"
                    onClick={() => splitPage(page.id)}
                    className="ml-1 inline-flex items-center gap-1 font-semibold text-brand underline decoration-brand/40 underline-offset-2 transition hover:text-brand-hover"
                  >
                    <IconScissors size={13} />
                    Împarte pe {chunks.length} pagini
                  </button>
                )}
              </p>
            </div>
          )}

          <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] tabular-nums text-ink-subtle">
            {index + 1} / {pages.length} · {format.label} · {Math.round(scale * 100)}% ·{' '}
            {fontSize}px
          </span>
        </>
      ) : (
        <p className="max-w-xs text-center text-sm text-ink-muted">
          Selectează o pagină din stânga sau apasă <strong className="text-ink">Serviciu nou</strong>{' '}
          ca să pornești de la un șablon.
        </p>
      )}
    </div>
  );
}
