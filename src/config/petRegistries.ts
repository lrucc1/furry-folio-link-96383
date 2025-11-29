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
  // Australia
  AU: [
    { value: 'Pet Address', label: 'Pet Address' },
    { value: 'Central Animal Records', label: 'Central Animal Records' },
    { value: 'Australasian Animal Registry', label: 'Australasian Animal Registry' },
    { value: 'National Pet Registry', label: 'National Pet Registry' },
    { value: 'PetSafe', label: 'PetSafe' },
  ],
  // United States
  US: [
    { value: 'HomeAgain', label: 'HomeAgain' },
    { value: 'Found.org', label: 'Found.org (Michelson Found Animals)' },
    { value: 'AKC Reunite', label: 'AKC Reunite' },
    { value: 'AVID', label: 'AVID' },
    { value: '24PetWatch', label: '24PetWatch' },
    { value: 'Petlink', label: 'Petlink' },
    { value: 'FreePetChipRegistry', label: 'Free Pet Chip Registry' },
  ],
  // United Kingdom
  GB: [
    { value: 'Petlog', label: 'Petlog (Kennel Club)' },
    { value: 'Animal Microchips', label: 'Animal Microchips' },
    { value: 'Identibase', label: 'Identibase' },
    { value: 'PetScanner', label: 'PetScanner' },
    { value: 'Pet Identity UK', label: 'Pet Identity UK' },
    { value: 'Anibase', label: 'Anibase' },
  ],
  // Canada
  CA: [
    { value: '24PetWatch Canada', label: '24PetWatch' },
    { value: 'HomeAgain Canada', label: 'HomeAgain' },
    { value: 'BC Pet Registry', label: 'BC Pet Registry' },
    { value: 'Canadian Kennel Club', label: 'Canadian Kennel Club' },
  ],
  // New Zealand
  NZ: [
    { value: 'NZ Companion Animal Register', label: 'NZ Companion Animal Register (NZCAR)' },
    { value: 'PetChip NZ', label: 'PetChip NZ' },
    { value: 'National Dog Database', label: 'National Dog Database' },
  ],
  // Ireland
  IE: [
    { value: 'Fido', label: 'Fido' },
    { value: 'Animal ID', label: 'Animal ID' },
    { value: 'Petlog Ireland', label: 'Petlog Ireland' },
    { value: 'Irish Kennel Club', label: 'Irish Kennel Club' },
  ],
  // Germany
  DE: [
    { value: 'TASSO', label: 'TASSO' },
    { value: 'Deutsches Haustierregister', label: 'Deutsches Haustierregister' },
    { value: 'FINDEFIX', label: 'FINDEFIX' },
  ],
  // France
  FR: [
    { value: 'I-CAD', label: 'I-CAD' },
    { value: 'SNVEL', label: 'SNVEL' },
  ],
  // Netherlands
  NL: [
    { value: 'Chipnummer.nl', label: 'Chipnummer.nl' },
    { value: 'Amivedi', label: 'Amivedi' },
    { value: 'NDG', label: 'NDG (Nederlandse Databank Gezelschapsdieren)' },
  ],
  // Singapore
  SG: [
    { value: 'AVS Licensing', label: 'AVS Licensing (NParks)' },
    { value: 'Singapore Microchip Registry', label: 'Singapore Microchip Registry' },
  ],
  // Japan
  JP: [
    { value: 'AIPO', label: 'AIPO (Animal ID Promotion Organization)' },
    { value: 'JKC', label: 'JKC (Japan Kennel Club)' },
    { value: 'FAM', label: 'FAM' },
  ],
  // Spain
  ES: [
    { value: 'REIAC', label: 'REIAC (Red Española de Identificación de Animales de Compañía)' },
    { value: 'SIAMU', label: 'SIAMU' },
    { value: 'RSCE', label: 'RSCE (Real Sociedad Canina de España)' },
    { value: 'AIAC', label: 'AIAC' },
  ],
  // Italy
  IT: [
    { value: 'Anagrafe Canina', label: 'Anagrafe Canina' },
    { value: 'AIC', label: 'AIC (Anagrafe degli Animali da Compagnia)' },
    { value: 'ENCI', label: 'ENCI (Ente Nazionale Cinofilia Italiana)' },
  ],
  // Portugal
  PT: [
    { value: 'SIAC', label: 'SIAC (Sistema de Identificação de Animais de Companhia)' },
    { value: 'SICAFE', label: 'SICAFE' },
  ],
  // Belgium
  BE: [
    { value: 'CatID', label: 'CatID' },
    { value: 'DogID', label: 'DogID' },
  ],
  // Switzerland
  CH: [
    { value: 'ANIS', label: 'ANIS' },
    { value: 'SKG', label: 'SKG (Schweizerische Kynologische Gesellschaft)' },
  ],
  // Austria
  AT: [
    { value: 'Heimtierdatenbank', label: 'Heimtierdatenbank' },
    { value: 'Austrian Pet Registry', label: 'Austrian Pet Registry' },
  ],
  // Sweden
  SE: [
    { value: 'Jordbruksverket', label: 'Jordbruksverket' },
    { value: 'SKK', label: 'SKK (Svenska Kennelklubben)' },
  ],
  // Norway
  NO: [
    { value: 'NKK', label: 'NKK (Norsk Kennel Klub)' },
    { value: 'Mattilsynet', label: 'Mattilsynet' },
    { value: 'DyreID', label: 'DyreID' },
  ],
  // Denmark
  DK: [
    { value: 'DKK', label: 'DKK (Dansk Kennel Klub)' },
    { value: 'CHR', label: 'CHR (Det Centrale HusdyrbrugsRegister)' },
  ],
  // Finland
  FI: [
    { value: 'SKL', label: 'SKL (Suomen Kennelliitto)' },
    { value: 'Evira', label: 'Evira' },
  ],
  // Poland
  PL: [
    { value: 'Safe-Animal', label: 'Safe-Animal' },
    { value: 'PetChip.pl', label: 'PetChip.pl' },
    { value: 'Identyfikacja Zwierząt', label: 'Identyfikacja Zwierząt' },
  ],
  // Brazil
  BR: [
    { value: 'Microchip Animal Brasil', label: 'Microchip Animal Brasil' },
    { value: 'RGA', label: 'RGA (Registro Geral do Animal)' },
    { value: 'CBKC', label: 'CBKC (Confederação Brasileira de Cinofilia)' },
  ],
  // Mexico
  MX: [
    { value: 'SAGAR', label: 'SAGAR' },
    { value: 'CONAVET Registry', label: 'CONAVET Registry' },
    { value: 'FCM', label: 'FCM (Federación Canófila Mexicana)' },
  ],
  // Argentina
  AR: [
    { value: 'SENASA', label: 'SENASA' },
    { value: 'FCA', label: 'FCA (Federación Cinológica Argentina)' },
  ],
  // South Africa
  ZA: [
    { value: 'SADR', label: 'SADR (South African Dog Registry)' },
    { value: 'KUSA', label: 'KUSA (Kennel Union of Southern Africa)' },
    { value: 'Identipet', label: 'Identipet' },
  ],
  // United Arab Emirates
  AE: [
    { value: 'Dubai Municipality', label: 'Dubai Municipality' },
    { value: 'Abu Dhabi Agriculture', label: 'Abu Dhabi Agriculture & Food Safety Authority' },
    { value: 'MOCCAE', label: 'MOCCAE' },
  ],
  // Hong Kong
  HK: [
    { value: 'AFCD', label: 'AFCD (Agriculture, Fisheries & Conservation Dept)' },
    { value: 'SPCA Hong Kong', label: 'SPCA Hong Kong' },
  ],
  // South Korea
  KR: [
    { value: 'KKF', label: 'KKF (Korea Kennel Federation)' },
    { value: 'Korea Pet Registry', label: 'Korea Pet Registry' },
    { value: 'Animal Protection Management', label: 'Animal Protection Management System' },
  ],
  // India
  IN: [
    { value: 'Animal Welfare Board', label: 'Animal Welfare Board of India' },
    { value: 'Kennel Club of India', label: 'Kennel Club of India' },
    { value: 'AWBI', label: 'AWBI' },
  ],
  // Thailand
  TH: [
    { value: 'DLD Thailand', label: 'DLD (Department of Livestock Development)' },
    { value: 'TKA', label: 'TKA (Thai Kennel Association)' },
  ],
  // Malaysia
  MY: [
    { value: 'DVS Malaysia', label: 'DVS (Department of Veterinary Services)' },
    { value: 'MKA', label: 'MKA (Malaysian Kennel Association)' },
  ],
  // Indonesia
  ID: [
    { value: 'PERKIN', label: 'PERKIN (Perkumpulan Kinologi Indonesia)' },
  ],
  // Philippines
  PH: [
    { value: 'PCCI', label: 'PCCI (Philippine Canine Club Inc)' },
    { value: 'BAI', label: 'BAI (Bureau of Animal Industry)' },
  ],
  // Greece
  GR: [
    { value: 'KOE', label: 'KOE (Kennel Club of Greece)' },
    { value: 'Greek Pet Registry', label: 'Greek Pet Registry' },
  ],
  // Czech Republic
  CZ: [
    { value: 'CMKU', label: 'ČMKU (Czech Kennel Club)' },
    { value: 'Czech Pet Registry', label: 'Czech Pet Registry' },
  ],
  // Hungary
  HU: [
    { value: 'MEOE', label: 'MEOE (Hungarian Kennel Club)' },
    { value: 'PetData Hungary', label: 'PetData Hungary' },
  ],
};

// Insurance providers by country code
const INSURANCE_BY_COUNTRY: Record<string, ProviderOption[]> = {
  // Australia
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
  // United States
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
  // United Kingdom
  GB: [
    { value: 'Petplan UK', label: 'Petplan' },
    { value: 'More Than', label: 'More Than' },
    { value: 'Direct Line', label: 'Direct Line' },
    { value: 'Animal Friends', label: 'Animal Friends' },
    { value: 'Bought by Many', label: 'Bought by Many (ManyPets)' },
    { value: 'John Lewis Pet Insurance', label: 'John Lewis Pet Insurance' },
    { value: 'Tesco Pet Insurance', label: 'Tesco Pet Insurance' },
  ],
  // Canada
  CA: [
    { value: 'Trupanion Canada', label: 'Trupanion' },
    { value: 'Petsecure', label: 'Petsecure' },
    { value: 'Petplan Canada', label: 'Petplan Canada' },
    { value: 'Desjardins Pet Insurance', label: 'Desjardins' },
    { value: '24PetWatch Insurance', label: '24PetWatch Insurance' },
  ],
  // New Zealand
  NZ: [
    { value: 'Pet-n-Sur', label: 'Pet-n-Sur' },
    { value: 'Southern Cross Pet Insurance', label: 'Southern Cross Pet Insurance' },
    { value: 'AA Pet Insurance', label: 'AA Pet Insurance' },
    { value: 'Petplan NZ', label: 'Petplan NZ' },
  ],
  // Ireland
  IE: [
    { value: 'Allianz Pet Insurance IE', label: 'Allianz Pet Insurance' },
    { value: 'Petinsurance.ie', label: 'Petinsurance.ie' },
    { value: 'Zurich Pet Insurance', label: 'Zurich Pet Insurance' },
  ],
  // Germany
  DE: [
    { value: 'Allianz Tierkrankenversicherung', label: 'Allianz' },
    { value: 'Agila', label: 'Agila' },
    { value: 'Helvetia', label: 'Helvetia' },
    { value: 'Uelzener', label: 'Uelzener' },
    { value: 'Petplan Deutschland', label: 'Petplan Deutschland' },
  ],
  // France
  FR: [
    { value: 'SantéVet', label: 'SantéVet' },
    { value: 'Bulle Bleue', label: 'Bulle Bleue' },
    { value: 'Carrefour Assurance', label: 'Carrefour Assurance' },
    { value: 'Animaux Santé', label: 'Animaux Santé' },
  ],
  // Netherlands
  NL: [
    { value: 'Petplan Nederland', label: 'Petplan Nederland' },
    { value: 'Independer', label: 'Independer' },
    { value: 'Ohra', label: 'Ohra' },
  ],
  // Singapore
  SG: [
    { value: 'Happy Tails', label: 'Happy Tails' },
    { value: 'AIA Pet Insurance', label: 'AIA Pet Insurance' },
    { value: 'Liberty Insurance', label: 'Liberty Insurance' },
  ],
  // Japan
  JP: [
    { value: 'Anicom', label: 'Anicom' },
    { value: 'ipet', label: 'ipet' },
    { value: 'PS Insurance', label: 'PS Insurance' },
  ],
  // Spain
  ES: [
    { value: 'Mapfre Mascotas', label: 'Mapfre' },
    { value: 'AXA Seguros Mascotas', label: 'AXA Seguros' },
    { value: 'Santander Seguros', label: 'Santander Seguros' },
    { value: 'Caser Seguros', label: 'Caser Seguros' },
  ],
  // Italy
  IT: [
    { value: 'UnipolSai Animali', label: 'UnipolSai' },
    { value: 'Generali Pet', label: 'Generali' },
    { value: 'Allianz Italia Pet', label: 'Allianz Italia' },
    { value: 'Zurich Connect Pet', label: 'Zurich Connect' },
  ],
  // Portugal
  PT: [
    { value: 'Fidelidade Pet', label: 'Fidelidade' },
    { value: 'Tranquilidade Pet', label: 'Tranquilidade' },
    { value: 'Allianz Portugal Pet', label: 'Allianz Portugal' },
  ],
  // Belgium
  BE: [
    { value: 'AG Insurance Pet', label: 'AG Insurance' },
    { value: 'Ethias Pet', label: 'Ethias' },
    { value: 'AXA Belgium Pet', label: 'AXA Belgium' },
  ],
  // Switzerland
  CH: [
    { value: 'Animalia', label: 'Animalia' },
    { value: 'Epona', label: 'Epona' },
    { value: 'Helvetia Pet', label: 'Helvetia' },
  ],
  // Austria
  AT: [
    { value: 'Allianz Austria Pet', label: 'Allianz Austria' },
    { value: 'Generali Austria Pet', label: 'Generali Austria' },
    { value: 'UNIQA Pet', label: 'UNIQA' },
  ],
  // Sweden
  SE: [
    { value: 'Folksam Djurförsäkring', label: 'Folksam' },
    { value: 'Agria Sverige', label: 'Agria' },
    { value: 'If Djurförsäkring', label: 'If' },
    { value: 'Sveland', label: 'Sveland' },
  ],
  // Norway
  NO: [
    { value: 'If Dyreforsikring', label: 'If' },
    { value: 'Tryg Dyreforsikring', label: 'Tryg' },
    { value: 'Agria Norge', label: 'Agria' },
  ],
  // Denmark
  DK: [
    { value: 'Alm. Brand Husdyr', label: 'Alm. Brand' },
    { value: 'Tryg Husdyrforsikring', label: 'Tryg' },
    { value: 'Agria Danmark', label: 'Agria' },
  ],
  // Finland
  FI: [
    { value: 'If Eläinvakuutus', label: 'If' },
    { value: 'Pohjola Eläinvakuutus', label: 'Pohjola' },
    { value: 'Agria Finland', label: 'Agria' },
  ],
  // Poland
  PL: [
    { value: 'PZU Zwierzęta', label: 'PZU' },
    { value: 'Warta Pet', label: 'Warta' },
    { value: 'Allianz Polska Pet', label: 'Allianz Polska' },
  ],
  // Brazil
  BR: [
    { value: 'Porto Seguro Pet', label: 'Porto Seguro Pet' },
    { value: 'SulAmérica Pet', label: 'SulAmérica' },
    { value: 'Bradesco Pet', label: 'Bradesco Pet' },
  ],
  // Mexico
  MX: [
    { value: 'GNP Mascotas', label: 'GNP Mascotas' },
    { value: 'Mapfre México Mascotas', label: 'Mapfre México' },
    { value: 'AXA México Pet', label: 'AXA México' },
  ],
  // Argentina
  AR: [
    { value: 'La Caja Pet', label: 'La Caja' },
    { value: 'Sancor Pet', label: 'Sancor Seguros' },
  ],
  // South Africa
  ZA: [
    { value: 'MediPet', label: 'MediPet' },
    { value: 'Oneplan Pet', label: 'Oneplan' },
    { value: 'Dotsure', label: 'Dotsure' },
  ],
  // United Arab Emirates
  AE: [
    { value: 'RSA Pet Insurance', label: 'RSA Pet Insurance' },
    { value: 'AXA Gulf Pet', label: 'AXA Gulf' },
    { value: 'Zurich UAE Pet', label: 'Zurich UAE' },
  ],
  // Hong Kong
  HK: [
    { value: 'OneDegree Pet', label: 'OneDegree' },
    { value: 'AXA Hong Kong Pet', label: 'AXA Hong Kong' },
    { value: 'MSIG Pet', label: 'MSIG' },
  ],
  // South Korea
  KR: [
    { value: 'Samsung Fire & Marine Pet', label: 'Samsung Fire & Marine' },
    { value: 'Hyundai Pet Insurance', label: 'Hyundai Pet Insurance' },
    { value: 'DB Insurance Pet', label: 'DB Insurance' },
  ],
  // India
  IN: [
    { value: 'New India Assurance Pet', label: 'New India Assurance' },
    { value: 'TATA AIG Pet', label: 'TATA AIG' },
    { value: 'Bajaj Allianz Pet', label: 'Bajaj Allianz' },
  ],
  // Thailand
  TH: [
    { value: 'Muang Thai Pet', label: 'Muang Thai' },
    { value: 'AIA Thailand Pet', label: 'AIA Thailand' },
  ],
  // Malaysia
  MY: [
    { value: 'Etiqa Pet', label: 'Etiqa' },
    { value: 'AXA Malaysia Pet', label: 'AXA Malaysia' },
  ],
  // Indonesia
  ID: [
    { value: 'Sinar Mas Pet', label: 'Sinar Mas' },
    { value: 'AXA Indonesia Pet', label: 'AXA Indonesia' },
  ],
  // Philippines
  PH: [
    { value: 'Pioneer Pet Insurance', label: 'Pioneer Insurance' },
    { value: 'PetPlan PH', label: 'PetPlan Philippines' },
  ],
  // Greece
  GR: [
    { value: 'Interamerican Pet', label: 'Interamerican' },
    { value: 'Ethniki Pet', label: 'Ethniki Asfalistiki' },
  ],
  // Czech Republic
  CZ: [
    { value: 'Generali CZ Pet', label: 'Generali' },
    { value: 'Allianz CZ Pet', label: 'Allianz' },
  ],
  // Hungary
  HU: [
    { value: 'Generali HU Pet', label: 'Generali' },
    { value: 'Allianz HU Pet', label: 'Allianz' },
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