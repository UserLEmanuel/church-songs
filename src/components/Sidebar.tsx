import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '../lib/dndModifiers';
import { useServiceStore, useSelectedPage } from '../store/useServiceStore';
import { SortablePageItem } from './SortablePageItem';
import { AddPageMenu } from './AddPageMenu';
import { BackgroundPicker } from './BackgroundPicker';

/** Coloana din stanga: lista paginilor (reordonabila) + setarile de fundal. */
export function Sidebar() {
  const pages = useServiceStore((s) => s.service.pages);
  const selectedPageId = useServiceStore((s) => s.selectedPageId);
  const reorderPages = useServiceStore((s) => s.reorderPages);
  const selectedPage = useSelectedPage();

  // `distance: 5` => un click simplu selecteaza pagina, nu porneste un drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = pages.findIndex((p) => p.id === active.id);
    const to = pages.findIndex((p) => p.id === over.id);
    if (from !== -1 && to !== -1) reorderPages(from, to);
  };

  return (
    <aside className="flex h-full w-full flex-col bg-surface-muted">
      <div className="flex items-center justify-between px-3.5 pb-1.5 pt-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
          Paginile serviciului
        </h2>
        <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-muted">
          {pages.length}
        </span>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-2.5 pb-2">
        {pages.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm leading-relaxed text-ink-subtle">
            Niciun slide încă.
            <br />
            Adaugă unul mai jos.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {pages.map((page, index) => (
                <div key={page.id}>
                  <SortablePageItem
                    page={page}
                    index={index}
                    selected={page.id === selectedPageId}
                  />
                  {/* Buton discret de inserare intre pagini. */}
                  <AddPageMenu index={index + 1} variant="inline" />
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="px-2.5 pb-3">
        <AddPageMenu index={pages.length} />
      </div>

      {selectedPage && <BackgroundPicker page={selectedPage} />}
    </aside>
  );
}
