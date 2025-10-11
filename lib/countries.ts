/**
 * Canonical Country Utilities
 * ISO-3166 alpha-2 country codes as single source of truth
 */

export type CountryCode =
  | 'US' | 'GB' | 'CA' | 'AU' | 'FR' | 'DE' | 'IT' | 'ES' | 'PT' | 'NL'
  | 'BE' | 'AT' | 'CH' | 'SE' | 'NO' | 'DK' | 'FI' | 'IS' | 'IE' | 'PL'
  | 'CZ' | 'HU' | 'RO' | 'BG' | 'GR' | 'HR' | 'SI' | 'SK' | 'LT' | 'LV'
  | 'EE' | 'RU' | 'UA' | 'BY' | 'MD' | 'TR' | 'IL' | 'PS' | 'SA' | 'AE'
  | 'EG' | 'JO' | 'LB' | 'SY' | 'IQ' | 'IR' | 'YE' | 'OM' | 'KW' | 'BH'
  | 'QA' | 'MA' | 'DZ' | 'TN' | 'LY' | 'SD' | 'ZA' | 'NG' | 'KE' | 'ET'
  | 'GH' | 'UG' | 'TZ' | 'CM' | 'CD' | 'AO' | 'MZ' | 'CN' | 'JP' | 'KR'
  | 'IN' | 'PK' | 'BD' | 'TH' | 'VN' | 'PH' | 'ID' | 'MY' | 'SG' | 'MM'
  | 'KH' | 'LA' | 'NP' | 'LK' | 'AF' | 'MX' | 'BR' | 'AR' | 'CL' | 'CO'
  | 'PE' | 'VE' | 'EC' | 'BO' | 'PY' | 'UY' | 'CU' | 'DO' | 'GT' | 'HN'
  | 'NI' | 'CR' | 'PA' | 'NZ' | 'FJ' | 'PG';

export const COUNTRIES: Record<CountryCode, { name: string; emoji: string }> = {
  // North America
  'US': { name: 'United States', emoji: '🇺🇸' },
  'CA': { name: 'Canada', emoji: '🇨🇦' },
  'MX': { name: 'Mexico', emoji: '🇲🇽' },

  // Central America & Caribbean
  'GT': { name: 'Guatemala', emoji: '🇬🇹' },
  'HN': { name: 'Honduras', emoji: '🇭🇳' },
  'NI': { name: 'Nicaragua', emoji: '🇳🇮' },
  'CR': { name: 'Costa Rica', emoji: '🇨🇷' },
  'PA': { name: 'Panama', emoji: '🇵🇦' },
  'CU': { name: 'Cuba', emoji: '🇨🇺' },
  'DO': { name: 'Dominican Republic', emoji: '🇩🇴' },

  // South America
  'BR': { name: 'Brazil', emoji: '🇧🇷' },
  'AR': { name: 'Argentina', emoji: '🇦🇷' },
  'CL': { name: 'Chile', emoji: '🇨🇱' },
  'CO': { name: 'Colombia', emoji: '🇨🇴' },
  'PE': { name: 'Peru', emoji: '🇵🇪' },
  'VE': { name: 'Venezuela', emoji: '🇻🇪' },
  'EC': { name: 'Ecuador', emoji: '🇪🇨' },
  'BO': { name: 'Bolivia', emoji: '🇧🇴' },
  'PY': { name: 'Paraguay', emoji: '🇵🇾' },
  'UY': { name: 'Uruguay', emoji: '🇺🇾' },

  // Western Europe
  'GB': { name: 'United Kingdom', emoji: '🇬🇧' },
  'FR': { name: 'France', emoji: '🇫🇷' },
  'DE': { name: 'Germany', emoji: '🇩🇪' },
  'IT': { name: 'Italy', emoji: '🇮🇹' },
  'ES': { name: 'Spain', emoji: '🇪🇸' },
  'PT': { name: 'Portugal', emoji: '🇵🇹' },
  'NL': { name: 'Netherlands', emoji: '🇳🇱' },
  'BE': { name: 'Belgium', emoji: '🇧🇪' },
  'AT': { name: 'Austria', emoji: '🇦🇹' },
  'CH': { name: 'Switzerland', emoji: '🇨🇭' },
  'IE': { name: 'Ireland', emoji: '🇮🇪' },

  // Northern Europe
  'SE': { name: 'Sweden', emoji: '🇸🇪' },
  'NO': { name: 'Norway', emoji: '🇳🇴' },
  'DK': { name: 'Denmark', emoji: '🇩🇰' },
  'FI': { name: 'Finland', emoji: '🇫🇮' },
  'IS': { name: 'Iceland', emoji: '🇮🇸' },

  // Eastern Europe
  'PL': { name: 'Poland', emoji: '🇵🇱' },
  'CZ': { name: 'Czech Republic', emoji: '🇨🇿' },
  'HU': { name: 'Hungary', emoji: '🇭🇺' },
  'RO': { name: 'Romania', emoji: '🇷🇴' },
  'BG': { name: 'Bulgaria', emoji: '🇧🇬' },
  'SK': { name: 'Slovakia', emoji: '🇸🇰' },
  'HR': { name: 'Croatia', emoji: '🇭🇷' },
  'SI': { name: 'Slovenia', emoji: '🇸🇮' },
  'LT': { name: 'Lithuania', emoji: '🇱🇹' },
  'LV': { name: 'Latvia', emoji: '🇱🇻' },
  'EE': { name: 'Estonia', emoji: '🇪🇪' },
  'RU': { name: 'Russia', emoji: '🇷🇺' },
  'UA': { name: 'Ukraine', emoji: '🇺🇦' },
  'BY': { name: 'Belarus', emoji: '🇧🇾' },
  'MD': { name: 'Moldova', emoji: '🇲🇩' },

  // Southern Europe
  'GR': { name: 'Greece', emoji: '🇬🇷' },
  'TR': { name: 'Turkey', emoji: '🇹🇷' },

  // Middle East
  'IL': { name: 'Israel', emoji: '🇮🇱' },
  'PS': { name: 'Palestine', emoji: '🇵🇸' },
  'SA': { name: 'Saudi Arabia', emoji: '🇸🇦' },
  'AE': { name: 'United Arab Emirates', emoji: '🇦🇪' },
  'EG': { name: 'Egypt', emoji: '🇪🇬' },
  'JO': { name: 'Jordan', emoji: '🇯🇴' },
  'LB': { name: 'Lebanon', emoji: '🇱🇧' },
  'SY': { name: 'Syria', emoji: '🇸🇾' },
  'IQ': { name: 'Iraq', emoji: '🇮🇶' },
  'IR': { name: 'Iran', emoji: '🇮🇷' },
  'YE': { name: 'Yemen', emoji: '🇾🇪' },
  'OM': { name: 'Oman', emoji: '🇴🇲' },
  'KW': { name: 'Kuwait', emoji: '🇰🇼' },
  'BH': { name: 'Bahrain', emoji: '🇧🇭' },
  'QA': { name: 'Qatar', emoji: '🇶🇦' },

  // North Africa
  'MA': { name: 'Morocco', emoji: '🇲🇦' },
  'DZ': { name: 'Algeria', emoji: '🇩🇿' },
  'TN': { name: 'Tunisia', emoji: '🇹🇳' },
  'LY': { name: 'Libya', emoji: '🇱🇾' },
  'SD': { name: 'Sudan', emoji: '🇸🇩' },

  // Sub-Saharan Africa
  'ZA': { name: 'South Africa', emoji: '🇿🇦' },
  'NG': { name: 'Nigeria', emoji: '🇳🇬' },
  'KE': { name: 'Kenya', emoji: '🇰🇪' },
  'ET': { name: 'Ethiopia', emoji: '🇪🇹' },
  'GH': { name: 'Ghana', emoji: '🇬🇭' },
  'UG': { name: 'Uganda', emoji: '🇺🇬' },
  'TZ': { name: 'Tanzania', emoji: '🇹🇿' },
  'CM': { name: 'Cameroon', emoji: '🇨🇲' },
  'CD': { name: 'Democratic Republic of the Congo', emoji: '🇨🇩' },
  'AO': { name: 'Angola', emoji: '🇦🇴' },
  'MZ': { name: 'Mozambique', emoji: '🇲🇿' },

  // East Asia
  'CN': { name: 'China', emoji: '🇨🇳' },
  'JP': { name: 'Japan', emoji: '🇯🇵' },
  'KR': { name: 'South Korea', emoji: '🇰🇷' },

  // South Asia
  'IN': { name: 'India', emoji: '🇮🇳' },
  'PK': { name: 'Pakistan', emoji: '🇵🇰' },
  'BD': { name: 'Bangladesh', emoji: '🇧🇩' },
  'NP': { name: 'Nepal', emoji: '🇳🇵' },
  'LK': { name: 'Sri Lanka', emoji: '🇱🇰' },
  'AF': { name: 'Afghanistan', emoji: '🇦🇫' },

  // Southeast Asia
  'TH': { name: 'Thailand', emoji: '🇹🇭' },
  'VN': { name: 'Vietnam', emoji: '🇻🇳' },
  'PH': { name: 'Philippines', emoji: '🇵🇭' },
  'ID': { name: 'Indonesia', emoji: '🇮🇩' },
  'MY': { name: 'Malaysia', emoji: '🇲🇾' },
  'SG': { name: 'Singapore', emoji: '🇸🇬' },
  'MM': { name: 'Myanmar', emoji: '🇲🇲' },
  'KH': { name: 'Cambodia', emoji: '🇰🇭' },
  'LA': { name: 'Laos', emoji: '🇱🇦' },

  // Oceania
  'AU': { name: 'Australia', emoji: '🇦🇺' },
  'NZ': { name: 'New Zealand', emoji: '🇳🇿' },
  'FJ': { name: 'Fiji', emoji: '🇫🇯' },
  'PG': { name: 'Papua New Guinea', emoji: '🇵🇬' },
};

export const COUNTRY_ALIASES: Record<string, CountryCode> = {
  // United States
  'USA': 'US',
  'United States of America': 'US',
  'American': 'US',
  'America': 'US',

  // United Kingdom
  'UK': 'GB',
  'Britain': 'GB',
  'Great Britain': 'GB',
  'British': 'GB',
  'England': 'GB',
  'Scotland': 'GB',
  'Wales': 'GB',
  'Northern Ireland': 'GB',
  'English': 'GB',
  'Scottish': 'GB',
  'Welsh': 'GB',

  // Other common aliases
  'French': 'FR',
  'German': 'DE',
  'Spanish': 'ES',
  'Italian': 'IT',
  'Portuguese': 'PT',
  'Dutch': 'NL',
  'Belgian': 'BE',
  'Austrian': 'AT',
  'Swiss': 'CH',
  'Swedish': 'SE',
  'Norwegian': 'NO',
  'Danish': 'DK',
  'Finnish': 'FI',
  'Irish': 'IE',
  'Polish': 'PL',
  'Czech': 'CZ',
  'Hungarian': 'HU',
  'Romanian': 'RO',
  'Bulgarian': 'BG',
  'Greek': 'GR',
  'Turkish': 'TR',
  'Israeli': 'IL',
  'Palestinian': 'PS',
  'Saudi': 'SA',
  'Emirati': 'AE',
  'Egyptian': 'EG',
  'Jordanian': 'JO',
  'Lebanese': 'LB',
  'Syrian': 'SY',
  'Iraqi': 'IQ',
  'Iranian': 'IR',
  'Chinese': 'CN',
  'Japanese': 'JP',
  'Korean': 'KR',
  'South Korean': 'KR',
  'Indian': 'IN',
  'Pakistani': 'PK',
  'Bangladeshi': 'BD',
  'Thai': 'TH',
  'Vietnamese': 'VN',
  'Filipino': 'PH',
  'Indonesian': 'ID',
  'Malaysian': 'MY',
  'Singaporean': 'SG',
  'Mexican': 'MX',
  'Brazilian': 'BR',
  'Argentine': 'AR',
  'Argentinian': 'AR',
  'Chilean': 'CL',
  'Colombian': 'CO',
  'Peruvian': 'PE',
  'Venezuelan': 'VE',
  'Russian': 'RU',
  'Ukrainian': 'UA',
  'Australian': 'AU',
  'Canadian': 'CA',
  'South African': 'ZA',
  'Nigerian': 'NG',
  'Kenyan': 'KE',
};

export const UNKNOWN_COUNTRY = { name: 'Other', emoji: '🌍' };

export function normalizeCountry(input?: string | null): CountryCode | null {
  if (!input) return null;

  // Handle "OTHER" or other invalid values
  const cleanInput = input.trim();
  if (cleanInput.toUpperCase() === 'OTHER' || cleanInput.toUpperCase() === 'UNKNOWN') {
    return null;
  }

  const norm = cleanInput.toUpperCase();

  // Direct ISO code match
  if (norm in COUNTRIES) return norm as CountryCode;

  // Alias match (case-insensitive)
  const alias = Object.keys(COUNTRY_ALIASES).find(
    k => k.toLowerCase() === cleanInput.toLowerCase()
  );
  if (alias) return COUNTRY_ALIASES[alias];

  // Full country name match (case-insensitive)
  const countryEntry = Object.entries(COUNTRIES).find(
    ([_, country]) => country.name.toLowerCase() === cleanInput.toLowerCase()
  );
  if (countryEntry) return countryEntry[0] as CountryCode;

  return null;
}

export function normalizeCountries(input: string | string[] | null | undefined): CountryCode[] {
  if (!input) return [];

  const items = typeof input === 'string'
    ? input.split(',').map(s => s.trim())
    : input;

  return Array.from(new Set(
    items
      .map(i => normalizeCountry(i))
      .filter((c): c is CountryCode => c !== null)
  ));
}

export function flagEmojiFromCode(code: CountryCode): string {
  return COUNTRIES[code]?.emoji || UNKNOWN_COUNTRY.emoji;
}

export function countryNameFromCode(code: CountryCode): string {
  return COUNTRIES[code]?.name || UNKNOWN_COUNTRY.name;
}

export function getAllCountryOptions(): Array<{ code: CountryCode; name: string; emoji: string }> {
  return Object.entries(COUNTRIES)
    .map(([code, data]) => ({
      code: code as CountryCode,
      name: data.name,
      emoji: data.emoji
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function formatCountryDisplay(
  codes: CountryCode[],
  options: { includeFlags?: boolean; separator?: string; maxDisplay?: number } = {}
): string {
  const { includeFlags = true, separator = ', ', maxDisplay = 3 } = options;

  if (codes.length === 0) {
    return includeFlags
      ? `${UNKNOWN_COUNTRY.emoji} ${UNKNOWN_COUNTRY.name}`
      : UNKNOWN_COUNTRY.name;
  }

  const displayCodes = codes.slice(0, maxDisplay);
  const remaining = codes.length - maxDisplay;

  const formatted = displayCodes.map(code =>
    includeFlags
      ? `${flagEmojiFromCode(code)} ${countryNameFromCode(code)}`
      : countryNameFromCode(code)
  );

  let result = formatted.join(separator);
  if (remaining > 0) {
    result += ` and ${remaining} more`;
  }

  return result;
}
