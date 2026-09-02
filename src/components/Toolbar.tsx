import { useServiceStore } from '../store/useServiceStore';

type Props = {
  onNewService: () => void;
  onExport: () => void;
  exporting: boolean;
  onToggleSidebar: () => void;
};

/** Bara de sus: numele serviciului, "Serviciu nou" si "Export PDF". */
export function Toolbar({ onNewService, onExport, exporting, onToggleSidebar }: Props) {
  const name = useServiceStore((s) => s.service.name);
  const setServiceName = useServiceStore((s) => s.setServiceName);
  const pageCount = useServiceStore((s) => s.service.pages.length);

  return (
    <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-2">
      <button
        type="button"
        onClick={onToggleSidebar}
        title="Arată/ascunde lista de pagini"
        aria-label="Arată sau ascunde lista de pagini"
        className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
      >
        ☰
      </button>

      <span className="hidden shrink-0 text-sm font-semibold text-slate-900 sm:block">
        Service Builder
      </span>

      <input
        value={name}
        onChange={(e) => setServiceName(e.target.value)}
        aria-label="Numele serviciului"
        className="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium hover:border-slate-200 focus:border-slate-400 focus:outline-none"
        placeholder="Numele serviciului"
      />

      <button
        type="button"
        onClick={onNewService}
        className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Serviciu nou
      </button>

      <button
        type="button"
        onClick={onExport}
        disabled={exporting || pageCount === 0}
        className="shrink-0 rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {exporting ? 'Se exportă…' : 'Export PDF'}
      </button>
    </header>
  );
}
