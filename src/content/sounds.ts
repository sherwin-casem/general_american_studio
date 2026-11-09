/**
 * The General American sound inventory: every consonant and vowel, the two common variants of T,
 * and the stress and melody skills. The sound chart, the notebook and the lesson path all use it.
 */
import type { Sound, SoundCategory, SoundKey, SoundKind } from './types';

export const CATEGORY_LABELS: Record<SoundCategory, string> = {
  stop: 'Stops',
  fricative: 'Fricatives',
  affricate: 'Affricates',
  nasal: 'Nasals',
  approximant: 'R, L, W and Y',
  't-variant': 'The American T',
  front: 'Front vowels',
  central: 'Central vowels',
  back: 'Back vowels',
  diphthong: 'Gliding vowels',
  'r-colored': 'Vowels before R',
  skill: 'Stress, rhythm and melody',
  other: 'Other',
};

/** One-line explanations shown under each chart group. */
export const CATEGORY_HINTS: Record<SoundCategory, string> = {
  stop: 'Air is stopped completely, then released.',
  fricative: 'Air is pushed through a narrow gap, so you hear friction.',
  affricate: 'A stop that opens into a fricative: t + sh, d + zh.',
  nasal: 'Air goes out through the nose.',
  approximant: 'The tongue or lips come close, but air flows freely.',
  't-variant': 'In American English, T often changes between vowels and before other consonants.',
  front: 'The tongue is high or forward in the mouth.',
  central: 'The tongue rests in the middle. These include the most common vowel, schwa.',
  back: 'The tongue is pulled back. Several are said with rounded lips.',
  diphthong: 'One vowel glides into another inside a single syllable.',
  'r-colored': 'A vowel followed by the American R, which is always pronounced.',
  skill: 'Beyond single sounds: which syllable is strong, how words link, and how the voice moves.',
  other: '',
};

export const KIND_LABELS: Record<SoundKind, string> = {
  consonant: 'Consonants',
  vowel: 'Vowels',
  skill: 'Stress and melody',
  other: 'Other',
};

const c = (
  key: SoundKey,
  category: SoundCategory,
  ipa: string,
  name: string,
  keyword: string,
  voiced: boolean,
  place: string,
): Sound => ({ key, kind: 'consonant', category, ipa, name, keyword, voiced, place });

const v = (
  key: SoundKey,
  category: SoundCategory,
  ipa: string,
  name: string,
  keyword: string,
): Sound => ({ key, kind: 'vowel', category, ipa, name, keyword });

const s = (key: SoundKey, ipa: string, name: string, keyword: string): Sound => ({
  key,
  kind: 'skill',
  category: 'skill',
  ipa,
  name,
  keyword,
});

/** In chart order: voiceless before voiced, front of the mouth before back. */
export const SOUNDS: Sound[] = [
  c('p', 'stop', 'p', 'P as in pen', 'pen', false, 'Both lips'),
  c('b', 'stop', 'b', 'B as in best', 'best', true, 'Both lips'),
  c('t', 'stop', 't', 'T as in top', 'top', false, 'Tongue tip on the gum ridge'),
  c('d', 'stop', 'd', 'D as in day', 'day', true, 'Tongue tip on the gum ridge'),
  c('k', 'stop', 'k', 'K as in key', 'key', false, 'Back of the tongue'),
  c('g', 'stop', 'ɡ', 'G as in go', 'go', true, 'Back of the tongue'),
  c('f', 'fricative', 'f', 'F as in fine', 'fine', false, 'Top teeth on the lower lip'),
  c('v', 'fricative', 'v', 'V as in very', 'very', true, 'Top teeth on the lower lip'),
  c('th-voiceless', 'fricative', 'θ', 'TH as in think', 'think', false, 'Tongue between the teeth'),
  c('th-voiced', 'fricative', 'ð', 'TH as in this', 'this', true, 'Tongue between the teeth'),
  c('s', 'fricative', 's', 'S as in see', 'see', false, 'Tongue tip near the gum ridge'),
  c('z', 'fricative', 'z', 'Z as in zoo', 'zoo', true, 'Tongue tip near the gum ridge'),
  c('sh', 'fricative', 'ʃ', 'SH as in she', 'she', false, 'Tongue behind the gum ridge'),
  c('zh', 'fricative', 'ʒ', 'ZH as in measure', 'measure', true, 'Tongue behind the gum ridge'),
  c('h', 'fricative', 'h', 'H as in hat', 'hat', false, 'Open throat'),
  c('ch', 'affricate', 'tʃ', 'CH as in check', 'check', false, 'Tongue behind the gum ridge'),
  c('j', 'affricate', 'dʒ', 'J as in job', 'job', true, 'Tongue behind the gum ridge'),
  c('m', 'nasal', 'm', 'M as in me', 'me', true, 'Both lips'),
  c('n', 'nasal', 'n', 'N as in no', 'no', true, 'Tongue tip on the gum ridge'),
  c('ng', 'nasal', 'ŋ', 'NG as in sing', 'sing', true, 'Back of the tongue'),
  c('l', 'approximant', 'l', 'L as in light', 'light', true, 'Tongue tip on the gum ridge'),
  c('r', 'approximant', 'r', 'R as in red', 'red', true, 'Tongue pulled back, touching nothing'),
  c('w', 'approximant', 'w', 'W as in we', 'we', true, 'Rounded lips'),
  c('y', 'approximant', 'j', 'Y as in yes', 'yes', true, 'Tongue high and forward'),
  c(
    'flap-t',
    't-variant',
    'ɾ',
    'Flap T as in water',
    'water',
    true,
    'A quick tap of the tongue tip',
  ),
  c(
    'stop-t',
    't-variant',
    't̚',
    'Held T as in get ready',
    'get ready',
    false,
    'Tongue tip on the gum ridge, held',
  ),

  v('i', 'front', 'i', 'EE as in sheep', 'sheep'),
  v('ih', 'front', 'ɪ', 'Short I as in ship', 'ship'),
  v('ay', 'front', 'eɪ', 'AY as in day', 'say'),
  v('eh', 'front', 'ɛ', 'E as in bed', 'bed'),
  v('ae', 'front', 'æ', 'A as in cat', 'cat'),
  v('uh', 'central', 'ʌ', 'U as in cup', 'cup'),
  v('schwa', 'central', 'ə', 'Schwa as in about', 'about'),
  v('er', 'central', 'ɝ', 'ER as in bird', 'bird'),
  v('long-oo', 'back', 'u', 'OO as in food', 'food'),
  v('short-oo', 'back', 'ʊ', 'OO as in book', 'book'),
  v('oh', 'back', 'oʊ', 'OH as in home', 'home'),
  v('aw', 'back', 'ɔ', 'AW as in law', 'law'),
  v('ah', 'back', 'ɑ', 'AH as in hot', 'hot'),
  v('eye', 'diphthong', 'aɪ', 'I as in time', 'time'),
  v('ow', 'diphthong', 'aʊ', 'OW as in now', 'now'),
  v('oy', 'diphthong', 'ɔɪ', 'OY as in boy', 'boy'),
  v('ear', 'r-colored', 'ɪr', 'EAR as in near', 'near'),
  v('air', 'r-colored', 'ɛr', 'AIR as in hair', 'hair'),
  v('ar', 'r-colored', 'ɑr', 'AR as in car', 'car'),
  v('or', 'r-colored', 'ɔr', 'OR as in more', 'more'),

  s('word-stress', '●•', 'Word stress', 'present'),
  s('rhythm', '‿', 'Rhythm and linking', 'pick it up'),
  s('intonation', '↗↘', 'Intonation', 'Are you ready?'),
  s('clusters', 'str', 'Consonant clusters', 'strengths'),
  { key: 'other', kind: 'other', category: 'other', ipa: '?', name: 'Another sound', keyword: '' },
];

const SOUND_MAP = new Map<string, Sound>(SOUNDS.map((sound) => [sound.key, sound]));
export const SOUND_KEYS: ReadonlySet<string> = new Set(SOUND_MAP.keys());

export function isSoundKey(value: unknown): value is SoundKey {
  return typeof value === 'string' && SOUND_KEYS.has(value);
}

export function soundByKey(key: string): Sound {
  return SOUND_MAP.get(key) ?? (SOUND_MAP.get('other') as Sound);
}

/** Chart groups in display order, each with its sounds. Empty groups are left out. */
export function soundsByCategory(kind?: SoundKind): { category: SoundCategory; sounds: Sound[] }[] {
  const order = Object.keys(CATEGORY_LABELS) as SoundCategory[];
  return order
    .map((category) => ({
      category,
      sounds: SOUNDS.filter(
        (sound) => sound.category === category && (!kind || sound.kind === kind),
      ),
    }))
    .filter((group) => group.sounds.length > 0);
}
