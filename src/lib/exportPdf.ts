import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { A4Page } from '../components/A4Page';
import { A4_HEIGHT, A4_WIDTH } from './constants';
import type { Page } from '../types';

/** De cate ori marim rezolutia fata de pagina de baza (2 => ~1588x2246 px). */
const EXPORT_SCALE = 2;

/** Dimensiunile A4 in milimetri, pentru jsPDF. */
const A4_MM = { width: 210, height: 297 };

/**
 * Transforma imaginea de fundal intr-un JPEG data-URL deja decupat "cover" pe A4.
 *
 * De ce: html2canvas se impiedica uneori de SVG-uri sau de object URL-uri.
 * Daca ii dam un JPEG data-URL gata potrivit pe raportul paginii, exportul e stabil.
 */
async function rasterizeBackground(src: string): Promise<string | null> {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Nu am putut încărca fundalul: ${src}`));
      img.src = src;
    });

    const canvas = document.createElement('canvas');
    canvas.width = A4_WIDTH * EXPORT_SCALE;
    canvas.height = A4_HEIGHT * EXPORT_SCALE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Reproducem manual `object-fit: cover`.
    const iw = img.naturalWidth || A4_WIDTH;
    const ih = img.naturalHeight || A4_HEIGHT;
    const scale = Math.max(canvas.width / iw, canvas.height / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);

    // JPEG, nu PNG: fundalul e opac, iar data-URL-ul iese de ~40x mai mic
    // (0.1 MB fata de 4.5 MB). html2canvas il re-citeste la fiecare pagina,
    // deci diferenta se vede direct in viteza exportului.
    return canvas.toDataURL('image/jpeg', 0.92);
  } catch {
    return null; // fara fundal e mai bine decat sa cada tot exportul
  }
}

/**
 * Asteapta un frame de randare.
 *
 * Atentie: daca tab-ul e in fundal, browserul nu mai declanseaza
 * requestAnimationFrame. De aceea punem si un timeout de siguranta, altfel
 * exportul s-ar bloca la nesfarsit cand utilizatorul schimba tab-ul.
 */
function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    requestAnimationFrame(finish);
    setTimeout(finish, 50);
  });
}

/** Asteapta ca o imagine sa fie gata, dar nu mai mult de 5 secunde. */
function waitForImage(img: HTMLImageElement): Promise<void> {
  const loaded = img.complete
    ? img.decode().catch(() => undefined)
    : new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 5000));
  return Promise.race([Promise.resolve(loaded).then(() => undefined), timeout]);
}

/** Asteapta ca React sa fi randat, fontul sa fie gata si imaginile sa fie decodate. */
async function settle(host: HTMLElement): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await nextFrame();
  await nextFrame();

  if (document.fonts?.ready) await document.fonts.ready;

  const images = Array.from(host.querySelectorAll('img'));
  await Promise.all(images.map((img) => waitForImage(img)));

  await nextFrame();
}

/** Curata numele fisierului de caractere interzise in Windows. */
function safeFileName(name: string): string {
  const cleaned = name.replace(/[\/:*?"<>|]+/g, '-').trim();
  return (cleaned || 'serviciu') + '.pdf';
}

type ExportOptions = {
  name: string;
  pages: Page[];
  /** Cum aflam sursa imaginii de fundal pentru o pagina. */
  resolveSrc: (page: Page) => string | null;
  /** Apelat dupa fiecare pagina, ca sa putem arata progresul. */
  onProgress?: (done: number, total: number) => void;
};

/**
 * Construieste documentul PDF (fara sa-l salveze).
 *
 * Fiecare pagina e randata off-screen la dimensiunea de baza, fotografiata cu
 * html2canvas la rezolutie dubla si adaugata in PDF full-bleed (fara margini).
 */
export async function buildServicePdf({
  pages,
  resolveSrc,
  onProgress,
}: Omit<ExportOptions, 'name'>): Promise<jsPDF> {
  if (pages.length === 0) throw new Error('Serviciul nu are nicio pagină.');

  // Containerul off-screen in care randam pe rand fiecare pagina.
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '-20000px';
  host.style.width = `${A4_WIDTH}px`;
  host.style.height = `${A4_HEIGHT}px`;
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);

  const root = createRoot(host);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const backgroundCache = new Map<string, string | null>();

  try {
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];

      // Fundalul: il pregatim o singura data per sursa si il refolosim.
      const src = resolveSrc(page);
      let dataUrl: string | null = null;
      if (src) {
        if (!backgroundCache.has(src)) backgroundCache.set(src, await rasterizeBackground(src));
        dataUrl = backgroundCache.get(src) ?? null;
      }

      root.render(createElement(A4Page, { page, backgroundSrc: dataUrl }));
      await settle(host);

      const canvas = await html2canvas(host, {
        scale: EXPORT_SCALE,
        width: A4_WIDTH,
        height: A4_HEIGHT,
        windowWidth: A4_WIDTH,
        windowHeight: A4_HEIGHT,
        backgroundColor: '#000000',
        useCORS: true,
        logging: false,
      });

      // JPEG: calitate foarte buna, dar fisier mult mai mic decat PNG.
      const image = canvas.toDataURL('image/jpeg', 0.92);
      if (i > 0) pdf.addPage('a4', 'portrait');
      pdf.addImage(image, 'JPEG', 0, 0, A4_MM.width, A4_MM.height, undefined, 'FAST');

      onProgress?.(i + 1, pages.length);
    }

    return pdf;
  } finally {
    root.unmount();
    host.remove();
  }
}

/** Construieste PDF-ul si il descarca cu numele serviciului. */
export async function exportServiceToPdf({ name, ...rest }: ExportOptions): Promise<void> {
  const pdf = await buildServicePdf(rest);
  pdf.save(safeFileName(name));
}
