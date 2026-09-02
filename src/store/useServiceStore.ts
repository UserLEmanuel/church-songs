import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, PageType, Service } from '../types';
import { uid } from '../lib/uid';
import { DEFAULT_BACKGROUND_ID } from '../lib/constants';
import { buildTemplate, type TemplateId } from '../lib/templates';

type ServiceState = {
  service: Service;
  /** Pagina selectata in sidebar (cea previzualizata si editata). */
  selectedPageId: string | null;

  setServiceName: (name: string) => void;
  newService: (template: TemplateId) => void;

  selectPage: (id: string) => void;
  /** Adauga o pagina de tipul dat; `index` = pozitia de inserare (default: la final). */
  addPage: (type: PageType, index?: number) => void;
  removePage: (id: string) => void;
  duplicatePage: (id: string) => void;
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

const emptyService = (): Service => ({ name: defaultServiceName(), pages: [] });

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      service: emptyService(),
      selectedPageId: null,

      setServiceName: (name) => set((s) => ({ service: { ...s.service, name } })),

      newService: (template) => {
        const pages = buildTemplate(template);
        set({
          service: { name: defaultServiceName(), pages },
          selectedPageId: pages[0]?.id ?? null,
        });
      },

      selectPage: (id) => set({ selectedPageId: id }),

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
      // Salvam doar serviciul si selectia; restul se recalculeaza la pornire.
      partialize: (s) => ({ service: s.service, selectedPageId: s.selectedPageId }),
    },
  ),
);

/** Helper: pagina selectata (sau undefined). */
export function useSelectedPage(): Page | undefined {
  return useServiceStore((s) => s.service.pages.find((p) => p.id === s.selectedPageId));
}
