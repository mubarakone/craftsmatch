"use client";

import { useEffect, useState } from "react";
import { getShippingRates, CarrierShippingRate, PackageDimensions, ShippingAddress } from "@/lib/shipping/carriers";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClockIcon, TruckIcon, CheckCircleIcon } from "lucide-react";

interface CarrierSelectorProps {
  fromAddress: ShippingAddress;
  toAddress: ShippingAddress;
  packageDetails: PackageDimensions;
  onCarrierSelect: (carrier: CarrierShippingRate) => void;
  selectedCarrierId?: string;
}

export function CarrierSelector({
  fromAddress,
  toAddress,
  packageDetails,
  onCarrierSelect,
  selectedCarrierId,
}: CarrierSelectorProps) {
  const [carriers, setCarriers] = useState<CarrierShippingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available carriers and rates
  useEffect(() => {
    const fetchCarriers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const rates = await getShippingRates(
          fromAddress,
          toAddress,
          packageDetails
        );
        
        setCarriers(rates);
        
        // Auto-select the first carrier if none is selected
        if (rates.length > 0 && !selectedCarrierId) {
          onCarrierSelect(rates[0]);
        }
      } catch (err) {
        console.error("Error fetching shipping rates:", err);
        setError("Unable to fetch shipping rates. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCarriers();
  }, [fromAddress, toAddress, packageDetails, onCarrierSelect, selectedCarrierId]);

  // Generate a carrier ID
  const getCarrierId = (carrier: CarrierShippingRate): string => {
    return `${carrier.carrier}-${carrier.service}`.toLowerCase().replace(/\s+/g, '-');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 rounded-lg text-destructive">
        {error}
      </div>
    );
  }

  if (carriers.length === 0) {
    return (
      <div className="p-4 border border-muted-foreground/20 bg-muted/50 rounded-lg">
        No shipping carriers available for this route.
      </div>
    );
  }

  return (
    <RadioGroup
      value={selectedCarrierId}
      onValueChange={(value) => {
        const selected = carriers.find(c => getCarrierId(c) === value);
        if (selected) {
          onCarrierSelect(selected);
        }
      }}
      className="space-y-3"
    >
      {carriers.map((carrier) => {
        const carrierId = getCarrierId(carrier);
        
        return (
          <div key={carrierId} className="flex items-center space-x-2">
            <RadioGroupItem value={carrierId} id={carrierId} className="peer" />
            <Label
              htmlFor={carrierId}
              className="flex-1 cursor-pointer"
            >
              <Card className="border peer-data-[state=checked]:border-primary">
                <CardContent className="p-4">
                  <div className="grid grid-cols-[1fr_auto] gap-4">
                    <div>
                      <div className="font-medium">{carrier.carrier} - {carrier.service}</div>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <ClockIcon className="mr-1 h-3 w-3" />
                        <span>
                          Estimated delivery: {carrier.estimatedDays} {carrier.estimatedDays === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      {carrier.trackingAvailable && (
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <TruckIcon className="mr-1 h-3 w-3" />
                          <span>Tracking available</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Badge variant="outline" className="mb-1">
                        ${carrier.rate.toFixed(2)}
                      </Badge>
                      {selectedCarrierId === carrierId && (
                        <CheckCircleIcon className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
} 