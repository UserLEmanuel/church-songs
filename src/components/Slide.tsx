import type { CSSProperties } from 'react';
import type { Page } from '../types';
import { DEFAULT_OVERLAY } from '../lib/constants';
import { getFormat, type FormatId, type SlideFormat } from '../lib/formats';
import { getFont, type FontId } from '../lib/fonts';
import { useAutoFit } from '../lib/useAutoFit';

type Props = {
  page: Page;
  /** URL-ul imaginii de fundal (public, object URL sau data URL la export). */
  backgroundSrc: string | null;
  formatId: FormatId;
  fontId: FontId;
  /** Primeste marimea de font aleasa de auto-fit, ca sa putem avertiza cand e prea mica. */
  onFontSize?: (px: number) => void;
};

// Stiluri inline peste tot (fara clase Tailwind): html2canvas are nevoie de
// culori simple rgb()/rgba() la exportul PDF, nu de functii moderne de culoare.

const bodyStyle: CSSProperties = {
  whiteSpace: 'pre-wrap', // pastreaza randurile si strofele din text
  lineHeight: 1.45,
};

/**
 * Un slide randat la dimensiunea de baza a formatului ales.
 * Cine il foloseste il scaleaza cu CSS transform; masuratorile raman in px "de baza".
 */
export function Slide({ page, backgroundSrc, formatId, fontId, onFontSize }: Props) {
  const format = getFormat(formatId);
  const font = getFont(fontId);
  const overlay = page.overlayOpacity ?? DEFAULT_OVERLAY;

  // Re-calculam fontul ori de cate ori se schimba ceva ce afecteaza incadrarea.
  const { containerRef, contentRef } = useAutoFit(
    [page.type, page.title, page.reference, page.body, page.hint, formatId, fontId],
    format.fontMin,
    format.fontMax,
    onFontSize,
  );

  return (
    <div
      style={{
        position: 'relative',
        width: format.width,
        height: format.height,
        overflow: 'hidden',
        backgroundColor: 'rgb(20,18,26)',
        fontFamily: font.stack,
      }}
    >
      {/* Fundalul: acopera tot slide-ul (full-bleed). */}
      {backgroundSrc && (
        <img
          src={backgroundSrc}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Overlay negru: face textul alb lizibil pe orice fundal. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: `rgba(0, 0, 0, ${overlay})`,
        }}
      />

      {/* Vinieta discreta: intuneca marginile si aduna privirea spre centru. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.38) 100%)',
        }}
      />

      {/* Zona de text: centrata pe orizontala si pe verticala. */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: format.padding,
          left: format.padding,
          width: format.width - format.padding * 2,
          height: format.height - format.padding * 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: '100%',
            flexShrink: 0, // ca masuratoarea de auto-fit sa fie corecta
            textAlign: 'center',
            color: 'rgb(255,255,255)',
            textShadow: '0 2px 12px rgba(0,0,0,0.7)',
          }}
        >
          <PageContent page={page} format={format} />
        </div>
      </div>
    </div>
  );
}

/** Linie decorativa subtire, folosita ca separator sub titluri. */
function Rule() {
  return (
    <div
      style={{
        width: '2.4em',
        height: 2,
        margin: '0.85em auto',
        backgroundColor: 'rgba(255,255,255,0.55)',
      }}
    />
  );
}

/** Continutul propriu-zis, diferit pentru fiecare tip de pagina. */
function PageContent({ page, format }: { page: Page; format: SlideFormat }) {
  // Pe 16:9 titlurile pot fi putin mai mari: e mai mult loc pe orizontala.
  const wide = format.id === 'wide';

  if (isEmpty(page)) {
    // Cat timp pagina e goala aratam indicatia din sablon, mai discreta.
    return (
      <div style={{ ...bodyStyle, fontSize: '0.8em', opacity: 0.7, fontStyle: 'italic' }}>
        {page.hint ?? 'Completează această pagină în panoul din dreapta'}
      </div>
    );
  }

  switch (page.type) {
    case 'chemare':
      return (
        <>
          {page.reference && (
            <div
              style={{
                fontSize: '0.66em',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                opacity: 0.92,
              }}
            >
              {page.reference}
            </div>
          )}
          {page.reference && <Rule />}
          {page.title && (
            <div style={{ fontSize: '1.1em', fontWeight: 700, marginBottom: '0.7em' }}>
              {page.title}
            </div>
          )}
          {page.body && <div style={{ ...bodyStyle, fontSize: '1em' }}>{page.body}</div>}
        </>
      );

    case 'cantare':
      return (
        <>
          {page.title && (
            <>
              <div style={{ fontSize: wide ? '1.4em' : '1.32em', fontWeight: 700 }}>
                {page.title}
              </div>
              <Rule />
            </>
          )}
          {page.body && <div style={{ ...bodyStyle, fontSize: '1em' }}>{page.body}</div>}
        </>
      );

    case 'text-fix':
      return (
        <>
          {page.title && (
            <>
              <div style={{ fontSize: '1.24em', fontWeight: 700 }}>{page.title}</div>
              <Rule />
            </>
          )}
          {page.body && <div style={{ ...bodyStyle, fontSize: '1em' }}>{page.body}</div>}
        </>
      );

    case 'predica':
      return (
        <>
          <div
            style={{
              fontSize: '0.58em',
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              opacity: 0.85,
              marginBottom: '1.1em',
            }}
          >
            Predică
          </div>
          {page.title && (
            <div style={{ fontSize: wide ? '1.75em' : '1.6em', fontWeight: 700, lineHeight: 1.22 }}>
              {page.title}
            </div>
          )}
          {page.reference && (
            <>
              <Rule />
              <div style={{ fontSize: '0.9em', opacity: 0.92 }}>{page.reference}</div>
            </>
          )}
        </>
      );

    case 'libera':
      return (
        <>
          {page.title && (
            <>
              <div style={{ fontSize: '1.24em', fontWeight: 700 }}>{page.title}</div>
              <Rule />
            </>
          )}
          {page.body && <div style={{ ...bodyStyle, fontSize: '1em' }}>{page.body}</div>}
        </>
      );
  }
}

/** O pagina e "goala" daca nu are niciun text de afisat. */
export function isEmpty(page: Page): boolean {
  return !page.title?.trim() && !page.body?.trim() && !page.reference?.trim();
}
