import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Page } from '../types';
import { PAGE_TYPE_LABEL } from '../lib/pageMeta';
import { useServiceStore } from '../store/useServiceStore';
import { isEmpty } from './Slide';
import { IconCopy, IconGrip, IconTrash } from './icons';

type Props = { page: Page; index: number; selected: boolean };

/** Un rand din lista de pagini: numar, tip, rezumat si actiuni. */
export function SortablePageItem({ page, index, selected }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });
  const selectPage = useServiceStore((s) => s.selectPage);
  const removePage = useServiceStore((s) => s.removePage);
  const duplicatePage = useServiceStore((s) => s.duplicatePage);

  const empty = isEmpty(page);
  // Rezumatul afisat sub tip: titlul completat, altfel indicatia din sablon.
  const summary = empty
    ? (page.hint ?? 'Necompletată')
    : (page.title?.trim() || page.reference?.trim() || page.body?.trim()?.split('\n')[0] || '');

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-stretch rounded-lg border transition ${
        selected
          ? 'border-brand bg-surface shadow-sm ring-1 ring-brand/20'
          : 'border-transparent bg-surface/70 hover:border-line hover:bg-surface'
      } ${isDragging ? 'z-20 opacity-90 shadow-lg' : ''}`}
    >
      {/* Manerul de tragere: doar de aici se muta pagina, ca sa nu incurce click-ul. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Trage ca să reordonezi"
        aria-label={`Trage ca să reordonezi pagina ${index + 1}`}
        className="flex w-7 shrink-0 cursor-grab items-center justify-center rounded-l-lg text-ink-subtle/60 transition hover:text-ink-muted active:cursor-grabbing"
      >
        <IconGrip size={14} />
      </button>

      <button
        type="button"
        onClick={() => selectPage(page.id)}
        aria-current={selected ? 'true' : undefined}
        className="min-w-0 flex-1 rounded-r-lg py-2 pr-1 text-left"
      >
        <span className="flex items-baseline gap-1.5">
          <span
            className={`text-[11px] font-semibold tabular-nums ${
              selected ? 'text-brand' : 'text-ink-subtle'
            }`}
          >
            {index + 1}
          </span>
          <span className="truncate text-[13px] font-semibold text-ink">
            {PAGE_TYPE_LABEL[page.type]}
          </span>
        </span>
        <span
          className={`mt-0.5 block truncate text-xs ${empty ? 'italic text-gold' : 'text-ink-muted'}`}
        >
          {summary}
        </span>
      </button>

      <div className="flex shrink-0 flex-col justify-center gap-0.5 pr-1.5 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => duplicatePage(page.id)}
          title="Duplică pagina"
          aria-label={`Duplică pagina ${index + 1}`}
          className="rounded p-1 text-ink-subtle transition hover:bg-surface-sunken hover:text-ink"
        >
          <IconCopy size={13} />
        </button>
        <button
          type="button"
          onClick={() => removePage(page.id)}
          title="Șterge pagina"
          aria-label={`Șterge pagina ${index + 1}`}
          className="rounded p-1 text-ink-subtle transition hover:bg-danger-soft hover:text-danger"
        >
          <IconTrash size={13} />
        </button>
      </div>
    </div>
  );
}
