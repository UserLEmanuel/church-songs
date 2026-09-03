import { useEffect } from 'react';
import { getFormat } from '../lib/formats';
import { useServiceStore } from '../store/useServiceStore';
import { IconFile, IconImages } from './icons';

export type ExportKind = 'pdf' | 'images';

type Props = {
  open: boolean;
  onClose: () => void;
  onChoose: (kind: ExportKind) => void;
};

/** Dialogul de export: un singur PDF, sau cate o imagine per slide intr-un .zip. */
export function ExportDialog({ open, onClose, onChoose }: Props) {
  const pages = useServiceStore((s) => s.service.pages);
  const formatId = useServiceStore((s) => s.service.format);
  const format = getFormat(formatId);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pixels = `${format.width * 2} × ${format.height * 2} px`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl bg-surface p-4 shadow-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="export-title" className="text-lg font-bold text-ink">
          Exportă serviciul
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {pages.length} {pages.length === 1 ? 'slide' : 'slide-uri'} în format{' '}
          <strong className="font-semibold text-ink">{format.label}</strong>.
        </p>

        <div className="mt-4 grid gap-2.5">
          <button
            type="button"
            onClick={() => onChoose('pdf')}
            className="flex items-start gap-3 rounded-xl border border-line p-3.5 text-left transition hover:border-brand hover:bg-brand-soft"
          >
            <span className="mt-0.5 shrink-0 text-brand">
              <IconFile size={22} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">Un singur PDF</span>
              <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                Toate slide-urile într-un fișier, în ordine. Bun pentru tipărit sau pentru a-l
                deschide pe alt calculator.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChoose('images')}
            className="flex items-start gap-3 rounded-xl border border-line p-3.5 text-left transition hover:border-brand hover:bg-brand-soft"
          >
            <span className="mt-0.5 shrink-0 text-brand">
              <IconImages size={22} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">
                Imagini separate (.zip)
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                Câte un JPG per slide ({pixels}), numerotate în ordine. Bun pentru programul de
                proiecție.
              </span>
            </span>
          </button>
        </div>

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-muted transition hover:bg-surface-sunken"
          >
            Renunță
          </button>
        </div>
      </div>
    </div>
  );
}
