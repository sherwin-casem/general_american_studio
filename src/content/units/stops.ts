/**
 * Stops: P and B, T and D, K and G, and the American T.
 *
 * Text markup and content rules: see src/content/README.md.
 */
import type { Lesson } from '../types';

export const STOP_LESSONS: Lesson[] = [
  {
    id: 'p-b',
    title: 'P and B: pie and buy',
    focus: 'P and B',
    sounds: ['p', 'b'],
    goal: 'Give P a small puff of air with your voice off, and make B with your voice on.',
    warmup:
      'Hold your hand in front of your mouth. Say “pa, pa, pa” and feel a small puff of air each time. Now say “ba, ba, ba” with your voice on: almost no puff. Switch five times: pa, ba, pa, ba.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'p',
          ipa: 'p',
          name: 'P',
          how: [
            'Press your lips together and build up a little air behind them.',
            'Open your lips with a small puff of air. Your voice is off.',
            'At the start of a word or a stressed syllable the puff is strong: hold a sheet of paper in front of your mouth on “pen” and watch it move.',
          ],
          spellings: ['p', 'pp'],
          words: [
            ['pen', 'pɛn'],
            ['people', 'ˈpipəl'],
            ['paper', 'ˈpeɪpɚ'],
            ['price', 'praɪs'],
            ['happy', 'ˈhæpi'],
            ['help', 'hɛlp'],
            ['stop', 'stɑp'],
          ],
        },
        {
          sound: 'b',
          ipa: 'b',
          name: 'B',
          how: [
            'Use the same lips as P: press them together.',
            'Turn your voice on before you open your lips. Touch your throat and feel the buzz.',
            'There is no strong puff of air on B.',
          ],
          spellings: ['b', 'bb'],
          words: [
            ['best', 'bɛst'],
            ['big', 'bɪɡ'],
            ['book', 'bʊk'],
            ['busy', 'ˈbɪzi'],
            ['number', 'ˈnʌmbɚ'],
            ['job', 'dʒɑb'],
          ],
        },
      ],
      mistake:
        'Saying P without a puff of air, so “pie” sounds like “buy” and “pack” like “back”. Some learners do the opposite and turn the voice off on B, so “back” sounds like “pack”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'Each pair changes only P and B. Feel the puff of air on P with your hand. Then test your ear.',
      pairs: [
        ['pie', 'buy'],
        ['pack', 'back'],
        ['pin', 'bin'],
        ['pull', 'bull'],
        ['pat', 'bat'],
        ['pear', 'bear'],
        ['cap', 'cab'],
        ['rope', 'robe'],
      ],
    },
    twister: {
      levels: [
        'a pack of paper',
        'Please put the book back.',
        'Big Bob put a pack of purple paper back in the brown box.',
      ],
    },
    shadow: {
      context: 'Asking a colleague for help',
      lines: [
        '[P]lease could you hel[p] me with the [p]rinter?',
        'The [p]a[p]er is stuck at the [b]ack.',
        'I need to [p]rint the re[p]ort [b]efore ten.',
      ],
      tip: 'Feel a small puff on the P in “please”, “printer”, “paper” and “report”. Keep your voice on for every B.',
    },
  },
  {
    id: 't-d',
    title: 'T and D: ten and den',
    focus: 'T and D',
    sounds: ['t', 'd'],
    goal: 'Make T with a puff of air and your voice off, D with your voice on, and say both clearly at the end of words.',
    warmup:
      'Touch the ridge just behind your top teeth with your tongue tip. Say “ta, ta, ta” with a small puff of air, then “da, da, da” with your voice on. Now say “bet” and “bed” slowly: the vowel is longer before D.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 't',
          ipa: 't',
          name: 'T',
          how: [
            'Touch the tip of your tongue to the ridge behind your top teeth, not to the teeth themselves.',
            'Release it with a small puff of air. Your voice is off.',
            'At the end of a word T is short and quiet, but don’t drop it: “last”, not “las”.',
          ],
          spellings: ['t', 'tt', 'ed'],
          words: [
            ['ten', 'tɛn'],
            ['time', 'taɪm'],
            ['tell', 'tɛl'],
            ['late', 'leɪt'],
            ['first', 'fɝst'],
            ['worked', 'wɝkt'],
          ],
        },
        {
          sound: 'd',
          ipa: 'd',
          name: 'D',
          how: [
            'Use the same tongue position as T.',
            'Turn your voice on. There is no strong puff of air.',
            'Make the vowel before a final D a little longer: “bed” is longer than “bet”.',
          ],
          spellings: ['d', 'dd', 'ed'],
          words: [
            ['day', 'deɪ'],
            ['date', 'deɪt'],
            ['idea', 'aɪˈdiə'],
            ['send', 'sɛnd'],
            ['need', 'nid'],
            ['played', 'pleɪd'],
          ],
        },
      ],
      mistake:
        'Dropping a final T or D (“las week” for “last week”), or saying every “-ed” ending as an extra syllable. The ending is /t/ after voiceless sounds (worked, helped), /d/ after voiced sounds (played, called), and /ɪd/ only after T or D (wanted, needed).',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'The first pairs change T and D at the start. In the last three, listen to the end of the word and notice the longer vowel before D. Then test your ear.',
      pairs: [
        ['ten', 'den'],
        ['tie', 'die'],
        ['time', 'dime'],
        ['try', 'dry'],
        ['town', 'down'],
        ['bet', 'bed'],
        ['seat', 'seed'],
        ['write', 'ride'],
      ],
    },
    twister: {
      levels: [
        'ten tidy desks',
        'Did the team decide today?',
        'Ted and Dan tried to do ten difficult tasks by Tuesday.',
      ],
    },
    shadow: {
      context: 'Updating your manager',
      lines: [
        '[T]oday I [t]alked to the [d]esign [t]eam.',
        'We [d]ecided to [d]elay the [t]es[t].',
        'I’ll sen[d] the [d]etails [t]onigh[t].',
      ],
      tip: 'Keep every final T and D. Say “-ed” as /t/ in “talked” and as /ɪd/ in “decided”.',
    },
  },
  {
    id: 'k-g',
    title: 'K and G: coat and goat',
    focus: 'K and G',
    sounds: ['k', 'g'],
    goal: 'Lift the back of your tongue for both sounds: K with a puff of air and your voice off, G with your voice on.',
    warmup:
      'Lift the back of your tongue until it touches the roof of your mouth, far back. Release it: “ka, ka, ka”, with a puff of air. Then turn your voice on: “ga, ga, ga”. Switch five times.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'k',
          ipa: 'k',
          name: 'K',
          how: [
            'Lift the back of your tongue so it touches the soft roof at the back of your mouth.',
            'Release it with a puff of air. Your voice is off.',
            'The letters c, k, ck and ch (as in “school”) can all spell this sound.',
          ],
          spellings: ['c', 'k', 'ck', 'ch', 'qu'],
          words: [
            ['key', 'ki'],
            ['call', 'kɔl'],
            ['come', 'kʌm'],
            ['quick', 'kwɪk'],
            ['school', 'skul'],
            ['work', 'wɝk'],
            ['back', 'bæk'],
          ],
        },
        {
          sound: 'g',
          ipa: 'ɡ',
          name: 'G',
          how: [
            'Use the same tongue position as K.',
            'Turn your voice on before you release. There is no strong puff of air.',
            'At the end of a word, keep your voice on and the vowel a little longer: “bag” is longer than “back”.',
          ],
          spellings: ['g', 'gg', 'gu'],
          words: [
            ['go', 'ɡoʊ'],
            ['good', 'ɡʊd'],
            ['get', 'ɡɛt'],
            ['give', 'ɡɪv'],
            ['again', 'əˈɡɛn'],
            ['big', 'bɪɡ'],
            ['bag', 'bæɡ'],
          ],
        },
      ],
      mistake:
        'Saying K and G the same, so “coat” sounds like “goat”, or turning the voice off on a final G, so “bag” sounds like “back” and “log” like “lock”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'Each pair changes only K and G. The first five change the start of the word, the last three the end. Then test your ear.',
      pairs: [
        ['coat', 'goat'],
        ['cold', 'gold'],
        ['came', 'game'],
        ['class', 'glass'],
        ['curl', 'girl'],
        ['back', 'bag'],
        ['pick', 'pig'],
        ['lock', 'log'],
      ],
    },
    twister: {
      levels: [
        'a big black bag',
        'Can Greg get the car keys?',
        'A clever cook gave the guests good cakes and cold green grapes.',
      ],
    },
    shadow: {
      context: 'Checking in at a conference',
      lines: [
        'Hi, I’m che[ck]ing in for the [c]onference.',
        '[C]ould I [g]et my [k]ey [c]ard a[g]ain?',
        '[G]reat. I’ll [g]rab a [c]offee and [c]ome ba[ck].',
      ],
      tip: 'Feel the puff of air on “could”, “key”, “card” and “coffee”. Keep your voice on for every G.',
    },
  },
  {
    id: 'american-t',
    title: 'The American T',
    focus: 'the flap T and held T',
    sounds: ['flap-t', 'stop-t'],
    goal: 'Hear and use the three common T sounds: clear T, flap T and held T.',
    warmup:
      'Tap your tongue once, very fast, on the ridge behind your top teeth: da-da-da. That quick tap is the flap T. Now say “water” five times using it.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 't',
          ipa: 't',
          name: 'Clear T',
          how: [
            'At the start of a word or a stressed syllable, T is strong, with a puff of air.',
            'Hold your hand in front of your mouth. You should feel the air on “ten”.',
          ],
          spellings: ['t', 'tt'],
          words: [
            ['ten', 'tɛn'],
            ['table', 'ˈteɪbəl'],
            ['today', 'təˈdeɪ'],
            ['attend', 'əˈtɛnd'],
            ['return', 'rɪˈtɝn'],
          ],
        },
        {
          sound: 'flap-t',
          ipa: 'ɾ',
          name: 'Flap T',
          how: [
            'Between two vowel sounds, T becomes a quick, soft tap, like a light D.',
            '“Water” sounds like “wah-der”. “Better” sounds like “beh-der”.',
            'It happens across words too: get it, a lot of, what about.',
          ],
          spellings: ['t', 'tt'],
          words: [
            ['water', 'ˈwɑɾɚ'],
            ['better', 'ˈbɛɾɚ'],
            ['city', 'ˈsɪɾi'],
            ['meeting', 'ˈmiɾɪŋ'],
            ['get it', 'ˈɡɛɾɪt'],
            ['a lot of', 'əˈlɑɾəv'],
          ],
        },
        {
          sound: 'stop-t',
          ipa: 't̚',
          name: 'Held T',
          how: [
            'At the end of a word, before a consonant or a pause, stop the air but don’t release it.',
            'Your tongue touches the ridge and stays there for a moment.',
            '“Get ready” sounds like “ge(t) ready”, with a tiny silent stop.',
          ],
          spellings: ['t'],
          words: [
            ['get ready', 'ɡɛt̚ ˈrɛdi'],
            ['that one', 'ðæt̚ wʌn'],
            ['not now', 'nɑt̚ naʊ'],
            ['football', 'ˈfʊt̚bɔl'],
          ],
        },
      ],
      mistake:
        'Saying every T strongly (“wa-Ter”, “bet-Ter”). People will understand you, but it sounds less natural in General American.',
    },
    listen: {
      title: 'Listen and repeat',
      intro:
        'Read the sound-alike spelling, play the real phrase, then repeat it at the same speed.',
      rows: [
        {
          cells: ['water'],
          hint: 'wah-der',
        },
        {
          cells: ['better'],
          hint: 'beh-der',
        },
        {
          cells: ['a lot of'],
          hint: 'uh-lah-duv',
        },
        {
          cells: ['get it'],
          hint: 'geh-dit',
        },
        {
          cells: ['what about'],
          hint: 'wuh-duh-bout',
        },
        {
          cells: ['put it on'],
          hint: 'puh-di-don',
        },
        {
          cells: ['eighty'],
          hint: 'ay-dee',
        },
        {
          cells: ['not bad'],
          hint: 'nah(t) bad',
        },
        {
          cells: ['get ready'],
          hint: 'geh(t) red-ee',
        },
      ],
    },
    twister: {
      levels: [
        'a little bit',
        'Betty bought a bit of better butter.',
        'Betty Botter bought some butter, but she said the butter’s bitter.',
      ],
    },
    shadow: {
      context: 'Before a meeting',
      lines: [
        'Let me ge[t a] li[tt]le wa[t]er before the mee[t]ing.',
        'It’s a lo[t] be[tt]er a[t] eight.',
        'Wha[t] do you think abou[t i]t?',
      ],
      tip: 'Flap T: get a, little, water, meeting, better, at eight, about it. Held T: lot, what.',
    },
  },
];
