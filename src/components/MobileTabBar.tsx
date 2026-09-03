import { useServiceStore } from '../store/useServiceStore';
import { IconList, IconMonitor, IconPencil } from './icons';

export type MobileTab = 'pages' | 'slide' | 'edit';

type Props = {
  value: MobileTab;
  onChange: (tab: MobileTab) => void;
};

/**
 * Bara de navigare de jos, doar pe telefon.
 *
 * Pe un ecran ingust nu incap trei coloane, asa ca aratam o singura zona
 * odata si comutam intre ele de aici.
 */
export function MobileTabBar({ value, onChange }: Props) {
  const pageCount = useServiceStore((s) => s.service.pages.length);

  const tabs: { id: MobileTab; label: string; icon: JSX.Element; badge?: number }[] = [
    { id: 'pages', label: 'Pagini', icon: <IconList size={20} />, badge: pageCount },
    { id: 'slide', label: 'Slide', icon: <IconMonitor size={20} /> },
    { id: 'edit', label: 'Editează', icon: <IconPencil size={20} /> },
  ];

  return (
    <nav
      aria-label="Secțiuni"
      // `pb-[env(safe-area-inset-bottom)]` tine butoanele deasupra barei de gesturi pe iPhone.
      className="flex shrink-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 transition ${
              active ? 'text-brand' : 'text-ink-subtle'
            }`}
          >
            <span className="relative">
              {tab.icon}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -right-2.5 -top-1 rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-white">
                  {tab.badge}
                </span>
              )}
            </span>
            <span className="text-[11px] font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
