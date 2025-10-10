/**
 * Canonical Country Utilities - Simplified version for immediate deployment
 */

export type CountryCode = 'US' | 'GB' | 'CA' | 'AU' | 'FR' | 'DE' | 'IT' | 'ES' | 'PT' | 'NL' | 'IL' | 'PS' | 'SA' | 'AE' | 'EG' | 'JO' | 'LB' | 'SY' | 'IQ' | 'IR' | 'CN' | 'JP' | 'KR' | 'IN' | 'PK' | 'BR' | 'AR' | 'MX' | 'ZA' | 'NG' | 'RU' | 'UA' | 'TR';

export const COUNTRIES: Record<CountryCode, { name: string; emoji: string }> = {
  'US': { name: 'United States', emoji: '🇺🇸' }, 'GB': { name: 'United Kingdom', emoji: '🇬🇧' },
  'CA': { name: 'Canada', emoji: '🇨🇦' }, 'AU': { name: 'Australia', emoji: '🇦🇺' },
  'FR': { name: 'France', emoji: '🇫🇷' }, 'DE': { name: 'Germany', emoji: '🇩🇪' },
  'IT': { name: 'Italy', emoji: '🇮🇹' }, 'ES': { name: 'Spain', emoji: '🇪🇸' },
  'PT': { name: 'Portugal', emoji: '🇵🇹' }, 'NL': { name: 'Netherlands', emoji: '🇳🇱' },
  'IL': { name: 'Israel', emoji: '🇮🇱' }, 'PS': { name: 'Palestine', emoji: '🇵🇸' },
  'SA': { name: 'Saudi Arabia', emoji: '🇸🇦' }, 'AE': { name: 'United Arab Emirates', emoji: '🇦🇪' },
  'EG': { name: 'Egypt', emoji: '🇪🇬' }, 'JO': { name: 'Jordan', emoji: '🇯🇴' },
  'LB': { name: 'Lebanon', emoji: '🇱🇧' }, 'SY': { name: 'Syria', emoji: '🇸🇾' },
  'IQ': { name: 'Iraq', emoji: '🇮🇶' }, 'IR': { name: 'Iran', emoji: '🇮🇷' },
  'CN': { name: 'China', emoji: '🇨🇳' }, 'JP': { name: 'Japan', emoji: '🇯🇵' },
  'KR': { name: 'South Korea', emoji: '🇰🇷' }, 'IN': { name: 'India', emoji: '🇮🇳' },
  'PK': { name: 'Pakistan', emoji: '🇵🇰' }, 'BR': { name: 'Brazil', emoji: '🇧🇷' },
  'AR': { name: 'Argentina', emoji: '🇦🇷' }, 'MX': { name: 'Mexico', emoji: '🇲🇽' },
  'ZA': { name: 'South Africa', emoji: '🇿🇦' }, 'NG': { name: 'Nigeria', emoji: '🇳🇬' },
  'RU': { name: 'Russia', emoji: '🇷🇺' }, 'UA': { name: 'Ukraine', emoji: '🇺🇦' },
  'TR': { name: 'Turkey', emoji: '🇹🇷' },
};

export const COUNTRY_ALIASES: Record<string, CountryCode> = {
  'USA': 'US', 'American': 'US', 'UK': 'GB', 'British': 'GB', 'England': 'GB',
  'French': 'FR', 'German': 'DE', 'Spanish': 'ES', 'Italian': 'IT',
  'Israeli': 'IL', 'Palestinian': 'PS', 'Russian': 'RU', 'Ukrainian': 'UA',
  'Chinese': 'CN', 'Japanese': 'JP', 'Korean': 'KR', 'South Korean': 'KR',
  'Indian': 'IN', 'Pakistani': 'PK', 'Brazilian': 'BR', 'Mexican': 'MX',
  'Turkish': 'TR',
};

export const UNKNOWN_COUNTRY = { name: 'Unknown', emoji: '🌐' };

export function normalizeCountry(input?: string | null): CountryCode | null {
  if (!input) return null;
  const norm = input.trim().toUpperCase();
  if (norm in COUNTRIES) return norm as CountryCode;
  const alias = Object.keys(COUNTRY_ALIASES).find(k => k.toLowerCase() === input.trim().toLowerCase());
  return alias ? COUNTRY_ALIASES[alias] : null;
}

export function normalizeCountries(input: string | string[] | null | undefined): CountryCode[] {
  if (!input) return [];
  const items = typeof input === 'string' ? input.split(',').map(s => s.trim()) : input;
  return Array.from(new Set(items.map(i => normalizeCountry(i)).filter((c): c is CountryCode => c !== null)));
}
