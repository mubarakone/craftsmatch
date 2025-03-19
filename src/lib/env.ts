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
  
  // Check if a required environment variable is missing
  validateEnv: () => {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'DATABASE_URL'
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