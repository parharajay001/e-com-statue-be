import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import { PrismaClient } from '@prisma/client';
import productRoutes from './routes/product.routes';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();