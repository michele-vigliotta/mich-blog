# mich-blog — Guida e registro delle decisioni

Sito personale per pubblicare "dove e quando mi alleno", raggiungibile via QR code
attaccato in giro per la città.

Documento vivo: viene aggiornato ogni volta che si prende una decisione.

---

## Stack

| Cosa | Versione / scelta |
|---|---|
| Framework | Next.js **16.2.12** (App Router) |
| React | 19.2.4 |
| Linguaggio | TypeScript |
| Stile | Tailwind CSS v4 |
| Contenuti | file Markdown con frontmatter in `content/posts/` |
| Parsing frontmatter | `gray-matter` |
| Hosting | Vercel |

> **Nota sulle versioni:** la guida di partenza era scritta per Next.js 15, ma
> `create-next-app@latest` installa sempre l'ultima major, quindi è arrivata la 16.
> Le differenze rilevanti sono elencate in fondo, sezione "Scostamenti dalla guida originale".

---

## Registro delle decisioni

### 1. Nome del progetto: `mich-blog`
Al posto di `allenati-con-me`. Il nome della cartella non influenza il codice.
Conviene usare lo stesso nome per il repo GitHub, così il dominio Vercel di default
sarà `mich-blog.vercel.app` e non ci sono tre nomi diversi da tenere a mente.
Il titolo mostrato sul sito (`<h1>`) è indipendente e si decide dopo.

### 2. Struttura in root, senza `src/`
Risposta `No` alla domanda `src/ directory` del wizard. Le cartelle `app/`, `lib/`,
`components/` stanno nella root del progetto, come assume la guida originale.

### 3. `qrcode` va in `devDependencies`, non in `dependencies`
Serve solo per uno script lanciato una volta dal PC: il sito in produzione non lo
importa mai. Vercel installa solo le `dependencies`, quindi tenerlo tra le dev rende
l'install più leggero e documenta l'intenzione ("è un tool, non parte dell'app").
`gray-matter` invece **deve** stare in `dependencies` perché gira a build time su Vercel.

Aggiunte rispetto alla guida originale:
- `@types/qrcode` — il pacchetto `qrcode` è JS puro e non porta i suoi tipi
- `tsx` — esegue direttamente i file `.ts` (serve per lo script del QR)

### 4. Immagini: solo copertina, niente markdown inline
**Decisione presa il 2026-07-26.**

Ogni post può avere **una** immagine di copertina, dichiarata nel frontmatter.
Niente immagini o formattazione dentro il corpo del testo.

*Perché:* la guida non renderizza markdown — il corpo del post finisce dentro un
`<p>` come testo puro (React fa escaping), quindi `![foto](...)`, `**grassetto**` e
`# titolo` comparirebbero letterali. Renderizzare markdown davvero richiede
`react-markdown` + `@tailwindcss/typography`. Per un post del tipo "ci vediamo qui a
quest'ora" una foto del posto vale più di dieci immagini inline, quindi non vale
la complessità aggiuntiva.

*Conseguenze sul codice:* campo `immagine` nel frontmatter, campo `immagine` nel tipo
`Post`, componente `<Image>` in `PostCard.tsx` e in `app/posts/[slug]/page.tsx`.
Nessuna dipendenza nuova: `next/image` è incluso in Next.

*Dove stanno i file:* da decidere al momento del primo post con foto. Due strade:
- **`public/images/`** — semplice, ma caricare un binario dall'app GitHub mobile non
  si può fare (serve il browser in versione desktop sul telefono), e le foto gonfiano
  lo storico git per sempre
- **URL esterno** (Telegram/Drive/imgur) — il campo `immagine` contiene l'URL completo,
  il repo resta leggero, ma va dichiarato il dominio in `next.config.ts`

Il campo `immagine` è **opzionale**: un post senza foto deve funzionare lo stesso.

### 5. Gli avvisi di `npm audit` si ignorano — MAI `npm audit fix --force`
**Decisione presa il 2026-07-26.**

Dopo `npm install` compaiono ~12 vulnerabilità "high severity" (`brace-expansion`,
`postcss`, `sharp`). Si lasciano stare.

*Perché non sono un rischio qui:*
- `brace-expansion` arriva da `eslint` → dev-only, gira sul PC sui file dell'autore,
  Vercel non lo installa nemmeno
- `postcss` gira a build time e processa il CSS scritto da noi → nessun input ostile
- `sharp` ottimizza le immagini, che carichiamo noi; e su Vercel l'ottimizzazione la
  fa l'infrastruttura di Vercel

`npm audit` confronta l'inventario dei pacchetti con un database di advisory: non sa
se il codice vulnerabile è raggiungibile né con quali input. È un segnale, non un ordine.

*Perché `--force` è pericoloso:* l'advisory su Next indica come vulnerabile l'intervallo
`9.3.4-canary.0 - 16.3.0-preview.7`, cioè fino all'ultima versione esistente — **non c'è
ancora una versione corretta**. L'unica versione "fuori intervallo" è sotto, quindi npm
propone `next@9.3.3`: un downgrade di sei anni, senza App Router. `--force` accetta
proposte del genere senza discutere e distruggerebbe il progetto.

`npm audit fix` senza `--force` è invece innocuo (solo aggiornamenti compatibili).

### 6. Nomi file con prefisso data ISO, e lo slug la conserva
**Decisione presa il 2026-07-26.**

Convenzione: `YYYY-MM-DD-slug-descrittivo.md`. Lo slug è il **nome file senza `.md`,
prefisso data incluso** → URL `/posts/2026-07-28-parco-foce`.

*Perché lo slug tiene la data (scostamento dalla guida originale).* La guida ricavava
lo slug togliendo anche la data:

```ts
const slug = filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
```

Ma su questo sito si torna spesso negli stessi posti: il secondo post al Parco della
Foce darebbe di nuovo slug `parco-foce`. Conseguenze silenziose:
`getPostBySlug` usa `.find()` e restituisce sempre il primo (l'altro post diventa
irraggiungibile), e `generateStaticParams` emette due volte lo stesso slug.
Nessun errore, un post sparisce e basta. Tenendo la data lo slug è unico per costruzione.

Versione corretta:
```ts
const slug = filename.replace(/\.md$/, '');
```

*Alternativa scartata: prefisso numerico* (`001-nome-post.md`). Garantisce anch'essa
l'unicità, ma obbliga a consultare l'ultimo numero usato prima di scrivere un post —
attrito proprio nel flusso "pubblico dal telefono in trenta secondi" — e il nome file
non dice più quando. Richiederebbe inoltre lo zero-padding per non rompere l'ordine
alfabetico all'undicesimo post (`10-` viene prima di `2-`).

### 7. Date salvate in ISO, mostrate all'italiana
**Decisione presa il 2026-07-26.**

Nome file e frontmatter usano **sempre** `YYYY-MM-DD`. Il formato giorno-mese-anno
si applica solo a schermo.

*Perché.* L'ISO è l'unico formato in cui l'ordine alfabetico coincide con quello
cronologico (il componente più significativo sta a sinistra). L'ordinamento dei post è
un confronto **tra stringhe**:

```ts
posts.sort((a, b) => (a.data < b.data ? 1 : -1));
```

Con `DD-MM-YYYY` si ordinerebbe per giorno del mese: `28-07-2026` finirebbe dopo
`04-08-2026`. Homepage in ordine casuale, senza nessun errore né warning.

*Principio generale:* il formato in cui si **salva** un dato e quello in cui lo si
**mostra** sono cose separate. Si salva nel formato che il codice maneggia meglio, si
converte al momento di stampare.

*Come formattare (da applicare in `PostCard.tsx`):*

```ts
// versione semplice → "28/07/2026"
const [anno, mese, giorno] = post.data.split('-');
const dataIt = `${giorno}/${mese}/${anno}`;

// versione con giorno della settimana → "martedì 28 luglio"
const [a, m, g] = post.data.split('-').map(Number);
const dataIt = new Date(a, m - 1, g).toLocaleDateString('it-IT', {
  weekday: 'long', day: 'numeric', month: 'long',
});
```

**Da evitare:** `new Date("2026-07-28").toLocaleDateString('it-IT')`. Quella stringa
viene interpretata come mezzanotte **UTC** e poi convertita nel fuso locale: su un
server in fuso negativo (e Vercel builda dove gli pare) diventa il 27 luglio.
Costruendo la data dai pezzi già separati il problema non si pone.

---

## Formato di un post

File in `content/posts/`, nome secondo la convenzione `YYYY-MM-DD-slug-descrittivo.md`.

```markdown
---
title: "Allenamento al Parco della Foce"
data: "2026-07-28"
ora: "18:00"
luogo: "Parco della Foce, Ancona"
tipo: "calisthenics"
immagine: "/images/parco-foce.jpg"   # opzionale
---

Vengo qui quasi tutti i giorni verso quest'ora, se vi va di allenarvi
insieme o anche solo fare due chiacchiere venite pure!
```

**Regola d'oro: virgolette sempre, su tutti i valori.** In YAML `data: 2026-07-28`
senza virgolette diventa un oggetto `Date`, con le virgolette resta una stringa.
L'ordinamento dei post confronta stringhe (`a.data < b.data`), e funziona solo perché
il formato `YYYY-MM-DD` si ordina alfabeticamente come cronologicamente.

---

## Struttura delle cartelle

```
mich-blog/
├── content/
│   └── posts/                    → i post in markdown
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  → homepage con la lista
│   └── posts/
│       └── [slug]/
│           └── page.tsx          → dettaglio singolo post
├── lib/
│   └── posts.ts                  → lettura e parsing dei .md
├── components/
│   └── PostCard.tsx
├── public/
│   └── images/                   → eventuali copertine locali
├── scripts/
│   └── generate-qrcode.ts        → script una tantum
└── GUIDA.md                      → questo file
```

---

## Stato di avanzamento

- [x] **1.** Progetto creato con `create-next-app`
- [x] **1b.** Dipendenze installate (`gray-matter`; dev: `qrcode`, `@types/qrcode`, `tsx`)
- [x] **2.** Cartelle create + primo post `.md` (`2026-07-26-primo-post.md`)
- [x] **3.** `lib/posts.ts` — verificato con `npx tsc --noEmit` e con uno script runtime
- [ ] **4.** `components/PostCard.tsx`
- [ ] **5.** `app/page.tsx` (homepage)
- [ ] **6.** `app/posts/[slug]/page.tsx` (dettaglio)
- [ ] **7.** Repo GitHub + deploy su Vercel
- [ ] **8.** Generazione del QR code (per ultimo: serve il dominio definitivo)

---

## Scostamenti dalla guida originale

| # | Guida originale | Qui | Motivo |
|---|---|---|---|
| 1 | Next.js 15 | Next.js 16.2.12 | `create-next-app@latest` installa l'ultima major |
| 2 | `params: { slug: string }` | `params: Promise<{ slug: string }>`, con `await` | Da Next 15 `params` è asincrono. Il codice originale non compila |
| 3 | solo `gray-matter` + `qrcode` | aggiunti `@types/qrcode` e `tsx` | Servono per far girare lo script del QR in TypeScript |
| 4 | nessuna immagine | campo `immagine` opzionale | Vedi decisione 4 |
| 5 | slug senza data (`parco-foce`) | slug con data (`2026-07-28-parco-foce`) | Post ripetuti nello stesso luogo darebbero slug duplicati. Vedi decisione 6 |

### Dettaglio scostamento 2 — `params` è una Promise

Next 16, `app/posts/[slug]/page.tsx`:

```tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // ...
}
```

La funzione diventa `async` e `params` va atteso. Fonte: i docs della versione
installata, in `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`.
