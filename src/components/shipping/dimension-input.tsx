"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackageDimensions } from "@/lib/shipping/carriers";
import { calculateVolumetricWeight } from "@/lib/shipping/calculations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

interface DimensionInputProps {
  initialDimensions?: Partial<PackageDimensions>;
  onDimensionsChange: (dimensions: PackageDimensions) => void;
}

export function DimensionInput({ 
  initialDimensions,
  onDimensionsChange
}: DimensionInputProps) {
  const [dimensions, setDimensions] = useState<PackageDimensions>({
    length: initialDimensions?.length || 0,
    width: initialDimensions?.width || 0,
    height: initialDimensions?.height || 0,
    weight: initialDimensions?.weight || 0
  });
  
  const [volumetricWeight, setVolumetricWeight] = useState<number | null>(null);

  // Update parent component when dimensions change
  useEffect(() => {
    if (dimensions.length > 0 && dimensions.width > 0 && 
        dimensions.height > 0 && dimensions.weight > 0) {
      onDimensionsChange(dimensions);
      
      // Calculate volumetric weight
      const vWeight = calculateVolumetricWeight(
        dimensions.length,
        dimensions.width,
        dimensions.height
      );
      setVolumetricWeight(vWeight);
    } else {
      setVolumetricWeight(null);
    }
  }, [dimensions, onDimensionsChange]);

  const handleDimensionChange = (dimension: keyof PackageDimensions, value: string) => {
    const numValue = parseFloat(value) || 0;
    setDimensions((prev) => ({
      ...prev,
      [dimension]: numValue
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Package Dimensions</CardTitle>
        <CardDescription>Enter the dimensions and weight of your package</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="length">Length (cm)</Label>
            <Input
              id="length"
              type="number"
              min="0"
              step="0.1"
              value={dimensions.length || ""}
              onChange={(e) => handleDimensionChange("length", e.target.value)}
              placeholder="Length"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="width">Width (cm)</Label>
            <Input
              id="width"
              type="number"
              min="0"
              step="0.1"
              value={dimensions.width || ""}
              onChange={(e) => handleDimensionChange("width", e.target.value)}
              placeholder="Width"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              min="0"
              step="0.1"
              value={dimensions.height || ""}
              onChange={(e) => handleDimensionChange("height", e.target.value)}
              placeholder="Height"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.1"
              value={dimensions.weight || ""}
              onChange={(e) => handleDimensionChange("weight", e.target.value)}
              placeholder="Weight"
            />
          </div>
        </div>
        
        {volumetricWeight !== null && volumetricWeight > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-md flex items-start">
            <InfoIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Volumetric Weight</p>
              <p className="text-sm text-muted-foreground">
                {volumetricWeight.toFixed(2)} kg
                {volumetricWeight > dimensions.weight && (
                  <span className="block mt-1">
                    Note: For shipping, the volumetric weight will be used as it's higher than the actual weight.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 