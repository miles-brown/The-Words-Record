/**
 * Database Field Definitions
 * These define the exact structure and validation rules for person data fields
 */

export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
  'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
  'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji',
  'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
  'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
  'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
  'South Sudan', 'Spain', 'Sri Lanka', 'Stateless', 'Sudan', 'Suriname', 'Sweden',
  'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
] as const

export const RELIGIONS = [
  'Jewish',
  'Christian',
  'Muslim',
  'Hindu',
  'Buddhist',
  'Sikh',
  'Other',
  'Unknown',
  'No Religion'
] as const

export const RELIGIOUS_AFFILIATIONS = {
  Christian: [
    'Anglican',
    'Baptist',
    'Christian Science',
    'Evangelical',
    'Jehovah\'s Witness',
    'Lutheran',
    'Methodist',
    'Mormon (LDS)',
    'Orthodox',
    'Pentecostal',
    'Presbyterian',
    'Quaker (Religious Society of Friends)',
    'Roman Catholic',
    'Seventh-Day Adventist',
    'Other (Christian)'
  ],
  'No Religion': [
    'Atheist',
    'Agnostic',
    'Spiritual',
    'Secular Humanist',
    'Other (Non-Religious)'
  ],
  Muslim: [
    'Sunni',
    'Shia',
    'Ahmadiyya',
    'Ibadi',
    'Other (Islamic)'
  ],
  Jewish: [
    'Modern Orthodox',
    'Haredi',
    'Hasidic',
    'Conservative',
    'Reform',
    'Reconstructionist',
    'Jewish Renewal',
    'Sephardi',
    'Mizrahi',
    'Karaite',
    'Other (Jewish)'
  ],
  Other: [
    'Scientology',
    'Baháʼí',
    'Jainism',
    'Zoroastrianism',
    'Shinto',
    'Rastafarianism',
    'Candomblé',
    'Umbanda',
    'Vodou',
    'Other (Specify)'
  ],
  Hindu: ['Not Applicable'],
  Buddhist: ['Not Applicable'],
  Sikh: ['Not Applicable'],
  Unknown: ['Not Applicable']
} as const

/**
 * Validation rules for nationality
 */
export function validateNationality(value: string): boolean {
  // Handle multiple citizenships (comma-separated)
  const countries = value.split(',').map(c => c.trim())
  return countries.every(country => COUNTRIES.includes(country as any))
}

/**
 * Validation rules for religion
 */
export function validateReligion(value: string): boolean {
  return RELIGIONS.includes(value as any)
}

/**
 * Validation rules for religious affiliation
 */
export function validateReligiousAffiliation(religion: string, affiliation: string): boolean {
  if (!RELIGIONS.includes(religion as any)) return false

  const validAffiliations = RELIGIOUS_AFFILIATIONS[religion as keyof typeof RELIGIOUS_AFFILIATIONS] as readonly string[]
  if (!validAffiliations) return false

  return validAffiliations.includes(affiliation)
}

/**
 * Get religious icon based on religion and affiliation
 */
export function getReligionIconFromFields(religion: string, affiliation?: string): string {
  const religionIcons: { [key: string]: string } = {
    'Jewish': '✡️',
    'Christian': '✝️',
    'Muslim': '☪️',
    'Hindu': '🕉️',
    'Buddhist': '☸️',
    'Sikh': '☬',
    'No Religion': affiliation === 'Atheist' ? '🚫' : affiliation === 'Agnostic' ? '❓' : '⚛️',
    'Unknown': '',
    'Other': '🙏'
  }

  // Special case for Orthodox Christians
  if (religion === 'Christian' && affiliation === 'Orthodox') {
    return '☦️'
  }

  return religionIcons[religion] || '🙏'
}

/**
 * Format nationality for display
 */
export function formatNationality(nationality: string): string {
  // Handle multiple citizenships
  if (nationality.includes(',')) {
    const countries = nationality.split(',').map(c => c.trim())
    return countries.join(', ')
  }
  return nationality
}

/**
 * Format religion for display (combines religion + affiliation)
 */
export function formatReligion(religion: string, affiliation?: string): string {
  if (!affiliation || affiliation === 'Not Applicable') {
    return religion
  }

  // Special formatting for certain combinations
  if (religion === 'No Religion') {
    return affiliation // Just show "Atheist", "Agnostic", etc.
  }

  if (religion === 'Christian' || religion === 'Muslim' || religion === 'Jewish') {
    return `${religion} (${affiliation})`
  }

  return religion
}
