import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, PageType, Service } from '../types';
import { uid } from '../lib/uid';
import { DEFAULT_BACKGROUND_ID } from '../lib/constants';
import { DEFAULT_FORMAT, getFormat, type FormatId } from '../lib/formats';
import { DEFAULT_FONT, type FontId } from '../lib/fonts';
import { buildTemplate, type TemplateId } from '../lib/templates';
import { linesPerSlide, splitBody } from '../lib/splitBody';

type ServiceState = {
  service: Service;
  /** Pagina selectata in sidebar (cea previzualizata si editata). */
  selectedPageId: string | null;

  setServiceName: (name: string) => void;
  setFormat: (format: FormatId) => void;
  setFont: (font: FontId) => void;
  newService: (template: TemplateId) => void;

  selectPage: (id: string) => void;
  /** Muta selectia cu un pas inainte/inapoi (pentru sagetile de la tastatura). */
  selectRelative: (delta: number) => void;
  /** Adauga o pagina de tipul dat; `index` = pozitia de inserare (default: la final). */
  addPage: (type: PageType, index?: number) => void;
  removePage: (id: string) => void;
  duplicatePage: (id: string) => void;
  /** Imparte textul unei pagini pe mai multe pagini consecutive, la limita de strofa. */
  splitPage: (id: string) => void;
  /** Reordoneaza dupa drag & drop. */
  reorderPages: (from: number, to: number) => void;
  /** Modifica campurile unei pagini. */
  updatePage: (id: string, patch: Partial<Page>) => void;
  /** Pune acelasi fundal pe toate paginile (comod la inceput de serviciu). */
  setBackgroundForAll: (backgroundId: string) => void;
};

/** O pagina noua, goala, de tipul cerut. */
function makePage(type: PageType, backgroundId = DEFAULT_BACKGROUND_ID, hint?: string): Page {
  return { id: uid(), type, backgroundId, hint };
}

/** Numele implicit al serviciului: "Serviciu <data de azi>". */
function defaultServiceName(): string {
  const d = new Date();
  return `Serviciu ${d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}`;
}

const emptyService = (): Service => ({
  name: defaultServiceName(),
  format: DEFAULT_FORMAT,
  font: DEFAULT_FONT,
  pages: [],
});

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      service: emptyService(),
      selectedPageId: null,

      setServiceName: (name) => set((s) => ({ service: { ...s.service, name } })),
      setFormat: (format) => set((s) => ({ service: { ...s.service, format } })),
      setFont: (font) => set((s) => ({ service: { ...s.service, font } })),

      newService: (template) => {
        const pages = buildTemplate(template);
        const { format, font } = get().service; // pastram alegerile de format/font
        set({
          service: { name: defaultServiceName(), format, font, pages },
          selectedPageId: pages[0]?.id ?? null,
        });
      },

      selectPage: (id) => set({ selectedPageId: id }),

      selectRelative: (delta) => {
        const { service, selectedPageId } = get();
        const idx = service.pages.findIndex((p) => p.id === selectedPageId);
        if (idx === -1) return;
        const next = service.pages[idx + delta];
        if (next) set({ selectedPageId: next.id });
      },

      addPage: (type, index) => {
        const { service } = get();
        // Preluam fundalul paginii curente ca sa pastram un aspect unitar.
        const current = service.pages.find((p) => p.id === get().selectedPageId);
        const page = makePage(type, current?.backgroundId ?? DEFAULT_BACKGROUND_ID);
        if (current?.overlayOpacity !== undefined) page.overlayOpacity = current.overlayOpacity;

        const pages = [...service.pages];
        const at = index === undefined ? pages.length : Math.max(0, Math.min(index, pages.length));
        pages.splice(at, 0, page);
        set({ service: { ...service, pages }, selectedPageId: page.id });
      },

      removePage: (id) => {
        const { service, selectedPageId } = get();
        const idx = service.pages.findIndex((p) => p.id === id);
        if (idx === -1) return;
        const pages = service.pages.filter((p) => p.id !== id);
        // Daca stergem pagina selectata, selectam vecina (urmatoarea, altfel precedenta).
        let nextSelected = selectedPageId;
        if (selectedPageId === id) {
          nextSelected = pages[idx]?.id ?? pages[idx - 1]?.id ?? null;
        }
        set({ service: { ...service, pages }, selectedPageId: nextSelected });
      },

      duplicatePage: (id) => {
        const { service } = get();
        const idx = service.pages.findIndex((p) => p.id === id);
        if (idx === -1) return;
        const copy: Page = { ...service.pages[idx], id: uid() };
        const pages = [...service.pages];
        pages.splice(idx + 1, 0, copy);
        set({ service: { ...service, pages }, selectedPageId: copy.id });
      },

      splitPage: (id) => {
        const { service } = get();
        const idx = service.pages.findIndex((p) => p.id === id);
        if (idx === -1) return;
        const page = service.pages[idx];

        // Impartim in cate pagini e nevoie ca textul sa ramana lizibil
        // la formatul ales, nu doar in doua.
        const maxLines = linesPerSlide(getFormat(service.format));
        const chunks = splitBody(page.body ?? '', maxLines);
        if (!chunks) return; // prea scurt ca sa merite impartit

        const newPages: Page[] = chunks.map((body, i) =>
          i === 0
            ? { ...page, body }
            : { ...page, id: uid(), body, hint: undefined },
        );
        const pages = [...service.pages];
        pages.splice(idx, 1, ...newPages);
        set({ service: { ...service, pages }, selectedPageId: newPages[0].id });
      },

      reorderPages: (from, to) => {
        const { service } = get();
        if (from === to) return;
        const pages = [...service.pages];
        const [moved] = pages.splice(from, 1);
        if (!moved) return;
        pages.splice(to, 0, moved);
        set({ service: { ...service, pages } });
      },

      updatePage: (id, patch) =>
        set((s) => ({
          service: {
            ...s.service,
            pages: s.service.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          },
        })),

      setBackgroundForAll: (backgroundId) =>
        set((s) => ({
          service: {
            ...s.service,
            pages: s.service.pages.map((p) => ({ ...p, backgroundId })),
          },
        })),
    }),
    {
      name: 'service-builder:current-service',
      version: 2,
      // Salvam doar serviciul si selectia; restul se recalculeaza la pornire.
      partialize: (s) => ({ service: s.service, selectedPageId: s.selectedPageId }),
      // Serviciile salvate inainte de introducerea formatelor nu au `format`/`font`.
      migrate: (persisted, version) => {
        const state = persisted as { service?: Partial<Service>; selectedPageId?: string | null };
        if (version < 2 && state?.service) {
          state.service.format ??= 'a4'; // ce format aveau efectiv inainte
          state.service.font ??= DEFAULT_FONT;
        }
        return state as { service: Service; selectedPageId: string | null };
      },
    },
  ),
);

/** Helper: pagina selectata (sau undefined). */
export function useSelectedPage(): Page | undefined {
  return useServiceStore((s) => s.service.pages.find((p) => p.id === s.selectedPageId));
}
