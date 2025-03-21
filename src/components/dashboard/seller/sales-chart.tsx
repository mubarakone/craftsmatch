"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesData } from "@/lib/dashboard/seller-queries";
import { BarChart } from "@/components/charts/bar-chart";
import { formatCurrency } from "@/lib/charts/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface SalesChartCardProps {
  data: SalesData[];
  className?: string;
}

export function SalesChartCard({ data, className }: SalesChartCardProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Process data for chart
  const chartData = data.map((item) => ({
    name: item.date,
    revenue: item.revenue,
    orders: item.orders,
  }));

  // Calculate totals
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Sales Performance</CardTitle>
          <CardDescription>Your overall sales performance</CardDescription>
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
        <Tabs defaultValue="revenue" className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue">
            <BarChart
              data={chartData}
              xKey="name"
              yKeys={[
                { key: "revenue", name: "Revenue", color: "#3B82F6" },
              ]}
              height={300}
            />
            <div className="text-center mt-2">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </TabsContent>
          <TabsContent value="orders">
            <BarChart
              data={chartData}
              xKey="name"
              yKeys={[
                { key: "orders", name: "Orders", color: "#10B981" },
              ]}
              height={300}
            />
            <div className="text-center mt-2">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold">{totalOrders}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 