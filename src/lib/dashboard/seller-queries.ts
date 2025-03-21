import { formatCurrency, getPercentChange } from "../charts/utils";

// This is a temporary mock implementation
// In a real application, we would fetch this data from the database

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  revenueByCategory: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
}

export interface PopularProduct {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  stock: number;
  image?: string;
}

export interface GeographicData {
  id: string;
  value: number;
  name: string;
}

// Get sales data for charting
export async function getSellerSalesData(
  sellerId: string,
  period: 'week' | 'month' | 'year' = 'month'
): Promise<SalesData[]> {
  // Mock data - would be replaced with actual DB query
  const periodMap = {
    week: 7,
    month: 30,
    year: 12,
  };
  
  const labels = period === 'year' 
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : Array.from({ length: periodMap[period] }, (_, i) => 
        period === 'week' 
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] 
          : `${i + 1}`
      );
  
  return labels.map((date) => ({
    date,
    revenue: Math.floor(Math.random() * 5000),
    orders: Math.floor(Math.random() * 20),
  }));
}

// Get revenue metrics
export async function getSellerRevenueMetrics(sellerId: string): Promise<RevenueMetrics> {
  // Mock data - would be replaced with actual DB query
  const categories = [
    'Furniture',
    'Textiles',
    'Ceramics',
    'Jewelry',
    'Woodwork',
  ];
  
  const totalRevenue = 25000;
  
  const revenueByCategory = categories.map((category) => {
    const value = Math.floor(Math.random() * (totalRevenue / 2));
    return {
      category,
      value,
      percentage: Math.round((value / totalRevenue) * 100),
    };
  });
  
  // Adjust to make sure percentages add up to 100
  const sumPercentage = revenueByCategory.reduce((sum, item) => sum + item.percentage, 0);
  if (sumPercentage < 100) {
    revenueByCategory[0].percentage += (100 - sumPercentage);
  }
  
  return {
    totalRevenue,
    averageOrderValue: Math.floor(totalRevenue / 125), // Assuming 125 orders
    revenueByCategory,
  };
}

// Get popular products
export async function getSellerPopularProducts(sellerId: string, limit: number = 5): Promise<PopularProduct[]> {
  // Mock data - would be replaced with actual DB query
  return Array.from({ length: limit }, (_, i) => ({
    id: `product-${i + 1}`,
    name: `Handcrafted Item ${i + 1}`,
    orders: Math.floor(Math.random() * 50),
    revenue: Math.floor(Math.random() * 5000),
    stock: Math.floor(Math.random() * 100),
    image: i % 2 === 0 ? `/placeholder-product-${i + 1}.jpg` : undefined,
  }));
}

// Get geographic distribution of buyers
export async function getSellerBuyerMap(sellerId: string): Promise<GeographicData[]> {
  // Mock data - would be replaced with actual DB query
  const regions = [
    { id: 'US-NY', name: 'New York' },
    { id: 'US-CA', name: 'California' },
    { id: 'US-TX', name: 'Texas' },
    { id: 'US-FL', name: 'Florida' },
    { id: 'US-IL', name: 'Illinois' },
    { id: 'US-PA', name: 'Pennsylvania' },
    { id: 'US-OH', name: 'Ohio' },
    { id: 'US-WA', name: 'Washington' },
    { id: 'US-CO', name: 'Colorado' },
    { id: 'CA-ON', name: 'Ontario, Canada' },
  ];
  
  return regions.map((region) => ({
    ...region,
    value: Math.floor(Math.random() * 100),
  }));
}

// Get seller dashboard summary metrics
export async function getSellerDashboardSummary(sellerId: string) {
  // Mock data - would be replaced with actual DB query
  const previousMonth = 18500;
  const currentMonth = 25000;
  const percentChange = getPercentChange(currentMonth, previousMonth);
  
  return {
    totalRevenue: {
      value: formatCurrency(currentMonth),
      trend: {
        value: percentChange,
        isPositive: percentChange > 0,
      },
      description: "vs. last month",
    },
    ordersReceived: {
      value: 125,
      trend: {
        value: 15,
        isPositive: true,
      },
      description: "vs. last month",
    },
    averageOrderValue: {
      value: formatCurrency(currentMonth / 125),
      trend: {
        value: 8,
        isPositive: true,
      },
      description: "vs. last month",
    },
    conversionRate: {
      value: "4.2%",
      trend: {
        value: 0.5,
        isPositive: true,
      },
      description: "vs. last month",
    },
  };
} 