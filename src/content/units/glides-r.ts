/**
 * Gliding vowels (I, OW, OY) and vowels before R.
 *
 * Text markup and content rules: see src/content/README.md.
 */
import type { Lesson } from '../types';

export const GLIDE_R_LESSONS: Lesson[] = [
  {
    id: 'diphthongs',
    title: 'Gliding vowels: I, OW and OY',
    focus: 'the gliding vowels',
    sounds: ['eye', 'ow', 'oy'],
    goal: 'Start each gliding vowel open and move smoothly to a high position: time, now, boy.',
    warmup:
      'Open your mouth wide for “ah”, then close slowly to “ee”: ah-ee becomes “I”. Do the same from “ah” to “oo” for “ow”, and from “aw” to “ee” for “oy”. Slowly, then faster. Five rounds.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'eye',
          ipa: 'aɪ',
          name: 'I as in time',
          how: [
            'Start with your mouth open, as for “ah”.',
            'Glide your tongue up and forward toward “ee” in one smooth movement.',
            'The start is long and the end is short: “aah-ee”.',
          ],
          spellings: ['i_e', 'igh', 'y', 'ie'],
          words: [
            ['time', 'taɪm'],
            ['my', 'maɪ'],
            ['right', 'raɪt'],
            ['price', 'praɪs'],
            ['buy', 'baɪ'],
            ['find', 'faɪnd'],
          ],
        },
        {
          sound: 'ow',
          ipa: 'aʊ',
          name: 'OW as in now',
          how: [
            'Start with your mouth open, as for “ah”.',
            'Round your lips and glide toward “oo” in one smooth movement.',
            'Don’t stop at the start: “now” must move, or it sounds like “nah”.',
          ],
          spellings: ['ou', 'ow'],
          words: [
            ['now', 'naʊ'],
            ['how', 'haʊ'],
            ['out', 'aʊt'],
            ['about', 'əˈbaʊt'],
            ['town', 'taʊn'],
            ['account', 'əˈkaʊnt'],
            ['thousand', 'ˈθaʊzənd'],
          ],
        },
        {
          sound: 'oy',
          ipa: 'ɔɪ',
          name: 'OY as in boy',
          how: [
            'Start with rounded lips, as for the “aw” in law.',
            'Glide forward toward “ee” and relax your lips.',
            'Two parts in one beat: “aw-ee” becomes “oy”.',
          ],
          spellings: ['oi', 'oy'],
          words: [
            ['boy', 'bɔɪ'],
            ['join', 'dʒɔɪn'],
            ['point', 'pɔɪnt'],
            ['choice', 'tʃɔɪs'],
            ['enjoy', 'ɪnˈdʒɔɪ'],
            ['voice', 'vɔɪs'],
          ],
        },
      ],
      mistake:
        'Cutting the glide short, so “time” sounds like “tom”, “now” like “nah”, and “coin” like “con”. Each of these vowels must move from open to high.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'Each pair changes the gliding vowel. Watch your jaw and lips move as you repeat. Then test your ear.',
      pairs: [
        ['tie', 'toy'],
        ['buy', 'boy'],
        ['file', 'foil'],
        ['town', 'tone'],
        ['now', 'no'],
        ['found', 'fond'],
        ['bite', 'bout'],
      ],
    },
    twister: {
      levels: [
        'my nice white bike',
        'Roy found a quiet town by the sea.',
        'Mike and Roy found out about the loud, noisy crowd downtown at nine.',
      ],
    },
    shadow: {
      context: 'Choosing a time to meet',
      lines: [
        'H[ow] ab[ou]t n[i]ne o’clock?',
        '[I]’d l[i]ke to j[oi]n the call.',
        'That’s a f[i]ne ch[oi]ce. See you d[ow]nt[ow]n.',
      ],
      tip: 'Let every underlined vowel glide: open first, then close. Hold the start a little longer than the end.',
    },
  },
  {
    id: 'r-vowels',
    title: 'Vowels before R',
    focus: 'the vowels before R',
    sounds: ['ear', 'air', 'ar', 'or'],
    goal: 'Say the vowel, then always finish with a full American R: near, hair, car, more.',
    warmup:
      'Say “ah”, then pull your tongue back and up without touching anything: ah-rrr, “are”. Do the same from “ee” for ear, “eh” for air and “aw” for or. Hold each R for two seconds. Five rounds.',
    learn: {
      kind: 'sounds',
      sounds: [
        {
          sound: 'ear',
          ipa: 'ɪr',
          name: 'EAR as in near',
          how: [
            'Start with the short I of “ship”, lips relaxed.',
            'Pull your tongue back into the American R without stopping the sound.',
            'Don’t say “nee-uh”: the R is always there.',
          ],
          spellings: ['ear', 'eer', 'ere'],
          words: [
            ['near', 'nɪr'],
            ['here', 'hɪr'],
            ['year', 'jɪr'],
            ['clear', 'klɪr'],
            ['career', 'kəˈrɪr'],
            ['engineer', 'ˌɛndʒəˈnɪr'],
          ],
        },
        {
          sound: 'air',
          ipa: 'ɛr',
          name: 'AIR as in hair',
          how: [
            'Start with the E of “bed”, jaw fairly open.',
            'Glide into the American R: tongue pulled back, sides touching your top back teeth.',
            'Keep it one syllable: “hair”, not “hay-uh”.',
          ],
          spellings: ['air', 'are', 'ear', 'ere'],
          words: [
            ['hair', 'hɛr'],
            ['care', 'kɛr'],
            ['where', 'wɛr'],
            ['share', 'ʃɛr'],
            ['there', 'ðɛr'],
            ['airport', 'ˈɛrˌpɔrt'],
          ],
        },
        {
          sound: 'ar',
          ipa: 'ɑr',
          name: 'AR as in car',
          how: [
            'Open your mouth wide for the “ah” of “hot”.',
            'Then pull your tongue back and up into the R.',
            'Keep the R strong: “car” is never “cah” in General American.',
          ],
          spellings: ['ar'],
          words: [
            ['car', 'kɑr'],
            ['start', 'stɑrt'],
            ['part', 'pɑrt'],
            ['market', 'ˈmɑrkɪt'],
            ['large', 'lɑrdʒ'],
            ['far', 'fɑr'],
          ],
        },
        {
          sound: 'or',
          ipa: 'ɔr',
          name: 'OR as in more',
          how: [
            'Round your lips for the “aw” of “law”.',
            'Keep them rounded and pull your tongue back into the R.',
            'Most Americans use this same sound in “for”, “four” and “more”.',
          ],
          spellings: ['or', 'ore', 'oor', 'our', 'oar'],
          words: [
            ['more', 'mɔr'],
            ['four', 'fɔr'],
            ['report', 'rɪˈpɔrt'],
            ['store', 'stɔr'],
            ['short', 'ʃɔrt'],
            ['door', 'dɔr'],
          ],
        },
      ],
      mistake:
        'Dropping the R, as many other accents do, so “car” sounds like “cah” and “more” like “maw”. Or mixing up the vowels, so “hear” sounds like “hair” and “far” like “for”.',
    },
    listen: {
      title: 'Hear the difference',
      intro:
        'Each pair changes only the vowel before R. Keep the R strong in both words, then test your ear.',
      pairs: [
        ['hear', 'hair'],
        ['beer', 'bear'],
        ['fear', 'fair'],
        ['car', 'core'],
        ['far', 'for'],
        ['star', 'store'],
        ['farm', 'form'],
        ['cart', 'court'],
      ],
    },
    twister: {
      levels: [
        'four more cars',
        'There are four more cars near here.',
        'Four fair engineers parked their large cars near the airport store.',
      ],
    },
    shadow: {
      context: 'Arranging a ride to the airport',
      lines: [
        'The c[ar] is p[ar]ked n[ear] the [air]p[or]t.',
        'Wh[ere] should we meet bef[ore] f[our]?',
        'Let’s meet by the st[ore] over th[ere].',
      ],
      tip: 'Every underlined part ends with a full R. Hold it for a moment on the first pass so you can feel your tongue pull back.',
    },
  },
];
