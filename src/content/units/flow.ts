/**
 * Rhythm, linking, intonation, consonant clusters and shadowing.
 *
 * Text markup and content rules: see src/content/README.md.
 */
import type { Lesson } from '../types';

export const FLOW_LESSONS: Lesson[] = [
  {
    id: 'rhythm',
    title: 'Rhythm, sentence stress and linking',
    focus: 'rhythm and linking',
    sounds: ['rhythm'],
    goal: 'Stress the important words, shrink the small ones, and link words together smoothly.',
    warmup:
      'Tap a steady beat on the table. Say one word per tap: CATS, CHASE, MICE. Keep the same beat and fit more words in: the CATS will CHASE the MICE.',
    learn: {
      kind: 'rules',
      rules: [
        {
          heading: 'Stress the content words',
          text: 'Nouns, main verbs, adjectives, adverbs and negatives (not, can’t) carry the beat. Small grammar words stay quick.',
          examples: ['I {need} the re{port} by {Fri}day.', 'She {can’t} {come} to the {meet}ing.'],
        },
        {
          heading: 'Keep the beat even',
          text: 'English keeps a steady rhythm between stressed words, so the small words in between get squeezed. These three sentences take about the same time.',
          examples: [
            '{Cats} / {chase} / {mice}.',
            'The {cats} / will {chase} / the {mice}.',
            'The {cats} / have been {chas}ing / the {mice}.',
          ],
        },
        {
          heading: 'Link a consonant to a vowel',
          text: 'When a word ends in a consonant and the next word starts with a vowel, join them as if they were one word.',
          examples: ['pick‿it‿up', 'turn‿it‿off', 'check‿it‿out', 'an‿hour'],
        },
      ],
      mistake:
        'Stressing every word equally (“I – NEED – TO – SEND – THE – RE – PORT”). It sounds choppy and makes the key words hard to find.',
    },
    listen: {
      title: 'Listen and repeat',
      intro: 'Read the sound-alike spelling, play the phrase, and say it as one smooth word.',
      rows: [
        {
          cells: ['pick‿it‿up'],
          hint: 'pi-ki-tup',
        },
        {
          cells: ['turn‿it‿off'],
          hint: 'tur-ni-toff',
        },
        {
          cells: ['check‿it‿out'],
          hint: 'che-ki-tout',
        },
        {
          cells: ['an‿apple'],
          hint: 'uh-nap-ul',
        },
        {
          cells: ['an‿hour'],
          hint: 'uh-nour',
        },
        {
          cells: ['send‿it‿over'],
          hint: 'sen-di-toe-ver',
        },
        {
          cells: ['look‿at‿it'],
          hint: 'loo-ka-dit',
        },
        {
          cells: ['find‿out'],
          hint: 'fine-dout',
        },
      ],
    },
    twister: {
      title: 'Rhythm chant',
      levels: [
        '{Dogs} / {eat} / {bones}.',
        'The {dogs} / will {eat} / the {bones}.',
        'The {dogs} / have been {eat}ing / the {bones}.',
      ],
    },
    shadow: {
      context: 'Asking a colleague for help',
      lines: [
        'I {need} to {check} the {num}bers / be{fore} the {meet}ing.',
        'Can you {send}‿it‿{o}ver / by {Fri}day?',
        '{Thanks}, / that would {help}‿a {lot}.',
      ],
      tip: 'Tap the table on each highlighted syllable. Everything else fits between the taps.',
    },
  },
  {
    id: 'intonation',
    title: 'Rising and falling intonation',
    focus: 'intonation',
    sounds: ['intonation'],
    goal: 'Let your voice fall at the end of statements and wh-questions, and rise at the end of yes/no questions.',
    warmup:
      'Say “Really?” as a surprised question, voice going up. Then say “Really.” as a calm answer, voice going down. Five times each. Exaggerate.',
    learn: {
      kind: 'rules',
      rules: [
        {
          heading: 'Falling ↘',
          text: 'Statements, requests and wh-questions (what, where, when, who, why, how) usually fall at the end.',
          examples: ['I’m {read}y. ↘', '{Where’s} the {meet}ing? ↘', 'Please {send} it to{day}. ↘'],
        },
        {
          heading: 'Rising ↗',
          text: 'Yes/no questions usually rise at the end.',
          examples: ['Are you {free} to{mor}row? ↗', 'Can you {hear} me? ↗'],
        },
        {
          heading: 'Lists and choices',
          text: 'In a list, rise on each item and fall on the last one. In a choice question, rise on the first option and fall on the last.',
          examples: ['We need {pa}per ↗, {pens} ↗, and a pro{jec}tor. ↘', '{Tea} ↗ or {cof}fee? ↘'],
        },
      ],
      mistake:
        'A flat voice on every sentence. Listeners can’t tell whether you are asking, telling or finished.',
    },
    listen: {
      title: 'Up or down?',
      intro:
        'Play each pair and copy the melody. Then read each quiz sentence, decide if the voice rises or falls, and play it to check.',
      rows: [
        {
          cells: ['Are you {read}y? ↗', 'I’m {read}y. ↘'],
        },
        {
          cells: ['Do you have a {min}ute? ↗', 'What {time} is it? ↘'],
        },
        {
          cells: ['{Tea} ↗ or {cof}fee? ↘'],
        },
      ],
      quiz: {
        type: 'tone',
        items: [
          ['Are you free tomorrow?', 'rise'],
          ['What time is it?', 'fall'],
          ['Can you hear me?', 'rise'],
          ['Where is the office?', 'fall'],
          ['I’ll send it today.', 'fall'],
          ['Do you have a minute?', 'rise'],
          ['How was the meeting?', 'fall'],
          ['Is this seat taken?', 'rise'],
          ['Who is joining the call?', 'fall'],
          ['Did you get my email?', 'rise'],
        ],
      },
    },
    twister: {
      title: 'Melody chant',
      levels: [
        '{Read}y? ↗ {Read}y. ↘',
        '{Tea} ↗ or {cof}fee? ↘',
        'We need {pa}per ↗, {pens} ↗, {mark}ers ↗, and a pro{jec}tor. ↘',
      ],
    },
    shadow: {
      context: 'Opening a team meeting',
      lines: [
        'Good {morn}ing, {ev}eryone. ↘',
        'Can you {all} {hear} me? ↗',
        'To{day} we’ll {talk} about {sales} ↗, {mar}keting ↗, / and {next} {steps}. ↘',
      ],
      tip: 'Exaggerate the arrows on the first two passes. Then make them natural.',
    },
  },
  {
    id: 'clusters',
    title: 'Consonant clusters',
    focus: 'consonant clusters',
    sounds: ['clusters'],
    goal: 'Say groups of consonants together, with no extra vowel before, between or after them.',
    warmup:
      'Hiss on “sss”, then add a T without a breath: “sss-t”, “st”. Then add R: “str”. Now say “street” starting from the S: ssstreet. Five times, each a little faster.',
    learn: {
      kind: 'rules',
      rules: [
        {
          heading: 'No vowel before S',
          text: 'Words like school, speak and student start straight on the S. Don’t add a vowel in front: “eschool” and “espeak” are hard to understand.',
          examples: ['[s]chool', '[s]peak', '[s]tudent', 'a [st]rong [st]art'],
        },
        {
          heading: 'No vowel inside the group',
          text: 'Keep the consonants pressed together. “Street” has one syllable, not three like “su-to-reet”.',
          examples: ['[str]eet', '[spl]it', '[pl]ease', '[bl]ue', 'the [cl]ient'],
        },
        {
          heading: 'Finish the ending',
          text: 'Final clusters carry meaning: -s for plurals and -ed for the past. Say every consonant, then stop. No extra vowel after: “asked” is one syllable.',
          examples: ['a[sked]', 'te[xts]', 'mon[ths]', 'ne[xt]', 'hel[ped]'],
        },
        {
          heading: 'Fast speech simplifies',
          text: 'When three consonants meet across two words, Americans often drop the middle one. In “next week”, “last night” and “most people”, the T almost disappears. This is natural, not lazy.',
          examples: ['next‿week', 'last‿night', 'most‿people'],
        },
      ],
      mistake:
        'Adding a vowel to break up the consonants: “eschool”, “su-to-reet”, “ask-u”. It adds syllables, changes the rhythm, and can even make a different word: “sport” becomes “support”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'In each pair, the second word has an extra vowel. Say the first word with no vowel between or before the consonants. Then test your ear.',
      pairs: [
        ['sport', 'support'],
        ['blow', 'below'],
        ['state', 'estate'],
        ['steam', 'esteem'],
        ['prayed', 'parade'],
        ['claps', 'collapse'],
        ['plight', 'polite'],
      ],
    },
    twister: {
      levels: [
        'strong street lights',
        'The student asked for the next three texts.',
        'Six strong students asked for the next sixteen texts in the first months of spring.',
      ],
    },
    shadow: {
      context: 'Planning next steps with your team',
      lines: [
        'Let’s [st]art with the [str]ategy.',
        'I a[sked] the [cl]ient for her [pl]ans.',
        'We’ll [spl]it the ta[sks] ne[xt] week.',
      ],
      tip: 'No vowel inside any underlined group. Say “asked” as one syllable, and let the T in “next week” nearly disappear.',
    },
  },
  {
    id: 'shadowing',
    title: 'Shadowing a self-introduction',
    focus: 'shadowing at natural speed',
    sounds: ['rhythm', 'intonation'],
    goal: 'Shadow a full introduction at natural speed, using everything from the path so far.',
    warmup:
      'Quick review: say one word from each part of the path, slowly first and then naturally: pen, water, think, she, really, very, team, budget, about, work, information, pick it up.',
    learn: {
      kind: 'rules',
      rules: [
        {
          heading: 'What shadowing is',
          text: 'You play a model and speak along with it, about half a second behind, copying the sounds, stress, rhythm and melody at the same time.',
          examples: [],
        },
        {
          heading: 'One focus per pass',
          text: 'Don’t fix everything at once. Listen for the sounds on one pass, the stress on the next, then the melody.',
          examples: [],
        },
        {
          heading: 'Make it yours',
          text: 'Once you can shadow the script smoothly, swap in your own name, team and project, and practice it as your real introduction.',
          examples: ['My {name} is {Al}ex, / and I {work} in {mar}keting. ↘'],
        },
      ],
      mistake:
        'Waiting until the end of a line to start speaking. Shadowing means speaking while the model is still talking.',
    },
    listen: {
      title: 'Review mix',
      separator: '',
      intro:
        'One target from each part of the path. Play, repeat, and log any that still feel hard in your Sound notebook. The ear test mixes pairs from earlier lessons.',
      rows: [
        { cells: ['[p]en', '[b]est'], hint: 'P and B' },
        { cells: ['wa[t]er', 'ge[t] ready'], hint: 'The American T' },
        { cells: ['[th]ink', '[th]is'], hint: 'TH' },
        { cells: ['[s]ee', '[sh]e'], hint: 'S and SH' },
        { cells: ['[r]eally', '[l]ight'], hint: 'R and L' },
        { cells: ['[v]ery', '[w]eek'], hint: 'V and W' },
        { cells: ['t[ea]m', 'm[i]nute'], hint: 'Sheep and ship' },
        { cells: ['pl[a]n', 'b[u]dget'], hint: 'Cat and cup' },
        { cells: ['[a]bout', 'w[or]k'], hint: 'Schwa and ER' },
        { cells: ['pre{sent}', 'infor{ma}tion'], hint: 'Word stress' },
        { cells: ['pick‿it‿up', 'Are you {read}y? ↗'], hint: 'Rhythm and melody' },
      ],
      quiz: {
        type: 'mixed-pairs',
        fromLessons: ['p-b', 'th', 's-z', 'r-l', 'v-w-b', 'i-ih', 'ae-eh-uh', 'er', 'diphthongs'],
      },
    },
    twister: {
      title: 'Review medley',
      levels: [
        'three red vans',
        'Better water for the team meeting.',
        'Thirty-three thankful workers really loved the better butter at the big team meeting.',
      ],
    },
    shadow: {
      context: 'Introducing yourself to a new team',
      lines: [
        'Hi, {ev}eryone. ↘',
        'My {name} is {Al}ex, / and I {work} in {mar}keting. ↘',
        'I’ve been with the {com}pany / for {three} {years}. ↘',
        'Right {now}, / I’m {work}ing on our {budg}et / for {next} {year}. ↘',
        'I’m {look}ing {for}ward to {work}ing with you. ↘',
        '{An}y {ques}tions? ↗',
      ],
      tip: 'Do the first pass at slow speed, the rest at natural speed. Then swap in your own name and job.',
    },
  },
];
