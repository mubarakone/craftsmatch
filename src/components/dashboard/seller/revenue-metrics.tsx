"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueMetrics } from "@/lib/dashboard/seller-queries";
import { PieChart } from "@/components/charts/pie-chart";
import { formatCurrency } from "@/lib/charts/utils";

interface RevenueMetricsCardProps {
  data: RevenueMetrics;
  className?: string;
}

export function RevenueMetricsCard({ data, className }: RevenueMetricsCardProps) {
  // Process data for chart
  const pieData = data.revenueByCategory.map((item) => ({
    name: item.category,
    value: item.value,
    color: getCategoryColor(item.category),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
        <CardDescription>Revenue by product category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
              <p className="text-2xl font-bold">{formatCurrency(data.averageOrderValue)}</p>
            </div>
            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium mb-2">Category Breakdown</p>
              <div className="space-y-2">
                {data.revenueByCategory.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: getCategoryColor(category.category) }}
                      />
                      <span className="text-sm">{category.category}</span>
                    </div>
                    <span className="text-sm font-medium">{category.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <PieChart
              data={pieData}
              height={250}
              innerRadius={40}
              outerRadius={85}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get a color for each category
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'Furniture': '#3B82F6',    // blue
    'Textiles': '#10B981',     // green
    'Ceramics': '#F59E0B',     // amber
    'Jewelry': '#8B5CF6',      // purple
    'Woodwork': '#EC4899',     // pink
    'Metalwork': '#06B6D4',    // cyan
    'Glassware': '#F97316',    // orange
    'Other': '#6B7280',        // gray
  };
  
  return colorMap[category] || '#6B7280'; // default to gray
} 