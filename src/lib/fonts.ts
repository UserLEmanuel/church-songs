// Fonturile disponibile pentru slide-uri.
//
// Doar fonturi instalate implicit pe Windows/macOS: nu depindem de internet,
// iar exportul PDF le poate reda garantat (html2canvas nu asteapta descarcari).

export type FontId = 'tahoma' | 'georgia' | 'verdana' | 'segoe' | 'trebuchet';

export type SlideFont = { id: FontId; label: string; stack: string; note: string };

export const FONTS: Record<FontId, SlideFont> = {
  tahoma: {
    id: 'tahoma',
    label: 'Tahoma',
    stack: 'Tahoma, Verdana, Geneva, sans-serif',
    note: 'Sobru și foarte lizibil. Recomandat.',
  },
  georgia: {
    id: 'georgia',
    label: 'Georgia',
    stack: 'Georgia, "Times New Roman", serif',
    note: 'Serif cald, mai solemn.',
  },
  verdana: {
    id: 'verdana',
    label: 'Verdana',
    stack: 'Verdana, Geneva, sans-serif',
    note: 'Mai lat, se citește bine de departe.',
  },
  segoe: {
    id: 'segoe',
    label: 'Segoe UI',
    stack: '"Segoe UI", system-ui, sans-serif',
    note: 'Modern și curat.',
  },
  trebuchet: {
    id: 'trebuchet',
    label: 'Trebuchet',
    stack: '"Trebuchet MS", Tahoma, sans-serif',
    note: 'Prietenos, cu personalitate.',
  },
};

export const FONT_LIST: SlideFont[] = [
  FONTS.tahoma,
  FONTS.georgia,
  FONTS.verdana,
  FONTS.segoe,
  FONTS.trebuchet,
];

export const DEFAULT_FONT: FontId = 'tahoma';

export function getFont(id: FontId | undefined): SlideFont {
  return (id && FONTS[id]) || FONTS[DEFAULT_FONT];
}
