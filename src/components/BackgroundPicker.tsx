import { useRef } from 'react';
import type { Page } from '../types';
import { DEFAULT_OVERLAY } from '../lib/constants';
import { getFormat } from '../lib/formats';
import { useLibraryStore } from '../store/useLibraryStore';
import { useServiceStore } from '../store/useServiceStore';
import { IconCheck, IconUpload } from './icons';

type Props = { page: Page };

/** Galeria de fundaluri + upload propriu + sliderul de intunecare, pentru pagina selectata. */
export function BackgroundPicker({ page }: Props) {
  const backgrounds = useLibraryStore((s) => s.backgrounds);
  const addCustomBackground = useLibraryStore((s) => s.addCustomBackground);
  const updatePage = useServiceStore((s) => s.updatePage);
  const setBackgroundForAll = useServiceStore((s) => s.setBackgroundForAll);
  const formatId = useServiceStore((s) => s.service.format);
  const fileRef = useRef<HTMLInputElement>(null);

  const format = getFormat(formatId);
  const overlay = page.overlayOpacity ?? DEFAULT_OVERLAY;

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    let lastId: string | null = null;
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) lastId = addCustomBackground(file);
    }
    if (lastId) updatePage(page.id, { backgroundId: lastId });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="border-t border-line bg-surface-sunken/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Fundal</h3>
        <button
          type="button"
          onClick={() => setBackgroundForAll(page.backgroundId)}
          className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-brand transition hover:bg-brand-soft"
        >
          Aplică la toate
        </button>
      </div>

      <div className="thin-scroll grid max-h-36 grid-cols-4 gap-1.5 overflow-y-auto pr-1">
        {backgrounds.map((bg) => {
          const active = bg.id === page.backgroundId;
          return (
            <button
              key={bg.id}
              type="button"
              title={bg.label}
              aria-label={`Fundal: ${bg.label}`}
              aria-pressed={active}
              onClick={() => updatePage(page.id, { backgroundId: bg.id })}
              style={{ aspectRatio: `${format.width} / ${format.height}` }}
              className={`relative overflow-hidden rounded-md ring-2 transition ${
                active ? 'ring-brand' : 'ring-transparent hover:ring-line-strong'
              }`}
            >
              <img src={bg.src} alt="" className="h-full w-full object-cover" />
              {active && (
                <span className="absolute inset-0 flex items-center justify-center bg-brand/35 text-white">
                  <IconCheck size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleUpload(e.target.files)}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-xs font-semibold text-ink-muted transition hover:border-brand hover:text-brand"
      >
        <IconUpload size={14} />
        Încarcă imaginea ta
      </button>
      <p className="mt-1 text-[11px] leading-tight text-ink-subtle">
        Imaginile încărcate rămân doar în sesiunea curentă.
      </p>

      <label className="mt-3 block">
        <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
          Întunecare fundal
          <span className="font-semibold normal-case tracking-normal tabular-nums text-ink-muted">
            {Math.round(overlay * 100)}%
          </span>
        </span>
        <input
          type="range"
          min={0}
          max={80}
          step={1}
          value={Math.round(overlay * 100)}
          onChange={(e) => updatePage(page.id, { overlayOpacity: Number(e.target.value) / 100 })}
          className="mt-1.5 w-full accent-brand"
        />
      </label>
    </div>
  );
}
