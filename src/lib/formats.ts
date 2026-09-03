// Formatele de slide disponibile.
//
// Un serviciu are UN singur format (un PDF cu pagini de dimensiuni diferite
// nu are sens). Toate marimile "de baza" sunt in px la 96 DPI, iar exportul
// PDF foloseste echivalentul in milimetri.

export type FormatId = 'a4' | 'wide' | 'square';

export type SlideFormat = {
  id: FormatId;
  label: string;
  /** Explicatie scurta pentru utilizator. */
  hint: string;
  /** Raportul scris omeneste, afisat in UI. */
  ratio: string;
  /** Dimensiunea de baza in px (la aceasta se raporteaza marimile de font). */
  width: number;
  height: number;
  /** Marginea interioara. */
  padding: number;
  /** Limitele auto-fit-ului pentru acest format. */
  fontMax: number;
  fontMin: number;
  /** Dimensiunea paginii PDF in milimetri. */
  pdf: { width: number; height: number };
};

/** px la 96 DPI -> milimetri. */
const mm = (px: number) => +((px / 96) * 25.4).toFixed(2);

export const FORMATS: Record<FormatId, SlideFormat> = {
  a4: {
    id: 'a4',
    label: 'A4 portret',
    hint: 'Pentru tipărit sau pentru dosarul serviciului.',
    ratio: '210 × 297 mm',
    width: 794,
    height: 1123,
    padding: 72,
    fontMax: 36,
    fontMin: 11,
    pdf: { width: 210, height: 297 },
  },
  wide: {
    id: 'wide',
    label: 'Ecran lat 16:9',
    hint: 'Pentru videoproiector și televizoare. Cel mai potrivit pentru proiecție.',
    ratio: '16 : 9',
    width: 1280,
    height: 720,
    padding: 72,
    fontMax: 44,
    fontMin: 12,
    pdf: { width: mm(1280), height: mm(720) },
  },
  square: {
    id: 'square',
    label: 'Pătrat 1:1',
    hint: 'Pentru postări pe Facebook sau Instagram.',
    ratio: '1 : 1',
    width: 1080,
    height: 1080,
    padding: 88,
    fontMax: 48,
    fontMin: 13,
    pdf: { width: mm(1080), height: mm(1080) },
  },
};

export const FORMAT_LIST: SlideFormat[] = [FORMATS.wide, FORMATS.a4, FORMATS.square];

export const DEFAULT_FORMAT: FormatId = 'wide';

/** Ia formatul dupa id, cu revenire pe cel implicit daca id-ul e necunoscut. */
export function getFormat(id: FormatId | undefined): SlideFormat {
  return (id && FORMATS[id]) || FORMATS[DEFAULT_FORMAT];
}
