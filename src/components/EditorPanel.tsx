import type { ReactNode } from 'react';
import type { Page } from '../types';
import { PAGE_TYPE_LABEL } from '../lib/pageMeta';
import { useLibraryStore } from '../store/useLibraryStore';
import { useServiceStore } from '../store/useServiceStore';
import { SearchableSelect } from './SearchableSelect';

/** Coloana din dreapta: campurile paginii selectate, in functie de tipul ei. */
export function EditorPanel({ page }: { page: Page }) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-white">
      <header className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">{PAGE_TYPE_LABEL[page.type]}</h2>
        {page.hint && <p className="mt-0.5 text-xs text-slate-500">{page.hint}</p>}
      </header>

      <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {page.type === 'chemare' && <ChemareFields page={page} />}
        {page.type === 'cantare' && <LibraryFields page={page} kind="cantare" />}
        {page.type === 'text-fix' && <LibraryFields page={page} kind="text-fix" />}
        {page.type === 'predica' && <PredicaFields page={page} />}
        {page.type === 'libera' && <LiberaFields page={page} />}
      </div>
    </section>
  );
}

/* ---------- bucati reutilizabile ---------- */

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500';

/** Hook mic: scrie un camp al paginii curente in store. */
function useSetField(pageId: string) {
  const updatePage = useServiceStore((s) => s.updatePage);
  return (patch: Partial<Page>) => updatePage(pageId, patch);
}

/* ---------- campuri per tip ---------- */

function ChemareFields({ page }: { page: Page }) {
  const set = useSetField(page.id);
  return (
    <>
      <Field label="Pasajul biblic" hint="Apare mic, deasupra textului.">
        <input
          className={inputClass}
          value={page.reference ?? ''}
          onChange={(e) => set({ reference: e.target.value })}
          placeholder="Psalmul 100:1-5"
        />
      </Field>
      <Field label="Titlu (opțional)">
        <input
          className={inputClass}
          value={page.title ?? ''}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Chemare la închinare"
        />
      </Field>
      <Field label="Textul">
        <textarea
          className={`${inputClass} min-h-[16rem] resize-y font-[inherit] leading-relaxed`}
          value={page.body ?? ''}
          onChange={(e) => set({ body: e.target.value })}
          placeholder="Strigați de bucurie către Domnul, toți locuitorii pământului!…"
        />
      </Field>
    </>
  );
}

function PredicaFields({ page }: { page: Page }) {
  const set = useSetField(page.id);
  return (
    <>
      <Field label="Tema predicii">
        <input
          className={inputClass}
          value={page.title ?? ''}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Harul care ne învață"
        />
      </Field>
      <Field label="Pasajul">
        <input
          className={inputClass}
          value={page.reference ?? ''}
          onChange={(e) => set({ reference: e.target.value })}
          placeholder="Tit 2:11-14"
        />
      </Field>
    </>
  );
}

function LiberaFields({ page }: { page: Page }) {
  const set = useSetField(page.id);
  return (
    <>
      <Field label="Titlu (opțional)">
        <input
          className={inputClass}
          value={page.title ?? ''}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Anunțuri"
        />
      </Field>
      <Field label="Text">
        <textarea
          className={`${inputClass} min-h-[18rem] resize-y leading-relaxed`}
          value={page.body ?? ''}
          onChange={(e) => set({ body: e.target.value })}
          placeholder="Scrie aici orice text…"
        />
      </Field>
    </>
  );
}

/**
 * Campurile pentru paginile care iau continut din biblioteca:
 * `cantare` (songs.json) si `text-fix` (fixed_texts.json).
 */
function LibraryFields({ page, kind }: { page: Page; kind: 'cantare' | 'text-fix' }) {
  const set = useSetField(page.id);
  const songs = useLibraryStore((s) => s.songs);
  const fixedTexts = useLibraryStore((s) => s.fixedTexts);
  const loading = useLibraryStore((s) => s.loading);
  const error = useLibraryStore((s) => s.error);

  const isSong = kind === 'cantare';
  const items = isSong ? songs : fixedTexts;
  const selectedId = isSong ? page.songId : page.fixedTextId;

  return (
    <>
      <div className="flex min-h-[18rem] flex-col">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {isSong ? 'Alege cântarea' : 'Alege textul'}
        </span>

        {error && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}

        <SearchableSelect
          items={items}
          value={selectedId}
          placeholder={isSong ? 'Caută după titlu…' : 'Caută…'}
          emptyLabel={loading ? 'Se încarcă…' : 'Niciun rezultat.'}
          onSelect={(item) =>
            // Copiem titlul si textul in pagina (snapshot), ca sa ramana stabile
            // chiar daca biblioteca se schimba mai tarziu.
            set(
              isSong
                ? { songId: item.id, title: item.title, body: item.body ?? '' }
                : { fixedTextId: item.id, title: item.title, body: item.body ?? '' },
            )
          }
        />
      </div>

      <Field label="Titlu pe slide">
        <input
          className={inputClass}
          value={page.title ?? ''}
          onChange={(e) => set({ title: e.target.value })}
          placeholder={isSong ? 'Titlul cântării' : 'Titlul textului'}
        />
      </Field>

      <Field label="Text pe slide" hint="Poți șterge strofe sau ajusta textul doar pentru azi.">
        <textarea
          className={`${inputClass} min-h-[14rem] resize-y leading-relaxed`}
          value={page.body ?? ''}
          onChange={(e) => set({ body: e.target.value })}
          placeholder={isSong ? 'Versurile apar aici după ce alegi cântarea.' : ''}
        />
      </Field>
    </>
  );
}
