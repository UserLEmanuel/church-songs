// Constante de randare.

/** Dimensiunea "de baza" a paginii A4 la 96 DPI (210x297 mm). */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

/** Marginea interioara a paginii (cam 19 mm). */
export const PAGE_PADDING = 72;

/** Opacitatea implicita a overlay-ului negru peste fundal. */
export const DEFAULT_OVERLAY = 0.35;

/** Fontul cerut: Tahoma, cu fallback-uri. */
export const FONT_STACK = 'Tahoma, Verdana, Geneva, sans-serif';

/** Limitele pentru auto-fit: incepem de la 36px si micsoram doar daca nu incape. */
export const FONT_MAX = 36;
export const FONT_MIN = 11;

/** Id-ul fundalului folosit implicit pentru pagini noi. */
export const DEFAULT_BACKGROUND_ID = 'bg-01';
