/**
 * Word stress in two-syllable and longer words.
 *
 * Text markup and content rules: see src/content/README.md.
 */
import type { Lesson } from '../types';

export const STRESS_LESSONS: Lesson[] = [
  {
    id: 'stress-two',
    title: 'Stress in two-syllable words',
    focus: 'word stress',
    sounds: ['word-stress'],
    goal: 'Make the stressed syllable longer, louder and higher, and relax the other one.',
    warmup:
      'Clap once per syllable as you say these words. Clap loudly on the stressed one: TA-ble (loud, soft), be-GIN (soft, loud). Repeat: TA-ble, be-GIN, TA-ble, be-GIN.',
    learn: {
      kind: 'stress',
      rules: [
        'Most two-syllable nouns and adjectives stress the first syllable.',
        'Most two-syllable verbs stress the second syllable.',
        'Some words change stress when they change job: a REcord, to reCORD.',
      ],
      groups: [
        {
          label: 'Nouns and adjectives: first syllable',
          words: ['TA·ble', 'MEET·ing', 'OF·fice', 'PROD·uct', 'CLI·ent', 'HAP·py'],
        },
        {
          label: 'Verbs: second syllable',
          words: ['be·GIN', 'de·CIDE', 're·PLY', 'ex·PLAIN', 'at·TEND', 'com·PLETE'],
        },
      ],
      mistake:
        'Stressing every syllable the same, or the wrong one. “deSERT” and “DEsert” are different words, so listeners can misunderstand.',
    },
    listen: {
      title: 'Hear the stress',
      intro:
        'Each row uses the same word as a noun and then as a verb. Play both and copy the stress shift. Then test your ear on single words.',
      rows: [
        {
          cells: ['Keep a {re}cord of the call.', 'Please re{cord} the call.'],
        },
        {
          cells: ['Thanks for the {pres}ent.', 'I will pre{sent} the plan.'],
        },
        {
          cells: ['There was an {in}crease in sales.', 'We need to in{crease} sales.'],
        },
        {
          cells: ['What is that {ob}ject?', 'Do you ob{ject} to this?'],
        },
      ],
      quiz: {
        type: 'stress',
        items: [
          'MEET·ing',
          'be·GIN',
          'OF·fice',
          'de·CIDE',
          'PROD·uct',
          're·PORT',
          'CLI·ent',
          'de·SIGN',
          'EX·tra',
          'suc·CESS',
          'PEO·ple',
          'com·PLETE',
          'ho·TEL',
          'IN·voice',
        ],
      },
    },
    twister: {
      title: 'Stress chant',
      levels: [
        '{ta}ble, {hap}py, {meet}ing',
        'be{gin}, re{turn}, de{cide}',
        'Please re{cord} the {rec}ord, then pre{sent} the {pres}ent.',
      ],
    },
    shadow: {
      context: 'Opening a product presentation',
      lines: [
        'I’d like to pre{sent} our new {prod}uct.',
        'We {start}ed the {proj}ect in {Jan}uary.',
        'Let me ex{plain} the de{sign}.',
      ],
      tip: 'Stretch each highlighted syllable a little longer and higher than the rest.',
    },
  },
  {
    id: 'stress-long',
    title: 'Stress in longer words',
    focus: 'stress in long words',
    sounds: ['word-stress'],
    goal: 'Find the stressed syllable in long business words with two simple suffix rules.',
    warmup:
      'Clap the beats of your job title or your company name. Where is the big clap? Then clap: in-for-MA-tion (soft, soft, LOUD, soft).',
    learn: {
      kind: 'stress',
      rules: [
        'Words ending in -tion, -sion, -ic, -ical, -ity and -ial stress the syllable just before the ending.',
        'When a word grows into a family, the stress can move: PHOtograph, phoTOGraphy, photoGRAPHic.',
        'The unstressed syllables usually relax into schwa.',
      ],
      groups: [
        {
          label: 'Stress just before the ending',
          words: [
            'in·for·MA·tion',
            'de·CI·sion',
            'ec·o·NOM·ic',
            'fi·NAN·cial',
            'op·por·TU·ni·ty',
            'pres·en·TA·tion',
          ],
        },
        {
          label: 'Stress moves inside word families',
          words: [
            'PHO·to·graph',
            'pho·TOG·ra·phy',
            'pho·to·GRAPH·ic',
            'e·CON·o·my',
            'AN·a·lyze',
            'a·NAL·y·sis',
          ],
        },
      ],
      mistake:
        'Keeping the stress in the same place across a word family: “PHO-to-gra-phy” instead of “pho-TOG-ra-phy”.',
    },
    listen: {
      title: 'Hear the stress',
      separator: '→',
      intro:
        'Play each word family from left to right and follow the stress as it moves. Then test your ear.',
      rows: [
        {
          cells: ['{pho}tograph', 'pho{tog}raphy', 'photo{graph}ic'],
        },
        {
          cells: ['e{con}omy', 'eco{nom}ic'],
        },
        {
          cells: ['{an}alyze', 'a{nal}ysis', 'ana{lyt}ical'],
        },
        {
          cells: ['{man}ager', 'mana{ger}ial'],
        },
      ],
      quiz: {
        type: 'stress',
        items: [
          'in·for·MA·tion',
          'de·CI·sion',
          'ec·o·NOM·ic',
          'fi·NAN·cial',
          'COM·pa·ny',
          'MAN·a·ger',
          'de·VEL·op',
          'a·NAL·y·sis',
          'pho·TOG·ra·phy',
          'com·pe·TI·tion',
          'CAL·en·dar',
          'a·VAIL·a·ble',
          'op·por·TU·ni·ty',
          'pres·en·TA·tion',
        ],
      },
    },
    twister: {
      title: 'Stress chant',
      levels: [
        '{pho}tograph, pho{tog}raphy',
        'e{con}omy, eco{nom}ic, eco{nom}ical',
        'The pho{tog}rapher took a {pho}tograph at the photo{graph}ic exhi{bi}tion.',
      ],
    },
    shadow: {
      context: 'Following up after a meeting',
      lines: [
        'Thank you for the infor{ma}tion.',
        'We made a de{ci}sion on the {budg}et.',
        'It’s a great oppor{tu}nity for the {com}pany.',
      ],
      tip: 'Find the ending first (-tion, -sion, -ity), then stress the syllable just before it.',
    },
  },
];
