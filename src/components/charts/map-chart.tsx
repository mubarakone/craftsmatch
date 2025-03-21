"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

export interface MapChartProps {
  title?: string;
  description?: string;
  className?: string;
  data: Array<{
    id: string;
    value: number;
    name: string;
  }>;
}

export function MapChart({
  title,
  description,
  className,
  data,
}: MapChartProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="text-center p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Geographic data visualization - This is a placeholder for a map component.
          </p>
          <div className="border rounded-md p-4 max-h-60 overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 border-b">Region</th>
                  <th className="text-right py-2 px-3 border-b">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="text-left py-2 px-3 border-b">{item.name}</td>
                    <td className="text-right py-2 px-3 border-b">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Note: A complete map visualization would be implemented with a library like @nivo/geo
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 