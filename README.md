# Service Builder

Aplicație web care construiește un **serviciu bisericesc** ca listă ordonată de pagini
(fundal + text centrat automat) și îl exportă ca **PDF A4 portret**, o pagină per slide.

Rulează 100% în browser — nu există server, nu se trimite nimic nicăieri.

---

## Cum rulez local

Ai nevoie de [Node.js](https://nodejs.org/) 20 sau mai nou.

```powershell
npm install
```

```powershell
npm run dev
```

Deschide adresa afișată în terminal (de obicei `http://localhost:5173`).

Alte comenzi:

| Comandă | Ce face |
| --- | --- |
| `npm run dev` | pornește aplicația în modul dezvoltare |
| `npm run build` | face build-ul de producție în `dist/` |
| `npm run preview` | testează local build-ul de producție |
| `npm run typecheck` | verifică tipurile TypeScript |

---

## Cum folosesc aplicația

1. **Serviciu nou** → alegi `Prezbiterian standard` (10 pagini pre-populate) sau `Serviciu gol`.
2. În stânga ai lista paginilor: le tragi de mânerul `⠿` ca să le reordonezi, le ștergi cu `✕`,
   le duplici cu `⧉`. Butonul `+` dintre două pagini inserează exact acolo.
3. În dreapta completezi câmpurile paginii selectate. Pentru cântări și texte fixe ai un
   selector cu căutare din biblioteca ta.
4. Sub lista de pagini alegi fundalul și reglezi cât de întunecat e (`Aplică la toate` pune
   același fundal pe tot serviciul).
5. **Export PDF** → se descarcă un singur PDF cu toate paginile, în ordine.

Serviciul curent se salvează automat în browser (`localStorage`), deci nu se pierde
dacă reîncarci pagina din greșeală.

---

## Cum îmi pun cântările și textele mele

Datele stau în `public/data/` și se încarcă la pornirea aplicației.
Fișierele din repo sunt doar **exemple** — înlocuiește-le cu ale tale.

### `public/data/songs.json`

```json
[
  {
    "id": "id-unic-fara-spatii",
    "title": "Titlul cântării",
    "body": "Primul vers\nAl doilea vers\n\nStrofa a doua începe după un rând gol"
  }
]
```

### `public/data/fixed_texts.json`

Aceeași formă (`id`, `title`, `body`) — pentru Crez, Tatăl Nostru, capitole biblice etc.

**Reguli pentru `body`:**
- `\n` = rând nou (un vers);
- rând gol (`\n\n`) = strofă/paragraf nou;
- fișierele trebuie salvate în **UTF-8**, ca diacriticele să apară corect.

> Aplicația **nu** citește fișiere Word. Conversia din Word în JSON o faci cu un script
> separat; aici pui doar JSON-ul rezultat.

`id`-ul trebuie să fie unic și e bine să nu-l schimbi după ce l-ai folosit într-un serviciu.

---

## Cum îmi pun fundalurile mele

În `public/backgrounds/` sunt 12 fundaluri implicite, `bg-01.svg` … `bg-12.svg`.

Ca să le înlocuiești cu pozele tale:

1. pune imaginile în `public/backgrounds/`;
2. păstrează **aceleași nume** (`bg-01`, `bg-02`, …);
3. dacă schimbi extensia (de ex. `.jpg` în loc de `.svg`), modifică linia din
   `src/store/useLibraryStore.ts` unde se construiește `src`:

```ts
.map((b) => ({ ...b, src: `${import.meta.env.BASE_URL}backgrounds/${b.id}.jpg` }));
```

Tot acolo poți schimba etichetele (`Amurg cald`, `Indigo`, …) sau adăuga mai multe fundaluri.

Recomandare: imagini **portret**, cam 1600×2260 px, mai degrabă întunecate — peste ele se
adaugă oricum un strat negru semitransparent (implicit 35%) ca textul alb să fie lizibil.

Poți încărca imagini și direct din aplicație (butonul `Încarcă imaginea ta…`), dar acelea
trăiesc doar în sesiunea curentă și se pierd la reîncărcarea paginii.

---

## Deploy pe GitHub Pages

Repo-ul conține deja workflow-ul `.github/workflows/deploy.yml`, care face build și publică
la fiecare push pe `main`.

Pași, o singură dată:

1. **Numele repo-ului contează.** În `vite.config.ts` există:

   ```ts
   const REPO_NAME = 'church-songs';
   ```

   Trebuie să fie exact numele repo-ului de pe GitHub. Dacă repo-ul tău se numește altfel,
   schimbă valoarea aici, altfel CSS-ul și imaginile nu se încarcă pe Pages.

2. Urcă proiectul pe GitHub, pe branch-ul `main`.

3. Pe GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

4. La următorul push pe `main`, workflow-ul rulează singur. Adresa finală va fi
   `https://<utilizator>.github.io/<nume-repo>/`.

Poți rula deploy-ul și manual din tab-ul **Actions → Deploy pe GitHub Pages → Run workflow**.

---

## Cum e făcut (pe scurt)

Stack: **React + TypeScript + Vite**, **Tailwind CSS**, **Zustand** (state), **@dnd-kit**
(reordonare), **jsPDF + html2canvas** (export).

```
public/
  backgrounds/      fundalurile (bg-01 … bg-12)
  data/             songs.json, fixed_texts.json
src/
  components/
    A4Page.tsx          randarea unei pagini A4 (folosită și în preview, și la export)
    CanvasPreview.tsx   previzualizarea din mijloc, scalată
    Sidebar.tsx         lista de pagini + drag & drop
    EditorPanel.tsx     câmpurile paginii selectate
    SearchableSelect.tsx selector cu căutare pentru cântări / texte fixe
    BackgroundPicker.tsx galeria de fundaluri + slider de întunecare
  lib/
    constants.ts        dimensiunile A4, fontul, limitele de font
    useAutoFit.ts       micșorează fontul până când textul încape pe pagină
    exportPdf.ts        randare off-screen → html2canvas → jsPDF
    templates.ts        șablonul „Prezbiterian standard”
  store/
    useServiceStore.ts  serviciul curent (+ salvare în localStorage)
    useLibraryStore.ts  cântări, texte fixe, fundaluri
```

Câteva detalii de implementare care contează:

- **Pagina de bază e 794×1123 px** (A4 la 96 DPI). Previzualizarea o scalează cu CSS, iar
  exportul o fotografiază la 2×, deci ce vezi pe ecran e exact ce iese în PDF.
- **Fontul se potrivește automat**: se caută binar cea mai mare valoare între 11px și 36px
  la care tot textul încape, fără tăiere. O cântare nu se împarte niciodată pe două pagini.
- **Textul devine imagine în PDF** — e intenționat: PDF-ul e pentru proiecție/print, nu
  pentru selectat text.
- Fundalul e convertit în JPEG înainte de captură; asta face exportul de ~30× mai rapid
  decât cu PNG.
