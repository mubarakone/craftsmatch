import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { parse } from 'pg-connection-string';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Parse the connection string
const connectionOptions = parse(process.env.DATABASE_URL);

// For PostgreSQL
export default {
  schema: './src/lib/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: connectionOptions.host || 'localhost',
    port: connectionOptions.port ? parseInt(connectionOptions.port) : 5432,
    user: connectionOptions.user || 'postgres',
    password: connectionOptions.password || '',
    database: connectionOptions.database || 'postgres',
    ssl: connectionOptions.ssl ? true : false,
  },
} satisfies Config; 