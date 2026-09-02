import { useLayoutEffect, useRef, useState } from 'react';
import { FONT_MAX, FONT_MIN } from './constants';

/**
 * Micsoreaza progresiv fontul pana cand tot continutul incape in container.
 *
 * Cum functioneaza: facem o cautare binara intre FONT_MIN si FONT_MAX si pastram
 * cel mai MARE font la care continutul inca incape (fara scroll, fara taiere).
 * Toate marimile din interior sunt definite in `em`, deci se scaleaza odata cu el.
 */
export function useAutoFit(deps: unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(FONT_MAX);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const fits = (px: number) => {
      content.style.fontSize = `${px}px`;
      // Citirea lui scrollHeight forteaza un reflow, deci masuratoarea e la zi.
      return (
        content.scrollHeight <= container.clientHeight && content.scrollWidth <= container.clientWidth
      );
    };

    let lo = FONT_MIN;
    let hi = FONT_MAX;
    let best = FONT_MIN;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (fits(mid)) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    content.style.fontSize = `${best}px`;
    setFontSize(best);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { containerRef, contentRef, fontSize };
}
