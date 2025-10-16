// Dynamic Person Field Schema Configuration
// This schema drives the automatic form generation in the admin dashboard

export type FieldType = 'text' | 'textarea' | 'email' | 'url' | 'number' | 'date' | 'select' | 'checkbox' | 'array'

export interface FieldSchema {
  name: string
  label: string
  type: FieldType
  category: string
  required?: boolean
  placeholder?: string
  helpText?: string
  maxLength?: number
  rows?: number
  options?: { value: string; label: string }[]
  min?: number | string
  max?: number | string
  step?: number
  showCharCount?: boolean
  disabled?: boolean
  defaultValue?: any
}

// Field categories for organizing the edit form
export const FIELD_CATEGORIES = {
  identifiers: 'Identifiers',
  basicInfo: 'Basic Information',
  biographical: 'Biography',
  demographics: 'Demographics',
  nationality: 'Nationality & Ethnicity',
  professional: 'Professional',
  currentPosition: 'Current Position',
  education: 'Education',
  publicProfile: 'Public Profile',
  influence: 'Influence & Reach',
  socialMedia: 'Social Media',
  mediaPresence: 'Media Presence',
  political: 'Political',
  relationships: 'Relationships',
  religion: 'Religion',
  controversy: 'Controversy & Reputation',
  legal: 'Legal',
  statistics: 'Statistics',
  activityTracking: 'Activity Tracking',
  verification: 'Verification',
  location: 'Location',
  contact: 'Contact',
  flags: 'Status Flags',
  notes: 'Notes',
  metadata: 'Metadata'
} as const

// Complete field definitions for all 182 Person fields
export const PERSON_FIELDS: FieldSchema[] = [
  // === IDENTIFIERS ===
  {
    name: 'id',
    label: 'ID',
    type: 'text',
    category: 'identifiers',
    disabled: true,
    helpText: 'Auto-generated unique identifier'
  },
  {
    name: 'slug',
    label: 'URL Slug',
    type: 'text',
    category: 'identifiers',
    required: true,
    placeholder: 'john-doe',
    helpText: 'Lowercase letters, numbers, and hyphens only'
  },

  // === BASIC INFORMATION ===
  {
    name: 'name',
    label: 'Display Name (Legacy)',
    type: 'text',
    category: 'basicInfo',
    helpText: 'Computed from first + last name'
  },
  {
    name: 'fullName',
    label: 'Full Name',
    type: 'text',
    category: 'basicInfo',
    helpText: 'Complete formatted name'
  },
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    category: 'basicInfo',
    required: true,
    placeholder: 'John'
  },
  {
    name: 'middleName',
    label: 'Middle Name',
    type: 'text',
    category: 'basicInfo',
    placeholder: 'Michael'
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    category: 'basicInfo',
    required: true,
    placeholder: 'Doe'
  },
  {
    name: 'namePrefix',
    label: 'Name Prefix',
    type: 'text',
    category: 'basicInfo',
    placeholder: 'Dr., Prof., Hon., etc.'
  },
  {
    name: 'nameSuffix',
    label: 'Name Suffix',
    type: 'text',
    category: 'basicInfo',
    placeholder: 'Jr., Sr., III, PhD, etc.'
  },
  {
    name: 'aliases',
    label: 'Aliases / AKA Names',
    type: 'array',
    category: 'basicInfo',
    helpText: 'Alternative names this person is known by'
  },
  {
    name: 'hebrewName',
    label: 'Hebrew Name',
    type: 'text',
    category: 'basicInfo',
    placeholder: 'Name in Hebrew script'
  },
  {
    name: 'arabicName',
    label: 'Arabic Name',
    type: 'text',
    category: 'basicInfo',
    placeholder: 'Name in Arabic script'
  },
  {
    name: 'nativeName',
    label: 'Native Name',
    type: 'text',
    category: 'basicInfo',
    placeholder: 'Name in native language/script'
  },
  {
    name: 'imageUrl',
    label: 'Profile Image URL',
    type: 'url',
    category: 'basicInfo',
    placeholder: 'https://example.com/image.jpg'
  },

  // === BIOGRAPHICAL ===
  {
    name: 'bio',
    label: 'Biography',
    type: 'textarea',
    category: 'biographical',
    rows: 6,
    placeholder: 'Detailed biography...'
  },
  {
    name: 'shortBio',
    label: 'Short Bio',
    type: 'textarea',
    category: 'biographical',
    rows: 2,
    maxLength: 500,
    showCharCount: true,
    placeholder: 'Brief one-line description (max 500 characters)'
  },
  {
    name: 'background',
    label: 'Background',
    type: 'textarea',
    category: 'biographical',
    rows: 4,
    placeholder: 'Background information'
  },
  {
    name: 'bestKnownFor',
    label: 'Best Known For',
    type: 'text',
    category: 'biographical',
    placeholder: 'e.g., Author of..., Former President of...'
  },
  {
    name: 'notableFor',
    label: 'Notable Achievements',
    type: 'array',
    category: 'biographical',
    helpText: 'List of notable achievements or accomplishments'
  },
  {
    name: 'awards',
    label: 'Awards',
    type: 'array',
    category: 'biographical',
    helpText: 'Awards and honors received'
  },
  {
    name: 'publications',
    label: 'Publications',
    type: 'array',
    category: 'biographical',
    helpText: 'Books, papers, or major publications'
  },

  // === DEMOGRAPHICS ===
  {
    name: 'birthDate',
    label: 'Birth Date (Legacy)',
    type: 'date',
    category: 'demographics',
    helpText: 'Use dateOfBirth instead'
  },
  {
    name: 'dateOfBirth',
    label: 'Date of Birth',
    type: 'date',
    category: 'demographics'
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    category: 'demographics',
    min: 0,
    max: 150,
    helpText: 'Calculated from birth date'
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    category: 'demographics',
    options: [
      { value: 'MALE', label: 'Male' },
      { value: 'FEMALE', label: 'Female' },
      { value: 'NON_BINARY', label: 'Non-Binary' },
      { value: 'OTHER', label: 'Other' },
      { value: 'UNKNOWN', label: 'Unknown' }
    ]
  },
  {
    name: 'birthPlace',
    label: 'Birth Place',
    type: 'text',
    category: 'demographics',
    placeholder: 'e.g., Boston, MA, USA'
  },
  {
    name: 'deathDate',
    label: 'Death Date (Legacy)',
    type: 'date',
    category: 'demographics',
    helpText: 'Use deceasedDate instead'
  },
  {
    name: 'deceasedDate',
    label: 'Date of Death',
    type: 'date',
    category: 'demographics'
  },
  {
    name: 'deathPlace',
    label: 'Death Place',
    type: 'text',
    category: 'demographics',
    placeholder: 'e.g., Los Angeles, CA, USA'
  },
  {
    name: 'deathCause',
    label: 'Cause of Death',
    type: 'text',
    category: 'demographics',
    placeholder: 'Cause of death if known'
  },
  {
    name: 'lastDeathCheck',
    label: 'Last Death Status Check',
    type: 'date',
    category: 'demographics',
    helpText: 'Last time death status was verified'
  },
  {
    name: 'isDeceased',
    label: 'Is Deceased',
    type: 'checkbox',
    category: 'demographics'
  },

  // === NATIONALITY & ETHNICITY ===
  {
    name: 'nationality',
    label: 'Nationality (Legacy Text)',
    type: 'text',
    category: 'nationality',
    placeholder: 'e.g., American, British',
    helpText: 'Use nationalities relation instead'
  },
  {
    name: 'nationalityDetail',
    label: 'Nationality Detail (Legacy)',
    type: 'text',
    category: 'nationality',
    helpText: 'Use nationalities relation instead'
  },
  {
    name: 'racialGroup',
    label: 'Racial Group',
    type: 'text',
    category: 'nationality',
    placeholder: 'Racial/ethnic identification'
  },
  {
    name: 'ethnicity',
    label: 'Ethnic Backgrounds',
    type: 'array',
    category: 'nationality',
    helpText: 'List of ethnic backgrounds'
  },

  // === PROFESSIONAL ===
  {
    name: 'profession',
    label: 'Profession (Legacy)',
    type: 'select',
    category: 'professional',
    options: [
      { value: 'POLITICIAN', label: 'Politician' },
      { value: 'JOURNALIST', label: 'Journalist' },
      { value: 'ACADEMIC', label: 'Academic' },
      { value: 'ACTIVIST', label: 'Activist' },
      { value: 'BUSINESS', label: 'Business' },
      { value: 'CELEBRITY', label: 'Celebrity' },
      { value: 'RELIGIOUS', label: 'Religious' },
      { value: 'MILITARY', label: 'Military' },
      { value: 'LEGAL', label: 'Legal' },
      { value: 'MEDICAL', label: 'Medical' },
      { value: 'ARTIST', label: 'Artist' },
      { value: 'ATHLETE', label: 'Athlete' },
      { value: 'OTHER', label: 'Other' }
    ],
    defaultValue: 'OTHER'
  },
  {
    name: 'professionDetail',
    label: 'Profession Detail (Legacy)',
    type: 'text',
    category: 'professional',
    placeholder: 'e.g., U.S. Senator, CEO'
  },
  {
    name: 'professionDetails',
    label: 'Profession Details',
    type: 'text',
    category: 'professional',
    placeholder: 'Additional profession details'
  },
  {
    name: 'industry',
    label: 'Industry',
    type: 'select',
    category: 'professional',
    options: [
      { value: 'POLITICS_GOVERNMENT', label: 'Politics/Government' },
      { value: 'MEDIA_JOURNALISM', label: 'Media/Journalism' },
      { value: 'EDUCATION_ACADEMIA', label: 'Education/Academia' },
      { value: 'LAW_LEGAL', label: 'Law/Legal' },
      { value: 'BUSINESS_FINANCE', label: 'Business/Finance' },
      { value: 'TECHNOLOGY', label: 'Technology' },
      { value: 'HEALTHCARE', label: 'Healthcare' },
      { value: 'ENTERTAINMENT', label: 'Entertainment' },
      { value: 'SPORTS', label: 'Sports' },
      { value: 'NONPROFIT_NGO', label: 'Nonprofit/NGO' },
      { value: 'RELIGION', label: 'Religion' },
      { value: 'MILITARY_DEFENSE', label: 'Military/Defense' },
      { value: 'OTHER', label: 'Other' }
    ]
  },
  {
    name: 'specialization',
    label: 'Specialization',
    type: 'text',
    category: 'professional',
    placeholder: 'Area of specialization'
  },
  {
    name: 'yearsActive',
    label: 'Years Active',
    type: 'text',
    category: 'professional',
    placeholder: 'e.g., 2005-present, 1990-2020'
  },
  {
    name: 'yearsExperience',
    label: 'Years of Experience',
    type: 'number',
    category: 'professional',
    min: 0,
    placeholder: 'Number of years'
  },
  {
    name: 'roleDescription',
    label: 'Role Description',
    type: 'text',
    category: 'professional',
    placeholder: 'Brief description of role'
  },

  // === CURRENT POSITION ===
  {
    name: 'currentTitle',
    label: 'Current Title',
    type: 'text',
    category: 'currentPosition',
    placeholder: 'e.g., Chief Executive Officer'
  },
  {
    name: 'currentOrganization',
    label: 'Current Organization',
    type: 'text',
    category: 'currentPosition',
    placeholder: 'e.g., Acme Corporation'
  },
  {
    name: 'currentOrgId',
    label: 'Current Organization ID',
    type: 'text',
    category: 'currentPosition',
    helpText: 'Foreign key to Organization table'
  },
  {
    name: 'employmentStatus',
    label: 'Employment Status',
    type: 'select',
    category: 'currentPosition',
    options: [
      { value: 'FULL_TIME', label: 'Full Time' },
      { value: 'PART_TIME', label: 'Part Time' },
      { value: 'CONTRACT', label: 'Contract' },
      { value: 'FREELANCE', label: 'Freelance' },
      { value: 'PER_DIEM', label: 'Per Diem' },
      { value: 'SEASONAL', label: 'Seasonal' },
      { value: 'TEMPORARY', label: 'Temporary' }
    ]
  },
  {
    name: 'isRetired',
    label: 'Is Retired',
    type: 'checkbox',
    category: 'currentPosition'
  },
  {
    name: 'retirementDate',
    label: 'Retirement Date',
    type: 'date',
    category: 'currentPosition'
  },

  // === EDUCATION ===
  {
    name: 'educationLevel',
    label: 'Education Level',
    type: 'select',
    category: 'education',
    options: [
      { value: 'HIGH_SCHOOL', label: 'High School' },
      { value: 'SOME_COLLEGE', label: 'Some College' },
      { value: 'BACHELORS', label: 'Bachelors' },
      { value: 'MASTERS', label: 'Masters' },
      { value: 'DOCTORATE', label: 'Doctorate' },
      { value: 'PROFESSIONAL', label: 'Professional' },
      { value: 'OTHER', label: 'Other' }
    ]
  },
  {
    name: 'degrees',
    label: 'Degrees',
    type: 'array',
    category: 'education',
    helpText: 'List of degrees earned (e.g., BA, MA, PhD)'
  },
  {
    name: 'universities',
    label: 'Universities',
    type: 'array',
    category: 'education',
    helpText: 'Universities attended'
  },
  {
    name: 'academicTitles',
    label: 'Academic Titles',
    type: 'array',
    category: 'education',
    helpText: 'Academic honors and titles'
  },

  // === PUBLIC PROFILE ===
  {
    name: 'publicFigure',
    label: 'Public Figure',
    type: 'checkbox',
    category: 'publicProfile',
    helpText: 'Whether this person is a public figure'
  },
  {
    name: 'celebrityStatus',
    label: 'Celebrity Status',
    type: 'select',
    category: 'publicProfile',
    options: [
      { value: 'A_LIST', label: 'A-List' },
      { value: 'B_LIST', label: 'B-List' },
      { value: 'NOTABLE', label: 'Notable' },
      { value: 'NICHE_FAMOUS', label: 'Niche Famous' },
      { value: 'INTERNET_FAMOUS', label: 'Internet Famous' },
      { value: 'LOCAL_CELEBRITY', label: 'Local Celebrity' }
    ]
  },

  // === INFLUENCE & REACH ===
  {
    name: 'influenceScore',
    label: 'Influence Score',
    type: 'number',
    category: 'influence',
    min: 0,
    max: 100,
    step: 0.1,
    helpText: 'Computed influence score (0-100)'
  },
  {
    name: 'influenceLevel',
    label: 'Influence Level',
    type: 'select',
    category: 'influence',
    options: [
      { value: 'GLOBAL', label: 'Global' },
      { value: 'INTERNATIONAL', label: 'International' },
      { value: 'NATIONAL', label: 'National' },
      { value: 'REGIONAL', label: 'Regional' },
      { value: 'LOCAL', label: 'Local' },
      { value: 'NICHE', label: 'Niche' }
    ]
  },

  // === SOCIAL MEDIA (continued from above) ===
  {
    name: 'hasTwitter',
    label: 'Has Twitter/X',
    type: 'checkbox',
    category: 'socialMedia'
  },
  {
    name: 'twitterHandle',
    label: 'Twitter Handle',
    type: 'text',
    category: 'socialMedia',
    placeholder: '@username'
  },
  {
    name: 'twitterFollowers',
    label: 'Twitter Followers',
    type: 'number',
    category: 'socialMedia',
    min: 0
  },
  {
    name: 'twitterVerified',
    label: 'Twitter Verified',
    type: 'checkbox',
    category: 'socialMedia'
  },
  {
    name: 'hasLinkedIn',
    label: 'Has LinkedIn',
    type: 'checkbox',
    category: 'socialMedia'
  },
  {
    name: 'linkedInUrl',
    label: 'LinkedIn URL',
    type: 'url',
    category: 'socialMedia',
    placeholder: 'https://linkedin.com/in/username'
  },
  {
    name: 'linkedInConnections',
    label: 'LinkedIn Connections',
    type: 'number',
    category: 'socialMedia',
    min: 0
  },
  {
    name: 'linkedInVerified',
    label: 'LinkedIn Verified',
    type: 'checkbox',
    category: 'socialMedia'
  },
  {
    name: 'hasFacebook',
    label: 'Has Facebook',
    type: 'checkbox',
    category: 'socialMedia'
  },
  {
    name: 'facebookUrl',
    label: 'Facebook URL',
    type: 'url',
    category: 'socialMedia',
    placeholder: 'https://facebook.com/username'
  },
  {
    name: 'facebookFollowers',
    label: 'Facebook Followers',
    type: 'number',
    category: 'socialMedia',
    min: 0
  },
  {
    name: 'hasInstagram',
    label: 'Has Instagram',
    type: 'checkbox',
    category: 'socialMedia'
  },
  {
    name: 'instagramHandle',
    label: 'Instagram Handle',
    type: 'text',
    category: 'socialMedia',
    placeholder: '@username'
  },
  {
    name: 'instagramFollowers',
    label: 'Instagram Followers',
    type: 'number',
    category: 'socialMedia',
    min: 0
  },
  {
    name: 'totalSocialReach',
    label: 'Total Social Reach',
    type: 'number',
    category: 'socialMedia',
    min: 0,
    helpText: 'Combined follower count across all platforms'
  },

  // === MEDIA PRESENCE ===
  {
    name: 'mediaAppearances',
    label: 'Media Appearances',
    type: 'number',
    category: 'mediaPresence',
    min: 0,
    defaultValue: 0
  },
  {
    name: 'citationCount',
    label: 'Citation Count',
    type: 'number',
    category: 'mediaPresence',
    min: 0,
    defaultValue: 0
  },

  // === POLITICAL ===
  {
    name: 'politicalParty',
    label: 'Political Party',
    type: 'text',
    category: 'political',
    placeholder: 'e.g., Democratic Party, Republican Party'
  },
  {
    name: 'politicalBeliefs',
    label: 'Political Beliefs',
    type: 'text',
    category: 'political',
    placeholder: 'e.g., Progressive, Conservative'
  },
  {
    name: 'knownPositions',
    label: 'Known Political Positions',
    type: 'array',
    category: 'political',
    helpText: 'Specific political stances and positions'
  },
  {
    name: 'advocacy',
    label: 'Advocacy Causes',
    type: 'array',
    category: 'political',
    helpText: 'Causes and issues advocated for'
  },
  {
    name: 'isPolitician',
    label: 'Is Politician',
    type: 'checkbox',
    category: 'political'
  },
  {
    name: 'isActivist',
    label: 'Is Activist',
    type: 'checkbox',
    category: 'political'
  },
  {
    name: 'isLobbyist',
    label: 'Is Lobbyist',
    type: 'checkbox',
    category: 'political'
  },

  // === RELATIONSHIPS ===
  {
    name: 'boardPositions',
    label: 'Board Positions',
    type: 'number',
    category: 'relationships',
    min: 0,
    defaultValue: 0,
    helpText: 'Number of board positions held'
  },

  // === RELIGION ===
  {
    name: 'religion',
    label: 'Religion',
    type: 'text',
    category: 'religion',
    placeholder: 'e.g., Christianity, Judaism, Islam'
  },
  {
    name: 'religionDenomination',
    label: 'Religious Denomination',
    type: 'text',
    category: 'religion',
    placeholder: 'e.g., Catholic, Methodist, Sunni'
  },

  // === CONTROVERSY & REPUTATION ===
  {
    name: 'hasControversies',
    label: 'Has Controversies',
    type: 'checkbox',
    category: 'controversy'
  },
  {
    name: 'controversyScore',
    label: 'Controversy Score',
    type: 'number',
    category: 'controversy',
    min: 0,
    max: 100,
    step: 0.1
  },
  {
    name: 'controversyNotes',
    label: 'Controversy Notes',
    type: 'textarea',
    category: 'controversy',
    rows: 3
  },
  {
    name: 'reputationNotes',
    label: 'Reputation Notes',
    type: 'textarea',
    category: 'controversy',
    rows: 3
  },
  {
    name: 'hasBeenCancelled',
    label: 'Has Been Cancelled',
    type: 'checkbox',
    category: 'controversy'
  },
  {
    name: 'cancelledDate',
    label: 'Cancellation Date',
    type: 'date',
    category: 'controversy'
  },
  {
    name: 'cancelledReason',
    label: 'Cancellation Reason',
    type: 'text',
    category: 'controversy'
  },
  {
    name: 'hasBeenSuspended',
    label: 'Has Been Suspended',
    type: 'checkbox',
    category: 'controversy'
  },
  {
    name: 'hasBeenFired',
    label: 'Has Been Fired',
    type: 'checkbox',
    category: 'controversy'
  },
  {
    name: 'hasResigned',
    label: 'Has Resigned',
    type: 'checkbox',
    category: 'controversy'
  },

  // === LEGAL ===
  {
    name: 'hasLegalIssues',
    label: 'Has Legal Issues',
    type: 'checkbox',
    category: 'legal'
  },
  {
    name: 'legalIssueNotes',
    label: 'Legal Issue Notes',
    type: 'textarea',
    category: 'legal',
    rows: 3
  },
  {
    name: 'underInvestigation',
    label: 'Under Investigation',
    type: 'checkbox',
    category: 'legal'
  },
  {
    name: 'investigationType',
    label: 'Investigation Type',
    type: 'text',
    category: 'legal'
  },
  {
    name: 'hasSanctions',
    label: 'Has Sanctions',
    type: 'checkbox',
    category: 'legal'
  },
  {
    name: 'sanctionDetails',
    label: 'Sanction Details',
    type: 'textarea',
    category: 'legal',
    rows: 3
  },
  {
    name: 'hasCriminalRecord',
    label: 'Has Criminal Record',
    type: 'checkbox',
    category: 'legal'
  },
  {
    name: 'criminalNotes',
    label: 'Criminal Record Notes',
    type: 'textarea',
    category: 'legal',
    rows: 3
  },

  // === STATISTICS ===
  {
    name: 'statementCount',
    label: 'Statement Count',
    type: 'number',
    category: 'statistics',
    min: 0,
    defaultValue: 0,
    disabled: true,
    helpText: 'Auto-calculated'
  },
  {
    name: 'incidentCount',
    label: 'Incident Count (Legacy)',
    type: 'number',
    category: 'statistics',
    min: 0,
    defaultValue: 0,
    disabled: true
  },
  {
    name: 'caseCount',
    label: 'Case Count',
    type: 'number',
    category: 'statistics',
    min: 0,
    disabled: true
  },
  {
    name: 'responseCount',
    label: 'Response Count',
    type: 'number',
    category: 'statistics',
    min: 0,
    disabled: true
  },
  {
    name: 'sourceCount',
    label: 'Source Count',
    type: 'number',
    category: 'statistics',
    min: 0,
    disabled: true
  },
  {
    name: 'criticismsMade',
    label: 'Criticisms Made',
    type: 'number',
    category: 'statistics',
    min: 0,
    disabled: true
  },
  {
    name: 'criticismsReceived',
    label: 'Criticisms Received',
    type: 'number',
    category: 'statistics',
    min: 0,
    disabled: true
  },
  {
    name: 'supportGiven',
    label: 'Support Given',
    type: 'number',
    category: 'statistics',
    min: 0,
    disabled: true
  },
  {
    name: 'supportReceived',
    label: 'Support Received',
    type: 'number',
    category: 'statistics',
    min: 0,
    disabled: true
  },

  // === ACTIVITY TRACKING ===
  {
    name: 'firstActivityDate',
    label: 'First Activity Date',
    type: 'date',
    category: 'activityTracking',
    disabled: true
  },
  {
    name: 'lastActiveDate',
    label: 'Last Active Date (Legacy)',
    type: 'date',
    category: 'activityTracking',
    disabled: true
  },
  {
    name: 'lastActivityDate',
    label: 'Last Activity Date',
    type: 'date',
    category: 'activityTracking',
    disabled: true
  },
  {
    name: 'mostActiveYear',
    label: 'Most Active Year',
    type: 'number',
    category: 'activityTracking',
    min: 1900,
    max: 2100,
    disabled: true
  },

  // === VERIFICATION ===
  {
    name: 'isVerified',
    label: 'Is Verified',
    type: 'checkbox',
    category: 'verification'
  },
  {
    name: 'verificationDate',
    label: 'Verification Date',
    type: 'date',
    category: 'verification'
  },
  {
    name: 'verificationNotes',
    label: 'Verification Notes',
    type: 'textarea',
    category: 'verification',
    rows: 2
  },
  {
    name: 'wikipediaUrl',
    label: 'Wikipedia URL',
    type: 'url',
    category: 'verification',
    placeholder: 'https://en.wikipedia.org/wiki/...'
  },
  {
    name: 'officialWebsite',
    label: 'Official Website',
    type: 'url',
    category: 'verification',
    placeholder: 'https://example.com'
  },

  // === LOCATION ===
  {
    name: 'residence',
    label: 'Residence (Legacy Text)',
    type: 'text',
    category: 'location',
    placeholder: 'e.g., New York, NY'
  },
  {
    name: 'residenceCountry',
    label: 'Residence Country',
    type: 'text',
    category: 'location'
  },
  {
    name: 'residenceState',
    label: 'Residence State/Province',
    type: 'text',
    category: 'location'
  },
  {
    name: 'residenceCity',
    label: 'Residence City',
    type: 'text',
    category: 'location'
  },
  {
    name: 'workCountry',
    label: 'Work Country',
    type: 'text',
    category: 'location'
  },
  {
    name: 'workCity',
    label: 'Work City',
    type: 'text',
    category: 'location'
  },

  // === CONTACT ===
  {
    name: 'publicEmail',
    label: 'Public Email',
    type: 'email',
    category: 'contact',
    placeholder: 'public@example.com'
  },
  {
    name: 'agentEmail',
    label: 'Agent Email',
    type: 'email',
    category: 'contact',
    placeholder: 'agent@example.com'
  },
  {
    name: 'pressContact',
    label: 'Press Contact',
    type: 'text',
    category: 'contact',
    placeholder: 'press@example.com or phone'
  },

  // === STATUS FLAGS ===
  {
    name: 'isActive',
    label: 'Is Active',
    type: 'checkbox',
    category: 'flags',
    helpText: 'Whether this person record is active'
  },
  {
    name: 'isBlocked',
    label: 'Is Blocked',
    type: 'checkbox',
    category: 'flags',
    helpText: 'Blocked from platform'
  },
  {
    name: 'isPEP',
    label: 'Is Politically Exposed Person (PEP)',
    type: 'checkbox',
    category: 'flags'
  },
  {
    name: 'isHighProfile',
    label: 'Is High Profile',
    type: 'checkbox',
    category: 'flags'
  },

  // === NOTES ===
  {
    name: 'publicNotes',
    label: 'Public Notes',
    type: 'textarea',
    category: 'notes',
    rows: 3,
    helpText: 'Notes visible to public'
  },
  {
    name: 'internalNotes',
    label: 'Internal Notes',
    type: 'textarea',
    category: 'notes',
    rows: 3,
    helpText: 'Staff-only notes'
  },
  {
    name: 'researchNotes',
    label: 'Research Notes',
    type: 'textarea',
    category: 'notes',
    rows: 3
  },
  {
    name: 'editorialNotes',
    label: 'Editorial Notes',
    type: 'textarea',
    category: 'notes',
    rows: 3
  },

  // === METADATA ===
  {
    name: 'createdAt',
    label: 'Created At',
    type: 'text',
    category: 'metadata',
    disabled: true
  },
  {
    name: 'updatedAt',
    label: 'Updated At',
    type: 'text',
    category: 'metadata',
    disabled: true
  },
  {
    name: 'createdBy',
    label: 'Created By',
    type: 'text',
    category: 'metadata'
  },
  {
    name: 'lastEditedBy',
    label: 'Last Edited By',
    type: 'text',
    category: 'metadata'
  },
  {
    name: 'dataSource',
    label: 'Data Source',
    type: 'text',
    category: 'metadata'
  },
  {
    name: 'importSource',
    label: 'Import Source',
    type: 'text',
    category: 'metadata'
  },
  {
    name: 'lastReviewDate',
    label: 'Last Review Date',
    type: 'date',
    category: 'metadata'
  },
  {
    name: 'needsReview',
    label: 'Needs Review',
    type: 'checkbox',
    category: 'metadata'
  }
]

// Export helper function to get fields by category
export function getFieldsByCategory(category: keyof typeof FIELD_CATEGORIES): FieldSchema[] {
  return PERSON_FIELDS.filter(field => field.category === category)
}

// Export helper to get all categories with their fields
export function getAllFieldsByCategory(): Record<string, FieldSchema[]> {
  const result: Record<string, FieldSchema[]> = {}
  Object.keys(FIELD_CATEGORIES).forEach(category => {
    result[category] = getFieldsByCategory(category as keyof typeof FIELD_CATEGORIES)
  })
  return result
}

// Get all editable fields (non-disabled)
export function getEditableFields(): FieldSchema[] {
  return PERSON_FIELDS.filter(field => !field.disabled)
}

// Get field by name
export function getFieldByName(name: string): FieldSchema | undefined {
  return PERSON_FIELDS.find(field => field.name === name)
}
