import type { SlideFormat } from './formats';
import { SMALL_FONT_WARNING } from './constants';

/**
 * Cate randuri de text incap pe un slide la marimea minima acceptabila.
 *
 * Pornim de la inaltimea utila a slide-ului si de la `line-height: 1.45`,
 * apoi scadem cateva randuri pentru titlu si linia decorativa.
 */
export function linesPerSlide(format: SlideFormat): number {
  const usable = format.height - format.padding * 2;
  const lineHeight = SMALL_FONT_WARNING * 1.45;
  const titleAllowance = 3; // titlul + separatorul ocupa cam 3 randuri
  return Math.max(4, Math.floor(usable / lineHeight) - titleAllowance);
}

/**
 * Imparte un text in mai multe bucati, taind la limita de strofa.
 *
 * Folosit pentru cantarile lungi, care altfel ar fi randate cu un font prea mic
 * ca sa fie citite de la distanta. Impartirea NU se face automat: utilizatorul
 * apasa butonul cand vrea.
 *
 * `maxLines` = cate randuri incap pe un slide. Daca lipseste, imparte in doua.
 * Returneaza `null` daca textul e prea scurt ca sa merite impartit.
 */
export function splitBody(body: string, maxLines?: number): string[] | null {
  const text = body.trim();
  if (!text) return null;

  const totalLines = text.split('\n').filter((l) => l.trim()).length;
  // Cate bucati vrem la final.
  const parts = maxLines ? Math.ceil(totalLines / maxLines) : 2;
  if (parts < 2) return null;

  let chunks: string[];

  // Intai incercam la strofe (blocuri separate de un rand gol).
  const stanzas = text.split(/\n\s*\n/).filter((s) => s.trim());
  if (stanzas.length >= 2) {
    chunks = balance(stanzas, Math.min(parts, stanzas.length)).map((g) => g.join('\n\n'));
  } else {
    // O singura strofa: taiem intre randuri.
    const lines = text.split('\n');
    if (lines.length < 4) return null; // prea scurt, n-are rost
    chunks = balance(lines, Math.min(parts, Math.floor(lines.length / 2))).map((g) =>
      g.join('\n'),
    );
  }

  // O cantare cu putine strofe, dar lungi, poate avea bucati care tot nu incap.
  // Pe acelea le mai taiem o data, de data asta intre randuri.
  if (maxLines) chunks = chunks.flatMap((chunk) => splitByLines(chunk, maxLines));

  return chunks.length >= 2 ? chunks : null;
}

/** Taie o bucata prea lunga in randuri, cat sa respecte limita. */
function splitByLines(chunk: string, maxLines: number): string[] {
  const count = chunk.split('\n').filter((l) => l.trim()).length;
  if (count <= maxLines) return [chunk];
  const lines = chunk.split('\n');
  return balance(lines, Math.ceil(count / maxLines)).map((g) => g.join('\n').trim());
}

/**
 * Imparte bucatile in `count` grupuri cat mai egale ca numar de randuri,
 * fara sa strice ordinea si fara sa taie in mijlocul unei strofe.
 */
function balance(parts: string[], count: number): string[][] {
  if (count < 2 || parts.length < 2) return [parts];

  const weight = (s: string) => s.split('\n').length;
  const total = parts.reduce((sum, p) => sum + weight(p), 0);
  const target = total / count;

  const groups: string[][] = [];
  let current: string[] = [];
  let currentLines = 0;

  for (let i = 0; i < parts.length; i++) {
    const w = weight(parts[i]);
    const remainingParts = parts.length - i;
    // Daca am inchide grupul acum, bucatile ramase trebuie sa formeze exact
    // atatea grupuri cate mai lipsesc pana la `count`.
    const groupsLeft = count - (groups.length + 1);

    const shouldClose =
      current.length > 0 &&
      currentLines + w / 2 > target &&
      groupsLeft >= 1 &&
      remainingParts >= groupsLeft;

    if (shouldClose) {
      groups.push(current);
      current = [];
      currentLines = 0;
    }

    current.push(parts[i]);
    currentLines += w;
  }

  if (current.length) groups.push(current);
  return groups;
}
