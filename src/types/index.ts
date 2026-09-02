// Modelul de date al aplicatiei.

/** Tipurile de pagina dintr-un serviciu. */
export type PageType = 'chemare' | 'cantare' | 'text-fix' | 'predica' | 'libera';

/** O pagina din serviciu (o "slide" A4). */
export type Page = {
  id: string;
  type: PageType;
  /** Referinta catre un fundal (default din public/backgrounds sau unul uploadat). */
  backgroundId: string;
  /** Opacitatea overlay-ului negru, 0..1. Daca lipseste se foloseste DEFAULT_OVERLAY. */
  overlayOpacity?: number;

  // Campurile de continut. Toate optionale in tip; ce se afiseaza depinde de `type`.
  title?: string;
  reference?: string; // pasaj biblic, ex. "Psalmul 100:1-5"
  body?: string;
  songId?: string; // pentru type === 'cantare'
  fixedTextId?: string; // pentru type === 'text-fix'

  /** Text ajutator din sablon ("alege cantarea"), afisat cat timp pagina e goala. */
  hint?: string;
};

/** Serviciul curent = nume + lista ordonata de pagini. */
export type Service = {
  name: string;
  pages: Page[];
};

/** O cantare din biblioteca (public/data/songs.json). */
export type Song = {
  id: string;
  title: string;
  /** Versurile: "\n" intre versuri, linie goala intre strofe. */
  body: string;
};

/** Un text presetat (Crez, Tatal Nostru, capitol biblic) din public/data/fixed_texts.json. */
export type FixedText = {
  id: string;
  title: string;
  body: string;
};

/** Un fundal disponibil in galerie. */
export type Background = {
  id: string;
  label: string;
  /** URL-ul imaginii: fie din /backgrounds, fie un object URL pentru upload. */
  src: string;
  /** true daca a fost incarcat de utilizator in sesiunea curenta. */
  custom?: boolean;
};
