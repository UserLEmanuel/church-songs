import type { CSSProperties } from 'react';
import type { Page } from '../types';
import {
  A4_HEIGHT,
  A4_WIDTH,
  DEFAULT_OVERLAY,
  FONT_STACK,
  PAGE_PADDING,
} from '../lib/constants';
import { useAutoFit } from '../lib/useAutoFit';

type Props = {
  page: Page;
  /** URL-ul imaginii de fundal (public, object URL sau data URL la export). */
  backgroundSrc: string | null;
};

// Stiluri comune. Folosim EXCLUSIV stiluri inline (fara clase Tailwind) pentru ca
// html2canvas sa vada culori simple rgb()/rgba() la exportul PDF.
const shadow = '0 2px 10px rgba(0,0,0,0.65)';

const bodyStyle: CSSProperties = {
  whiteSpace: 'pre-wrap', // pastreaza randurile si strofele din text
  lineHeight: 1.45,
};

/**
 * O pagina A4 randata la dimensiunea de baza (794x1123 px).
 * Cine o foloseste o scaleaza cu CSS transform; masuratorile raman in px "A4".
 */
export function A4Page({ page, backgroundSrc }: Props) {
  const overlay = page.overlayOpacity ?? DEFAULT_OVERLAY;

  // Re-calculam fontul ori de cate ori se schimba ceva din continut.
  const { containerRef, contentRef } = useAutoFit([
    page.type,
    page.title,
    page.reference,
    page.body,
    page.hint,
  ]);

  return (
    <div
      style={{
        position: 'relative',
        width: A4_WIDTH,
        height: A4_HEIGHT,
        overflow: 'hidden',
        backgroundColor: 'rgb(24,24,27)',
        fontFamily: FONT_STACK,
      }}
    >
      {/* Fundalul: acopera toata pagina (full-bleed). */}
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

      {/* Overlay negru semitransparent, ca textul alb sa fie mereu lizibil. */}
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

      {/* Zona de text: centrata pe orizontala si pe verticala. */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: PAGE_PADDING,
          left: PAGE_PADDING,
          width: A4_WIDTH - PAGE_PADDING * 2,
          height: A4_HEIGHT - PAGE_PADDING * 2,
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
            textShadow: shadow,
          }}
        >
          <PageContent page={page} />
        </div>
      </div>
    </div>
  );
}

/** Continutul propriu-zis, diferit pentru fiecare tip de pagina. */
function PageContent({ page }: { page: Page }) {
  const empty = isEmpty(page);

  // Cat timp pagina e goala aratam indicatia din sablon, mai discreta.
  if (empty) {
    return (
      <div style={{ ...bodyStyle, fontSize: '0.85em', opacity: 0.72, fontStyle: 'italic' }}>
        {page.hint ?? 'Completează această pagină în panoul din dreapta →'}
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
                fontSize: '0.72em',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                opacity: 0.9,
                marginBottom: '1.1em',
              }}
            >
              {page.reference}
            </div>
          )}
          {page.title && (
            <div style={{ fontSize: '1.1em', fontWeight: 700, marginBottom: '0.9em' }}>
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
            <div style={{ fontSize: '1.35em', fontWeight: 700, marginBottom: '1em' }}>
              {page.title}
            </div>
          )}
          {page.body && <div style={{ ...bodyStyle, fontSize: '1em' }}>{page.body}</div>}
        </>
      );

    case 'text-fix':
      return (
        <>
          {page.title && (
            <div style={{ fontSize: '1.25em', fontWeight: 700, marginBottom: '1em' }}>
              {page.title}
            </div>
          )}
          {page.body && <div style={{ ...bodyStyle, fontSize: '1em' }}>{page.body}</div>}
        </>
      );

    case 'predica':
      return (
        <>
          <div
            style={{
              fontSize: '0.62em',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              opacity: 0.85,
              marginBottom: '1.4em',
            }}
          >
            Predică
          </div>
          {page.title && (
            <div style={{ fontSize: '1.6em', fontWeight: 700, lineHeight: 1.25 }}>{page.title}</div>
          )}
          {page.reference && (
            <div style={{ fontSize: '0.9em', marginTop: '1.2em', opacity: 0.92 }}>
              {page.reference}
            </div>
          )}
        </>
      );

    case 'libera':
      return (
        <>
          {page.title && (
            <div style={{ fontSize: '1.25em', fontWeight: 700, marginBottom: '1em' }}>
              {page.title}
            </div>
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
