import { useRef } from 'react';
import type { Page } from '../types';
import { DEFAULT_OVERLAY } from '../lib/constants';
import { useLibraryStore } from '../store/useLibraryStore';
import { useServiceStore } from '../store/useServiceStore';

type Props = { page: Page };

/** Galeria de fundaluri + upload propriu + sliderul de overlay, pentru pagina selectata. */
export function BackgroundPicker({ page }: Props) {
  const backgrounds = useLibraryStore((s) => s.backgrounds);
  const addCustomBackground = useLibraryStore((s) => s.addCustomBackground);
  const updatePage = useServiceStore((s) => s.updatePage);
  const setBackgroundForAll = useServiceStore((s) => s.setBackgroundForAll);
  const fileRef = useRef<HTMLInputElement>(null);

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
    <div className="border-t border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fundal</h3>
        <button
          type="button"
          onClick={() => setBackgroundForAll(page.backgroundId)}
          className="text-xs text-slate-500 underline decoration-dotted hover:text-slate-800"
        >
          Aplică la toate
        </button>
      </div>

      <div className="thin-scroll grid max-h-40 grid-cols-4 gap-1.5 overflow-y-auto pr-1">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            type="button"
            title={bg.label}
            onClick={() => updatePage(page.id, { backgroundId: bg.id })}
            className={`aspect-[210/297] overflow-hidden rounded border-2 ${
              bg.id === page.backgroundId
                ? 'border-slate-800'
                : 'border-transparent hover:border-slate-400'
            }`}
          >
            <img src={bg.src} alt={bg.label} className="h-full w-full object-cover" />
          </button>
        ))}
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
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white"
      >
        Încarcă imaginea ta…
      </button>
      <p className="mt-1 text-[11px] leading-tight text-slate-400">
        Imaginile încărcate rămân doar în sesiunea curentă (se pierd la reîncărcarea paginii).
      </p>

      <label className="mt-3 block">
        <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
          Întunecare fundal
          <span className="font-normal normal-case tracking-normal text-slate-400">
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
          className="mt-1 w-full accent-slate-800"
        />
      </label>
    </div>
  );
}
