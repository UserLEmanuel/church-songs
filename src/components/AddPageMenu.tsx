import { useEffect, useRef, useState } from 'react';
import { PAGE_TYPES, PAGE_TYPE_HELP, PAGE_TYPE_LABEL } from '../lib/pageMeta';
import { useServiceStore } from '../store/useServiceStore';

type Props = {
  /** Pozitia unde se insereaza pagina noua. */
  index: number;
  /** `inline` = butonasul "+" dintre pagini; `button` = butonul mare de jos. */
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
          className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-white"
        >
          + Adaugă pagină
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title="Inserează o pagină aici"
          aria-label="Inserează o pagină aici"
          className="mx-auto flex h-4 w-full items-center justify-center opacity-0 transition hover:opacity-100 focus:opacity-100 group-hover/list:opacity-60"
        >
          <span className="h-px w-full bg-slate-300" />
          <span className="mx-1 rounded-full bg-slate-300 px-1.5 text-[10px] font-bold leading-4 text-white">
            +
          </span>
          <span className="h-px w-full bg-slate-300" />
        </button>
      )}

      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-1 w-full min-w-[15rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {PAGE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                addPage(type, index);
                setOpen(false);
              }}
              className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-slate-100"
            >
              <span className="block text-sm font-medium text-slate-800">
                {PAGE_TYPE_LABEL[type]}
              </span>
              <span className="block text-xs text-slate-500">{PAGE_TYPE_HELP[type]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
