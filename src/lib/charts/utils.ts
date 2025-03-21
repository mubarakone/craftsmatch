/**
 * Generates a random hex color
 */
export const getRandomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

/**
 * Formats a number value to a readable string with K, M, B suffixes
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

/**
 * Formats a currency value
 */
export const formatCurrency = (
  value: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Generates a color palette for charts
 */
export const generateColorPalette = (count: number): string[] => {
  const baseColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // If we need more colors than base colors, generate them
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    colors.push(getRandomColor());
  }
  
  return colors;
};

/**
 * Creates data for a demo chart
 */
export const getDemoData = (
  type: 'sales' | 'orders' | 'revenue' | 'customers',
  period: 'day' | 'week' | 'month' | 'year' = 'month'
) => {
  const periods = {
    day: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    month: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
    year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };
  
  const multipliers = {
    sales: 1000,
    orders: 100,
    revenue: 10000,
    customers: 50,
  };
  
  return periods[period].map((label) => {
    const randomValue = Math.floor(Math.random() * multipliers[type]);
    return {
      name: label,
      value: randomValue,
    };
  });
};

/**
 * Gets the percent change between two values
 */
export const getPercentChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Truncates long text for display in charts
 */
export const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}; 