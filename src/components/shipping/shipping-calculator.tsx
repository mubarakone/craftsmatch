"use client";

import { useState, useEffect } from "react";
import { calculateShippingCost, estimateDeliveryTime, getAvailableShippingMethods } from "@/lib/shipping/calculations";
import { ProductShippingDetails } from "@/lib/shipping/calculations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface ShippingCalculatorProps {
  product: ProductShippingDetails;
  sellerCountry: string;
  orderValue?: number;
  quantity?: number;
  onEstimateUpdate?: (estimate: number) => void;
}

export function ShippingCalculator({
  product,
  sellerCountry,
  orderValue = 0,
  quantity = 1,
  onEstimateUpdate,
}: ShippingCalculatorProps) {
  const [country, setCountry] = useState<string>("");
  const [shippingMethod, setShippingMethod] = useState<string>("");
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<{
    minDays: number;
    maxDays: number;
  } | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Populate available shipping methods when country changes
  useEffect(() => {
    if (!country) {
      setAvailableMethods([]);
      return;
    }

    try {
      const methods = getAvailableShippingMethods(country, sellerCountry, product);
      setAvailableMethods(methods);
      
      // Auto-select standard shipping if available
      if (methods.includes('standard') && !shippingMethod) {
        setShippingMethod('standard');
      } else if (methods.length > 0 && !shippingMethod) {
        setShippingMethod(methods[0]);
      }
    } catch (error) {
      console.error("Error getting shipping methods:", error);
      setAvailableMethods([]);
    }
  }, [country, sellerCountry, product, shippingMethod]);

  // Calculate shipping when inputs change
  useEffect(() => {
    // Reset calculation error
    setCalculationError(null);

    // Only calculate if we have both country and shipping method
    if (!country || !shippingMethod) {
      setShippingCost(null);
      setDeliveryTime(null);
      if (onEstimateUpdate) onEstimateUpdate(0);
      return;
    }

    setIsLoading(true);

    try {
      // Calculate shipping cost
      const cost = calculateShippingCost({
        product,
        destinationCountry: country,
        sellerCountry,
        shippingMethod,
        orderValue,
        quantity,
      });

      // Estimate delivery time
      const time = estimateDeliveryTime(country, sellerCountry, shippingMethod);

      // Update state
      setShippingCost(cost);
      setDeliveryTime(time);
      setIsLoading(false);
      
      // Update parent component
      if (onEstimateUpdate) onEstimateUpdate(cost);
    } catch (error) {
      console.error("Error calculating shipping:", error);
      setCalculationError(
        error instanceof Error ? error.message : "Unable to calculate shipping. Please check your shipping information."
      );
      setShippingCost(null);
      setDeliveryTime(null);
      setIsLoading(false);
      if (onEstimateUpdate) onEstimateUpdate(0);
    }
  }, [country, shippingMethod, product, sellerCountry, orderValue, quantity, onEstimateUpdate]);

  // Common countries for quick selection
  const commonCountries = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "GB", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Shipping Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {commonCountries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {country && availableMethods.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Shipping Method</label>
              <Select value={shippingMethod} onValueChange={setShippingMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shipping method" />
                </SelectTrigger>
                <SelectContent>
                  {availableMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {country && availableMethods.length === 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Shipping to this country is not available for this product.
              </AlertDescription>
            </Alert>
          )}

          {calculationError && (
            <Alert variant="destructive">
              <AlertDescription>{calculationError}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            shippingCost !== null && (
              <div className="mt-4 space-y-3 border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-sm">Shipping cost:</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                {deliveryTime && (
                  <div className="flex justify-between">
                    <span className="text-sm">Estimated delivery:</span>
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
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
} 