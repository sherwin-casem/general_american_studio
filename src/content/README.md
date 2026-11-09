# Course content

Everything a learner reads or hears is in this folder. It is typed data with no logic. `tests/content.test.ts` checks it, so a mistake fails `npm test` instead of breaking a lesson.

| File         | Holds                                                                            |
| ------------ | -------------------------------------------------------------------------------- |
| `types.ts`   | The shapes: `Sound`, `Lesson`, `SoundCard`, `Unit` and the rest                  |
| `sounds.ts`  | The sound inventory: every General American consonant and vowel, and the skills  |
| `units/*.ts` | The lessons, one file per unit, in path order                                    |
| `course.ts`  | The path (`UNITS`), lookups, and the table that maps old week numbers to lessons |

## Lessons

A lesson teaches one or more sounds in six steps: warm up, meet the sounds, hear the difference (minimal pairs and an ear test), tongue-twister drill, shadow the script, and rate and note.

- `id` is stored with every session the learner saves. Never rename an id once it has shipped.
- `sounds` lists the inventory keys the lesson teaches. The first is the default sound for notebook notes.
- Every consonant and vowel needs a `SoundCard` in at least one lesson. The sound chart shows the first card on the path for each sound.
- `SoundCard.ipa` must match the inventory symbol. The only alias is `ɚ` for the `er` sound.
- Each card has two to four `how` steps and four to eight example `words`.
- Minimal pairs (`listen.pairs`) are two real, common words that differ in one sound. Six to eight pairs is right. They become the drill rows and the ear test.
- Twisters have exactly three levels: a short phrase, a short sentence, then a full challenge.
- Shadow scripts are three or four lines, in a short work situation, because the course leads into Business English.

### Writing style

Short, plain sentences for a beginner. Use typographic quotes and apostrophes: “think”, don’t. Describe the mouth in everyday words (“tongue tip”, “top teeth”, “touch your throat”), not phonetic terms.

### Words and real recordings

Single words play a real native-speaker recording when Wikimedia Commons has one (see “Audio” in the main README). Common dictionary words in lowercase are almost always recorded, so prefer them in cards and pairs. Run `npm run audio` after adding words.

## Text markup

Used in drill rows, twisters, shadow lines and rule examples (see `src/domain/markup.ts`):

| Write        | Shows as                           |
| ------------ | ---------------------------------- |
| `pre{sent}`  | stressed syllable, highlighted     |
| `[th]ink`    | target sound, underlined           |
| `/`          | short pause (spaces on both sides) |
| `pick‿it‿up` | linked words                       |
| `↗` `↘`      | voice rises / falls                |

Stress words in `learn.groups` and stress quizzes are syllables split by `·`, with the stressed syllable in capitals: `'in·for·MA·tion'`.

## IPA

Broad General American transcription, without slashes:

- R is `r`. The R vowel is `ɝ` when stressed (bird `bɝd`) and `ɚ` when not (teacher `ˈtitʃɚ`).
- Diphthongs: `eɪ` `oʊ` `aɪ` `aʊ` `ɔɪ`. The letters `e`, `o` and `a` appear only inside these.
- Before R: `ɪr` `ɛr` `ɑr` `ɔr` (near, hair, car, more).
- G is the IPA letter `ɡ` (U+0261), not the keyboard `g`.
- `ɑ` for hot and father, `ɔ` for law and thought. Many Americans merge them; the lessons say so.
- The flap is `ɾ` (water `ˈwɔɾɚ`) and the held T is `t̚`.
- Stress marks `ˈ` (primary) and `ˌ` (secondary) go before the syllable. Never use an apostrophe.
- No length marks (`ː`).
