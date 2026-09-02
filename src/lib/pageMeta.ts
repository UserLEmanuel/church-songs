import type { PageType } from '../types';

/** Eticheta afisata in UI pentru fiecare tip de pagina. */
export const PAGE_TYPE_LABEL: Record<PageType, string> = {
  chemare: 'Chemare la închinare',
  cantare: 'Cântare',
  'text-fix': 'Text fix',
  predica: 'Text predică',
  libera: 'Pagină liberă',
};

/** O descriere scurta, folosita in meniul "Adaugă pagină". */
export const PAGE_TYPE_HELP: Record<PageType, string> = {
  chemare: 'Pasaj biblic de deschidere',
  cantare: 'Cântare din bibliotecă',
  'text-fix': 'Crez, Tatăl Nostru, capitol biblic…',
  predica: 'Tema predicii + pasajul',
  libera: 'Orice text vrei tu',
};

/** Toate tipurile, in ordinea in care apar in meniu. */
export const PAGE_TYPES: PageType[] = ['chemare', 'cantare', 'text-fix', 'predica', 'libera'];
