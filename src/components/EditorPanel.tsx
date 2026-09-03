import type { ReactNode } from 'react';
import type { Page } from '../types';
import { PAGE_TYPE_LABEL } from '../lib/pageMeta';
import { linesPerSlide, splitBody } from '../lib/splitBody';
import { getFormat } from '../lib/formats';
import { useLibraryStore } from '../store/useLibraryStore';
import { useServiceStore } from '../store/useServiceStore';
import { SearchableSelect } from './SearchableSelect';
import { IconScissors } from './icons';

/** Coloana din dreapta: campurile paginii selectate, in functie de tipul ei. */
export function EditorPanel({ page }: { page: Page }) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-surface">
      <header className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-bold text-ink">{PAGE_TYPE_LABEL[page.type]}</h2>
        {page.hint && <p className="mt-0.5 text-xs leading-snug text-ink-muted">{page.hint}</p>}
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
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-subtle">{hint}</span>}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-brand';

/** Hook mic: scrie un camp al paginii curente in store. */
function useSetField(pageId: string) {
  const updatePage = useServiceStore((s) => s.updatePage);
  return (patch: Partial<Page>) => updatePage(pageId, patch);
}

/** Buton de impartire, aratat doar cand textul chiar poate fi impartit. */
function SplitButton({ page }: { page: Page }) {
  const splitPage = useServiceStore((s) => s.splitPage);
  const formatId = useServiceStore((s) => s.service.format);
  const chunks = splitBody(page.body ?? '', linesPerSlide(getFormat(formatId)));
  if (!chunks) return null;

  return (
    <button
      type="button"
      onClick={() => splitPage(page.id)}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line-strong bg-surface-muted px-3 py-2 text-xs font-semibold text-ink-muted transition hover:border-brand hover:bg-brand-soft hover:text-brand"
    >
      <IconScissors size={14} />
      Împarte textul pe {chunks.length} pagini
    </button>
  );
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
          className={`${inputClass} min-h-[15rem] resize-y leading-relaxed`}
          value={page.body ?? ''}
          onChange={(e) => set({ body: e.target.value })}
          placeholder="Strigați de bucurie către Domnul, toți locuitorii pământului!…"
        />
      </Field>
      <SplitButton page={page} />
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
          className={`${inputClass} min-h-[17rem] resize-y leading-relaxed`}
          value={page.body ?? ''}
          onChange={(e) => set({ body: e.target.value })}
          placeholder="Scrie aici orice text…"
        />
      </Field>
      <SplitButton page={page} />
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
      <div className="flex min-h-[17rem] flex-col">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
          {isSong ? 'Alege cântarea' : 'Alege textul'}
        </span>

        {error && (
          <p className="mb-2 rounded-lg bg-danger-soft p-2 text-xs text-danger">{error}</p>
        )}

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
          className={`${inputClass} min-h-[13rem] resize-y leading-relaxed`}
          value={page.body ?? ''}
          onChange={(e) => set({ body: e.target.value })}
          placeholder={isSong ? 'Versurile apar aici după ce alegi cântarea.' : ''}
        />
      </Field>

      <SplitButton page={page} />
    </>
  );
}
