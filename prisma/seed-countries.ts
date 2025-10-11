/**
 * Seed Country table with ISO 3166-1 countries
 * Idempotent: safe to run multiple times
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Core countries we actively use (expandable)
const COUNTRIES = [
  // North America
  { code: 'US', name_en: 'United States', iso3: 'USA', m49: 840, flag_emoji: '🇺🇸' },
  { code: 'CA', name_en: 'Canada', iso3: 'CAN', m49: 124, flag_emoji: '🇨🇦' },
  { code: 'MX', name_en: 'Mexico', iso3: 'MEX', m49: 484, flag_emoji: '🇲🇽' },

  // Western Europe
  { code: 'GB', name_en: 'United Kingdom', iso3: 'GBR', m49: 826, flag_emoji: '🇬🇧' },
  { code: 'FR', name_en: 'France', iso3: 'FRA', m49: 250, flag_emoji: '🇫🇷' },
  { code: 'DE', name_en: 'Germany', iso3: 'DEU', m49: 276, flag_emoji: '🇩🇪' },
  { code: 'IT', name_en: 'Italy', iso3: 'ITA', m49: 380, flag_emoji: '🇮🇹' },
  { code: 'ES', name_en: 'Spain', iso3: 'ESP', m49: 724, flag_emoji: '🇪🇸' },
  { code: 'PT', name_en: 'Portugal', iso3: 'PRT', m49: 620, flag_emoji: '🇵🇹' },
  { code: 'NL', name_en: 'Netherlands', iso3: 'NLD', m49: 528, flag_emoji: '🇳🇱' },
  { code: 'BE', name_en: 'Belgium', iso3: 'BEL', m49: 56, flag_emoji: '🇧🇪' },
  { code: 'AT', name_en: 'Austria', iso3: 'AUT', m49: 40, flag_emoji: '🇦🇹' },
  { code: 'CH', name_en: 'Switzerland', iso3: 'CHE', m49: 756, flag_emoji: '🇨🇭' },
  { code: 'IE', name_en: 'Ireland', iso3: 'IRL', m49: 372, flag_emoji: '🇮🇪' },

  // Northern Europe
  { code: 'SE', name_en: 'Sweden', iso3: 'SWE', m49: 752, flag_emoji: '🇸🇪' },
  { code: 'NO', name_en: 'Norway', iso3: 'NOR', m49: 578, flag_emoji: '🇳🇴' },
  { code: 'DK', name_en: 'Denmark', iso3: 'DNK', m49: 208, flag_emoji: '🇩🇰' },
  { code: 'FI', name_en: 'Finland', iso3: 'FIN', m49: 246, flag_emoji: '🇫🇮' },
  { code: 'IS', name_en: 'Iceland', iso3: 'ISL', m49: 352, flag_emoji: '🇮🇸' },

  // Eastern Europe
  { code: 'PL', name_en: 'Poland', iso3: 'POL', m49: 616, flag_emoji: '🇵🇱' },
  { code: 'CZ', name_en: 'Czech Republic', iso3: 'CZE', m49: 203, flag_emoji: '🇨🇿' },
  { code: 'HU', name_en: 'Hungary', iso3: 'HUN', m49: 348, flag_emoji: '🇭🇺' },
  { code: 'RO', name_en: 'Romania', iso3: 'ROU', m49: 642, flag_emoji: '🇷🇴' },
  { code: 'BG', name_en: 'Bulgaria', iso3: 'BGR', m49: 100, flag_emoji: '🇧🇬' },
  { code: 'SK', name_en: 'Slovakia', iso3: 'SVK', m49: 703, flag_emoji: '🇸🇰' },
  { code: 'HR', name_en: 'Croatia', iso3: 'HRV', m49: 191, flag_emoji: '🇭🇷' },
  { code: 'SI', name_en: 'Slovenia', iso3: 'SVN', m49: 705, flag_emoji: '🇸🇮' },
  { code: 'LT', name_en: 'Lithuania', iso3: 'LTU', m49: 440, flag_emoji: '🇱🇹' },
  { code: 'LV', name_en: 'Latvia', iso3: 'LVA', m49: 428, flag_emoji: '🇱🇻' },
  { code: 'EE', name_en: 'Estonia', iso3: 'EST', m49: 233, flag_emoji: '🇪🇪' },
  { code: 'RU', name_en: 'Russia', iso3: 'RUS', m49: 643, flag_emoji: '🇷🇺' },
  { code: 'UA', name_en: 'Ukraine', iso3: 'UKR', m49: 804, flag_emoji: '🇺🇦' },
  { code: 'BY', name_en: 'Belarus', iso3: 'BLR', m49: 112, flag_emoji: '🇧🇾' },
  { code: 'MD', name_en: 'Moldova', iso3: 'MDA', m49: 498, flag_emoji: '🇲🇩' },

  // Southern Europe & Balkans
  { code: 'GR', name_en: 'Greece', iso3: 'GRC', m49: 300, flag_emoji: '🇬🇷' },
  { code: 'TR', name_en: 'Turkey', iso3: 'TUR', m49: 792, flag_emoji: '🇹🇷' },
  { code: 'RS', name_en: 'Serbia', iso3: 'SRB', m49: 688, flag_emoji: '🇷🇸' },
  { code: 'BA', name_en: 'Bosnia and Herzegovina', iso3: 'BIH', m49: 70, flag_emoji: '🇧🇦' },
  { code: 'AL', name_en: 'Albania', iso3: 'ALB', m49: 8, flag_emoji: '🇦🇱' },

  // Middle East
  { code: 'IL', name_en: 'Israel', iso3: 'ISR', m49: 376, flag_emoji: '🇮🇱' },
  { code: 'PS', name_en: 'Palestine', iso3: 'PSE', m49: 275, flag_emoji: '🇵🇸' },
  { code: 'SA', name_en: 'Saudi Arabia', iso3: 'SAU', m49: 682, flag_emoji: '🇸🇦' },
  { code: 'AE', name_en: 'United Arab Emirates', iso3: 'ARE', m49: 784, flag_emoji: '🇦🇪' },
  { code: 'EG', name_en: 'Egypt', iso3: 'EGY', m49: 818, flag_emoji: '🇪🇬' },
  { code: 'JO', name_en: 'Jordan', iso3: 'JOR', m49: 400, flag_emoji: '🇯🇴' },
  { code: 'LB', name_en: 'Lebanon', iso3: 'LBN', m49: 422, flag_emoji: '🇱🇧' },
  { code: 'SY', name_en: 'Syria', iso3: 'SYR', m49: 760, flag_emoji: '🇸🇾' },
  { code: 'IQ', name_en: 'Iraq', iso3: 'IRQ', m49: 368, flag_emoji: '🇮🇶' },
  { code: 'IR', name_en: 'Iran', iso3: 'IRN', m49: 364, flag_emoji: '🇮🇷' },
  { code: 'YE', name_en: 'Yemen', iso3: 'YEM', m49: 887, flag_emoji: '🇾🇪' },
  { code: 'OM', name_en: 'Oman', iso3: 'OMN', m49: 512, flag_emoji: '🇴🇲' },
  { code: 'KW', name_en: 'Kuwait', iso3: 'KWT', m49: 414, flag_emoji: '🇰🇼' },
  { code: 'BH', name_en: 'Bahrain', iso3: 'BHR', m49: 48, flag_emoji: '🇧🇭' },
  { code: 'QA', name_en: 'Qatar', iso3: 'QAT', m49: 634, flag_emoji: '🇶🇦' },

  // North Africa
  { code: 'MA', name_en: 'Morocco', iso3: 'MAR', m49: 504, flag_emoji: '🇲🇦' },
  { code: 'DZ', name_en: 'Algeria', iso3: 'DZA', m49: 12, flag_emoji: '🇩🇿' },
  { code: 'TN', name_en: 'Tunisia', iso3: 'TUN', m49: 788, flag_emoji: '🇹🇳' },
  { code: 'LY', name_en: 'Libya', iso3: 'LBY', m49: 434, flag_emoji: '🇱🇾' },
  { code: 'SD', name_en: 'Sudan', iso3: 'SDN', m49: 729, flag_emoji: '🇸🇩' },

  // Sub-Saharan Africa
  { code: 'ZA', name_en: 'South Africa', iso3: 'ZAF', m49: 710, flag_emoji: '🇿🇦' },
  { code: 'NG', name_en: 'Nigeria', iso3: 'NGA', m49: 566, flag_emoji: '🇳🇬' },
  { code: 'KE', name_en: 'Kenya', iso3: 'KEN', m49: 404, flag_emoji: '🇰🇪' },
  { code: 'ET', name_en: 'Ethiopia', iso3: 'ETH', m49: 231, flag_emoji: '🇪🇹' },
  { code: 'GH', name_en: 'Ghana', iso3: 'GHA', m49: 288, flag_emoji: '🇬🇭' },
  { code: 'UG', name_en: 'Uganda', iso3: 'UGA', m49: 800, flag_emoji: '🇺🇬' },
  { code: 'TZ', name_en: 'Tanzania', iso3: 'TZA', m49: 834, flag_emoji: '🇹🇿' },
  { code: 'CM', name_en: 'Cameroon', iso3: 'CMR', m49: 120, flag_emoji: '🇨🇲' },
  { code: 'CD', name_en: 'Democratic Republic of the Congo', iso3: 'COD', m49: 180, flag_emoji: '🇨🇩' },
  { code: 'AO', name_en: 'Angola', iso3: 'AGO', m49: 24, flag_emoji: '🇦🇴' },
  { code: 'MZ', name_en: 'Mozambique', iso3: 'MOZ', m49: 508, flag_emoji: '🇲🇿' },

  // East Asia
  { code: 'CN', name_en: 'China', iso3: 'CHN', m49: 156, flag_emoji: '🇨🇳' },
  { code: 'JP', name_en: 'Japan', iso3: 'JPN', m49: 392, flag_emoji: '🇯🇵' },
  { code: 'KR', name_en: 'South Korea', iso3: 'KOR', m49: 410, flag_emoji: '🇰🇷' },
  { code: 'KP', name_en: 'North Korea', iso3: 'PRK', m49: 408, flag_emoji: '🇰🇵' },
  { code: 'TW', name_en: 'Taiwan', iso3: 'TWN', m49: 158, flag_emoji: '🇹🇼' },
  { code: 'HK', name_en: 'Hong Kong', iso3: 'HKG', m49: 344, flag_emoji: '🇭🇰' },

  // South Asia
  { code: 'IN', name_en: 'India', iso3: 'IND', m49: 356, flag_emoji: '🇮🇳' },
  { code: 'PK', name_en: 'Pakistan', iso3: 'PAK', m49: 586, flag_emoji: '🇵🇰' },
  { code: 'BD', name_en: 'Bangladesh', iso3: 'BGD', m49: 50, flag_emoji: '🇧🇩' },
  { code: 'NP', name_en: 'Nepal', iso3: 'NPL', m49: 524, flag_emoji: '🇳🇵' },
  { code: 'LK', name_en: 'Sri Lanka', iso3: 'LKA', m49: 144, flag_emoji: '🇱🇰' },
  { code: 'AF', name_en: 'Afghanistan', iso3: 'AFG', m49: 4, flag_emoji: '🇦🇫' },

  // Southeast Asia
  { code: 'TH', name_en: 'Thailand', iso3: 'THA', m49: 764, flag_emoji: '🇹🇭' },
  { code: 'VN', name_en: 'Vietnam', iso3: 'VNM', m49: 704, flag_emoji: '🇻🇳' },
  { code: 'PH', name_en: 'Philippines', iso3: 'PHL', m49: 608, flag_emoji: '🇵🇭' },
  { code: 'ID', name_en: 'Indonesia', iso3: 'IDN', m49: 360, flag_emoji: '🇮🇩' },
  { code: 'MY', name_en: 'Malaysia', iso3: 'MYS', m49: 458, flag_emoji: '🇲🇾' },
  { code: 'SG', name_en: 'Singapore', iso3: 'SGP', m49: 702, flag_emoji: '🇸🇬' },
  { code: 'MM', name_en: 'Myanmar', iso3: 'MMR', m49: 104, flag_emoji: '🇲🇲' },
  { code: 'KH', name_en: 'Cambodia', iso3: 'KHM', m49: 116, flag_emoji: '🇰🇭' },
  { code: 'LA', name_en: 'Laos', iso3: 'LAO', m49: 418, flag_emoji: '🇱🇦' },

  // Oceania
  { code: 'AU', name_en: 'Australia', iso3: 'AUS', m49: 36, flag_emoji: '🇦🇺' },
  { code: 'NZ', name_en: 'New Zealand', iso3: 'NZL', m49: 554, flag_emoji: '🇳🇿' },
  { code: 'FJ', name_en: 'Fiji', iso3: 'FJI', m49: 242, flag_emoji: '🇫🇯' },
  { code: 'PG', name_en: 'Papua New Guinea', iso3: 'PNG', m49: 598, flag_emoji: '🇵🇬' },

  // Central & South America
  { code: 'BR', name_en: 'Brazil', iso3: 'BRA', m49: 76, flag_emoji: '🇧🇷' },
  { code: 'AR', name_en: 'Argentina', iso3: 'ARG', m49: 32, flag_emoji: '🇦🇷' },
  { code: 'CL', name_en: 'Chile', iso3: 'CHL', m49: 152, flag_emoji: '🇨🇱' },
  { code: 'CO', name_en: 'Colombia', iso3: 'COL', m49: 170, flag_emoji: '🇨🇴' },
  { code: 'PE', name_en: 'Peru', iso3: 'PER', m49: 604, flag_emoji: '🇵🇪' },
  { code: 'VE', name_en: 'Venezuela', iso3: 'VEN', m49: 862, flag_emoji: '🇻🇪' },
  { code: 'EC', name_en: 'Ecuador', iso3: 'ECU', m49: 218, flag_emoji: '🇪🇨' },
  { code: 'BO', name_en: 'Bolivia', iso3: 'BOL', m49: 68, flag_emoji: '🇧🇴' },
  { code: 'PY', name_en: 'Paraguay', iso3: 'PRY', m49: 600, flag_emoji: '🇵🇾' },
  { code: 'UY', name_en: 'Uruguay', iso3: 'URY', m49: 858, flag_emoji: '🇺🇾' },
  { code: 'CU', name_en: 'Cuba', iso3: 'CUB', m49: 192, flag_emoji: '🇨🇺' },
  { code: 'DO', name_en: 'Dominican Republic', iso3: 'DOM', m49: 214, flag_emoji: '🇩🇴' },
  { code: 'GT', name_en: 'Guatemala', iso3: 'GTM', m49: 320, flag_emoji: '🇬🇹' },
  { code: 'HN', name_en: 'Honduras', iso3: 'HND', m49: 340, flag_emoji: '🇭🇳' },
  { code: 'NI', name_en: 'Nicaragua', iso3: 'NIC', m49: 558, flag_emoji: '🇳🇮' },
  { code: 'CR', name_en: 'Costa Rica', iso3: 'CRI', m49: 188, flag_emoji: '🇨🇷' },
  { code: 'PA', name_en: 'Panama', iso3: 'PAN', m49: 591, flag_emoji: '🇵🇦' },

  // Special/Edge cases
  { code: 'XX', name_en: 'Stateless', iso3: null, m49: null, flag_emoji: '🏴' },
]

async function seedCountries() {
  console.log('🌍 Seeding Country table...\n')

  let created = 0
  let updated = 0
  let skipped = 0

  for (const country of COUNTRIES) {
    try {
      const existing = await prisma.country.findUnique({
        where: { code: country.code },
      })

      if (existing) {
        // Update if name/data changed
        if (existing.name_en !== country.name_en || existing.flag_emoji !== country.flag_emoji) {
          await prisma.country.update({
            where: { code: country.code },
            data: country,
          })
          console.log(`  ✏️  Updated: ${country.code} - ${country.name_en}`)
          updated++
        } else {
          skipped++
        }
      } else {
        await prisma.country.create({
          data: country,
        })
        console.log(`  ✅ Created: ${country.code} - ${country.name_en}`)
        created++
      }
    } catch (error) {
      console.error(`  ❌ Error with ${country.code}:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Created: ${created}`)
  console.log(`✏️  Updated: ${updated}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log(`📊 Total: ${COUNTRIES.length}`)
  console.log('='.repeat(60) + '\n')
}

seedCountries()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
