import { create } from 'zustand';
import type { Background, FixedText, Song } from '../types';
import { uid } from '../lib/uid';

/** Cele 12 fundaluri implicite din public/backgrounds/. */
const DEFAULT_BACKGROUNDS: Background[] = [
  { id: 'bg-01', label: 'Amurg cald' },
  { id: 'bg-02', label: 'Albastru profund' },
  { id: 'bg-03', label: 'Piatră caldă' },
  { id: 'bg-04', label: 'Verde măslin' },
  { id: 'bg-05', label: 'Vin & aur' },
  { id: 'bg-06', label: 'Cer de dimineață' },
  { id: 'bg-07', label: 'Gri catedrală' },
  { id: 'bg-08', label: 'Teracotă' },
  { id: 'bg-09', label: 'Indigo' },
  { id: 'bg-10', label: 'Nisip' },
  { id: 'bg-11', label: 'Brad' },
  { id: 'bg-12', label: 'Noapte senină' },
].map((b) => ({ ...b, src: `${import.meta.env.BASE_URL}backgrounds/${b.id}.svg` }));

type LibraryState = {
  songs: Song[];
  fixedTexts: FixedText[];
  backgrounds: Background[];
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  /** Adauga un fundal incarcat de utilizator (traieste doar in sesiunea curenta). */
  addCustomBackground: (file: File) => string;
  removeCustomBackground: (id: string) => void;
};

/** Citeste un JSON din public/data/ tinand cont de `base` (GitHub Pages). */
async function fetchData<T>(file: string): Promise<T[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${file}`);
  if (!res.ok) throw new Error(`Nu am putut încărca ${file} (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? (data as T[]) : [];
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  songs: [],
  fixedTexts: [],
  backgrounds: DEFAULT_BACKGROUNDS,
  loading: true,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const [songs, fixedTexts] = await Promise.all([
        fetchData<Song>('songs.json'),
        fetchData<FixedText>('fixed_texts.json'),
      ]);
      set({ songs, fixedTexts, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Eroare la încărcarea datelor' });
    }
  },

  addCustomBackground: (file) => {
    const id = `upload-${uid()}`;
    const bg: Background = {
      id,
      label: file.name.replace(/\.[^.]+$/, '').slice(0, 24),
      src: URL.createObjectURL(file),
      custom: true,
    };
    set({ backgrounds: [...get().backgrounds, bg] });
    return id;
  },

  removeCustomBackground: (id) => {
    const bg = get().backgrounds.find((b) => b.id === id);
    if (bg?.custom) URL.revokeObjectURL(bg.src);
    set({ backgrounds: get().backgrounds.filter((b) => b.id !== id) });
  },
}));

/** Cauta sursa unui fundal dupa id; daca lipseste (ex. upload pierdut la refresh) cade pe primul default. */
export function resolveBackgroundSrc(backgrounds: Background[], id: string): string | null {
  const found = backgrounds.find((b) => b.id === id);
  if (found) return found.src;
  return backgrounds[0]?.src ?? null;
}
