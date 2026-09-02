import { useEffect } from 'react';
import { TEMPLATES, type TemplateId } from '../lib/templates';
import { useServiceStore } from '../store/useServiceStore';

type Props = { open: boolean; onClose: () => void };

/** Dialogul "Serviciu nou": alege sablonul standard sau porneste de la zero. */
export function NewServiceDialog({ open, onClose }: Props) {
  const newService = useServiceStore((s) => s.newService);
  const hasPages = useServiceStore((s) => s.service.pages.length > 0);

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
    newService(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900">Serviciu nou</h2>
        {hasPages && (
          <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Atenție: serviciul curent va fi înlocuit. Exportă-l în PDF întâi dacă vrei să-l
            păstrezi.
          </p>
        )}

        <div className="mt-4 grid gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => choose(t.id)}
              className="rounded-lg border border-slate-200 p-3 text-left transition hover:border-slate-800 hover:bg-slate-50"
            >
              <span className="block font-medium text-slate-900">{t.name}</span>
              <span className="block text-sm text-slate-500">{t.description}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Renunță
          </button>
        </div>
      </div>
    </div>
  );
}
