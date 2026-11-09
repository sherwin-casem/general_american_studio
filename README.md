# General American Studio

A pronunciation practice app for every sound of General American English. A path of 29 short lessons (about 15 minutes each) covers all 24 consonants, the American T, all 16 vowels and gliding vowels, the vowels before R, and then word stress, rhythm, intonation and shadowing.

| Unit                     | Lessons                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| Stops                    | P and B · T and D · K and G · The American T                     |
| Fricatives               | F and V · TH · S and Z · SH and ZH · CH and J                    |
| Nasals, R, L, W, Y and H | M, N and NG · R and L · V, W and B · Y and H                     |
| Front vowels             | Sheep and ship · Day and bed · Cat, bed and cup                  |
| Central and back vowels  | Schwa · The ER vowel · Food and book · Home · Hot and law        |
| Gliding vowels and R     | Time, now and boy · Vowels before R                              |
| Word stress              | Two-syllable words · Longer words                                |
| Rhythm and melody        | Rhythm and linking · Intonation · Consonant clusters · Shadowing |

Each lesson has six steps you can repeat: warm-up, meet the sounds, hear the difference (minimal pairs and an ear test), tongue twister, shadowing, and rate-and-note.

The app has five views:

- **Today:** the next lesson, this week’s plan (two lessons a week), and what to review: notebook sounds due for a check-in and lessons rated below 3.
- **Sounds:** a chart of every sound, grouped by how it is made. Select one to see how to make it, its spellings and example words, and the lesson that practices it.
- **Lessons:** the path, and the six steps of the open lesson.
- **Notebook:** log difficult sounds and check in weekly to see them improve.
- **Progress:** stats, clarity over time, the lesson map, session history, backups and audio credits.

It is built with TypeScript and Vite, with no runtime framework.

## Getting started

You need [Node.js](https://nodejs.org) 20.19 or newer (22 is recommended; see `.nvmrc`).

```powershell
cd "D:\English tutor"
npm install
npm run dev
```

`npm run dev` prints a local address, usually http://localhost:5173. Changes to the code reload the page automatically.

## Audio: real American speakers

Single words are played from **real recordings of American English speakers**. They are the US pronunciations on [Wikimedia Commons](https://commons.wikimedia.org), mostly recorded for Wiktionary and shared under free licenses. Words with a recording show a small green speaker badge. The Voice and audio panel can turn recordings off.

Sentences (twisters, shadowing scripts, tone questions) have no ready-made recordings, so they use the best American voice on the device. The app picks neural voices first: Microsoft Edge’s “Natural” voices (Aria, Jenny, Ava…) sound far better than the older system voices. Every lesson also links to [YouGlish](https://youglish.com), which plays the same words in real videos.

Recordings are downloaded once, at build time, and served with the app. Nothing is fetched from Wikimedia while you practice.

```powershell
npm run audio                # download recordings for words that don't have one yet
npm run audio -- --dry       # only report which words have recordings
npm run audio -- --all       # check every word again
```

- Files go to `public/audio/words/`, and `public/audio/manifest.json` lists each word with its speaker, license and source page. The Progress page shows these credits, as the licenses (mostly CC BY-SA) require.
- Only freely licensed files are used: CC BY, CC BY-SA, CC0 or public domain. The original uploads are saved (mostly Ogg Vorbis, about 15 KB each).
- Words with two pronunciations (present, record, live, minute…) always use the device voice, so a recording can never play the wrong stress.
- In an ear test, both words of a minimal pair come from the same speaker, or both from the device voice, so the voice itself never gives the answer away.
- Wikimedia limits how fast automated clients may download, and limits unidentified clients much more. The script goes one file at a time, in lesson order (so the first lessons get recordings first), slows down when asked, and saves after every file. Stop it at any time; running it again continues where it stopped, and lookups are cached in `node_modules/.cache`. Setting `AUDIO_CONTACT` to your website or email identifies you to Wikimedia, as its User-Agent policy asks, and usually makes downloads much faster: `$env:AUDIO_CONTACT = "you@example.com"; npm run audio`.
- Run `npm run audio` after adding words to the course. Commit the files so builds and CI never depend on the network.

## Scripts

| Command              | What it does                                                          |
| -------------------- | --------------------------------------------------------------------- |
| `npm run dev`        | Starts the development server with live reload                        |
| `npm run build`      | Type-checks, then builds the production site into `dist/`             |
| `npm run preview`    | Serves the production build locally, to check it before deploying     |
| `npm run audio`      | Downloads word recordings from Wikimedia Commons (see above)          |
| `npm test`           | Runs all tests once                                                   |
| `npm run test:watch` | Re-runs tests as you edit                                             |
| `npm run coverage`   | Runs tests with a coverage report in `coverage/`                      |
| `npm run typecheck`  | Type-checks without building                                          |
| `npm run lint`       | Runs ESLint                                                           |
| `npm run format`     | Formats every file with Prettier                                      |
| `npm run check`      | Type check, lint, format check and tests: what CI runs before a build |

## Deploying

`npm run build` produces a static site in `dist/`. Every path in it is relative, so it can be hosted from any folder on any static host, for example GitHub Pages, Netlify, Cloudflare Pages or an S3 bucket.

- Serve it over HTTPS. Offline support and installing the app on a phone both need HTTPS (or `localhost`).
- Opening `dist/index.html` directly from disk does not work: browsers block module scripts on `file://`. Use `npm run preview` instead.
- The build includes a strict Content-Security-Policy as a `<meta>` tag. If your host can set headers, you can also send the same policy as a `Content-Security-Policy` header and add `frame-ancestors 'none'`.
- After changing anything in `public/` other than recordings, bump `VERSION` in `public/sw.js` so returning visitors get the new files. Recordings are cached as they are played, in their own cache; bump `AUDIO` there only if existing recordings are replaced.

The `.github/workflows/ci.yml` workflow runs every check and builds the site on each push and pull request.

## Where data is saved

| Running as                       | Sessions and notes are saved in              |
| -------------------------------- | -------------------------------------------- |
| This app on any website or local | The browser’s `localStorage`, on that device |
| The published claude.ai Artifact | Your Claude account, on any device           |

The two are separate. To move data, or keep a backup, use **Progress → Your data → Export backup**, and **Import backup** on the other side. Importing keeps what you have and skips duplicates.

Data handling:

- Everything read from storage or a backup file is validated. Damaged records are skipped and counted, never shown as is.
- If the saved data can’t be read at all, the app starts fresh, keeps a copy of the old data under a `gas:v2:corrupt:<time>` key, and tells you.
- Older data is migrated when it is read. Version 1 keys (`gas.data.v1`, `gas.draft.v1`, `gas.week`, `gas.voice`) move to the current keys, and the week numbers of versions 1 and 2 map to their lessons (week 1 → TH, week 2 → R and L, and so on). Old backups import the same way.
- If storage is full, the save fails with a message and nothing already saved is lost.
- Changes made in another tab show up without a reload.

| Key             | Holds                                                         |
| --------------- | ------------------------------------------------------------- |
| `gas:v2:data`   | Sessions and notebook notes (versioned envelope)              |
| `gas:v2:drafts` | Unsaved work per lesson: ticks, reps, passes, rating, note    |
| `gas:v2:prefs`  | Selected lesson, chosen sentence voice, and recordings on/off |

## Editing the course

All lesson content is in `src/content/`: the sound inventory in `sounds.ts`, the lessons in `units/*.ts`, one file per unit. [`src/content/README.md`](src/content/README.md) explains the lesson structure, the text markup and the IPA conventions.

The content tests (`tests/content.test.ts`) check every lesson: structure, markup, IPA characters, stress marks, minimal pairs and ear tests. They also check that every consonant and vowel in the inventory is taught by a lesson and has a sound card, so the chart can never point at a sound without a lesson.

**To add a lesson:** add it to the unit file where it belongs (array order is path order), give it a new `id` that you will never change, and run `npm run audio` to fetch recordings for its words. Lesson numbers, the path, Today and Progress all follow automatically.

## Project structure

```
index.html              Page shell: sidebar or tab bar, and the five views
public/                 Copied as is: service worker, manifest, icon, recordings
scripts/fetch-audio.mjs Downloads word recordings from Wikimedia Commons
src/
  main.ts               Entry: styles, fonts, error handling, app start
  app.ts                Controller: state, rendering regions, actions, events
  content/              Sound inventory, lessons by unit, and their types
  domain/               Pure rules: markup, progress, quiz engine, validation
  storage/              Storage adapters (browser, Claude account), backups, errors
  state/                Store, drafts, preferences, app state shape
  services/             Word recordings (audio.ts) and the device voice (speech.ts)
  ui/                   HTML templating, components, views, chart
  styles/               Tokens (light and dark), base, components, layout, views
tests/                  Unit, content and end-to-end tests (Vitest + happy-dom)
docs/ARCHITECTURE.md    How the pieces fit together
```

## Browser support

Current Chrome, Edge, Safari and Firefox, on desktop and mobile. Recordings are the original Ogg files from Commons, which Edge, Chrome and Firefox play. Where a browser can’t play them (some Safari versions), words use the device voice instead. Sentence voices depend on the device: Edge’s “Natural” voices sound best, then Chrome’s “Google US English”. If a browser has no speech support, the app says so; recordings and YouGlish links still work.

## Privacy

The app sends nothing to any server. There are no analytics and no third-party requests: fonts and recordings are bundled. Speech runs in the browser. Recordings you load for comparison stay on your device and are never stored. Only `npm run audio`, run by you at build time, contacts Wikimedia Commons.
