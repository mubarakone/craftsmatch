import { formatCurrency, getPercentChange } from "../charts/utils";

// This is a temporary mock implementation
// In a real application, we would fetch this data from the database

export interface OrderSummary {
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface SpendingData {
  month: string;
  amount: number;
}

export interface FavoriteSeller {
  id: string;
  name: string;
  ordersPlaced: number;
  rating: number;
  image?: string;
}

export interface SampleRequest {
  id: string;
  productName: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'rejected';
  requestDate: string;
  sellerName: string;
}

export async function getBuyerOrderSummary(userId: string): Promise<OrderSummary> {
  // Mock data - would be replaced with actual DB query
  return {
    pending: 2,
    inProgress: 3,
    completed: 8,
    cancelled: 1,
  };
}

export async function getBuyerSpendingData(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<SpendingData[]> {
  // Mock data - would be replaced with actual DB query
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month) => ({
    month,
    amount: Math.floor(Math.random() * 5000),
  }));
}

export async function getBuyerFavoriteSellers(userId: string, limit: number = 5): Promise<FavoriteSeller[]> {
  // Mock data - would be replaced with actual DB query
  return Array.from({ length: limit }, (_, i) => ({
    id: `seller-${i + 1}`,
    name: `Artisan Studio ${i + 1}`,
    ordersPlaced: Math.floor(Math.random() * 20),
    rating: 3 + Math.random() * 2, // Random rating between 3 and 5
    image: i % 2 === 0 ? `/placeholder-seller-${i + 1}.jpg` : undefined,
  }));
}

export async function getBuyerSampleRequests(userId: string): Promise<SampleRequest[]> {
  // Mock data - would be replaced with actual DB query
  const statuses: Array<SampleRequest['status']> = ['pending', 'approved', 'shipped', 'delivered', 'rejected'];
  
  return Array.from({ length: 5 }, (_, i) => ({
    id: `sample-${i + 1}`,
    productName: `Handcrafted Product ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    requestDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sellerName: `Artisan Studio ${Math.floor(Math.random() * 10) + 1}`,
  }));
}

export async function getBuyerDashboardSummary(userId: string) {
  // Mock data - would be replaced with actual DB query
  const previousMonth = 850;
  const currentMonth = 1200;
  const percentChange = getPercentChange(currentMonth, previousMonth);
  
  return {
    totalSpent: {
      value: formatCurrency(currentMonth),
      trend: {
        value: percentChange,
        isPositive: percentChange > 0,
      },
      description: "vs. last month",
    },
    ordersPlaced: {
      value: 14,
      trend: {
        value: 27,
        isPositive: true,
      },
      description: "vs. last month",
    },
    averageOrderValue: {
      value: formatCurrency(currentMonth / 14),
      trend: {
        value: 5,
        isPositive: true,
      },
      description: "vs. last month",
    },
    activeSellers: {
      value: 8,
      description: "you've ordered from",
    },
  };
} 