import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Micsoreaza progresiv fontul pana cand tot continutul incape in container.
 *
 * Cum functioneaza: facem o cautare binara intre `min` si `max` si pastram
 * cel mai MARE font la care continutul inca incape (fara scroll, fara taiere).
 * Toate marimile din interior sunt definite in `em`, deci se scaleaza odata cu el.
 *
 * `onFontSize` primeste rezultatul, ca sa putem avertiza cand textul e prea mic.
 */
export function useAutoFit(
  deps: unknown[],
  min: number,
  max: number,
  onFontSize?: (px: number) => void,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(max);

  // Tinem callback-ul intr-un ref: asa nu trebuie sa fie in lista de dependinte
  // si nu re-rulam masuratoarea degeaba la fiecare randare a parintelui.
  const callbackRef = useRef(onFontSize);
  useEffect(() => {
    callbackRef.current = onFontSize;
  });

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

    let lo = min;
    let hi = max;
    let best = min;
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
    callbackRef.current?.(best);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, min, max]);

  return { containerRef, contentRef, fontSize };
}
