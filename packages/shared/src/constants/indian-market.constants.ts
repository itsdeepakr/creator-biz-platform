/**
 * Indian Market Validation Patterns and Metadata
 */

// Permanent Account Number (PAN): 5 letters, 4 digits, 1 letter
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Goods and Services Tax Identification Number (GSTIN): 2 digits state code, 10 char PAN, 1 entity digit, 'Z', 1 check digit
export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Indian Financial System Code (IFSC): 4 alpha, 0, 6 alpha/numeric
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Indian 10-digit mobile phone number (with optional +91 or 0 prefix)
export const INDIAN_PHONE_REGEX = /^(?:\+91|91|0)?[6-9]\d{9}$/;

// Indian 6-digit postal PIN code
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// Aadhaar 12-digit number (masked or unmasked format)
export const AADHAAR_REGEX = /^\d{4}\s?\d{4}\s?\d{4}$/;

export const INDIAN_MAJOR_CITIES = [
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Patna',
  'Vadodara',
  'Ghaziabad',
  'Ludhiana',
  'Agra',
  'Nashik',
  'Faridabad',
  'Coimbatore',
  'Kochi',
  'Chandigarh',
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
] as const;
