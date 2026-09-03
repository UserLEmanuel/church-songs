import { useMemo, useState } from 'react';
import { IconCheck, IconSearch } from './icons';

type Item = { id: string; title: string; body?: string };

type Props = {
  items: Item[];
  /** Id-ul elementului selectat momentan. */
  value?: string;
  onSelect: (item: Item) => void;
  placeholder?: string;
  emptyLabel?: string;
};

/**
 * Selector cu cautare: o casuta de search + lista filtrata, mereu vizibila.
 * Preferat unui dropdown clasic pentru ca e mai usor de folosit fara experienta.
 */
export function SearchableSelect({
  items,
  value,
  onSelect,
  placeholder = 'Caută…',
  emptyLabel = 'Niciun rezultat.',
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.title.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle">
          <IconSearch size={15} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-line-strong bg-surface py-2 pl-8 pr-3 text-sm outline-none transition placeholder:text-ink-subtle focus:border-brand"
        />
      </div>

      <div className="thin-scroll mt-2 min-h-0 flex-1 overflow-y-auto rounded-lg border border-line bg-surface">
        {filtered.length === 0 && <p className="p-3 text-sm text-ink-subtle">{emptyLabel}</p>}

        {filtered.map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              aria-pressed={selected}
              className={`flex w-full items-center gap-2 border-b border-line/60 px-3 py-2 text-left text-[13px] transition last:border-b-0 ${
                selected ? 'bg-brand font-semibold text-white' : 'hover:bg-brand-soft'
              }`}
            >
              {selected && (
                <span className="shrink-0">
                  <IconCheck size={14} />
                </span>
              )}
              <span className="line-clamp-2">{item.title}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-1 text-[11px] tabular-nums text-ink-subtle">
        {filtered.length} din {items.length}
      </p>
    </div>
  );
}
