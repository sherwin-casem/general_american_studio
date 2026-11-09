/**
 * Front vowels: sheep and ship, day and bed, cat and cup.
 *
 * Text markup and content rules: see src/content/README.md.
 */
import type { Lesson } from '../types';

export const FRONT_VOWEL_LESSONS: Lesson[] = [
  {
    id: 'i-ih',
    title: 'Sheep and ship',
    focus: 'long EE and short I',
    sounds: ['i', 'ih'],
    goal: 'Make /i/ long and tense with a small smile, and /ɪ/ short and relaxed.',
    warmup:
      'Smile and say “eeee” for three seconds. Now relax your face completely and say a short “ih”. Switch five times: eee, ih, eee, ih.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'i',
          ipa: 'i',
          name: 'Long EE',
          how: [
            'Spread your lips into a small smile.',
            'Lift your tongue high and forward. The muscles feel tight.',
            'Hold it a little longer than /ɪ/.',
          ],
          spellings: ['ee', 'ea', 'e', 'ie', 'y'],
          words: [
            ['sheep', 'ʃip'],
            ['team', 'tim'],
            ['leave', 'liv'],
            ['please', 'pliz'],
            ['need', 'nid'],
            ['email', 'ˈimeɪl'],
          ],
        },
        {
          sound: 'ih',
          ipa: 'ɪ',
          name: 'Short I',
          how: [
            'Relax your lips and jaw. No smile.',
            'Your tongue is a little lower and looser than for /i/.',
            'Keep it short and quick.',
          ],
          spellings: ['i', 'y', 'u', 'e'],
          words: [
            ['ship', 'ʃɪp'],
            ['live', 'lɪv'],
            ['sit', 'sɪt'],
            ['minute', 'ˈmɪnɪt'],
            ['business', 'ˈbɪznəs'],
            ['big', 'bɪɡ'],
          ],
        },
      ],
      mistake:
        'Using one vowel for both, so “live” sounds like “leave” and “fill” sounds like “feel”. Length helps, but the mouth shape matters more.',
    },
    listen: {
      title: 'Hear the difference',
      intro: 'Smile for the first word, relax for the second. Then test your ear.',
      pairs: [
        ['sheep', 'ship'],
        ['leave', 'live'],
        ['seat', 'sit'],
        ['feel', 'fill'],
        ['heat', 'hit'],
        ['team', 'Tim'],
        ['eat', 'it'],
        ['green', 'grin'],
        ['cheap', 'chip'],
      ],
    },
    twister: {
      levels: [
        'it is easy',
        'Jim will see the green ship.',
        'Tim’s team keeps the green bin in the big, clean kitchen.',
      ],
    },
    shadow: {
      context: 'Starting a meeting',
      lines: [
        'Hi, I’m [i]n the m[ee]ting room.',
        'Pl[ea]se s[i]t [i]n the fr[ee] s[ea]t.',
        'W[e] w[i]ll beg[i]n [i]n fift[ee]n m[i]nutes.',
      ],
      tip: 'Smile on: meeting, please, free, seat, we, fifteen. Relax on: in, sit, will, begin, minutes.',
    },
  },
  {
    id: 'ay-eh',
    title: 'Late and let',
    focus: 'the AY and E vowels',
    sounds: ['ay', 'eh'],
    goal: 'Glide /eɪ/ up into a small smile, and keep /ɛ/ short and still.',
    warmup:
      'Say “eh” and keep your jaw completely still. Now say “ay”: start the same way, then let your jaw close a little as your lips spread into a small smile. Switch five times: eh, ay, eh, ay.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'ay',
          ipa: 'eɪ',
          name: 'AY as in day',
          how: [
            'Start with your jaw about halfway open, as for /ɛ/.',
            'Glide your tongue up and spread your lips into a small smile.',
            'It is one sound that moves. Feel your jaw rise a little at the end.',
          ],
          spellings: ['a_e', 'ai', 'ay', 'a', 'ei', 'ey'],
          words: [
            ['day', 'deɪ'],
            ['late', 'leɪt'],
            ['wait', 'weɪt'],
            ['name', 'neɪm'],
            ['eight', 'eɪt'],
            ['paper', 'ˈpeɪpɚ'],
            ['change', 'tʃeɪndʒ'],
          ],
        },
        {
          sound: 'eh',
          ipa: 'ɛ',
          name: 'E as in bed',
          how: [
            'Open your jaw about halfway and keep it there.',
            'Your tongue sits a little forward, in the middle of your mouth.',
            'No glide and no smile at the end. Short and still.',
          ],
          spellings: ['e', 'ea', 'ai', 'a'],
          words: [
            ['let', 'lɛt'],
            ['get', 'ɡɛt'],
            ['test', 'tɛst'],
            ['pen', 'pɛn'],
            ['head', 'hɛd'],
            ['never', 'ˈnɛvɚ'],
            ['yes', 'jɛs'],
          ],
        },
      ],
      mistake:
        'Leaving out the glide, so “late” sounds like “let” and “sale” sounds like “sell”. Or adding a glide to /ɛ/, so “pen” sounds like “pain”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'The first word glides into a small smile. The second stays short and still. Then test your ear.',
      pairs: [
        ['late', 'let'],
        ['wait', 'wet'],
        ['pain', 'pen'],
        ['sale', 'sell'],
        ['taste', 'test'],
        ['main', 'men'],
        ['gate', 'get'],
        ['date', 'debt'],
      ],
    },
    twister: {
      levels: [
        'eight red pens',
        'Jane went to wait for the next train.',
        'Eight late trains wait at the gate while Ted gets ten fresh red pens.',
      ],
    },
    shadow: {
      context: 'Moving a test date',
      lines: [
        'Can we ch[a]nge the d[a]te for the t[e]st?',
        'I’ll s[e]nd the p[a]pers tod[ay].',
        'L[e]t’s s[ay] [ei]ght o’clock on W[e]dnesd[ay].',
      ],
      tip: 'Glide into a smile on: change, date, papers, today, say, eight. Keep your jaw still on: test, send, let’s, and the start of Wednesday.',
    },
  },
  {
    id: 'ae-eh-uh',
    title: 'Cat, bed and cup',
    focus: 'the A, E and U vowels',
    sounds: ['ae', 'eh', 'uh'],
    goal: 'Open wide for /æ/, halfway for /ɛ/, and relax into a short /ʌ/.',
    warmup:
      'Drop your jaw low and say “aa” as in cat. Close a little for “eh”. Relax completely for “uh”. Go down and up the ladder five times: cat, bed, cup.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'ae',
          ipa: 'æ',
          name: 'A as in cat',
          how: [
            'Drop your jaw low and spread your lips a little.',
            'Your tongue is low and pushed forward.',
            'In General American this vowel is long and bright, especially before M and N: man, plan.',
          ],
          spellings: ['a', 'au'],
          words: [
            ['cat', 'kæt'],
            ['plan', 'plæn'],
            ['bad', 'bæd'],
            ['back', 'bæk'],
            ['manager', 'ˈmænɪdʒɚ'],
            ['thanks', 'θæŋks'],
          ],
        },
        {
          sound: 'eh',
          ipa: 'ɛ',
          name: 'E as in bed',
          how: [
            'Open your jaw about halfway.',
            'Your tongue sits in the middle of your mouth, a little forward.',
            'It is shorter than /æ/.',
          ],
          spellings: ['e', 'ea', 'ai', 'a'],
          words: [
            ['bed', 'bɛd'],
            ['send', 'sɛnd'],
            ['check', 'tʃɛk'],
            ['many', 'ˈmɛni'],
            ['said', 'sɛd'],
            ['again', 'əˈɡɛn'],
          ],
        },
        {
          sound: 'uh',
          ipa: 'ʌ',
          name: 'U as in cup',
          how: [
            'Relax your lips and jaw, and open just a little.',
            'Your tongue rests in the center.',
            'Short and quick, like a small “uh”.',
          ],
          spellings: ['u', 'o', 'ou', 'oo'],
          words: [
            ['cup', 'kʌp'],
            ['budget', 'ˈbʌdʒɪt'],
            ['Monday', 'ˈmʌndeɪ'],
            ['lunch', 'lʌntʃ'],
            ['done', 'dʌn'],
            ['money', 'ˈmʌni'],
          ],
        },
      ],
      mistake:
        'Saying “bed” for “bad” or “cap” for “cup”. Feel how far your jaw moves between them.',
    },
    listen: {
      title: 'Hear the difference',
      intro: 'Feel your jaw move between each pair. Then test your ear.',
      pairs: [
        ['bad', 'bed'],
        ['man', 'men'],
        ['cap', 'cup'],
        ['cat', 'cut'],
        ['pan', 'pen'],
        ['sad', 'said'],
        ['ran', 'run'],
        ['track', 'truck'],
        ['lack', 'luck'],
      ],
    },
    twister: {
      levels: [
        'a black cat',
        'Ten fat cats ran up to the bus.',
        'Ben’s black cat ran up and sat on the bed with a bag of nuts.',
      ],
    },
    shadow: {
      context: 'A quick budget check',
      lines: [
        'Th[a]nks for the [u]pdate on the b[u]dget.',
        'Can we ch[e]ck the pl[a]n ag[ai]n?',
        'L[e]t’s s[e]nd it before l[u]nch on M[o]nday.',
      ],
      tip: 'Open wide: thanks, plan. Halfway: check, again, let’s, send. Relax: update, budget, lunch, Monday.',
    },
  },
];
