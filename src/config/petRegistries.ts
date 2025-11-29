/**
 * Centralized configuration for pet microchip registries and insurance providers by country.
 * Includes "Other" option for manual entry.
 */

export type ProviderOption = {
  value: string;
  label: string;
  isOther?: boolean;
};

export type CountryProviders = {
  registries: ProviderOption[];
  insuranceProviders: ProviderOption[];
};

// Registry data by country code
const REGISTRIES_BY_COUNTRY: Record<string, ProviderOption[]> = {
  AU: [
    { value: 'Pet Address', label: 'Pet Address' },
    { value: 'Central Animal Records', label: 'Central Animal Records' },
    { value: 'Australasian Animal Registry', label: 'Australasian Animal Registry' },
    { value: 'National Pet Registry', label: 'National Pet Registry' },
    { value: 'PetSafe', label: 'PetSafe' },
  ],
  US: [
    { value: 'HomeAgain', label: 'HomeAgain' },
    { value: 'Found.org', label: 'Found.org (Michelson Found Animals)' },
    { value: 'AKC Reunite', label: 'AKC Reunite' },
    { value: 'AVID', label: 'AVID' },
    { value: '24PetWatch', label: '24PetWatch' },
    { value: 'Petlink', label: 'Petlink' },
    { value: 'FreePetChipRegistry', label: 'Free Pet Chip Registry' },
  ],
  GB: [
    { value: 'Petlog', label: 'Petlog (Kennel Club)' },
    { value: 'Animal Microchips', label: 'Animal Microchips' },
    { value: 'Identibase', label: 'Identibase' },
    { value: 'PetScanner', label: 'PetScanner' },
    { value: 'Pet Identity UK', label: 'Pet Identity UK' },
    { value: 'Anibase', label: 'Anibase' },
  ],
  CA: [
    { value: '24PetWatch Canada', label: '24PetWatch' },
    { value: 'HomeAgain Canada', label: 'HomeAgain' },
    { value: 'BC Pet Registry', label: 'BC Pet Registry' },
    { value: 'Canadian Kennel Club', label: 'Canadian Kennel Club' },
  ],
  NZ: [
    { value: 'NZ Companion Animal Register', label: 'NZ Companion Animal Register (NZCAR)' },
    { value: 'PetChip NZ', label: 'PetChip NZ' },
    { value: 'National Dog Database', label: 'National Dog Database' },
  ],
  IE: [
    { value: 'Fido', label: 'Fido' },
    { value: 'Animal ID', label: 'Animal ID' },
    { value: 'Petlog Ireland', label: 'Petlog Ireland' },
    { value: 'Irish Kennel Club', label: 'Irish Kennel Club' },
  ],
  DE: [
    { value: 'TASSO', label: 'TASSO' },
    { value: 'Deutsches Haustierregister', label: 'Deutsches Haustierregister' },
    { value: 'FINDEFIX', label: 'FINDEFIX' },
  ],
  FR: [
    { value: 'I-CAD', label: 'I-CAD' },
    { value: 'SNVEL', label: 'SNVEL' },
  ],
  NL: [
    { value: 'Chipnummer.nl', label: 'Chipnummer.nl' },
    { value: 'Amivedi', label: 'Amivedi' },
    { value: 'NDG', label: 'NDG (Nederlandse Databank Gezelschapsdieren)' },
  ],
  SG: [
    { value: 'AVS Licensing', label: 'AVS Licensing (NParks)' },
    { value: 'Singapore Microchip Registry', label: 'Singapore Microchip Registry' },
  ],
  JP: [
    { value: 'AIPO', label: 'AIPO (Animal ID Promotion Organization)' },
    { value: 'JKC', label: 'JKC (Japan Kennel Club)' },
    { value: 'FAM', label: 'FAM' },
  ],
};

// Insurance providers by country code
const INSURANCE_BY_COUNTRY: Record<string, ProviderOption[]> = {
  AU: [
    { value: 'RSPCA Pet Insurance', label: 'RSPCA Pet Insurance' },
    { value: 'Bow Wow Meow', label: 'Bow Wow Meow' },
    { value: 'Pet Insurance Australia', label: 'Pet Insurance Australia' },
    { value: 'Woolworths Pet Insurance', label: 'Woolworths Pet Insurance' },
    { value: 'NRMA Pet Insurance', label: 'NRMA Pet Insurance' },
    { value: 'Medibank Pet Insurance', label: 'Medibank Pet Insurance' },
    { value: 'PetSure', label: 'PetSure' },
    { value: 'Petplan Australia', label: 'Petplan Australia' },
  ],
  US: [
    { value: 'Nationwide', label: 'Nationwide Pet Insurance' },
    { value: 'Healthy Paws', label: 'Healthy Paws' },
    { value: 'Trupanion', label: 'Trupanion' },
    { value: 'Lemonade Pet', label: 'Lemonade Pet' },
    { value: 'Pets Best', label: 'Pets Best' },
    { value: 'ASPCA Pet Insurance', label: 'ASPCA Pet Insurance' },
    { value: 'Embrace Pet Insurance', label: 'Embrace Pet Insurance' },
    { value: 'Figo', label: 'Figo' },
  ],
  GB: [
    { value: 'Petplan UK', label: 'Petplan' },
    { value: 'More Than', label: 'More Than' },
    { value: 'Direct Line', label: 'Direct Line' },
    { value: 'Animal Friends', label: 'Animal Friends' },
    { value: 'Bought by Many', label: 'Bought by Many (ManyPets)' },
    { value: 'John Lewis Pet Insurance', label: 'John Lewis Pet Insurance' },
    { value: 'Tesco Pet Insurance', label: 'Tesco Pet Insurance' },
  ],
  CA: [
    { value: 'Trupanion Canada', label: 'Trupanion' },
    { value: 'Petsecure', label: 'Petsecure' },
    { value: 'Petplan Canada', label: 'Petplan Canada' },
    { value: 'Desjardins Pet Insurance', label: 'Desjardins' },
    { value: '24PetWatch Insurance', label: '24PetWatch Insurance' },
  ],
  NZ: [
    { value: 'Pet-n-Sur', label: 'Pet-n-Sur' },
    { value: 'Southern Cross Pet Insurance', label: 'Southern Cross Pet Insurance' },
    { value: 'AA Pet Insurance', label: 'AA Pet Insurance' },
    { value: 'Petplan NZ', label: 'Petplan NZ' },
  ],
  IE: [
    { value: 'Allianz Pet Insurance IE', label: 'Allianz Pet Insurance' },
    { value: 'Petinsurance.ie', label: 'Petinsurance.ie' },
    { value: 'Zurich Pet Insurance', label: 'Zurich Pet Insurance' },
  ],
  DE: [
    { value: 'Allianz Tierkrankenversicherung', label: 'Allianz' },
    { value: 'Agila', label: 'Agila' },
    { value: 'Helvetia', label: 'Helvetia' },
    { value: 'Uelzener', label: 'Uelzener' },
    { value: 'Petplan Deutschland', label: 'Petplan Deutschland' },
  ],
  FR: [
    { value: 'SantéVet', label: 'SantéVet' },
    { value: 'Bulle Bleue', label: 'Bulle Bleue' },
    { value: 'Carrefour Assurance', label: 'Carrefour Assurance' },
    { value: 'Animaux Santé', label: 'Animaux Santé' },
  ],
  NL: [
    { value: 'Petplan Nederland', label: 'Petplan Nederland' },
    { value: 'Independer', label: 'Independer' },
    { value: 'Ohra', label: 'Ohra' },
  ],
  SG: [
    { value: 'Happy Tails', label: 'Happy Tails' },
    { value: 'AIA Pet Insurance', label: 'AIA Pet Insurance' },
    { value: 'Liberty Insurance', label: 'Liberty Insurance' },
  ],
  JP: [
    { value: 'Anicom', label: 'Anicom' },
    { value: 'ipet', label: 'ipet' },
    { value: 'PS Insurance', label: 'PS Insurance' },
  ],
};

// Global fallback options (used when country is not in the list)
const GLOBAL_REGISTRIES: ProviderOption[] = [
  { value: 'Petlink', label: 'Petlink (Global)' },
  { value: 'EuroPetNet', label: 'EuroPetNet' },
  { value: 'International Pet Registry', label: 'International Pet Registry' },
];

const GLOBAL_INSURANCE: ProviderOption[] = [
  { value: 'Petplan International', label: 'Petplan International' },
];

/**
 * Get registries for a specific country code.
 * Falls back to global registries if country not found.
 * Always includes "Other" option at the end.
 */
export const getRegistriesForCountry = (countryCode: string | null): ProviderOption[] => {
  const registries = countryCode && REGISTRIES_BY_COUNTRY[countryCode]
    ? REGISTRIES_BY_COUNTRY[countryCode]
    : GLOBAL_REGISTRIES;
  
  return [
    ...registries,
    { value: 'Other', label: 'Other (enter manually)', isOther: true },
  ];
};

/**
 * Get insurance providers for a specific country code.
 * Falls back to global providers if country not found.
 * Always includes "Other" option at the end.
 */
export const getInsuranceProvidersForCountry = (countryCode: string | null): ProviderOption[] => {
  const providers = countryCode && INSURANCE_BY_COUNTRY[countryCode]
    ? INSURANCE_BY_COUNTRY[countryCode]
    : GLOBAL_INSURANCE;
  
  return [
    ...providers,
    { value: 'Other', label: 'Other (enter manually)', isOther: true },
  ];
};

/**
 * Check if a value is a known provider (not "Other" or custom entry)
 */
export const isKnownProvider = (
  value: string,
  type: 'registry' | 'insurance',
  countryCode: string | null
): boolean => {
  if (!value || value === 'Other') return false;
  
  const options = type === 'registry'
    ? getRegistriesForCountry(countryCode)
    : getInsuranceProvidersForCountry(countryCode);
  
  return options.some(opt => opt.value === value && !opt.isOther);
};

/**
 * Get all supported country codes that have specific registry/insurance data
 */
export const getSupportedCountries = (): string[] => {
  return [...new Set([
    ...Object.keys(REGISTRIES_BY_COUNTRY),
    ...Object.keys(INSURANCE_BY_COUNTRY),
  ])];
};
