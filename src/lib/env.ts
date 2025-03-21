export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  
  // Storage
  NEXT_PUBLIC_STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Shipping APIs (placeholders for future implementation)
  SHIPPING_API_KEY: process.env.SHIPPING_API_KEY || '',
  SHIPPING_CARRIER_API_ENDPOINT: process.env.SHIPPING_CARRIER_API_ENDPOINT || 'https://api.example.com/shipping',
  
  // Check if a required environment variable is missing
  validateEnv: () => {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'DATABASE_URL'
      // NEXT_PUBLIC_STORAGE_URL is optional since we can derive it from SUPABASE_URL
      // SHIPPING_API_KEY and SHIPPING_CARRIER_API_ENDPOINT are optional for now
    ];
    
    const missingVars = requiredVars.filter(
      (envVar) => !process.env[envVar]
    );
    
    if (missingVars.length > 0) {
      throw new Error(
        `The following environment variables are missing: ${missingVars.join(
          ', '
        )}`
      );
    }
    
    return true;
  }
}; 