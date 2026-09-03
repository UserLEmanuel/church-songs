import { useCallback, useEffect, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { CanvasPreview } from './components/CanvasPreview';
import { EditorPanel } from './components/EditorPanel';
import { NewServiceDialog } from './components/NewServiceDialog';
import { ExportDialog, type ExportKind } from './components/ExportDialog';
import { resolveBackgroundSrc, useLibraryStore } from './store/useLibraryStore';
import { useSelectedPage, useServiceStore } from './store/useServiceStore';
import { useMediaQuery } from './lib/useMediaQuery';

export function App() {
  const service = useServiceStore((s) => s.service);
  const selectedPage = useSelectedPage();
  const selectRelative = useServiceStore((s) => s.selectRelative);
  const backgrounds = useLibraryStore((s) => s.backgrounds);
  const loadLibrary = useLibraryStore((s) => s.load);

  // Sub 1280px nu incap trei coloane fara sa strivim previzualizarea,
  // asa ca acolo sidebar-ul devine un panou care aluneca peste continut.
  const wideLayout = useMediaQuery('(min-width: 1280px)');
  const [sidebarOpen, setSidebarOpen] = useState(wideLayout);

  // Cand fereastra trece pragul, deschidem/inchidem sidebar-ul automat.
  useEffect(() => {
    setSidebarOpen(wideLayout);
  }, [wideLayout]);

  // Daca pornim cu un serviciu gol, propunem direct alegerea unui sablon.
  const [newOpen, setNewOpen] = useState(
    () => useServiceStore.getState().service.pages.length === 0,
  );
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Incarcam cantarile si textele fixe o singura data, la pornire.
  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  // Sagetile sus/jos schimba slide-ul, dar numai cand nu scrii intr-un camp.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      selectRelative(e.key === 'ArrowDown' ? 1 : -1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectRelative]);

  const handleExport = useCallback(
    async (kind: ExportKind) => {
      setExportOpen(false);
      setExporting(true);
      setProgress({ done: 0, total: service.pages.length });
      try {
        // Import dinamic: jsPDF, html2canvas si JSZip sunt grele si sunt
        // necesare doar cand chiar exporti.
        const { exportServiceToPdf, exportServiceToImages } = await import('./lib/exportService');
        const options = {
          service,
          resolveSrc: (page: (typeof service.pages)[number]) =>
            resolveBackgroundSrc(backgrounds, page.backgroundId),
          onProgress: (done: number, total: number) => setProgress({ done, total }),
        };
        if (kind === 'pdf') await exportServiceToPdf(options);
        else await exportServiceToImages(options);
      } catch (e) {
        alert(`Exportul a eșuat: ${e instanceof Error ? e.message : 'eroare necunoscută'}`);
      } finally {
        setExporting(false);
      }
    },
    [service, backgrounds],
  );

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        onNewService={() => setNewOpen(true)}
        onExport={() => setExportOpen(true)}
        exporting={exporting}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <main className="relative flex min-h-0 flex-1">
        {sidebarOpen &&
          (wideLayout ? (
            // Ecran lat: sidebar-ul e o coloana normala.
            <div className="w-72 shrink-0 border-r border-line">
              <Sidebar />
            </div>
          ) : (
            // Ecran ingust: panou peste continut, cu fundal pe care poti da click.
            <>
              <div
                className="absolute inset-0 z-20 bg-ink/25"
                onClick={() => setSidebarOpen(false)}
                role="presentation"
              />
              <div className="absolute inset-y-0 left-0 z-30 w-72 border-r border-line shadow-2xl">
                <Sidebar />
              </div>
            </>
          ))}

        <div className="min-w-0 flex-1">
          <CanvasPreview />
        </div>

        {selectedPage && (
          <div className="w-72 shrink-0 border-l border-line lg:w-80 xl:w-96">
            <EditorPanel key={selectedPage.id} page={selectedPage} />
          </div>
        )}
      </main>

      <NewServiceDialog open={newOpen} onClose={() => setNewOpen(false)} />
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onChoose={handleExport}
      />

      {exporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
          <div className="w-80 rounded-2xl bg-surface p-5 text-center shadow-2xl">
            <p className="text-sm font-semibold text-ink">Se pregătește exportul…</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{
                  width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs tabular-nums text-ink-muted">
              Slide {progress.done} din {progress.total}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
