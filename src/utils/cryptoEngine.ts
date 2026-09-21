export interface PasswordOptions {
  length: number;
  includeUpper?: boolean;
  includeLower?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  excludeAmbiguous: boolean;
}

export interface PassphraseOptions {
  wordCount: number;
  separator: '-' | '_' | '.' | ' ';
  capitalize: boolean;
  includeNumber?: boolean;
  appendNumber?: boolean;
}

export const WORDLIST = [
  'anchor', 'beacon', 'breeze', 'bridge', 'cactus', 'canyon', 'castle', 'cedar',
  'cherry', 'circle', 'clover', 'cobalt', 'comet', 'copper', 'crater', 'crystal',
  'desert', 'dolphin', 'dragon', 'ember', 'falcon', 'feather', 'forest', 'fossil',
  'galaxy', 'garden', 'geyser', 'glacier', 'granite', 'harbor', 'haven', 'horizon',
  'island', 'jaguar', 'jungle', 'lagoon', 'lantern', 'meadow', 'meteor', 'mineral',
  'monarch', 'nebula', 'oasis', 'ocean', 'orchid', 'pebble', 'phoenix', 'planet',
  'plasma', 'prism', 'pulsar', 'pyramid', 'quarry', 'quartz', 'radar', 'raptor',
  'ravine', 'reef', 'ripple', 'river', 'rocket', 'saddle', 'safari', 'samurai',
  'saturn', 'shadow', 'shield', 'sierra', 'silver', 'solstice', 'spark', 'sphere',
  'spring', 'summit', 'temple', 'thunder', 'timber', 'topaz', 'torrent', 'tower',
  'tundra', 'valley', 'vector', 'velvet', 'vortex', 'vulcan', 'walnut', 'willow',
  'zenith', 'zephyr', 'albatross', 'aurora', 'avalanche', 'badger', 'bamboo', 'basalt',
  'blizzard', 'boulder', 'cascade', 'cipher', 'citadel', 'compass', 'cosmos', 'coyote',
  'cyclone', 'dune', 'eclipse', 'emerald', 'falcon', 'fern', 'flare', 'flint',
  'frost', 'garnet', 'ginkgo', 'glade', 'grove', 'hawk', 'heather', 'hybrid',
  'indigo', 'infinity', 'jade', 'jasmine', 'juniper', 'kelp', 'kinetic', 'kodiak',
  'labyrinth', 'lynx', 'magma', 'marble', 'matrix', 'mesa', 'moss', 'mystic',
  'nautilus', 'nomad', 'obsidian', 'opal', 'orbit', 'osprey', 'panorama', 'pathway',
  'peak', 'pelican', 'pine', 'pioneer', 'polar', 'portal', 'prairie', 'pulsar',
  'quartz', 'quiver', 'radius', 'rainforest', 'ranger', 'redwood', 'ridge', 'rover',
  'runway', 'saffron', 'sequoia', 'shadow', 'shimmer', 'skyline', 'solitude', 'spectrum',
  'spruce', 'stellar', 'stone', 'stream', 'stratus', 'stride', 'sunset', 'surge',
  'taiga', 'talon', 'tangle', 'tartan', 'tempest', 'thistle', 'tidal', 'timberline',
  'trail', 'traverse', 'tropic', 'tsunami', 'vanguard', 'verdant', 'voyage', 'whisper',
  'wildfire', 'zenith', 'zodiac'
];

export const USERNAME_ADJECTIVES = [
  'silent', 'covert', 'cipher', 'shadow', 'hidden', 'cloaked', 'masked', 'discreet',
  'private', 'secure', 'neutral', 'shielded', 'cryptic', 'stellar', 'velvet', 'serene',
  'quantum', 'nordic', 'solitary', 'spectral', 'zenith', 'aurora', 'lunar', 'astral'
];

export const USERNAME_NOUNS = [
  'beacon', 'phoenix', 'courier', 'sentinel', 'voyager', 'falcon', 'matrix', 'stream',
  'wanderer', 'orbit', 'vertex', 'glider', 'signal', 'node', 'ranger', 'guardian',
  'seeker', 'cipher', 'harbor', 'echo', 'horizon', 'pulse', 'vector', 'arc'
];

/**
 * Generates cryptographically secure random integers in range [0, max).
 */
export function getCryptoRandomInt(max: number): number {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

/**
 * Generates a strong random password matching specified criteria.
 */
export function generatePassword(options: PasswordOptions): string {
  let upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let lower = 'abcdefghijkmnopqrstuvwxyz';
  let numbers = '23456789';
  let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!options.excludeAmbiguous) {
    upper += 'IO';
    lower += 'lo';
    numbers += '01';
  }

  const useUpper = options.uppercase !== undefined ? options.uppercase : options.includeUpper;
  const useLower = options.lowercase !== undefined ? options.lowercase : options.includeLower;
  const useNum = options.numbers !== undefined ? options.numbers : options.includeNumbers;
  const useSym = options.symbols !== undefined ? options.symbols : options.includeSymbols;

  let charset = '';
  const guaranteedChars: string[] = [];

  if (useUpper) {
    charset += upper;
    guaranteedChars.push(upper[getCryptoRandomInt(upper.length)]);
  }
  if (useLower) {
    charset += lower;
    guaranteedChars.push(lower[getCryptoRandomInt(lower.length)]);
  }
  if (useNum) {
    charset += numbers;
    guaranteedChars.push(numbers[getCryptoRandomInt(numbers.length)]);
  }
  if (useSym) {
    charset += symbols;
    guaranteedChars.push(symbols[getCryptoRandomInt(symbols.length)]);
  }

  if (charset.length === 0) {
    charset = lower + numbers;
    guaranteedChars.push(lower[getCryptoRandomInt(lower.length)]);
  }

  const result: string[] = [...guaranteedChars];
  const remainingLength = Math.max(0, options.length - guaranteedChars.length);

  for (let i = 0; i < remainingLength; i++) {
    result.push(charset[getCryptoRandomInt(charset.length)]);
  }

  // Cryptographic shuffle (Fisher-Yates)
  for (let i = result.length - 1; i > 0; i--) {
    const j = getCryptoRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}

export const generateSecurePassword = generatePassword;

/**
 * Generates a memorable Diceware-style passphrase.
 */
export function generatePassphrase(
  optionsOrWordCount: PassphraseOptions | number = 4,
  separator: '-' | '_' | '.' | ' ' = '-',
  capitalize: boolean = false,
  appendNumber: boolean = true
): string {
  let wordCount = 4;
  let sep = separator;
  let cap = capitalize;
  let num = appendNumber;

  if (typeof optionsOrWordCount === 'object') {
    wordCount = optionsOrWordCount.wordCount;
    sep = optionsOrWordCount.separator;
    cap = optionsOrWordCount.capitalize;
    num = optionsOrWordCount.includeNumber ?? optionsOrWordCount.appendNumber ?? true;
  } else {
    wordCount = optionsOrWordCount;
  }

  const chosenWords: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    let word = WORDLIST[getCryptoRandomInt(WORDLIST.length)];
    if (cap) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    chosenWords.push(word);
  }

  let result = chosenWords.join(sep);
  if (num) {
    const n = 10 + getCryptoRandomInt(90);
    result += `${sep}${n}`;
  }

  return result;
}

/**
 * Generates a privacy-friendly random username / pseudonym.
 */
export function generateRandomUsername(style: 'pseudonym' | 'numeric' | 'short' = 'pseudonym'): string {
  const adj = USERNAME_ADJECTIVES[getCryptoRandomInt(USERNAME_ADJECTIVES.length)];
  const noun = USERNAME_NOUNS[getCryptoRandomInt(USERNAME_NOUNS.length)];
  const num = 100 + getCryptoRandomInt(900);

  if (style === 'short') {
    return `${noun}_${num}`;
  }
  return `${adj}_${noun}_${num}`;
}

export const generateAnonymousUsername = generateRandomUsername;

/**
 * Generates a numeric PIN of specified length using CSPRNG.
 */
export function generatePin(length: number = 6): string {
  const digits = '0123456789';
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(digits[getCryptoRandomInt(digits.length)]);
  }
  return result.join('');
}

/**
 * Computes estimated entropy and crack time for a password or passphrase.
 */
export function evaluatePasswordStrength(password: string): {
  entropy: number;
  entropyBits: number;
  score: number;
  label: string;
  color: string;
  textColor: string;
  percent: number;
  crackTime: string;
  crackTimeEstimate: string;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  feedback: string[];
} {
  if (!password) {
    return {
      entropy: 0,
      entropyBits: 0,
      score: 5,
      label: 'None',
      color: 'bg-slate-700',
      textColor: 'text-slate-400',
      percent: 0,
      crackTime: 'Instant',
      crackTimeEstimate: 'Instant',
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSymbol: false,
      feedback: ['Enter or generate a password to inspect its security score.'],
    };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 33;

  const entropy = Math.round(password.length * Math.log2(Math.max(2, poolSize)));

  const feedback: string[] = [];
  if (password.length < 12) {
    feedback.push('Length is under 12 characters; consider increasing length for brute-force resistance.');
  }
  if (!hasUpper) feedback.push('Add uppercase characters to expand the search space.');
  if (!hasLower) feedback.push('Add lowercase characters.');
  if (!hasNumber) feedback.push('Add digits (0-9).');
  if (!hasSymbol) feedback.push('Add special symbols (!@#$%^&*).');

  // Check for repeated sequences
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Contains 3+ consecutive repeated characters, which reduces entropy.');
  }

  if (feedback.length === 0) {
    feedback.push('Excellent cryptographic distribution with optimal character variety.');
  }

  let label = 'Weak';
  let percent = 25;
  let crackTimeEstimate = 'Few seconds';
  let color = 'bg-rose-500';
  let textColor = 'text-rose-400';

  if (entropy >= 80) {
    label = 'Maximum Security';
    percent = 100;
    color = 'bg-emerald-400';
    textColor = 'text-emerald-400';
    crackTimeEstimate = 'Trillions of centuries';
  } else if (entropy >= 60) {
    label = 'Strong';
    percent = 80;
    color = 'bg-indigo-400';
    textColor = 'text-indigo-400';
    crackTimeEstimate = 'Decades to centuries';
  } else if (entropy >= 40) {
    label = 'Fair';
    percent = 55;
    color = 'bg-amber-400';
    textColor = 'text-amber-400';
    crackTimeEstimate = 'A few months';
  } else {
    label = 'Weak';
    percent = 25;
    color = 'bg-rose-500';
    textColor = 'text-rose-400';
    crackTimeEstimate = 'Few seconds to minutes';
  }

  return {
    entropy,
    entropyBits: entropy,
    score: percent,
    label,
    color,
    textColor,
    percent,
    crackTime: crackTimeEstimate,
    crackTimeEstimate,
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    feedback,
  };
}

export const calculatePasswordStrength = evaluatePasswordStrength;

