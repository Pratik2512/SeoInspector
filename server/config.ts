import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
config();

// Define the schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PGPASSWORD: z.string().min(1, 'PGPASSWORD is required'),
  PGPORT: z.string().default('5000'),
  PORT: z.string().default('3000'), 
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

export default env; 