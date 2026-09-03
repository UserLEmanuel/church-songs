import { useEffect, useRef, useState } from 'react';
import { PAGE_TYPES, PAGE_TYPE_HELP, PAGE_TYPE_LABEL } from '../lib/pageMeta';
import { useServiceStore } from '../store/useServiceStore';
import { IconPlus } from './icons';

type Props = {
  /** Pozitia unde se insereaza pagina noua. */
  index: number;
  /** `inline` = butonasul dintre pagini; `button` = butonul mare de jos. */
  variant?: 'inline' | 'button';
};

/** Buton care deschide un mic meniu cu tipurile de pagina si insereaza pagina la `index`. */
export function AddPageMenu({ index, variant = 'button' }: Props) {
  const addPage = useServiceStore((s) => s.addPage);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Inchidem meniul la click in afara sau la Escape.
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
    <div ref={wrapRef} className="relative">
      {variant === 'button' ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong px-3 py-2.5 text-[13px] font-semibold text-ink-muted transition hover:border-brand hover:bg-brand-soft hover:text-brand"
        >
          <IconPlus size={15} />
          Adaugă pagină
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title="Inserează o pagină aici"
          aria-label={`Inserează o pagină pe poziția ${index + 1}`}
          aria-expanded={open}
          className={`flex h-4 w-full items-center justify-center transition ${
            open ? 'opacity-100' : 'opacity-0 hover:opacity-100 focus-visible:opacity-100'
          }`}
        >
          <span className="h-px flex-1 bg-brand/30" />
          <span className="mx-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white">
            <IconPlus size={10} />
          </span>
          <span className="h-px flex-1 bg-brand/30" />
        </button>
      )}

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-30 mb-1.5 w-full min-w-[16rem] overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
        >
          {PAGE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              onClick={() => {
                addPage(type, index);
                setOpen(false);
              }}
              className="block w-full border-b border-line/60 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-brand-soft"
            >
              <span className="block text-[13px] font-semibold text-ink">
                {PAGE_TYPE_LABEL[type]}
              </span>
              <span className="block text-xs text-ink-muted">{PAGE_TYPE_HELP[type]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
