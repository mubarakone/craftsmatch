"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderSummary } from "@/lib/dashboard/buyer-queries";
import { PieChart } from "@/components/charts/pie-chart";

interface OrderSummaryCardProps {
  data: OrderSummary;
  className?: string;
}

export function OrderSummaryCard({ data, className }: OrderSummaryCardProps) {
  const pieData = [
    { name: "Pending", value: data.pending, color: "#F59E0B" },
    { name: "In Progress", value: data.inProgress, color: "#3B82F6" },
    { name: "Completed", value: data.completed, color: "#10B981" },
    { name: "Cancelled", value: data.cancelled, color: "#EF4444" },
  ];

  const totalOrders = Object.values(data).reduce((sum, val) => sum + val, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>{totalOrders} Total Orders</CardDescription>
      </CardHeader>
      <CardContent>
        <PieChart 
          data={pieData}
          height={300}
          innerRadius={50}
          outerRadius={80}
        />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-muted-foreground">Active Orders</span>
            <span className="text-2xl font-bold">{data.pending + data.inProgress}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-muted-foreground">Completion Rate</span>
            <span className="text-2xl font-bold">
              {totalOrders ? Math.round((data.completed / totalOrders) * 100) : 0}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 