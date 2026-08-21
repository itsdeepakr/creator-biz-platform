/**
 * Core platform business constants.
 */

export const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform commission on collaboration amount
export const GST_RATE_PERCENTAGE = 18; // 18% GST applicable on services in India
export const TDS_RATE_PERCENTAGE = 1; // 1% Section 194O TDS on e-commerce creator payouts
export const MAX_REVISIONS_DEFAULT = 2;
export const AUTO_APPROVE_DAYS_DEFAULT = 7;
export const PAYMENT_TIMEOUT_HOURS = 48;
export const DISPUTE_AUTO_CLOSE_DAYS = 14;
export const MAX_DELIVERABLE_FILE_SIZE_MB = 100;
export const MAX_PORTFOLIO_ITEMS = 20;
export const MAX_SERVICES_PER_CREATOR = 10;
export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

export const CREATOR_CATEGORIES = [
  'Fashion & Style',
  'Beauty & Skincare',
  'Tech & Gadgets',
  'Fitness & Health',
  'Food & Culinary',
  'Travel & Lifestyle',
  'Gaming & Esports',
  'Finance & Crypto',
  'Parenting & Family',
  'Education & Career',
  'Entertainment & Comedy',
  'Automobile & Mobility',
  'Art & Photography',
] as const;

export type CreatorCategory = typeof CREATOR_CATEGORIES[number];

export const SUPPORTED_LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Bengali',
  'Gujarati',
  'Punjabi',
  'Odia',
  'Assamese',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
