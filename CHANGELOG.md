# Changelog

## 3.1.0 – 2026-11-11

A homepage, pictures of every sound, and animation.

### Added

- **Homepage.** A new first page: a mouth diagram that morphs from sound to sound (pick one to hear it), the course in numbers, how a lesson works, a vowel map you can tap to hear, the eight units with your progress, sample words by real speakers, and a button to start or continue. The logo links to it, and it is the first item in the sidebar.
- **Mouth diagrams for every sound.** Cross-sections drawn in code show the tongue, lips, soft palate, airflow, voicing and where each sound is made. They appear on Home, in the Sounds panel (with the vowel chart for vowels) and in each lesson's sound cards. The Today hero shows the next lesson's first sound, and each unit has a small picture.
- **Animation**, with [Motion](https://motion.dev) (formerly Framer Motion): page transitions, scroll reveals, a sliding navigation highlight, count-ups, filling meters, quiz feedback, a celebration when you pass a lesson, animated toasts, and moving airflow and buzzing vocal folds on the diagrams.
- **Settings → Animations:** follow the system's reduced-motion setting (the default), or turn animations on or off for this app.

### Changed

- The app opens on Home; Today is one click away. The "Voice and audio" panel is now "Settings".

## 3.0.0 – 2026-11-09

Every sound of General American, real speakers, and a new design. Saved progress, notes, drafts and backups from earlier versions are migrated automatically.

### Added

- **All the sounds.** The 12-week course became a path of 29 lessons in 8 units: all 24 consonants, the flap and held T, all 16 vowels and gliding vowels, the vowels before R, word stress, rhythm, intonation, consonant clusters and shadowing. 17 lessons are new.
- **Sound chart.** Every sound in one chart, grouped by how it is made and colored by your progress. Each sound shows how to make it, its spellings, example words, its lessons, and a shortcut to log it in the notebook.
- **Real speakers.** Single words play recordings of American speakers from Wikimedia Commons, with a badge on each recorded word and credits on the Progress page. `npm run audio` downloads them, at build time only. Words without an `En-us-` recording fall back to recordings that Wiktionary labels as US.
- **Today view.** The next lesson, a weekly plan of two lessons, a review list (notebook check-ins due and lessons to repeat), and progress through each unit.
- Spellings on every sound card, and a YouGlish link for each shadowing script.
- The notebook covers all 50 sounds and skills.

### Changed

- New design: a sidebar on wide screens and a bottom tab bar on phones, a lesson path with collapsible units instead of the week rail, and a lesson header with progress and next/previous lessons.
- Voice settings moved to a “Voice and audio” panel, with a switch for recordings. The device voice is now used for sentences only.
- Sessions, notes and drafts store a lesson id instead of a week number.
- The service worker caches recordings as they are played, in a cache that survives updates.

### Fixed

- The IPA symbol for G is now the IPA letter ɡ, matching the transcriptions.

### Development

- Content tests check the planned path, sound coverage (every consonant and vowel has a lesson and a card), IPA characters and minimal pairs. A new content guide is at `src/content/README.md`.
- New tests for the audio service, the installed recordings, the weekly plan and sound progress, and the new views.

## 2.0.0 – 2026-11-07

A rebuild of the app for production use. Course content is unchanged, and saved progress from 1.0.0 is migrated automatically.

### Added

- Backup export and import (Progress → Your data). Importing skips duplicates.
- Offline support and install-to-home-screen (service worker and web app manifest).
- Notices when saved data was damaged or couldn't be read, with the old data kept.
- Screen-reader announcements for ear-test results, a skip link, and focus that stays in place after every action.
- Changes made in another browser tab appear without a reload.

### Changed

- Rewritten in TypeScript with Vite, split into content, domain, storage, state and UI modules.
- Fonts are bundled, so the app makes no third-party requests.
- A strict Content-Security-Policy is applied in production builds.
- HTML templates escape every value by default.
- Week counts are derived from the content, so adding a week needs no code changes.

### Fixed

- Corrupt or edited saved data could crash the app. It's now validated and repaired on load.
- A failed save because storage was full went unnoticed. It now shows a message and keeps existing data.
- Retrying "Finish session" after a failed save could log the session twice.
- Two open tabs could overwrite each other's progress.
- Speech could fail to start on iOS Safari, or appear stuck when a browser never reported the end of speech.
- Finishing a session moved you to the next week right away, so the "Session saved" banner never appeared.
- The default voice could be an older robotic one (such as Microsoft Zira) even when better "Natural" voices were installed. The app now picks the best-sounding American voice, and remembers a voice only when you choose it yourself.
- The speaker icon in the voice "Test" button shrank to a dot.

### Development

- 183 automated tests: unit, content-integrity and end-to-end in a simulated browser.
- ESLint, Prettier, EditorConfig and a GitHub Actions workflow that runs every check and the build.

## 1.0.0 – 2026-11-07

- First version: a single HTML file published as a claude.ai Artifact.
