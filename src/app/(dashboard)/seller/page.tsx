"use client";

import { MetricCard } from "@/components/charts/metric-card";
import { SalesChartCard } from "@/components/dashboard/seller/sales-chart";
import { RevenueMetricsCard } from "@/components/dashboard/seller/revenue-metrics";
import { PopularProductsCard } from "@/components/dashboard/seller/popular-products";
import { BuyerMapCard } from "@/components/dashboard/seller/buyer-map";
import { 
  getSellerDashboardSummary, 
  getSellerSalesData, 
  getSellerRevenueMetrics, 
  getSellerPopularProducts, 
  getSellerBuyerMap,
  SalesData,
  RevenueMetrics,
  PopularProduct,
  GeographicData
} from "@/lib/dashboard/seller-queries";
import { useEffect, useState } from "react";

// Icons for metric cards
import { DollarSign, ShoppingBag, CreditCard, PercentIcon } from "lucide-react";

interface DashboardSummary {
  totalRevenue: {
    value: string;
    trend: {
      value: number;
      isPositive: boolean;
    };
    description: string;
  };
  ordersReceived: {
    value: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
    description: string;
  };
  averageOrderValue: {
    value: string;
    trend: {
      value: number;
      isPositive: boolean;
    };
    description: string;
  };
  conversionRate: {
    value: string;
    trend: {
      value: number;
      isPositive: boolean;
    };
    description: string;
  };
}

export default function SellerDashboardPage() {
  // Use states for data
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [salesData, setSalesData] = useState<SalesData[] | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[] | null>(null);
  const [buyerMap, setBuyerMap] = useState<GeographicData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Seller ID would come from auth context in a real app
        const sellerId = "seller-1";
        
        const summaryData = await getSellerDashboardSummary(sellerId);
        const sales = await getSellerSalesData(sellerId);
        const revenue = await getSellerRevenueMetrics(sellerId);
        const products = await getSellerPopularProducts(sellerId);
        const geoData = await getSellerBuyerMap(sellerId);
        
        setDashboardSummary(summaryData);
        setSalesData(sales);
        setRevenueMetrics(revenue);
        setPopularProducts(products);
        setBuyerMap(geoData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
        <div className="grid gap-6">
          <div className="h-96 bg-muted/20 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
      
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Revenue"
          value={dashboardSummary!.totalRevenue.value}
          description={dashboardSummary!.totalRevenue.description}
          trend={dashboardSummary!.totalRevenue.trend}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Orders Received"
          value={dashboardSummary!.ordersReceived.value}
          description={dashboardSummary!.ordersReceived.description}
          trend={dashboardSummary!.ordersReceived.trend}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg. Order Value"
          value={dashboardSummary!.averageOrderValue.value}
          description={dashboardSummary!.averageOrderValue.description}
          trend={dashboardSummary!.averageOrderValue.trend}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={dashboardSummary!.conversionRate.value}
          description={dashboardSummary!.conversionRate.description}
          trend={dashboardSummary!.conversionRate.trend}
          icon={<PercentIcon className="h-4 w-4" />}
        />
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SalesChartCard data={salesData!} className="mb-6" />
          <RevenueMetricsCard data={revenueMetrics!} />
        </div>
        <div>
          <PopularProductsCard data={popularProducts!} className="mb-6" />
          <BuyerMapCard data={buyerMap!} />
        </div>
      </div>
    </div>
  );
} 