import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'ruralroute_default_secret_key_2026',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
