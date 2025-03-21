"use client";

import { MetricCard } from "@/components/charts/metric-card";
import { OrderSummaryCard } from "@/components/dashboard/buyer/order-summary";
import { FavoriteSellersCard } from "@/components/dashboard/buyer/favorite-sellers";
import { SpendingChartCard } from "@/components/dashboard/buyer/spending-chart";
import { SampleRequestsCard } from "@/components/dashboard/buyer/sample-requests";
import { 
  getBuyerDashboardSummary, 
  getBuyerOrderSummary, 
  getBuyerSpendingData, 
  getBuyerFavoriteSellers, 
  getBuyerSampleRequests,
  OrderSummary,
  SpendingData,
  FavoriteSeller,
  SampleRequest 
} from "@/lib/dashboard/buyer-queries";
import { useEffect, useState } from "react";

// Icons for metric cards
import { DollarSign, ShoppingBag, CreditCard, Users } from "lucide-react";

interface DashboardSummary {
  totalSpent: {
    value: string;
    trend: {
      value: number;
      isPositive: boolean;
    };
    description: string;
  };
  ordersPlaced: {
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
  activeSellers: {
    value: number;
    description: string;
  };
}

export default function BuyerDashboardPage() {
  // Use states for data
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [spendingData, setSpendingData] = useState<SpendingData[] | null>(null);
  const [favoriteSellers, setFavoriteSellers] = useState<FavoriteSeller[] | null>(null);
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // User ID would come from auth context in a real app
        const userId = "user-1";
        
        const summaryData = await getBuyerDashboardSummary(userId);
        const orderData = await getBuyerOrderSummary(userId);
        const spendingHistory = await getBuyerSpendingData(userId);
        const sellerData = await getBuyerFavoriteSellers(userId);
        const samples = await getBuyerSampleRequests(userId);
        
        setDashboardSummary(summaryData);
        setOrderSummary(orderData);
        setSpendingData(spendingHistory);
        setFavoriteSellers(sellerData);
        setSampleRequests(samples);
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
        <h1 className="text-3xl font-bold mb-6">Buyer Dashboard</h1>
        <div className="grid gap-6">
          <div className="h-96 bg-muted/20 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Buyer Dashboard</h1>
      
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Spent"
          value={dashboardSummary!.totalSpent.value}
          description={dashboardSummary!.totalSpent.description}
          trend={dashboardSummary!.totalSpent.trend}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Orders Placed"
          value={dashboardSummary!.ordersPlaced.value}
          description={dashboardSummary!.ordersPlaced.description}
          trend={dashboardSummary!.ordersPlaced.trend}
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
          title="Active Sellers"
          value={dashboardSummary!.activeSellers.value}
          description={dashboardSummary!.activeSellers.description}
          icon={<Users className="h-4 w-4" />}
        />
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingChartCard data={spendingData!} className="mb-6" />
          <OrderSummaryCard data={orderSummary!} />
        </div>
        <div className="space-y-6">
          <FavoriteSellersCard data={favoriteSellers!} />
          <SampleRequestsCard data={sampleRequests!} />
        </div>
      </div>
    </div>
  );
} 