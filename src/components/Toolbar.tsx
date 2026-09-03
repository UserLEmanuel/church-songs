import { useServiceStore } from '../store/useServiceStore';
import { SlideSettingsMenu } from './SlideSettingsMenu';
import { IconDownload, IconPanelLeft, IconSparkle } from './icons';

type Props = {
  onNewService: () => void;
  onExport: () => void;
  exporting: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

/** Bara de sus: numele serviciului, aspectul, "Serviciu nou" si "Export". */
export function Toolbar({
  onNewService,
  onExport,
  exporting,
  sidebarOpen,
  onToggleSidebar,
}: Props) {
  const name = useServiceStore((s) => s.service.name);
  const setServiceName = useServiceStore((s) => s.setServiceName);
  const pageCount = useServiceStore((s) => s.service.pages.length);

  return (
    <header className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2.5">
      <button
        type="button"
        onClick={onToggleSidebar}
        title="Arată/ascunde lista de pagini"
        aria-label="Arată sau ascunde lista de pagini"
        aria-pressed={sidebarOpen}
        className={`shrink-0 rounded-lg p-2 transition ${
          sidebarOpen
            ? 'bg-brand-soft text-brand'
            : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
        }`}
      >
        <IconPanelLeft size={17} />
      </button>

      <span className="hidden shrink-0 items-center gap-1.5 pl-1 pr-2 text-sm font-bold text-ink md:flex">
        <span className="text-brand">
          <IconSparkle size={16} />
        </span>
        Service Builder
      </span>

      <input
        value={name}
        onChange={(e) => setServiceName(e.target.value)}
        aria-label="Numele serviciului"
        className="min-w-0 flex-1 rounded-lg border border-transparent px-2.5 py-1.5 text-sm font-semibold text-ink outline-none transition hover:border-line focus:border-brand focus:bg-surface"
        placeholder="Numele serviciului"
      />

      <SlideSettingsMenu />

      <button
        type="button"
        onClick={onNewService}
        className="shrink-0 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-[13px] font-semibold text-ink-muted transition hover:border-brand hover:text-brand"
      >
        Serviciu nou
      </button>

      <button
        type="button"
        onClick={onExport}
        disabled={exporting || pageCount === 0}
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-subtle disabled:shadow-none"
      >
        <IconDownload size={15} />
        {exporting ? 'Se exportă…' : 'Export'}
      </button>
    </header>
  );
}
