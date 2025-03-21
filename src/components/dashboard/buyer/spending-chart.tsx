"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingData } from "@/lib/dashboard/buyer-queries";
import { LineChart } from "@/components/charts/line-chart";
import { formatCurrency } from "@/lib/charts/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface SpendingChartCardProps {
  data: SpendingData[];
  className?: string;
}

export function SpendingChartCard({ data, className }: SpendingChartCardProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  const chartData = data.map((item) => ({
    name: item.month,
    amount: item.amount,
  }));

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const averageAmount = totalAmount / data.length;

  const maxAmount = Math.max(...data.map((item) => item.amount));
  const minAmount = Math.min(...data.map((item) => item.amount));

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription>Your spending history</CardDescription>
        </div>
        <Select 
          defaultValue={period} 
          onValueChange={(value) => setPeriod(value as 'week' | 'month' | 'year')}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <LineChart
          data={chartData}
          xKey="name"
          yKeys={[
            { key: "amount", name: "Spending", color: "#3B82F6" },
          ]}
          height={300}
        />
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Spending</p>
            <p className="text-lg font-medium">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-lg font-medium">{formatCurrency(averageAmount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Range</p>
            <p className="text-lg font-medium">{formatCurrency(maxAmount - minAmount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 