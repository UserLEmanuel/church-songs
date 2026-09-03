import { useEffect, useRef, useState } from 'react';
import { FORMAT_LIST, getFormat } from '../lib/formats';
import { FONT_LIST } from '../lib/fonts';
import { useServiceStore } from '../store/useServiceStore';
import { IconRatio } from './icons';

/**
 * Buton din bara de sus care deschide setarile de aspect ale serviciului:
 * formatul slide-urilor si fontul. Sunt setari pentru tot serviciul, nu per pagina.
 */
export function SlideSettingsMenu() {
  const formatId = useServiceStore((s) => s.service.format);
  const fontId = useServiceStore((s) => s.service.font);
  const setFormat = useServiceStore((s) => s.setFormat);
  const setFont = useServiceStore((s) => s.setFont);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const format = getFormat(formatId);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Formatul și fontul slide-urilor"
        className="flex h-10 min-w-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink-muted transition hover:border-brand hover:text-brand md:h-auto md:py-1.5"
      >
        <IconRatio ratio={format.width / format.height} size={16} />
        <span className="hidden sm:inline">{format.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-[min(20rem,calc(100vw-1rem))] max-h-[70vh] overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface shadow-xl">
          <fieldset className="p-3">
            <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              Format slide
            </legend>
            <div className="grid gap-1.5">
              {FORMAT_LIST.map((f) => {
                const active = f.id === formatId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    aria-pressed={active}
                    className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition ${
                      active
                        ? 'border-brand bg-brand-soft'
                        : 'border-line hover:border-line-strong hover:bg-surface-muted'
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 ${active ? 'text-brand' : 'text-ink-subtle'}`}>
                      <IconRatio ratio={f.width / f.height} size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-baseline gap-1.5">
                        <span
                          className={`text-[13px] font-semibold ${active ? 'text-brand' : 'text-ink'}`}
                        >
                          {f.label}
                        </span>
                        <span className="text-[11px] tabular-nums text-ink-subtle">{f.ratio}</span>
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                        {f.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="border-t border-line p-3">
            <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              Font pe slide
            </legend>
            <div className="grid gap-1">
              {FONT_LIST.map((f) => {
                const active = f.id === fontId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFont(f.id)}
                    aria-pressed={active}
                    style={{ fontFamily: f.stack }}
                    className={`flex items-baseline justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition ${
                      active ? 'bg-brand text-white' : 'hover:bg-surface-muted'
                    }`}
                  >
                    <span className="text-[13px] font-semibold">{f.label}</span>
                    <span
                      className={`truncate text-[11px] ${active ? 'text-white/80' : 'text-ink-subtle'}`}
                    >
                      {f.note}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
