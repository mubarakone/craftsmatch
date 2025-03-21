export type ShippingZone = 'domestic' | 'international_1' | 'international_2' | 'international_3';

export interface CountryZoneMapping {
  [countryCode: string]: ShippingZone;
}

export interface ShippingRate {
  baseRate: number;
  perKgRate: number;
}

export interface ShippingMethodTiming {
  minDays: number;
  maxDays: number;
}

// Country groups by zone
export const countryGroups: Record<ShippingZone, string[]> = {
  domestic: [], // This is determined dynamically based on seller's country
  international_1: [
    'US', 'USA', 'CA', 'CAN', 'MX', 'MEX', // North America
  ],
  international_2: [
    // Europe
    'GB', 'UK', 'DE', 'FR', 'IT', 'ES', 'PT', 'NL', 'BE', 'LU', 
    'CH', 'AT', 'DK', 'SE', 'NO', 'FI', 'IE', 'IS', 'PL', 'CZ',
    // Australia & New Zealand
    'AU', 'AUS', 'NZ', 'NZL',
  ],
  international_3: [
    // Rest of the world is handled as default
  ],
};

// Default shipping rates by zone and method
export const shippingRates: Record<ShippingZone, Record<string, ShippingRate>> = {
  domestic: {
    standard: { baseRate: 10, perKgRate: 2 },
    express: { baseRate: 25, perKgRate: 4 },
  },
  international_1: { 
    standard: { baseRate: 20, perKgRate: 5 },
    express: { baseRate: 40, perKgRate: 8 },
  },
  international_2: { 
    standard: { baseRate: 30, perKgRate: 7 },
    express: { baseRate: 55, perKgRate: 12 },
  },
  international_3: { 
    standard: { baseRate: 40, perKgRate: 10 },
    express: { baseRate: 75, perKgRate: 15 },
  },
};

// Estimated delivery times by zone and shipping method
export const deliveryTimes: Record<ShippingZone, Record<string, ShippingMethodTiming>> = {
  domestic: {
    standard: { minDays: 3, maxDays: 7 },
    express: { minDays: 1, maxDays: 3 },
  },
  international_1: {
    standard: { minDays: 7, maxDays: 14 },
    express: { minDays: 3, maxDays: 5 },
  },
  international_2: {
    standard: { minDays: 10, maxDays: 21 },
    express: { minDays: 4, maxDays: 7 },
  },
  international_3: {
    standard: { minDays: 14, maxDays: 30 },
    express: { minDays: 5, maxDays: 10 },
  },
};

// Helper function to determine shipping zone based on country
export const getShippingZone = (
  destinationCountry: string, 
  sellerCountry: string
): ShippingZone => {
  if (destinationCountry === sellerCountry) {
    return 'domestic';
  }
  
  // Check if country is in international zone 1
  if (countryGroups.international_1.includes(destinationCountry)) {
    return 'international_1';
  }
  
  // Check if country is in international zone 2
  if (countryGroups.international_2.includes(destinationCountry)) {
    return 'international_2';
  }
  
  // Default to international zone 3 for all other countries
  return 'international_3';
}; 