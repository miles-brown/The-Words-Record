/**
 * Utility functions to get emoji/icon representations for nationality, religion, and profession
 * These are display-only and not stored in the database
 */

/**
 * Get flag emoji for a country name
 */
export function getCountryFlag(country: string): string {
  const countryFlags: { [key: string]: string } = {
    // Major countries
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Portugal': '🇵🇹',
    'Netherlands': '🇳🇱',
    'Belgium': '🇧🇪',
    'Switzerland': '🇨🇭',
    'Austria': '🇦🇹',
    'Sweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Denmark': '🇩🇰',
    'Finland': '🇫🇮',
    'Ireland': '🇮🇪',
    'Poland': '🇵🇱',
    'Greece': '🇬🇷',
    'Turkey': '🇹🇷',
    'Russia': '🇷🇺',
    'Ukraine': '🇺🇦',
    'Israel': '🇮🇱',
    'Palestine': '🇵🇸',
    'Egypt': '🇪🇬',
    'Saudi Arabia': '🇸🇦',
    'United Arab Emirates': '🇦🇪',
    'Jordan': '🇯🇴',
    'Lebanon': '🇱🇧',
    'Syria': '🇸🇾',
    'Iraq': '🇮🇶',
    'Iran': '🇮🇷',
    'Qatar': '🇶🇦',
    'Kuwait': '🇰🇼',
    'Morocco': '🇲🇦',
    'Algeria': '🇩🇿',
    'Tunisia': '🇹🇳',
    'Libya': '🇱🇾',
    'South Africa': '🇿🇦',
    'Nigeria': '🇳🇬',
    'Kenya': '🇰🇪',
    'Ethiopia': '🇪🇹',
    'Ghana': '🇬🇭',
    'China': '🇨🇳',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'India': '🇮🇳',
    'Pakistan': '🇵🇰',
    'Bangladesh': '🇧🇩',
    'Indonesia': '🇮🇩',
    'Malaysia': '🇲🇾',
    'Singapore': '🇸🇬',
    'Thailand': '🇹🇭',
    'Vietnam': '🇻🇳',
    'Philippines': '🇵🇭',
    'Brazil': '🇧🇷',
    'Argentina': '🇦🇷',
    'Mexico': '🇲🇽',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'Peru': '🇵🇪',
    'Venezuela': '🇻🇪',
    'New Zealand': '🇳🇿',
  }

  // Handle dual citizenship (comma-separated)
  if (country.includes(',')) {
    const countries = country.split(',').map(c => c.trim())
    return countries.map(c => countryFlags[c] || '🌍').join(' ')
  }

  return countryFlags[country] || '🌍'
}

/**
 * Get icon emoji for religion
 */
export function getReligionIcon(religion: string): string {
  if (!religion || religion === 'Not publicly disclosed' || religion === 'N/A') {
    return ''
  }

  const religionIcons: { [key: string]: string } = {
    // General religions
    'Jewish': '✡️',
    'Judaism': '✡️',
    'Christian': '✝️',
    'Christianity': '✝️',
    'Catholic': '✝️',
    'Christian (Catholic)': '✝️',
    'Christian (Protestant)': '✝️',
    'Protestant': '✝️',
    'Christian (Orthodox)': '☦️',
    'Orthodox': '☦️',
    'Christian (Anglican)': '✝️',
    'Anglican': '✝️',
    'Muslim': '☪️',
    'Islam': '☪️',
    'Muslim (Sunni)': '☪️',
    'Muslim (Shia)': '☪️',
    'Muslim (Shiite)': '☪️',
    'Hindu': '🕉️',
    'Hinduism': '🕉️',
    'Buddhist': '☸️',
    'Buddhism': '☸️',
    'Sikh': '☬',
    'Sikhism': '☬',
    'Atheist': '🚫',
    'Agnostic': '❓',
    'Secular': '⚛️',
  }

  // Check for partial matches
  for (const [key, icon] of Object.entries(religionIcons)) {
    if (religion.includes(key)) {
      return icon
    }
  }

  return '🙏'
}

/**
 * Get icon emoji for profession
 */
export function getProfessionIcon(profession: string): string {
  if (!profession) return ''

  const professionIcons: { [key: string]: string } = {
    'Politician': '🏛️',
    'Actor': '🎭',
    'Actress': '🎭',
    'Singer': '🎤',
    'Musician': '🎵',
    'Journalist': '📰',
    'News Anchor': '📺',
    'Presenter': '📺',
    'TV Personality': '📺',
    'Activist': '✊',
    'Podcaster': '🎙️',
    'Author': '✍️',
    'Writer': '✍️',
    'Painter': '🎨',
    'Artist': '🎨',
    'Comedian': '😂',
    'Entrepreneur': '💼',
    'Diplomat': '🤝',
    'Judge': '⚖️',
    'Lawyer': '⚖️',
    'Barrister': '⚖️',
    'Model': '👗',
    'Footballer': '⚽',
    'Athlete': '🏃',
    'Director': '🎬',
    'Producer': '🎬',
    'Academic': '🎓',
    'Professor': '🎓',
    'Scientist': '🔬',
    'Doctor': '⚕️',
    'Religious Leader': '⛪',
  }

  // Handle multiple professions (comma-separated)
  if (profession.includes(',')) {
    const professions = profession.split(',').map(p => p.trim())
    // Return icon for the first recognized profession
    for (const prof of professions) {
      for (const [key, icon] of Object.entries(professionIcons)) {
        if (prof.includes(key)) {
          return icon
        }
      }
    }
  }

  // Single profession - check for matches
  for (const [key, icon] of Object.entries(professionIcons)) {
    if (profession.includes(key)) {
      return icon
    }
  }

  return '👤'
}

/**
 * Helper function to display nationality with flag
 */
export function displayNationalityWithFlag(nationality: string): { flag: string; text: string } {
  return {
    flag: getCountryFlag(nationality),
    text: nationality
  }
}

/**
 * Helper function to display religion with icon
 */
export function displayReligionWithIcon(religion: string): { icon: string; text: string } {
  return {
    icon: getReligionIcon(religion),
    text: religion
  }
}

/**
 * Helper function to display profession with icon
 */
export function displayProfessionWithIcon(profession: string): { icon: string; text: string } {
  return {
    icon: getProfessionIcon(profession),
    text: profession
  }
}
