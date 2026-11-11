# Architecture

General American Studio is a static single-page app. There is no server, and it has no runtime dependencies apart from bundled fonts and recordings.

## Layers

```
content/   ─┐
domain/    ─┼─►  state/ ─►  app.ts ─►  ui/views/  ─►  DOM
storage/   ─┘        ▲         │
services/  ──────────┴─────────┘
```

| Layer       | Responsibility                                                                                       | Depends on            |
| ----------- | ---------------------------------------------------------------------------------------------------- | --------------------- |
| `content/`  | The sound inventory and the lessons as typed data, and the path that orders them. Lookups only.      | nothing               |
| `domain/`   | Pure rules: markup parsing, lesson and sound progress, the weekly plan, the quiz engine, validation. | `content/`            |
| `storage/`  | Persistence adapters behind one `StorageAdapter` interface.                                          | `domain/validation`   |
| `state/`    | Observable store, app state shape, drafts, preferences.                                              | `domain/`             |
| `services/` | `audio.ts` plays word recordings and falls back to `speech.ts`, the browser’s speech synthesis.      | `state/` types        |
| `ui/`       | Escaping HTML templates, components and views (pure functions of state), illustrations and motion.   | `domain/`, `content/` |
| `app.ts`    | Wires it all: regions, actions, events, boot.                                                        | everything            |

`domain/` and `content/` never touch the DOM or storage, which keeps them simple to test.

## Illustrations and motion

- `ui/illustrations.ts` draws every picture as SVG from numbers. A mouth shape is an `Articulation`: tongue points (tip, blade, body, back), jaw, lips, rounding, lip tuck, soft palate, voicing, airflow and the highlighted spot. Consonants take their shape from their place of articulation; vowels from their position on the vowel chart (front–back, high–low), with rounding for the back vowels. `mouthParts()` turns a shape into path data, with the tongue as a smooth curve through its points.
- Because shapes are numbers, `mixArticulation()` can blend two of them, and `updateMouth()` updates a drawn diagram in place. That is how the homepage mouth morphs between sounds.
- Pictures use classes only (colors are theme tokens in `styles/art.css`), never style attributes, so the Content-Security-Policy holds. Tests check this for every sound.
- `ui/motion.ts` wraps [Motion](https://motion.dev)'s `animate`, `inView` and `stagger`. Its rules: content is visible without animation (animations start from a state Motion sets and always end visible, so a re-render never leaves anything hidden); reduced motion means no movement; without the Web Animations API (tests, old browsers) everything is a no-op; and no animation error can break the app.
- What animates: view changes (`enterView`, from the `main` region), scroll reveals for `data-reveal` (Home), the navigation pill (`.nav` region), count-ups for `data-count`, meters, swapping the Sounds panel, quiz feedback (`pop`, `shake`), the finished-lesson `celebrate` burst and toasts. Diagram loops (airflow, buzzing, pulse) run through `ambient()` only while a diagram is on screen; each region stops its loops before it is rendered again.
- The learner's **Animations** setting (`system`, `on`, `off`) is saved with the preferences. `setMotionPreference()` applies it and mirrors the result on `<html data-motion>`, which CSS uses for press feedback. Changing it renders every region again, so animations start or stop at once.

## Course model

- `content/sounds.ts` lists every sound the app knows: 26 consonants (including the flap and held T), 20 vowels, and 4 stress and melody skills. Keys are stable because notebook notes store them.
- `content/units/*.ts` hold the lessons, one file per unit. `content/course.ts` puts the units in path order. A lesson’s position on the path is its number; its `id` is what sessions store.
- A lesson lists the sounds it teaches. The sound chart shows each sound’s first sound card on the path and links to every lesson that teaches it.
- Versions 1 and 2 stored week numbers. `LEGACY_WEEK_IDS` maps them to lesson ids. Validation, drafts and preferences migrate them when they are read, so old data, old backups and records in a Claude account all keep working.

## State and rendering

- One immutable `AppState` lives in a small observable store (`state/store.ts`).
- The page is split into **regions** (`app.ts`). Each region names its container, the parts of state it depends on, and a view function that returns HTML.
- After every state change, only regions whose dependencies changed are re-rendered. Typing in a text field never triggers a re-render, so the cursor and open `<details>` stay where they are. The Today region follows drafts only while it is visible.
- `mount()` (`ui/html.ts`) keeps keyboard focus on the element with the same `data-key` across a re-render.
- Child regions (the quiz, twister levels, rating buttons) re-render automatically when their parent replaces their container.
- After each render, speak buttons whose word has a recording get the `rec` class, which draws the speaker badge.

## Audio

```
npm run audio ─► Wikimedia Commons API ─► public/audio/words/*.ogg
                                       └► public/audio/manifest.json (word, file, speaker, license)

AudioService.say(text)
  single word with a recording, recordings on ─► <audio> plays the file
  otherwise, or if the file fails to load      ─► SpeechService (device voice)
```

- `scripts/fetch-audio.mjs` loads the course with Vite’s `runnerImport`, collects every single word (card words, pairs, stress words, drill cells, keywords), and looks up `File:En-us-<word>.ogg` on Commons. For words without one, it reads the word’s English entry on Wiktionary and takes a recording that editors labelled US or General American (often a Lingua Libre WAV file), if its file name is the word itself. It keeps only free licenses, skips heteronyms, and downloads the original upload (Wikimedia’s converted MP3 copies are heavily rate-limited), one file at a time with adaptive pacing. The manifest is saved after every file, so a stopped run resumes.
- `AudioService` fetches the manifest at start-up and validates it like any untrusted input: safe relative file paths, web links only. It uses a recording only if the browser can play its format (`canPlayType`).
- Ear tests ask `sourceFor(pair)`: recordings only when one speaker recorded both words, otherwise the device voice for both.
- `tests/audio-files.test.ts` checks the installed manifest and files in CI without touching the network.

## Safety

- **HTML:** `html` tagged templates escape every interpolated value. Only `raw()` bypasses escaping, and it’s used only for constant SVG icons and chart geometry built from numbers.
- **CSP:** production builds include `default-src 'self'` with no inline scripts or styles. Dynamic sizes and positions are applied through CSS custom properties set from script (`data-pct`, `data-x`/`data-y`), and animations run through the Web Animations API and the CSSOM, all of which the policy allows.
- **Stored data is untrusted.** Every adapter runs records through `domain/validation.ts`, which drops invalid records and clamps values. The recordings manifest gets the same treatment.

## Storage

`createStorage()` picks the first adapter available:

1. `ClaudeAccountAdapter`, when the app runs as a published claude.ai Artifact (`window.claude` exists). Records are stored under `learners/<viewer id>/runs` and `/notes`.
2. `LocalStorageAdapter` on `localStorage`, for every other deployment.
3. `LocalStorageAdapter` on `MemoryStorage` when the browser blocks storage. Data lasts only until the page closes, and the status chip says so.

Guarantees:

- **Idempotent saves.** Ids are generated by the client and reserved in the draft before a save. Retrying a failed "Finish session" reuses them, so it can never create duplicates.
- **Versioned schema.** `gas:v2:data` holds `{app, schemaVersion, savedAt, runs, notes}`. Older keys and week numbers are migrated on load.
- **No silent loss.** Unreadable data is copied to a quarantine key, and a write that fails (for example when storage is full) throws and leaves the current state unchanged.
- **Cross-tab sync** through the `storage` event.

## Offline

`public/sw.js` is a hand-written service worker, registered only in production builds served over HTTP(S):

- Pages and the recordings manifest: network first, falling back to the cache.
- Built assets (content-hashed) and fonts: cache first.
- Recordings: cached the first time each one plays, in a separate cache that survives app updates. Range requests are answered with the whole file, because the Cache API can’t store partial responses.
- A new `VERSION` deletes old app caches on activation.

## Testing

| Suite                       | Covers                                                                       |
| --------------------------- | ---------------------------------------------------------------------------- |
| `content.test.ts`           | The path, every lesson’s structure, markup, IPA and ear test, sound coverage |
| `markup.test.ts`            | Escaping, markup rendering, speech text, stress parsing                      |
| `validation.test.ts`        | Record validation, clamping, and migration of week numbers                   |
| `progress.test.ts`          | Lesson status, suggestions, weekly plan, sound progress, streaks, notebook   |
| `quiz.test.ts`              | Quiz engine with a deterministic random source                               |
| `local-storage.test.ts`     | Saving, idempotency, migration, quarantine, quota, cross-tab                 |
| `backup-and-drafts.test.ts` | Backup parsing, draft and preference migration                               |
| `speech.test.ts`            | Choosing the best-sounding device voice                                      |
| `audio.test.ts`             | Manifest validation, recordings vs. device voice, fallbacks, ear-test pairs  |
| `audio-files.test.ts`       | The installed recordings and their credits                                   |
| `app.test.ts`               | Boots the real `index.html` and goes through whole flows                     |
