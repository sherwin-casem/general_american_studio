/**
 * Central and back vowels: schwa, the ER vowel, OO, OH, AH and AW.
 *
 * Text markup and content rules: see src/content/README.md.
 */
import type { Lesson } from '../types';

export const BACK_VOWEL_LESSONS: Lesson[] = [
  {
    id: 'schwa',
    title: 'Schwa, the relaxed vowel',
    focus: 'schwa and weak words',
    sounds: ['schwa'],
    goal: 'Relax unstressed syllables and small grammar words into a short, quiet /ə/.',
    warmup:
      'Let your jaw hang loose and make a tiny, lazy “uh”. Say “banana” two ways: first “ba-na-na” with full vowels, then “buh-NAN-uh”. The second one is the American way.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'schwa',
          ipa: 'ə',
          name: 'Schwa',
          how: [
            'Relax your whole mouth. Lips neutral, tongue resting in the middle.',
            'Make it short and quiet. Schwa is never stressed.',
            'It is the most common vowel sound in American English, and any vowel letter can spell it: about, problem, today, support.',
          ],
          spellings: ['a', 'e', 'i', 'o', 'u'],
          words: [
            ['about', 'əˈbaʊt'],
            ['banana', 'bəˈnænə'],
            ['problem', 'ˈprɑbləm'],
            ['today', 'təˈdeɪ'],
            ['support', 'səˈpɔrt'],
            ['company', 'ˈkʌmpəni'],
          ],
        },
        {
          sound: 'schwa',
          ipa: 'ə',
          name: 'Weak words',
          how: [
            'Small grammar words usually take schwa in a sentence.',
            'to /tə/, for /fɚ/, and /ən/, of /əv/, can /kən/, a /ə/.',
            'Say the important words clearly and let these small words go quiet and quick.',
          ],
          spellings: ['a', 'o', 'e'],
          words: [
            ['to work', 'tə ˈwɝk'],
            ['for you', 'fɚ ˈju'],
            ['salt and pepper', 'ˈsɔlt ən ˈpɛpɚ'],
            ['a cup of tea', 'ə ˈkʌp əv ˈti'],
            ['I can go', 'aɪ kən ˈɡoʊ'],
            ['at noon', 'ət ˈnun'],
          ],
        },
      ],
      mistake:
        'Giving every syllable a full vowel (“ba-NA-NA”, “COM-PA-NY”). It sounds careful and robotic, and the stressed syllable gets lost.',
    },
    listen: {
      title: 'Listen and repeat',
      intro:
        'Read the sound-alike spelling, play the phrase, and copy how small and quick the weak parts are.',
      rows: [
        {
          cells: ['a cup of coffee'],
          hint: 'uh-kup-uh-kaw-fee',
        },
        {
          cells: ['I can go'],
          hint: 'eye-kn-go',
        },
        {
          cells: ['salt and pepper'],
          hint: 'salt-n-pep-er',
        },
        {
          cells: ['for you'],
          hint: 'fer-you',
        },
        {
          cells: ['to work'],
          hint: 'tuh-work',
        },
        {
          cells: ['What do you think?'],
          hint: 'wah-duh-yuh-think',
        },
        {
          cells: ['banana'],
          hint: 'buh-nan-uh',
        },
        {
          cells: ['company'],
          hint: 'kum-puh-nee',
        },
      ],
    },
    twister: {
      levels: [
        'a cup of tea',
        'I need to go to the bank for a minute.',
        'Tell Amanda about the panda and the banana at the cinema.',
      ],
    },
    shadow: {
      context: 'Moving a meeting',
      lines: [
        'I need [to] talk [to] [A]mand[a] [a]bout the [a]gend[a].',
        '[Can] we do it [at] sev[e]n?',
        'It’s [a] probl[e]m [for] the comp[a]ny.',
      ],
      tip: 'Keep the underlined parts small and quiet. Make the other words clear and strong.',
    },
  },
  {
    id: 'er',
    title: 'The American ER',
    focus: 'the ER vowel',
    sounds: ['er'],
    goal: 'Make one smooth R-colored vowel in “bird” and “teacher”, with no separate vowel before the R.',
    warmup:
      'Say a long “rrrr” on its own, like a quiet growl. Pull your tongue back, keep the tip from touching anything, and round your lips a little. Now say “bird”, “word” and “first”, and keep the growl going through the whole vowel.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'er',
          ipa: 'ɝ',
          name: 'Stressed ER',
          how: [
            'Pull your tongue back and bunch it up, or curl the tip up a little. It touches nothing.',
            'Round your lips slightly.',
            'The whole vowel is the R sound. Don’t say a vowel first and then add an R.',
          ],
          spellings: ['er', 'ir', 'ur', 'or', 'ear'],
          words: [
            ['bird', 'bɝd'],
            ['work', 'wɝk'],
            ['first', 'fɝst'],
            ['learn', 'lɝn'],
            ['turn', 'tɝn'],
            ['person', 'ˈpɝsən'],
          ],
        },
        {
          sound: 'er',
          ipa: 'ɚ',
          name: 'Unstressed ER',
          how: [
            'Use the same tongue shape, but make it short and weak.',
            'It ends many words spelled -er, -or and -ar.',
            'Don’t drop it. In American English this R is always heard.',
          ],
          spellings: ['er', 'or', 'ar', 'ure'],
          words: [
            ['teacher', 'ˈtitʃɚ'],
            ['better', 'ˈbɛɾɚ'],
            ['after', 'ˈæftɚ'],
            ['doctor', 'ˈdɑktɚ'],
            ['together', 'təˈɡɛðɚ'],
            ['number', 'ˈnʌmbɚ'],
          ],
        },
      ],
      mistake:
        'Dropping the R, so “bird” sounds like “bud” and “teacher” like “teach-uh”. Or saying a full vowel before the R, so “work” sounds like “walk”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'Keep the R color through the whole vowel of the first word. The second word has a different vowel. Then test your ear.',
      pairs: [
        ['hurt', 'hut'],
        ['bird', 'bud'],
        ['work', 'walk'],
        ['shirt', 'short'],
        ['first', 'fast'],
        ['word', 'ward'],
        ['burn', 'barn'],
        ['heard', 'hard'],
      ],
    },
    twister: {
      levels: [
        'her first word',
        'The nurse works early on Thursday.',
        'Thirty early workers heard the third nurse learn her first German words.',
      ],
    },
    shadow: {
      context: 'Handing in a first draft',
      lines: [
        'I h[ear]d the f[ir]st draft is done.',
        'Let’s t[ur]n it in on Th[ur]sday aft[er] lunch.',
        'Then the oth[er] team can w[or]k on it.',
      ],
      tip: 'Keep your tongue pulled back through every underlined part. The R is always heard, even at the end of “after” and “other”.',
    },
  },
  {
    id: 'oo',
    title: 'Food and book',
    focus: 'the two OO sounds',
    sounds: ['long-oo', 'short-oo'],
    goal: 'Round your lips tightly for a long /u/, and relax them for a short /ʊ/.',
    warmup:
      'Push your lips forward into a small circle, as if to whistle, and say “oooo” for three seconds. Now loosen your lips and jaw and say the short vowel in “book”. Switch five times: food, book, food, book.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'long-oo',
          ipa: 'u',
          name: 'Long OO',
          how: [
            'Round your lips into a small, tight circle and push them forward.',
            'Lift the back of your tongue high.',
            'Hold it a little longer than /ʊ/.',
          ],
          spellings: ['oo', 'u', 'ue', 'ew', 'o', 'ui'],
          words: [
            ['food', 'fud'],
            ['soon', 'sun'],
            ['new', 'nu'],
            ['do', 'du'],
            ['true', 'tru'],
            ['two', 'tu'],
            ['school', 'skul'],
          ],
        },
        {
          sound: 'short-oo',
          ipa: 'ʊ',
          name: 'Short OO',
          how: [
            'Round your lips only a little, and keep them relaxed.',
            'Your tongue is a little lower and looser than for /u/.',
            'Keep it short and quick.',
          ],
          spellings: ['oo', 'u', 'ou'],
          words: [
            ['book', 'bʊk'],
            ['good', 'ɡʊd'],
            ['look', 'lʊk'],
            ['put', 'pʊt'],
            ['could', 'kʊd'],
            ['full', 'fʊl'],
            ['woman', 'ˈwʊmən'],
          ],
        },
      ],
      mistake:
        'Using the long /u/ everywhere, so “full” sounds like “fool” and “look” sounds like “Luke”. Or the reverse, so “pool” sounds like “pull”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'Tight, rounded lips for the first word. Loose lips and a shorter vowel for the second. Then test your ear.',
      pairs: [
        ['pool', 'pull'],
        ['fool', 'full'],
        ['Luke', 'look'],
        ['suit', 'soot'],
        ["who'd", 'hood'],
        ['stewed', 'stood'],
      ],
    },
    twister: {
      levels: [
        'a good book',
        'Look, the new school food is good.',
        'Who took the good book to the cool blue pool at noon?',
      ],
    },
    shadow: {
      context: 'Checking a schedule',
      lines: [
        'C[ou]ld you l[oo]k at the n[ew] r[u]les?',
        'I sh[ou]ld p[u]t them in the b[oo]k.',
        'Let’s talk s[oo]n, maybe at n[oo]n on T[ue]sday.',
      ],
      tip: 'Tight lips on: new, rules, soon, noon, Tuesday. Loose lips on: could, look, should, put, book.',
    },
  },
  {
    id: 'oh',
    title: 'Home, not hot',
    focus: 'the OH vowel',
    sounds: ['oh'],
    goal: 'Start /oʊ/ with round lips, then glide them closed into a small circle.',
    warmup:
      'Say “oh” slowly in a mirror. Start with your mouth open and round, then close your lips into a small circle at the end, like “oh-w”. Do it five times, then say: go, no, so, home.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'oh',
          ipa: 'oʊ',
          name: 'OH as in home',
          how: [
            'Start with rounded lips and your jaw a little open.',
            'Glide your lips closer together into a small circle, toward /ʊ/.',
            'It is one moving sound. A flat “o” without the glide sounds like “aw” or “uh”.',
          ],
          spellings: ['o', 'o_e', 'oa', 'ow', 'oe', 'ough'],
          words: [
            ['go', 'ɡoʊ'],
            ['home', 'hoʊm'],
            ['know', 'noʊ'],
            ['phone', 'foʊn'],
            ['open', 'ˈoʊpən'],
            ['show', 'ʃoʊ'],
            ['road', 'roʊd'],
          ],
        },
      ],
      mistake:
        'Saying a short, flat “o” with no glide, so “coat” sounds like “caught” or “cut”, and “boat” sounds like “bought”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'The first word glides into a small circle. The second word doesn’t glide at all. Then test your ear.',
      pairs: [
        ['boat', 'bought'],
        ['low', 'law'],
        ['so', 'saw'],
        ['coat', 'cut'],
        ['phone', 'fun'],
        ['woke', 'walk'],
        ['coal', 'call'],
        ['note', 'not'],
      ],
    },
    twister: {
      levels: [
        'go home slowly',
        'Joe knows the road home is closed.',
        'Joe’s old goat rode home alone over the cold, open road.',
      ],
    },
    shadow: {
      context: 'Leaving a voicemail',
      lines: [
        'Hell[o], it’s J[oe]. I kn[ow] you’re busy.',
        'The ph[o]ne n[o]tes are in the f[o]lder.',
        'S[o] call me back. I’ll be at h[o]me.',
      ],
      tip: 'Glide into a small circle on every underlined O. Without the glide, “phone” starts to sound like “fun”.',
    },
  },
  {
    id: 'ah-aw',
    title: 'Hot and law',
    focus: 'the AH and AW vowels',
    sounds: ['ah', 'aw'],
    goal: 'Open wide and relaxed for /ɑ/, round your lips a little for /ɔ/, and always keep /ɔ/ before R.',
    warmup:
      'Open your mouth wide, like at the doctor, and say “ahhh”. Keep your jaw low but round your lips a little: “awww”. Switch five times: ah, aw, ah, aw. Then say: more, door, north.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'ah',
          ipa: 'ɑ',
          name: 'AH as in hot',
          how: [
            'Drop your jaw low and keep your lips relaxed, not rounded.',
            'Your tongue lies low and a little back.',
            'Most words with a short O use this sound in American English: hot, stop, job.',
          ],
          spellings: ['o', 'a'],
          words: [
            ['hot', 'hɑt'],
            ['stop', 'stɑp'],
            ['job', 'dʒɑb'],
            ['father', 'ˈfɑðɚ'],
            ['problem', 'ˈprɑbləm'],
            ['box', 'bɑks'],
          ],
        },
        {
          sound: 'aw',
          ipa: 'ɔ',
          name: 'AW as in law',
          how: [
            'Keep your jaw fairly low, a little higher than for /ɑ/.',
            'Round your lips a little and push them forward.',
            'Many Americans say this like /ɑ/, and both are correct. Before R it is always /ɔ/: more, north, story.',
          ],
          spellings: ['aw', 'au', 'al', 'ough', 'o'],
          words: [
            ['law', 'lɔ'],
            ['talk', 'tɔk'],
            ['thought', 'θɔt'],
            ['call', 'kɔl'],
            ['walk', 'wɔk'],
            ['saw', 'sɔ'],
          ],
        },
      ],
      mistake:
        'Rounding your lips on /ɑ/, so “hot” and “stop” sound British, or opening too little, so “not” sounds like “nut”. Before R, always round: “more”, “north”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'Relaxed lips for the first word, slightly rounded lips for the second. Many Americans say these pairs the same way, and that is correct too, so use this test to train your ear, not to worry.',
      pairs: [
        ['cot', 'caught'],
        ['Don', 'dawn'],
        ['stock', 'stalk'],
        ['collar', 'caller'],
        ['tot', 'taught'],
        ['odd', 'awed'],
      ],
    },
    twister: {
      levels: [
        'a hot pot',
        'Tom saw a lot of dogs on the long walk.',
        'On Sunday, Paul and Tom bought hot coffee and talked a lot on a long walk.',
      ],
    },
    shadow: {
      context: 'Asking about a problem',
      lines: [
        'I g[o]t your message about the j[o]b.',
        'I th[ough]t we s[o]lved that pr[o]blem.',
        'Let’s t[al]k at f[ou]r in my [o]ffice.',
      ],
      tip: 'Open wide on: got, job, solved, problem. Round a little on: thought, talk, office. Always round before R: four.',
    },
  },
];
