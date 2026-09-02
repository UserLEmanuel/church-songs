import type { Page, PageType } from '../types';
import { uid } from './uid';
import { DEFAULT_BACKGROUND_ID } from './constants';

export type TemplateId = 'presbiterian' | 'gol';

/** O intrare din sablon: ce tip de pagina si ce indicatie primeste utilizatorul. */
type TemplateEntry = { type: PageType; hint: string; title?: string };

/** Ordinea fixa a serviciului prezbiterian standard. */
const PRESBITERIAN: TemplateEntry[] = [
  { type: 'chemare', hint: 'Completează pasajul biblic de chemare la închinare' },
  { type: 'cantare', hint: 'Cântare (Laudă) — alege cântarea' },
  { type: 'text-fix', hint: 'Crez / Tatăl Nostru / capitol biblic — alege textul' },
  { type: 'cantare', hint: 'Cântare — alege cântarea' },
  { type: 'cantare', hint: 'Cântare — alege cântarea' },
  { type: 'cantare', hint: 'Cântare — alege cântarea' },
  { type: 'predica', hint: 'Text predică — scrie tema și pasajul' },
  { type: 'cantare', hint: 'Cântare de colectă — alege cântarea' },
  { type: 'cantare', hint: 'Cântare finală — alege cântarea' },
  { type: 'cantare', hint: 'Cântare finală — alege cântarea' },
];

/** Construieste lista de pagini goale pentru un sablon. */
export function buildTemplate(template: TemplateId): Page[] {
  if (template === 'gol') return [];
  return PRESBITERIAN.map((entry) => ({
    id: uid(),
    type: entry.type,
    backgroundId: DEFAULT_BACKGROUND_ID,
    hint: entry.hint,
    title: entry.title,
  }));
}

export const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  {
    id: 'presbiterian',
    name: 'Prezbiterian standard',
    description: '10 pagini în ordinea obișnuită a serviciului, gata de completat.',
  },
  {
    id: 'gol',
    name: 'Serviciu gol',
    description: 'Pornești de la zero și adaugi tu paginile.',
  },
];
