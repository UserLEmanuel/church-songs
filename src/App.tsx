import { useEffect, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { CanvasPreview } from './components/CanvasPreview';
import { EditorPanel } from './components/EditorPanel';
import { NewServiceDialog } from './components/NewServiceDialog';
import { resolveBackgroundSrc, useLibraryStore } from './store/useLibraryStore';
import { useSelectedPage, useServiceStore } from './store/useServiceStore';
import { useMediaQuery } from './lib/useMediaQuery';

export function App() {
  const service = useServiceStore((s) => s.service);
  const selectedPage = useSelectedPage();
  const backgrounds = useLibraryStore((s) => s.backgrounds);
  const loadLibrary = useLibraryStore((s) => s.load);

  // Sub 1280px nu incap trei coloane fara sa strivim previzualizarea A4,
  // asa ca acolo sidebar-ul devine un panou care aluneca peste continut.
  const wideLayout = useMediaQuery('(min-width: 1280px)');
  const [sidebarOpen, setSidebarOpen] = useState(wideLayout);

  // Cand fereastra trece pragul, deschidem/inchidem sidebar-ul automat.
  useEffect(() => {
    setSidebarOpen(wideLayout);
  }, [wideLayout]);
  // Daca pornim cu un serviciu gol, propunem direct alegerea unui sablon.
  const [dialogOpen, setDialogOpen] = useState(() => useServiceStore.getState().service.pages.length === 0);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Incarcam cantarile si textele fixe o singura data, la pornire.
  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  const handleExport = async () => {
    setExporting(true);
    setProgress({ done: 0, total: service.pages.length });
    try {
      // Import dinamic: jsPDF + html2canvas sunt grele si nu sunt necesare
      // decat cand chiar apesi "Export PDF".
      const { exportServiceToPdf } = await import('./lib/exportPdf');
      await exportServiceToPdf({
        name: service.name,
        pages: service.pages,
        resolveSrc: (page) => resolveBackgroundSrc(backgrounds, page.backgroundId),
        onProgress: (done, total) => setProgress({ done, total }),
      });
    } catch (e) {
      alert(`Exportul a eșuat: ${e instanceof Error ? e.message : 'eroare necunoscută'}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        onNewService={() => setDialogOpen(true)}
        onExport={handleExport}
        exporting={exporting}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <main className="relative flex min-h-0 flex-1">
        {sidebarOpen &&
          (wideLayout ? (
            // Ecran lat: sidebar-ul e o coloana normala.
            <div className="w-72 shrink-0 border-r border-slate-200">
              <Sidebar />
            </div>
          ) : (
            // Ecran ingust: panou peste continut, cu fundal pe care poti da click ca sa-l inchizi.
            <>
              <div
                className="absolute inset-0 z-20 bg-black/25"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 z-30 w-72 border-r border-slate-200 shadow-xl">
                <Sidebar />
              </div>
            </>
          ))}

        <div className="min-w-0 flex-1">
          <CanvasPreview />
        </div>

        {selectedPage && (
          <div className="w-72 shrink-0 border-l border-slate-200 lg:w-80 xl:w-96">
            <EditorPanel key={selectedPage.id} page={selectedPage} />
          </div>
        )}
      </main>

      <NewServiceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      {exporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-72 rounded-xl bg-white p-5 text-center shadow-xl">
            <p className="text-sm font-medium text-slate-800">Se generează PDF-ul…</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-slate-800 transition-all"
                style={{
                  width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Pagina {progress.done} din {progress.total}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
