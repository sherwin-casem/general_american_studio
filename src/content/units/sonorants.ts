/**
 * Nasals and approximants: M, N and NG, R and L, W, Y and H.
 *
 * Text markup and content rules: see src/content/README.md.
 */
import type { Lesson } from '../types';

export const SONORANT_LESSONS: Lesson[] = [
  {
    id: 'm-n-ng',
    title: 'M, N and NG',
    focus: 'M, N and NG',
    sounds: ['m', 'n', 'ng'],
    goal: 'Close your lips for M, touch the ridge behind your top teeth for N, and lift the back of your tongue for NG, with no G after it.',
    warmup:
      'Hum with your lips closed: mmmm. Open your lips and put your tongue tip behind your top teeth: nnnn. Now lift the back of your tongue, as in the middle of “singer”: ŋŋŋŋ. Feel the buzz in your nose each time. Five rounds.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'm',
          ipa: 'm',
          name: 'M',
          how: [
            'Close both lips gently.',
            'Turn your voice on and let the air come out through your nose.',
            'At the end of a word (team, name), keep your lips closed until the sound is finished.',
          ],
          spellings: ['m', 'mm', 'mb', 'mn'],
          words: [
            ['me', 'mi'],
            ['more', 'mɔr'],
            ['meeting', 'ˈmiɾɪŋ'],
            ['summer', 'ˈsʌmɚ'],
            ['team', 'tim'],
            ['name', 'neɪm'],
          ],
        },
        {
          sound: 'n',
          ipa: 'n',
          name: 'N',
          how: [
            'Press the tip of your tongue on the ridge just behind your top front teeth.',
            'Keep your lips open and let the air come out through your nose.',
            'Hold the tongue tip up until the end of the word: phone, plan.',
          ],
          spellings: ['n', 'nn', 'kn', 'gn'],
          words: [
            ['no', 'noʊ'],
            ['new', 'nu'],
            ['number', 'ˈnʌmbɚ'],
            ['dinner', 'ˈdɪnɚ'],
            ['phone', 'foʊn'],
            ['plan', 'plæn'],
          ],
        },
        {
          sound: 'ng',
          ipa: 'ŋ',
          name: 'NG',
          how: [
            'Lift the back of your tongue to touch the soft back part of the roof of your mouth, as for K or G.',
            'Keep the tongue tip down, behind your bottom teeth, and let the air come out through your nose.',
            'At the end of a word, stop there: “sing”, not “sing-g”.',
            'In the middle of a word it varies: “singer” has no G, but “finger” and “English” do.',
          ],
          spellings: ['ng', 'n in nk'],
          words: [
            ['sing', 'sɪŋ'],
            ['long', 'lɔŋ'],
            ['thing', 'θɪŋ'],
            ['morning', 'ˈmɔrnɪŋ'],
            ['think', 'θɪŋk'],
            ['singer', 'ˈsɪŋɚ'],
            ['finger', 'ˈfɪŋɡɚ'],
            ['English', 'ˈɪŋɡlɪʃ'],
          ],
        },
      ],
      mistake:
        'Adding a hard G after NG (“sing-g”, “long-g”), or using N for NG so “thing” sounds like “thin”. In General American, there is no G sound at the end of “-ng” words.',
    },
    listen: {
      title: 'Hear the difference',
      intro: 'M, N or NG? Feel where your lips or tongue close for each word. Then test your ear.',
      pairs: [
        ['sin', 'sing'],
        ['win', 'wing'],
        ['thin', 'thing'],
        ['ran', 'rang'],
        ['ban', 'bang'],
        ['sum', 'sun'],
        ['map', 'nap'],
        ['mail', 'nail'],
      ],
    },
    twister: {
      levels: [
        'morning meeting',
        'The singer is bringing nine new songs.',
        'Many men in the morning meeting are thinking, singing and making long lists of new names.',
      ],
    },
    shadow: {
      context: 'Planning a morning meeting',
      lines: [
        'Good [m]or[n]i[ng], [N]i[n]a.',
        'The [m]eeti[ng] is at [n]i[n]e o’clock.',
        'I’[m] bri[ng]i[ng] the [n]ew [n]u[m]bers.',
        'Let’s [m]ake it a short o[n]e.',
      ],
      tip: 'Close your lips fully for every M and keep your tongue tip up for N. Stop cleanly at the end of “morning” and “bringing”, with no G sound.',
    },
  },
  {
    id: 'r-l',
    title: 'R and L',
    focus: 'R and L',
    sounds: ['r', 'l'],
    goal: 'Keep R and L clearly different, and say every R, including the R after a vowel.',
    warmup:
      'Say “la-la-la” with your tongue tip tapping behind your top teeth. Then say “rrr” with your tongue pulled back, touching nothing. Switch five times: la, rrr, la, rrr.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'r',
          ipa: 'r',
          name: 'American R',
          how: [
            'Pull your tongue back a little and lift its sides to touch your upper back teeth.',
            'The tip of your tongue does not touch the roof of your mouth.',
            'Round your lips slightly. In General American, say the R after vowels too: car, work, here.',
          ],
          spellings: ['r', 'rr', 'wr'],
          words: [
            ['red', 'rɛd'],
            ['right', 'raɪt'],
            ['sorry', 'ˈsɑri'],
            ['car', 'kɑr'],
            ['work', 'wɝk'],
            ['here', 'hɪr'],
          ],
        },
        {
          sound: 'l',
          ipa: 'l',
          name: 'L',
          how: [
            'Press the tip of your tongue on the ridge just behind your top front teeth.',
            'Let the air flow around the sides of your tongue.',
            'At the end of a word (feel, call), keep the tip touching and let the back of your tongue rise a little.',
          ],
          spellings: ['l', 'll'],
          words: [
            ['light', 'laɪt'],
            ['late', 'leɪt'],
            ['hello', 'həˈloʊ'],
            ['feel', 'fil'],
            ['call', 'kɔl'],
            ['help', 'hɛlp'],
          ],
        },
      ],
      mistake:
        'Using one sound for both, so “right” sounds like “light”, or dropping the R in words like car, work and her.',
    },
    listen: {
      title: 'Hear the difference',
      intro: 'R or L? Play both words, copy the tongue movement, then test your ear.',
      pairs: [
        ['right', 'light'],
        ['road', 'load'],
        ['rock', 'lock'],
        ['pray', 'play'],
        ['correct', 'collect'],
        ['fry', 'fly'],
        ['arrive', 'alive'],
        ['wrong', 'long'],
      ],
    },
    twister: {
      levels: [
        'red light, red light',
        'Larry really likes the yellow letter.',
        'Red leather, yellow leather, red leather, yellow leather.',
      ],
    },
    shadow: {
      context: 'A short phone call',
      lines: [
        'Hello, I’m ca[ll]ing about the [r]epo[r]t.',
        'I’d [r]ea[ll]y [l]ike to a[rr]ive ea[r]ly.',
        'Is that a[ll] [r]ight?',
      ],
      tip: 'Let the R in “report”, “really” and “early” sound strong. Keep the L in “calling” and “like” light, with the tongue tip up.',
    },
  },
  {
    id: 'v-w-b',
    title: 'V, W and B',
    focus: 'V and W',
    sounds: ['w', 'v', 'b'],
    goal: 'Top teeth on your lip for V. Lips rounded and teeth away for W. Both lips closed for B.',
    warmup:
      'Rest your top teeth on your bottom lip and hum: vvvv. Then round your lips into a small circle and open them: wa, wa, wa. Alternate five times.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'v',
          ipa: 'v',
          name: 'V',
          how: [
            'Rest your top front teeth on your bottom lip.',
            'Push air through and turn your voice on. Your lip should tickle.',
            'Hold the sound for a moment at first: vvvery.',
          ],
          spellings: ['v', 'f in of'],
          words: [
            ['very', 'ˈvɛri'],
            ['video', 'ˈvɪdioʊ'],
            ['seven', 'ˈsɛvən'],
            ['invoice', 'ˈɪnvɔɪs'],
            ['have', 'hæv'],
            ['five', 'faɪv'],
          ],
        },
        {
          sound: 'w',
          ipa: 'w',
          name: 'W',
          how: [
            'Round your lips into a small circle. Teeth stay away from your lips.',
            'Turn your voice on and open your lips quickly into the next vowel.',
            'It starts like a fast “oo”: oo-eek becomes week.',
          ],
          spellings: ['w', 'wh', 'u in qu', 'o in one'],
          words: [
            ['we', 'wi'],
            ['work', 'wɝk'],
            ['week', 'wik'],
            ['away', 'əˈweɪ'],
            ['quick', 'kwɪk'],
            ['one', 'wʌn'],
          ],
        },
        {
          sound: 'b',
          ipa: 'b',
          name: 'B',
          how: [
            'Close both lips completely.',
            'Turn your voice on and open your lips with a small pop.',
            'No teeth on the lip. That is the difference from V.',
          ],
          spellings: ['b', 'bb'],
          words: [
            ['best', 'bɛst'],
            ['boat', 'boʊt'],
            ['about', 'əˈbaʊt'],
            ['job', 'dʒɑb'],
          ],
        },
      ],
      mistake:
        'Saying “west” for “vest” or “berry” for “very”. Check in a mirror: only V puts your teeth on your lip.',
    },
    listen: {
      title: 'Hear the difference',
      intro: 'V, W or B? Watch your lips in a mirror as you repeat each pair. Then test your ear.',
      pairs: [
        ['vest', 'west'],
        ['vine', 'wine'],
        ['very', 'berry'],
        ['vote', 'boat'],
        ['van', 'ban'],
        ['vet', 'wet'],
        ['curve', 'curb'],
      ],
    },
    twister: {
      levels: [
        'very well',
        'We visit the village every Wednesday.',
        'Vivian’s very valuable vase was wrapped well in velvet.',
      ],
    },
    shadow: {
      context: 'Confirming a video call',
      lines: [
        '[W]e ha[v]e a [v]ideo call at ele[v]en.',
        '[V]ictor [w]ill re[v]ie[w] the in[v]oice.',
        '[V]ery good. I’ll [b]e there.',
      ],
      tip: 'Teeth on the lip for every V: have, video, eleven, review, invoice. Round lips for W: we, will.',
    },
  },
  {
    id: 'y-h',
    title: 'Y and H',
    focus: 'Y and H',
    sounds: ['y', 'h'],
    goal: 'Start Y with your tongue high and forward, like a quick “ee”, and start H with a soft breath. Never drop the H.',
    warmup:
      'Breathe out on a cold window to fog it: hhhh. Then say “ee” and slide straight into “es”: ee-es becomes yes. Alternate: ha, ya, ha, ya. Five times.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'y',
          ipa: 'j',
          name: 'Y',
          how: [
            'Raise the middle of your tongue high and forward, close to the roof of your mouth, as for “ee”.',
            'Turn your voice on and slide quickly into the next vowel: ee-es becomes yes.',
            'Keep the tongue tip down. If it touches the roof of your mouth, you get J, as in jet.',
            'Before an “ee” sound (year, yeast), start even higher, so “year” doesn’t sound like “ear”.',
          ],
          spellings: ['y', 'u in use', 'ew in few'],
          words: [
            ['yes', 'jɛs'],
            ['you', 'ju'],
            ['year', 'jɪr'],
            ['yellow', 'ˈjɛloʊ'],
            ['yesterday', 'ˈjɛstɚˌdeɪ'],
            ['few', 'fju'],
          ],
        },
        {
          sound: 'h',
          ipa: 'h',
          name: 'H',
          how: [
            'Open your mouth for the next vowel first.',
            'Push out a soft breath from your throat, like fogging a mirror, then start the vowel.',
            'No scrape in the throat. H is just air.',
            'A few words have a silent H, such as hour and honest. Say all the others.',
          ],
          spellings: ['h', 'wh in who'],
          words: [
            ['hat', 'hæt'],
            ['hello', 'həˈloʊ'],
            ['help', 'hɛlp'],
            ['home', 'hoʊm'],
            ['who', 'hu'],
            ['behind', 'bɪˈhaɪnd'],
            ['perhaps', 'pɚˈhæps'],
          ],
        },
      ],
      mistake:
        'Dropping the H, so “hear” sounds like “ear” and “hold” like “old”. Or saying J for Y, so “yet” sounds like “jet”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'Y or J? H or no H? Play both words, feel the difference in your mouth, then test your ear.',
      pairs: [
        ['yet', 'jet'],
        ['yam', 'jam'],
        ['yolk', 'joke'],
        ['year', 'ear'],
        ['hat', 'at'],
        ['high', 'eye'],
        ['hold', 'old'],
        ['heart', 'art'],
      ],
    },
    twister: {
      levels: [
        'yes, you can',
        'Yes, he’s here every year.',
        'Harry’s yellow yo-yo hung high in the hall for a hundred years.',
      ],
    },
    shadow: {
      context: 'Welcoming a new colleague',
      lines: [
        '[H]ello! [Y]ou must be the new [h]ire.',
        'I’m [h]appy to [h]elp [y]ou this [y]ear.',
        '[H]ere’s [y]our desk, and the kitchen is be[h]ind it.',
      ],
      tip: 'A soft breath on every underlined H. Start every Y with your tongue high, like a quick “ee”: listen to “here” and “year”.',
    },
  },
];
