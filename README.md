# Service Builder

Aplicație web care construiește un **serviciu bisericesc** ca listă ordonată de slide-uri
(fundal + text centrat automat) și îl exportă ca **PDF** sau ca **imagini**.

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

| Comandă | Ce face |
| --- | --- |
| `npm run dev` | pornește aplicația în modul dezvoltare |
| `npm run build` | face build-ul de producție în `dist/` |
| `npm run preview` | testează local build-ul de producție |
| `npm run typecheck` | verifică tipurile TypeScript |

---

## Cum o folosesc

1. **Serviciu nou** → alegi întâi **formatul**, apoi șablonul.
2. În stânga ai lista slide-urilor: le tragi de mâner ca să le reordonezi, le ștergi, le duplici.
   Butonul `+` dintre două pagini inserează exact acolo.
3. În dreapta completezi câmpurile. Pentru cântări și texte fixe ai un selector cu căutare.
4. Sub lista de pagini alegi fundalul și cât de întunecat e.
5. **Export** → alegi PDF sau imagini.

Serviciul curent se salvează automat în browser (`localStorage`), deci nu se pierde la refresh.

**Scurtături:** săgețile `↑` / `↓` schimbă slide-ul (cât timp nu scrii într-un câmp).

### Formate

Formatul se aplică întregului serviciu și se schimbă oricând din butonul din bara de sus.

| Format | Dimensiune | Pentru ce |
| --- | --- | --- |
| **Ecran lat 16:9** | 1280 × 720 | videoproiector, televizor — *implicit* |
| **A4 portret** | 210 × 297 mm | tipărit, dosarul serviciului |
| **Pătrat 1:1** | 1080 × 1080 | postări Facebook / Instagram |

Când schimbi formatul, textul se re-încadrează automat: pe A4 încape mai mult text pe verticală
decât pe 16:9, deci aceeași cântare va avea font mai mare pe A4.

### Font

Tot din butonul de format alegi fontul slide-urilor: **Tahoma** (implicit), Georgia, Verdana,
Segoe UI sau Trebuchet. Sunt toate fonturi instalate implicit în Windows, ca exportul să arate
identic pe orice calculator și fără internet.

### Cântările prea lungi

Textul se micșorează automat cât să încapă pe slide. Dacă ajunge sub 18px, apare un avertisment
sub previzualizare cu butonul **Împarte pe N pagini**: împarte cântarea la limită de strofă în
câte pagini e nevoie ca textul să redevină lizibil.

Împărțirea nu se face niciodată automat — tu apeși butonul. Același buton îl găsești și în panoul
din dreapta, sub câmpul de text.

> Pe 16:9 încap cam 19 rânduri pe slide, pe A4 cam 34. Din cele 78 de cântări din bibliotecă,
> 14 au nevoie de împărțire pe 16:9 și doar 3 pe A4.

### Export

- **Un singur PDF** — toate slide-urile în ordine, la dimensiunea formatului ales.
- **Imagini separate (.zip)** — câte un JPG per slide, la rezoluție dublă (de ex. 2560 × 1440
  pentru 16:9), numerotate `1.jpg`, `2.jpg`… ca să intre direct în programul de proiecție.

Textul devine imagine în ambele cazuri — e intenționat: rezultatul e pentru proiecție/print,
nu pentru selectat text.

---

## Cum îmi pun cântările și textele mele

Datele stau în `public/data/` și se încarcă la pornirea aplicației.

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
- rând gol (`\n\n`) = strofă/paragraf nou — **aici taie și funcția de împărțire**, deci merită
  păstrate corect;
- fișierele trebuie salvate în **UTF-8**, ca diacriticele să apară corect.

> Aplicația **nu** citește fișiere Word. Conversia din Word în JSON o faci cu un script separat.

`id`-ul trebuie să fie unic și e bine să nu-l schimbi după ce l-ai folosit într-un serviciu.

---

## Cum îmi pun fundalurile mele

În `public/backgrounds/` sunt 12 fundaluri implicite, `bg-01.svg` … `bg-12.svg`.

1. pune imaginile în `public/backgrounds/`;
2. păstrează **aceleași nume** (`bg-01`, `bg-02`, …);
3. dacă schimbi extensia, modifică linia din `src/store/useLibraryStore.ts`:

```ts
.map((b) => ({ ...b, src: `${import.meta.env.BASE_URL}backgrounds/${b.id}.jpg` }));
```

Tot acolo poți schimba etichetele sau adăuga mai multe fundaluri.

Recomandare: imagini **mari și late** (cel puțin 2560 × 1440), mai degrabă întunecate. Sunt
decupate automat pe centru (`cover`) pentru orice format, deci o poză 16:9 merge și pe A4, doar
că i se taie marginile stânga/dreapta.

Poți încărca imagini și direct din aplicație, dar acelea trăiesc doar în sesiunea curentă.

---

## Deploy pe GitHub Pages

Repo-ul conține workflow-ul `.github/workflows/deploy.yml`, care face build și publică la fiecare
push pe `main`.

1. **Numele repo-ului contează.** În `vite.config.ts`:

   ```ts
   const REPO_NAME = 'church-songs';
   ```

   Trebuie să fie exact numele repo-ului de pe GitHub, altfel CSS-ul și imaginile nu se încarcă.

2. Urcă proiectul pe GitHub, pe branch-ul `main`.
3. Pe GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. La următorul push, workflow-ul rulează singur. Adresa: `https://<utilizator>.github.io/<nume-repo>/`.

---

## Cum e făcut (pe scurt)

Stack: **React + TypeScript + Vite**, **Tailwind CSS**, **Zustand** (state), **@dnd-kit**
(reordonare), **jsPDF + html2canvas** (PDF), **JSZip** (imagini).

```
public/
  backgrounds/      fundalurile (bg-01 … bg-12)
  data/             songs.json, fixed_texts.json
src/
  components/
    Slide.tsx            randarea unui slide (aceeași și în preview, și la export)
    CanvasPreview.tsx    previzualizarea din mijloc + avertismentul de font mic
    Sidebar.tsx          lista de pagini + drag & drop
    EditorPanel.tsx      câmpurile paginii selectate
    SlideSettingsMenu.tsx selectorul de format și font
    ExportDialog.tsx     alegerea PDF / imagini
    icons.tsx            setul de iconițe SVG
  lib/
    formats.ts        cele 3 formate (px de bază, margini, limite de font, mm pentru PDF)
    fonts.ts          fonturile disponibile
    useAutoFit.ts     micșorează fontul până când textul încape
    splitBody.ts      împărțirea cântărilor lungi pe mai multe slide-uri
    exportService.ts  randare off-screen → html2canvas → jsPDF / JSZip
    templates.ts      șablonul „Prezbiterian standard”
  store/
    useServiceStore.ts  serviciul curent (+ salvare în localStorage)
    useLibraryStore.ts  cântări, texte fixe, fundaluri
```

Detalii de implementare care contează:

- **Fiecare format are dimensiunea lui „de bază” în px** (16:9 → 1280 × 720). Previzualizarea o
  scalează cu CSS, exportul o fotografiază la 2×, deci ce vezi pe ecran e ce iese în fișier.
- **Fontul se potrivește automat** printr-o căutare binară între limitele formatului. O cântare
  nu se împarte niciodată singură pe două slide-uri.
- Fundalul e convertit în JPEG înainte de captură; asta face exportul de ~30× mai rapid decât
  cu PNG.
- Exportul are timeout-uri de siguranță: `requestAnimationFrame` nu se declanșează în taburile
  din fundal, iar fără ele exportul s-ar bloca dacă schimbi tabul.
- Paleta și stilurile sunt în `tailwind.config.js` (culori semantice: `ink`, `brand`, `line`,
  `surface`), nu împrăștiate prin componente.
