import { 
  getShippingZone, 
  shippingRates, 
  deliveryTimes,
  type ShippingMethodTiming 
} from '@/data/shipping-zones';

export interface ProductShippingDetails {
  weight: number; // in kg
  dimensions?: {
    length: number; // in cm
    width: number; // in cm
    height: number; // in cm
  };
  restrictedCountries?: string[];
  freeShippingThreshold?: number;
  customShippingRates?: Record<string, number>;
}

export interface ShippingCalculationParams {
  product: ProductShippingDetails;
  destinationCountry: string;
  sellerCountry: string;
  shippingMethod: string;
  orderValue?: number;
  quantity?: number;
}

/**
 * Calculate volumetric weight based on package dimensions
 */
export const calculateVolumetricWeight = (
  length: number, 
  width: number, 
  height: number
): number => {
  // Volumetric weight formula: (length × width × height) ÷ 5000
  return (length * width * height) / 5000;
};

/**
 * Calculate estimated shipping cost based on product weight, dimensions, and destination
 */
export const calculateShippingCost = ({
  product,
  destinationCountry,
  sellerCountry,
  shippingMethod = 'standard',
  orderValue = 0,
  quantity = 1,
}: ShippingCalculationParams): number => {
  // Check if shipping is not available to the destination country
  if (product.restrictedCountries?.includes(destinationCountry)) {
    throw new Error(`Shipping to ${destinationCountry} is not available for this product`);
  }

  // Check if custom shipping rates are defined for the destination country
  if (product.customShippingRates?.[destinationCountry]) {
    return product.customShippingRates[destinationCountry] * quantity;
  }

  // Check for free shipping threshold
  if (product.freeShippingThreshold && orderValue >= product.freeShippingThreshold) {
    return 0;
  }
  
  // Get shipping zone based on countries
  const zone = getShippingZone(destinationCountry, sellerCountry);
  
  // Get base rates for the zone and method
  const methodKey = shippingMethod.toLowerCase();
  const { baseRate, perKgRate } = shippingRates[zone][methodKey] || 
    shippingRates[zone]['standard'];
  
  // Calculate total weight
  const totalWeight = product.weight * quantity;
  
  // Calculate volumetric weight if dimensions are provided
  let volumetricWeight = 0;
  if (product.dimensions) {
    // Calculate volumetric weight
    volumetricWeight = calculateVolumetricWeight(
      product.dimensions.length,
      product.dimensions.width,
      product.dimensions.height
    ) * quantity;
  }
  
  // Use greater of actual weight or volumetric weight
  const chargableWeight = Math.max(totalWeight, volumetricWeight);
  
  // Calculate total shipping cost
  const shippingCost = baseRate + (perKgRate * chargableWeight);
  
  // Round to 2 decimal places
  return Math.round(shippingCost * 100) / 100;
};

/**
 * Calculate estimated delivery time based on shipping method and destination
 */
export const estimateDeliveryTime = (
  destinationCountry: string,
  sellerCountry: string,
  method: string
): ShippingMethodTiming => {
  const zone = getShippingZone(destinationCountry, sellerCountry);
  const methodKey = method.toLowerCase();
  
  return deliveryTimes[zone][methodKey] || deliveryTimes[zone]['standard'];
};

/**
 * Get available shipping methods for a destination country
 */
export const getAvailableShippingMethods = (
  destinationCountry: string,
  sellerCountry: string,
  product: ProductShippingDetails
): string[] => {
  // Check if shipping is restricted to the destination country
  if (product.restrictedCountries?.includes(destinationCountry)) {
    return [];
  }
  
  const zone = getShippingZone(destinationCountry, sellerCountry);
  return Object.keys(shippingRates[zone]);
}; 