import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
};