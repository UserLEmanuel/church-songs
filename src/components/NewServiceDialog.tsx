import { useEffect, useState } from 'react';
import { TEMPLATES, type TemplateId } from '../lib/templates';
import { FORMAT_LIST } from '../lib/formats';
import { useServiceStore } from '../store/useServiceStore';
import { IconRatio } from './icons';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Apelat doar cand serviciul chiar a fost creat (nu si la renuntare). */
  onCreated?: () => void;
};

/** Dialogul "Serviciu nou": alege formatul si sablonul. */
export function NewServiceDialog({ open, onClose, onCreated }: Props) {
  const newService = useServiceStore((s) => s.newService);
  const setFormat = useServiceStore((s) => s.setFormat);
  const currentFormat = useServiceStore((s) => s.service.format);
  const hasPages = useServiceStore((s) => s.service.pages.length > 0);

  // Formatul ales in dialog; se aplica in momentul crearii serviciului.
  const [format, setLocalFormat] = useState(currentFormat);
  useEffect(() => {
    if (open) setLocalFormat(currentFormat);
  }, [open, currentFormat]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const choose = (id: TemplateId) => {
    setFormat(format);
    newService(id);
    onCreated?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-service-title"
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl bg-surface p-4 shadow-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="new-service-title" className="text-lg font-bold text-ink">
          Serviciu nou
        </h2>

        {hasPages && (
          <p className="mt-2 rounded-lg border border-gold/30 bg-gold-soft px-3 py-2 text-sm text-ink-muted">
            Serviciul curent va fi înlocuit. Exportă-l întâi dacă vrei să-l păstrezi.
          </p>
        )}

        <fieldset className="mt-4">
          <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
            1. Pentru ce îl faci
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {FORMAT_LIST.map((f) => {
              const active = f.id === format;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setLocalFormat(f.id)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition ${
                    active
                      ? 'border-brand bg-brand-soft'
                      : 'border-line hover:border-line-strong hover:bg-surface-muted'
                  }`}
                >
                  <span className={active ? 'text-brand' : 'text-ink-subtle'}>
                    <IconRatio ratio={f.width / f.height} size={26} />
                  </span>
                  <span
                    className={`text-center text-xs font-semibold leading-tight ${
                      active ? 'text-brand' : 'text-ink'
                    }`}
                  >
                    {f.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-ink-subtle">
            {FORMAT_LIST.find((f) => f.id === format)?.hint}
          </p>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
            2. De unde pornești
          </legend>
          <div className="grid gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => choose(t.id)}
                className="rounded-xl border border-line p-3 text-left transition hover:border-brand hover:bg-brand-soft"
              >
                <span className="block text-sm font-semibold text-ink">{t.name}</span>
                <span className="mt-0.5 block text-xs text-ink-muted">{t.description}</span>
              </button>
            ))}
          </div>
        </fieldset>

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
