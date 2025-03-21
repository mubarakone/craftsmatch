"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeographicData } from "@/lib/dashboard/seller-queries";
import { MapChart } from "@/components/charts/map-chart";

interface BuyerMapCardProps {
  data: GeographicData[];
  className?: string;
}

export function BuyerMapCard({ data, className }: BuyerMapCardProps) {
  // Sort data by value (descending)
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Buyer Distribution</CardTitle>
        <CardDescription>Geographic distribution of your buyers</CardDescription>
      </CardHeader>
      <CardContent>
        <MapChart data={sortedData} />
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Top Regions</h4>
          <div className="grid grid-cols-2 gap-2">
            {sortedData.slice(0, 4).map((region) => (
              <div key={region.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-xs font-medium">{region.name}</span>
                <span className="text-xs">{region.value} orders</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 