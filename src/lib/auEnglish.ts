/**
 * Australian English localisation helper
 * Converts US English to Australian English for user-visible text only.
 * Does NOT modify: API names, HTTP headers, SDK keys, database fields, code identifiers.
 */

const US_TO_AU_MAP: Record<string, string> = {
  // -ize/-ise
  'organize': 'organise',
  'organized': 'organised',
  'organizing': 'organising',
  'organization': 'organisation',
  'organizations': 'organisations',
  'customize': 'customise',
  'customized': 'customised',
  'customizing': 'customising',
  'customization': 'customisation',
  'authorize': 'authorise',
  'authorized': 'authorised',
  'authorizing': 'authorising',
  'authorization': 'authorisation',
  
  // -or/-our
  'behavior': 'behaviour',
  'behaviors': 'behaviours',
  'color': 'colour',
  'colors': 'colours',
  'favor': 'favour',
  'favors': 'favours',
  'favorite': 'favourite',
  'favorites': 'favourites',
  'honor': 'honour',
  'honors': 'honours',
  'neighbor': 'neighbour',
  'neighbors': 'neighbours',
  
  // -er/-re
  'center': 'centre',
  'centers': 'centres',
  'fiber': 'fibre',
  'theater': 'theatre',
  
  // Other common differences
  'license': 'licence',
  'defense': 'defence',
  'offense': 'offence',
  'catalog': 'catalogue',
  'dialog': 'dialogue',
  'program': 'programme', // context-dependent, be careful
};

const PROTECTED_PATTERNS = [
  /Authorization/i,
  /organization_id/i,
  /orgId/i,
  /https?:\/\//,
  /\.com/,
  /\.org/,
  /api\//i,
  /className/,
  /style=/,
  /color:/,
  /bg-\w+/,
  /text-\w+/,
];

export function au(text: string): string {
  // Skip if text contains protected patterns
  if (PROTECTED_PATTERNS.some(pattern => pattern.test(text))) {
    return text;
  }

  let result = text;
  
  // Apply word-boundary replacements (case-aware)
  Object.entries(US_TO_AU_MAP).forEach(([us, au]) => {
    // Handle capitalized versions
    const usCapital = us.charAt(0).toUpperCase() + us.slice(1);
    const auCapital = au.charAt(0).toUpperCase() + au.slice(1);
    
    // Replace with word boundaries
    result = result.replace(new RegExp(`\\b${usCapital}\\b`, 'g'), auCapital);
    result = result.replace(new RegExp(`\\b${us}\\b`, 'g'), au);
  });

  return result;
}

// Unit tests (inline documentation)
if (import.meta.env.DEV) {
  const tests = [
    { input: 'Organize your pets', expected: 'Organise your pets' },
    { input: 'Authorization header', expected: 'Authorization header' }, // Protected
    { input: 'User authorization', expected: 'User authorisation' },
    { input: 'Favorite color', expected: 'Favourite colour' },
    { input: 'className="color-red"', expected: 'className="color-red"' }, // Protected
    { input: 'Center panel', expected: 'Centre panel' },
    { input: 'Visit our center', expected: 'Visit our centre' },
  ];

  const runTests = () => {
    tests.forEach(({ input, expected }) => {
      const result = au(input);
      if (result !== expected) {
        console.warn(`AU English test failed: "${input}" → "${result}" (expected "${expected}")`);
      }
    });
  };

  // Run once on module load in dev
  runTests();
}
