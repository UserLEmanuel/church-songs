import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Page } from '../types';
import { PAGE_TYPE_LABEL } from '../lib/pageMeta';
import { useServiceStore } from '../store/useServiceStore';
import { isEmpty } from './A4Page';

type Props = { page: Page; index: number; selected: boolean };

/** Un rand din lista de pagini: numar, tip, rezumat, si butoane de duplicare/stergere. */
export function SortablePageItem({ page, index, selected }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });
  const selectPage = useServiceStore((s) => s.selectPage);
  const removePage = useServiceStore((s) => s.removePage);
  const duplicatePage = useServiceStore((s) => s.duplicatePage);

  // Rezumatul afisat sub tip: titlul completat, altfel indicatia din sablon.
  const summary = isEmpty(page)
    ? (page.hint ?? 'Necompletată')
    : (page.title?.trim() || page.reference?.trim() || page.body?.trim()?.split('\n')[0] || '');

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-stretch gap-1 rounded-lg border ${
        selected ? 'border-slate-800 bg-white shadow-sm' : 'border-transparent bg-white/60'
      } ${isDragging ? 'z-20 opacity-80 shadow-lg' : ''}`}
    >
      {/* Manerul de tragere: doar de aici se muta pagina, ca sa nu incurce click-ul. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Trage ca să reordonezi"
        aria-label="Trage ca să reordonezi"
        className="cursor-grab px-1.5 text-slate-300 hover:text-slate-500 active:cursor-grabbing"
      >
        ⠿
      </button>

      <button
        type="button"
        onClick={() => selectPage(page.id)}
        className="min-w-0 flex-1 py-2 pr-1 text-left"
      >
        <span className="flex items-baseline gap-1.5">
          <span className="text-xs font-semibold text-slate-400">{index + 1}.</span>
          <span className="truncate text-sm font-medium text-slate-800">
            {PAGE_TYPE_LABEL[page.type]}
          </span>
        </span>
        <span
          className={`mt-0.5 block truncate text-xs ${
            isEmpty(page) ? 'italic text-amber-600' : 'text-slate-500'
          }`}
        >
          {summary}
        </span>
      </button>

      <div className="flex flex-col justify-center pr-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => duplicatePage(page.id)}
          title="Duplică pagina"
          aria-label="Duplică pagina"
          className="px-1 text-xs text-slate-400 hover:text-slate-700"
        >
          ⧉
        </button>
        <button
          type="button"
          onClick={() => removePage(page.id)}
          title="Șterge pagina"
          aria-label="Șterge pagina"
          className="px-1 text-xs text-slate-400 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
