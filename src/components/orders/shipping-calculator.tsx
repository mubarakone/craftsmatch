"use client";

import { useEffect, useState } from "react";
import { calculateShippingCost, estimateDeliveryTime } from "@/lib/shipping/calculator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ShippingCalculatorProps {
  product: any; // Replace with proper product type
  country: string;
  shippingMethod: string;
  onEstimateUpdate: (estimate: number) => void;
}

export function ShippingCalculator({
  product,
  country,
  shippingMethod,
  onEstimateUpdate,
}: ShippingCalculatorProps) {
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<{
    minDays: number;
    maxDays: number;
  } | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  useEffect(() => {
    // Reset calculation error
    setCalculationError(null);

    // Only calculate if we have both country and shipping method
    if (!country || !shippingMethod) {
      setShippingCost(null);
      setDeliveryTime(null);
      return;
    }

    try {
      // Get seller country
      const sellerCountry = product.sellerCountry || "US"; // Default to US if not provided

      // Calculate shipping cost
      const cost = calculateShippingCost({
        weight: product.weight || 1, // Default to 1kg if not provided
        dimensions: product.dimensions,
        country,
        sellerCountry,
        shippingMethod,
      });

      // Estimate delivery time
      const time = estimateDeliveryTime(country, sellerCountry, shippingMethod);

      // Update state
      setShippingCost(cost);
      setDeliveryTime(time);
      
      // Update parent component
      onEstimateUpdate(cost);
    } catch (error) {
      console.error("Error calculating shipping:", error);
      setCalculationError(
        "Unable to calculate shipping. Please check your shipping information."
      );
      setShippingCost(null);
      setDeliveryTime(null);
      onEstimateUpdate(0);
    }
  }, [country, shippingMethod, product, onEstimateUpdate]);

  if (!country || !shippingMethod) {
    return null;
  }

  if (calculationError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Shipping Calculation Error</AlertTitle>
        <AlertDescription>{calculationError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-muted/30">
      <h3 className="font-medium mb-2">Shipping Estimate</h3>
      
      {shippingCost !== null ? (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Estimated shipping cost:</span>
            <span className="font-medium">${shippingCost.toFixed(2)}</span>
          </div>
          
          {deliveryTime && (
            <div className="flex justify-between">
              <span>Estimated delivery time:</span>
              <span className="font-medium">
                {deliveryTime.minDays === deliveryTime.maxDays
                  ? `${deliveryTime.minDays} days`
                  : `${deliveryTime.minDays}-${deliveryTime.maxDays} days`}
              </span>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            Final shipping costs will be calculated at checkout based on actual weight and dimensions.
          </p>
        </div>
      ) : (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
} 