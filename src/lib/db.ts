import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Uegy7tGfFnB5@ep-hidden-dew-ah581q96-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const sql = neon(connectionString);
