/**
 * Fricatives and affricates: F and V, TH, S and Z, SH and ZH, CH and J.
 *
 * Text markup and content rules: see src/content/README.md.
 */
import type { Lesson } from '../types';

export const FRICATIVE_LESSONS: Lesson[] = [
  {
    id: 'f-v',
    title: 'F and V: fan and van',
    focus: 'F and V',
    sounds: ['f', 'v'],
    goal: 'Touch your top teeth to your lower lip for both sounds: F with the voice off, V with the voice on.',
    warmup:
      'Rest your top front teeth lightly on your lower lip. Blow air out: ffff. Keep the same position and turn your voice on so your lip buzzes: vvvv. Switch five times: ffff, vvvv.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'f',
          ipa: 'f',
          name: 'F',
          how: [
            'Rest your top front teeth lightly on the inside of your lower lip.',
            'Blow air out between your teeth and lip, with your voice off.',
            'Your lips never close. If they do, you get P instead.',
          ],
          spellings: ['f', 'ff', 'ph', 'gh'],
          words: [
            ['fine', 'faɪn'],
            ['first', 'fɝst'],
            ['phone', 'foʊn'],
            ['office', 'ˈɔfɪs'],
            ['coffee', 'ˈkɔfi'],
            ['enough', 'ɪˈnʌf'],
          ],
        },
        {
          sound: 'v',
          ipa: 'v',
          name: 'V',
          how: [
            'Use the same position as F: top teeth on your lower lip.',
            'Turn your voice on and feel your lip buzz.',
            'Don’t close your lips. Closed lips make B, so “very” becomes “berry”.',
          ],
          spellings: ['v', 've'],
          words: [
            ['very', 'ˈvɛri'],
            ['visit', 'ˈvɪzɪt'],
            ['video', 'ˈvɪdioʊ'],
            ['over', 'ˈoʊvɚ'],
            ['seven', 'ˈsɛvən'],
            ['five', 'faɪv'],
            ['have', 'hæv'],
          ],
        },
      ],
      mistake:
        'Closing your lips, so F becomes P (“coffee” sounds like “copy”, “fast” like “past”) and V becomes B (“very” sounds like “berry”, “vote” like “boat”). Keep your top teeth on your lip.',
    },
    listen: {
      title: 'Hear the difference',
      intro: 'Each pair changes only F and V. Feel your lip buzz on V. Then test your ear.',
      pairs: [
        ['fan', 'van'],
        ['fine', 'vine'],
        ['few', 'view'],
        ['fast', 'vast'],
        ['ferry', 'very'],
        ['safe', 'save'],
        ['leaf', 'leave'],
        ['proof', 'prove'],
      ],
    },
    twister: {
      levels: [
        'five vivid videos',
        'Vince found a very fine van.',
        'Victor’s five friends offered very fresh coffee every Friday.',
      ],
    },
    shadow: {
      context: 'Planning a team visit',
      lines: [
        '[V]ictor will [v]isit our o[ff]ice on [F]riday.',
        '[F]i[v]e people ha[v]e o[ff]ered to help.',
        'Is ele[v]en o’clock [f]ine [f]or e[v]eryone?',
      ],
      tip: 'Top teeth on your lower lip for every underlined F and V. Don’t let your lips close.',
    },
  },
  {
    id: 'th',
    title: 'TH: think and this',
    focus: 'the TH sounds',
    sounds: ['th-voiceless', 'th-voiced'],
    goal: 'Put your tongue between your teeth for every TH: voice off for /θ/, voice on for /ð/.',
    warmup:
      'Rest the tip of your tongue lightly between your teeth. Blow air out like cooling soup: thhhh. Now turn your voice on so it buzzes: ðððð. Five times each, slowly.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'th-voiceless',
          ipa: 'θ',
          name: 'Voiceless TH',
          how: [
            'Rest the tip of your tongue lightly between your top and bottom front teeth.',
            'Push air out over your tongue with your voice off.',
            'Check in a mirror: you should see the tip of your tongue.',
          ],
          spellings: ['th'],
          words: [
            ['think', 'θɪŋk'],
            ['three', 'θri'],
            ['thanks', 'θæŋks'],
            ['month', 'mʌnθ'],
            ['birthday', 'ˈbɝθˌdeɪ'],
            ['both', 'boʊθ'],
          ],
        },
        {
          sound: 'th-voiced',
          ipa: 'ð',
          name: 'Voiced TH',
          how: [
            'Use the same tongue position as /θ/.',
            'Turn your voice on. Touch your throat and feel the buzz.',
            'Many small words use this sound: the, this, that, they, there.',
          ],
          spellings: ['th'],
          words: [
            ['this', 'ðɪs'],
            ['they', 'ðeɪ'],
            ['there', 'ðɛr'],
            ['mother', 'ˈmʌðɚ'],
            ['weather', 'ˈwɛðɚ'],
            ['breathe', 'brið'],
          ],
        },
      ],
      mistake:
        'Swapping TH for T, D, S or Z, so “think” becomes “tink” or “sink”, and “this” becomes “dis” or “zis”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'Each pair changes only one sound. Play both words and repeat them. Then test your ear.',
      pairs: [
        ['thin', 'tin'],
        ['three', 'tree'],
        ['thank', 'tank'],
        ['think', 'sink'],
        ['they', 'day'],
        ['then', 'den'],
        ['breathe', 'breeze'],
      ],
    },
    twister: {
      levels: [
        'three thin things',
        'They think this is the third one.',
        'Thirty-three thankful thinkers thought through three thousand things.',
      ],
    },
    shadow: {
      context: 'Replying to a meeting invitation',
      lines: [
        '[Th]anks for [th]e invitation.',
        'I [th]ink [Th]ursday is fine.',
        'Let’s meet [th]ere at [th]ree.',
      ],
      tip: 'Keep your tongue forward on every underlined TH, even when you speed up.',
    },
  },
  {
    id: 's-z',
    title: 'S and Z: sue and zoo',
    focus: 'S and Z',
    sounds: ['s', 'z'],
    goal: 'Hiss for S and buzz for Z, and say the -s ending the right way.',
    warmup:
      'Put your tongue tip just behind your top teeth, without touching them. Hiss like a snake: ssss. Now turn your voice on so it buzzes like a bee: zzzz. Switch five times.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 's',
          ipa: 's',
          name: 'S',
          how: [
            'Put your tongue tip close to the ridge behind your top teeth, without touching it.',
            'Push a thin stream of air through the gap, with your voice off. It sounds like a hiss.',
            'After a voiceless sound, the -s ending is /s/: cats, works, helps.',
          ],
          spellings: ['s', 'ss', 'c', 'ce'],
          words: [
            ['see', 'si'],
            ['small', 'smɔl'],
            ['city', 'ˈsɪɾi'],
            ['price', 'praɪs'],
            ['office', 'ˈɔfɪs'],
            ['works', 'wɝks'],
          ],
        },
        {
          sound: 'z',
          ipa: 'z',
          name: 'Z',
          how: [
            'Use the same tongue position as S.',
            'Turn your voice on so the sound buzzes. Touch your throat to check.',
            'After a voiced sound, the -s ending is /z/: plays, calls, jobs. The letter s often sounds like Z.',
          ],
          spellings: ['z', 'zz', 's', 'se'],
          words: [
            ['zero', 'ˈzɪroʊ'],
            ['easy', 'ˈizi'],
            ['busy', 'ˈbɪzi'],
            ['is', 'ɪz'],
            ['plays', 'pleɪz'],
            ['please', 'pliz'],
          ],
        },
      ],
      mistake:
        'Saying every S as /s/, although many sound like Z: “is”, “please”, “easy”, “plays”. Don’t add a vowel to the ending either: “works” is one syllable. The ending is an extra syllable, /ɪz/, only after S, Z, SH, CH and J sounds: “buses”, “changes”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'Each pair changes only S and Z. Hiss for S, buzz for Z. In the last five, listen to the end of the word. Then test your ear.',
      pairs: [
        ['sue', 'zoo'],
        ['sip', 'zip'],
        ['sink', 'zinc'],
        ['bus', 'buzz'],
        ['price', 'prize'],
        ['place', 'plays'],
        ['ice', 'eyes'],
        ['rice', 'rise'],
      ],
    },
    twister: {
      levels: [
        'six busy days',
        'Sue says the zoo is closed.',
        'Sam’s sister sells six sizes of zebra-striped socks.',
      ],
    },
    shadow: {
      context: 'Talking about sales results',
      lines: [
        'Our [s]ales were [s]trong thi[s] month.',
        'The new pri[c]e[s] are ea[s]y to under[s]tand.',
        'Plea[s]e [s]end the number[s] to [Z]oe by [s]ix.',
      ],
      tip: 'Hiss on the S in “sales”, “strong” and “send”. Buzz on the S in “prices”, “easy”, “please” and “numbers”.',
    },
  },
  {
    id: 'sh-zh',
    title: 'SH and ZH: she and measure',
    focus: 'SH and ZH',
    sounds: ['sh', 'zh'],
    goal: 'Round your lips and pull your tongue back a little for SH and ZH, so they sound different from S.',
    warmup:
      'Say “ssss”. Then push your lips forward into a small round shape and pull your tongue back a little: shhhh, like asking for quiet. Now turn your voice on: zhhhh, the middle sound of “measure”. Switch five times: ssss, shhhh.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'sh',
          ipa: 'ʃ',
          name: 'SH',
          how: [
            'Pull your tongue tip back a little, behind the ridge, and push your lips forward into a soft round shape.',
            'Blow air out with your voice off: shhhh, as if asking for quiet.',
            'S is thin and high. SH is wider and deeper.',
          ],
          spellings: ['sh', 'ti', 'ci', 'ss', 's'],
          words: [
            ['she', 'ʃi'],
            ['share', 'ʃɛr'],
            ['sure', 'ʃʊr'],
            ['special', 'ˈspɛʃəl'],
            ['option', 'ˈɑpʃən'],
            ['finish', 'ˈfɪnɪʃ'],
          ],
        },
        {
          sound: 'zh',
          ipa: 'ʒ',
          name: 'ZH',
          how: [
            'Use the same tongue and lips as SH.',
            'Turn your voice on so it buzzes: zhhhh. It’s the middle sound of “measure” and “usual”.',
            'It is usually spelled s or g, and almost never starts an English word.',
          ],
          spellings: ['s', 'si', 'g'],
          words: [
            ['measure', 'ˈmɛʒɚ'],
            ['usual', 'ˈjuʒuəl'],
            ['vision', 'ˈvɪʒən'],
            ['decision', 'dɪˈsɪʒən'],
            ['television', 'ˈtɛləˌvɪʒən'],
            ['casual', 'ˈkæʒuəl'],
          ],
        },
      ],
      mistake:
        'Saying SH like S, so “she” sounds like “see” and “ship” like “sip”, or saying ZH like Z or J (“meazure”, “televijon”). Round your lips for both.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'ZH has almost no word pairs, so these pairs practice S against SH. Round your lips for SH. Then test your ear.',
      pairs: [
        ['see', 'she'],
        ['sip', 'ship'],
        ['sign', 'shine'],
        ['save', 'shave'],
        ['sock', 'shock'],
        ['seat', 'sheet'],
        ['sort', 'short'],
        ['mass', 'mash'],
      ],
    },
    twister: {
      levels: [
        'a short decision',
        'Sean usually shares his vision.',
        'She sells seashells by the seashore, and the shells she sells are surely seashells.',
      ],
    },
    shadow: {
      context: 'Presenting a decision',
      lines: [
        'I’d like to [sh]are an important deci[s]ion.',
        'U[s]ually we [sh]ip orders on Mondays.',
        'I’m [s]ure this is the right vi[s]ion for our [sh]op.',
      ],
      tip: 'Round your lips for every underlined sound. “Share”, “ship”, “sure” and “shop” have SH. “Decision”, “usually” and “vision” have ZH.',
    },
  },
  {
    id: 'ch-j',
    title: 'CH and J: cheap and jeep',
    focus: 'CH and J',
    sounds: ['ch', 'j'],
    goal: 'Start CH and J with a short stop, then release into SH or ZH: CH with the voice off, J with the voice on.',
    warmup:
      'Say “t” and “sh” together, quickly: t-sh, t-sh, ch. Feel your tongue stop, then release. Now turn your voice on: d-zh, d-zh, j. Switch five times: ch, j, ch, j.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'ch',
          ipa: 'tʃ',
          name: 'CH',
          how: [
            'Touch your tongue to the ridge behind your top teeth, a little further back than for T.',
            'Release it into SH with your lips slightly round: t + sh = ch.',
            'Your voice is off. SH has no stop at the start, CH does: “share”, “chair”.',
          ],
          spellings: ['ch', 'tch', 't'],
          words: [
            ['check', 'tʃɛk'],
            ['change', 'tʃeɪndʒ'],
            ['choose', 'tʃuz'],
            ['much', 'mʌtʃ'],
            ['future', 'ˈfjutʃɚ'],
            ['watch', 'wɑtʃ'],
          ],
        },
        {
          sound: 'j',
          ipa: 'dʒ',
          name: 'J',
          how: [
            'Use the same tongue and lips as CH.',
            'Turn your voice on: d + zh = j. Touch your throat to feel the buzz.',
            'It is spelled j, g (before e, i or y), or dge at the end of a word.',
          ],
          spellings: ['j', 'g', 'ge', 'dge'],
          words: [
            ['job', 'dʒɑb'],
            ['just', 'dʒʌst'],
            ['join', 'dʒɔɪn'],
            ['project', 'ˈprɑdʒɛkt'],
            ['large', 'lɑrdʒ'],
            ['bridge', 'brɪdʒ'],
          ],
        },
      ],
      mistake:
        'Mixing CH and SH, so “chair” sounds like “share”, or saying J like Y or Z (“yob” or “zob” for “job”). CH and J both start with a short stop.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'The first five pairs change CH and J. The last three change SH and CH: listen for the short stop at the start of CH. Then test your ear.',
      pairs: [
        ['cheap', 'jeep'],
        ['choke', 'joke'],
        ['chin', 'gin'],
        ['rich', 'ridge'],
        ['batch', 'badge'],
        ['share', 'chair'],
        ['wash', 'watch'],
        ['ship', 'chip'],
      ],
    },
    twister: {
      levels: [
        'cheap orange juice',
        'Which job did Charles choose?',
        'Jolly Jack chose a large cheese and a jar of cherry jam for the picnic.',
      ],
    },
    shadow: {
      context: 'Changing a project date',
      lines: [
        '[J]ust a quick [ch]ange to the pro[j]ect.',
        'Our mana[g]er [ch]ose a new date in [J]uly.',
        'Please [ch]eck it and [j]oin the [ch]at at ten.',
      ],
      tip: 'Start every CH and J with a short stop. Voice off for “change”, “chose”, “check” and “chat”. Voice on for “just”, “project”, “manager”, “July” and “join”.',
    },
  },
];
