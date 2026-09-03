import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Slide } from '../components/Slide';
import { getFormat } from './formats';
import type { Page, Service } from '../types';

/** De cate ori marim rezolutia fata de slide-ul de baza (2 => 2560x1440 pe 16:9). */
const EXPORT_SCALE = 2;

/** Calitatea JPEG-urilor. 0.92 arata identic cu originalul, dar e mult mai mic. */
const JPEG_QUALITY = 0.92;

/**
 * Transforma imaginea de fundal intr-un JPEG data-URL deja decupat "cover"
 * pe dimensiunea slide-ului.
 *
 * De ce: html2canvas se impiedica uneori de SVG-uri sau de object URL-uri, iar
 * un data-URL JPEG gata potrivit e si stabil, si de ~40x mai mic decat un PNG
 * (html2canvas il re-citeste la fiecare slide, deci conteaza direct la viteza).
 */
async function rasterizeBackground(src: string, width: number, height: number) {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Nu am putut încărca fundalul: ${src}`));
      img.src = src;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width * EXPORT_SCALE;
    canvas.height = height * EXPORT_SCALE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Reproducem manual `object-fit: cover`.
    const iw = img.naturalWidth || width;
    const ih = img.naturalHeight || height;
    const scale = Math.max(canvas.width / iw, canvas.height / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
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
function safeFileName(name: string, extension: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]+/g, '-').trim();
  return `${cleaned || 'serviciu'}.${extension}`;
}

/** Descarca un blob sub numele dat. */
function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Eliberam URL-ul dupa ce browserul a apucat sa porneasca descarcarea.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export type ExportOptions = {
  service: Service;
  /** Cum aflam sursa imaginii de fundal pentru o pagina. */
  resolveSrc: (page: Page) => string | null;
  /** Apelat dupa fiecare slide, ca sa putem arata progresul. */
  onProgress?: (done: number, total: number) => void;
};

/**
 * Randeaza pe rand fiecare slide off-screen si il trimite mai departe ca <canvas>.
 *
 * Este partea comuna a tuturor exporturilor: PDF si imagini pornesc de aici.
 */
async function forEachSlideCanvas(
  { service, resolveSrc, onProgress }: ExportOptions,
  visit: (canvas: HTMLCanvasElement, index: number) => void | Promise<void>,
): Promise<void> {
  const { pages } = service;
  if (pages.length === 0) throw new Error('Serviciul nu are nicio pagină.');

  const format = getFormat(service.format);

  // Containerul off-screen in care randam pe rand fiecare slide.
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '-20000px';
  host.style.width = `${format.width}px`;
  host.style.height = `${format.height}px`;
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);

  const root = createRoot(host);
  const backgroundCache = new Map<string, string | null>();

  try {
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];

      // Fundalul: il pregatim o singura data per sursa si il refolosim.
      const src = resolveSrc(page);
      let dataUrl: string | null = null;
      if (src) {
        if (!backgroundCache.has(src)) {
          backgroundCache.set(src, await rasterizeBackground(src, format.width, format.height));
        }
        dataUrl = backgroundCache.get(src) ?? null;
      }

      root.render(
        createElement(Slide, {
          page,
          backgroundSrc: dataUrl,
          formatId: service.format,
          fontId: service.font,
        }),
      );
      await settle(host);

      const canvas = await html2canvas(host, {
        scale: EXPORT_SCALE,
        width: format.width,
        height: format.height,
        windowWidth: format.width,
        windowHeight: format.height,
        backgroundColor: '#000000',
        useCORS: true,
        logging: false,
      });

      await visit(canvas, i);
      onProgress?.(i + 1, pages.length);
    }
  } finally {
    root.unmount();
    host.remove();
  }
}

/** Construieste documentul PDF (fara sa-l salveze). */
export async function buildServicePdf(options: ExportOptions): Promise<jsPDF> {
  const format = getFormat(options.service.format);
  const { width, height } = format.pdf;
  const orientation = width >= height ? 'landscape' : 'portrait';

  const pdf = new jsPDF({ orientation, unit: 'mm', format: [width, height] });

  await forEachSlideCanvas(options, (canvas, index) => {
    const image = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    if (index > 0) pdf.addPage([width, height], orientation);
    pdf.addImage(image, 'JPEG', 0, 0, width, height, undefined, 'FAST');
  });

  return pdf;
}

/** Construieste un .zip cu cate o imagine JPG per slide (fara sa-l salveze). */
export async function buildSlidesZip(options: ExportOptions): Promise<Blob> {
  // Import dinamic: JSZip e nevoie doar la exportul de imagini.
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const total = options.service.pages.length;
  const digits = String(total).length;

  await forEachSlideCanvas(options, async (canvas, index) => {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );
    if (!blob) return;
    // Nume cu zerouri in fata, ca ordinea sa fie corecta si in Explorer.
    const name = String(index + 1).padStart(digits, '0');
    zip.file(`${name}.jpg`, blob);
  });

  return zip.generateAsync({ type: 'blob' });
}

/** Construieste PDF-ul si il descarca cu numele serviciului. */
export async function exportServiceToPdf(options: ExportOptions): Promise<void> {
  const pdf = await buildServicePdf(options);
  download(pdf.output('blob'), safeFileName(options.service.name, 'pdf'));
}

/** Construieste arhiva de imagini si o descarca. */
export async function exportServiceToImages(options: ExportOptions): Promise<void> {
  const blob = await buildSlidesZip(options);
  download(blob, safeFileName(options.service.name, 'zip'));
}
