import { env } from '@/lib/env';

// Shipping zones defined by regions
type ShippingZone = 'domestic' | 'international_1' | 'international_2' | 'international_3';

interface ShippingRate {
  baseRate: number;
  perKgRate: number;
}

// Default shipping rates by zone and method
const shippingRates: Record<ShippingZone, Record<string, ShippingRate>> = {
  domestic: {
    standard: { baseRate: 10, perKgRate: 2 },
    express: { baseRate: 25, perKgRate: 4 },
  },
  international_1: { // North America
    standard: { baseRate: 20, perKgRate: 5 },
    express: { baseRate: 40, perKgRate: 8 },
  },
  international_2: { // Europe, Australia
    standard: { baseRate: 30, perKgRate: 7 },
    express: { baseRate: 55, perKgRate: 12 },
  },
  international_3: { // Rest of World
    standard: { baseRate: 40, perKgRate: 10 },
    express: { baseRate: 75, perKgRate: 15 },
  },
};

// Helper function to determine shipping zone based on country
const getShippingZone = (country: string, sellerCountry: string): ShippingZone => {
  if (country === sellerCountry) {
    return 'domestic';
  }
  
  const northAmerica = ['USA', 'US', 'Canada', 'CA', 'Mexico', 'MX'];
  const europeAustralia = [
    'GB', 'UK', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'DK', 'NO', 'FI',
    'AU', 'NZ',
  ];
  
  if (northAmerica.includes(country)) {
    return 'international_1';
  } else if (europeAustralia.includes(country)) {
    return 'international_2';
  } else {
    return 'international_3';
  }
};

interface ShippingCalculationParams {
  weight: number; // in kg
  dimensions?: {
    length: number; // in cm
    width: number; // in cm
    height: number; // in cm
  };
  country: string;
  sellerCountry: string;
  shippingMethod: string;
}

/**
 * Calculate estimated shipping cost based on product weight, dimensions, and destination
 */
export const calculateShippingCost = ({
  weight,
  dimensions,
  country,
  sellerCountry,
  shippingMethod = 'standard',
}: ShippingCalculationParams): number => {
  // Get shipping zone based on countries
  const zone = getShippingZone(country, sellerCountry);
  
  // Get base rates for the zone and method
  const { baseRate, perKgRate } = shippingRates[zone][shippingMethod.toLowerCase()] || 
    shippingRates[zone]['standard'];
  
  // Calculate volumetric weight if dimensions are provided
  let volumetricWeight = 0;
  if (dimensions) {
    // Volumetric weight formula: (length × width × height) ÷ 5000
    volumetricWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000;
  }
  
  // Use greater of actual weight or volumetric weight
  const chargableWeight = Math.max(weight, volumetricWeight);
  
  // Calculate total shipping cost
  const shippingCost = baseRate + (perKgRate * chargableWeight);
  
  // Round to 2 decimal places
  return Math.round(shippingCost * 100) / 100;
};

/**
 * Calculate estimated delivery time based on shipping method and destination
 */
export const estimateDeliveryTime = (
  country: string,
  sellerCountry: string,
  method: string
): { minDays: number; maxDays: number } => {
  const zone = getShippingZone(country, sellerCountry);
  
  if (method.toLowerCase() === 'express') {
    switch (zone) {
      case 'domestic':
        return { minDays: 1, maxDays: 3 };
      case 'international_1':
        return { minDays: 3, maxDays: 5 };
      case 'international_2':
        return { minDays: 4, maxDays: 7 };
      case 'international_3':
        return { minDays: 5, maxDays: 10 };
    }
  } else {
    // Standard shipping
    switch (zone) {
      case 'domestic':
        return { minDays: 3, maxDays: 7 };
      case 'international_1':
        return { minDays: 7, maxDays: 14 };
      case 'international_2':
        return { minDays: 10, maxDays: 21 };
      case 'international_3':
        return { minDays: 14, maxDays: 30 };
    }
  }
}; 