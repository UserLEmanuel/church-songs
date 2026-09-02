import { useEffect, useState } from 'react';

/** Urmareste un media query CSS din React (ex. '(min-width: 1280px)'). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    // Ascultam si 'resize': evenimentul 'change' al media query-ului nu se
    // declanseaza in toate situatiile (de ex. cand fereastra e redimensionata
    // de unelte de dezvoltare), iar layout-ul ar ramane blocat pe varianta veche.
    mql.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mql.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, [query]);

  return matches;
}
