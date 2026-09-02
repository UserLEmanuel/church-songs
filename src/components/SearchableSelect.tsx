import { useMemo, useState } from 'react';

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
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
      />

      <div className="thin-scroll mt-2 min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white">
        {filtered.length === 0 && <p className="p-3 text-sm text-slate-500">{emptyLabel}</p>}

        {filtered.map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`block w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 ${
                selected ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'
              }`}
            >
              <span className="line-clamp-2">{item.title}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-1 text-xs text-slate-400">
        {filtered.length} din {items.length}
      </p>
    </div>
  );
}
