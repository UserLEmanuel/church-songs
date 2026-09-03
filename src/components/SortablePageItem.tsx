import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Page } from '../types';
import { PAGE_TYPE_LABEL } from '../lib/pageMeta';
import { useServiceStore } from '../store/useServiceStore';
import { isEmpty } from './Slide';
import { IconChevronDown, IconChevronUp, IconCopy, IconGrip, IconTrash } from './icons';

type Props = {
  page: Page;
  index: number;
  selected: boolean;
  /** Apelat cand utilizatorul apasa randul (pe telefon, trecem la editare). */
  onOpen?: () => void;
};

/** Un rand din lista de pagini: numar, tip, rezumat si actiuni. */
export function SortablePageItem({ page, index, selected, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });
  const selectPage = useServiceStore((s) => s.selectPage);
  const removePage = useServiceStore((s) => s.removePage);
  const duplicatePage = useServiceStore((s) => s.duplicatePage);
  const reorderPages = useServiceStore((s) => s.reorderPages);
  const total = useServiceStore((s) => s.service.pages.length);

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
      {/*
        Pe desktop se trage de maner. Pe telefon tragerea intr-o lista care
        deruleaza e incomoda, asa ca acolo aratam butoane sus/jos.
      */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Trage ca să reordonezi"
        aria-label={`Trage ca să reordonezi pagina ${index + 1}`}
        className="hidden w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-l-lg text-ink-subtle/60 transition hover:text-ink-muted active:cursor-grabbing md:flex"
      >
        <IconGrip size={14} />
      </button>

      <div className="flex shrink-0 flex-col justify-center gap-0.5 py-1 pl-1 md:hidden">
        <button
          type="button"
          onClick={() => reorderPages(index, index - 1)}
          disabled={index === 0}
          aria-label={`Mută pagina ${index + 1} mai sus`}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink-muted transition hover:bg-surface-sunken disabled:opacity-30"
        >
          <IconChevronUp size={16} />
        </button>
        <button
          type="button"
          onClick={() => reorderPages(index, index + 1)}
          disabled={index === total - 1}
          aria-label={`Mută pagina ${index + 1} mai jos`}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink-muted transition hover:bg-surface-sunken disabled:opacity-30"
        >
          <IconChevronDown size={16} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          selectPage(page.id);
          onOpen?.();
        }}
        aria-current={selected ? 'true' : undefined}
        className="min-w-0 flex-1 rounded-r-lg px-1.5 py-2.5 text-left md:py-2 md:pl-0"
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

      {/*
        Pe desktop actiunile apar la hover. Pe touch nu exista hover,
        deci acolo raman mereu vizibile.
      */}
      <div className="flex shrink-0 flex-col justify-center gap-0.5 pr-1 opacity-100 transition focus-within:opacity-100 md:pr-1.5 md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => duplicatePage(page.id)}
          title="Duplică pagina"
          aria-label={`Duplică pagina ${index + 1}`}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink-subtle transition hover:bg-surface-sunken hover:text-ink md:h-auto md:w-auto md:p-1"
        >
          <IconCopy size={14} />
        </button>
        <button
          type="button"
          onClick={() => removePage(page.id)}
          title="Șterge pagina"
          aria-label={`Șterge pagina ${index + 1}`}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink-subtle transition hover:bg-danger-soft hover:text-danger md:h-auto md:w-auto md:p-1"
        >
          <IconTrash size={14} />
        </button>
      </div>
    </div>
  );
}
