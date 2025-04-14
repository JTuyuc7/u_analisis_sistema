import 'reflect-metadata';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import customerRoutes from './routes/customerRoutes';
import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import profileRoutes from './routes/profileRoutes';
import seedRoutes from './routes/seedRoutes';
import paymentRoutes from './routes/paymentRoutes';
import testRoutes from './routes/testRoute';
import { AppDataSource, closeIdleConnections } from './data-source';
import dotenv from 'dotenv';
import { swaggerOptions } from './swaggerConfig';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // your frontend URL
  credentials: true, // to allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api', profileRoutes);
app.use('/api', seedRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/test', testRoutes);

// Swagger documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve);
app.use('/api-docs', swaggerUi.setup(specs, { explorer: true }));

// Initialize database connection if not already initialized
const initializeDb = async () => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    } catch (error) {
      console.error('❌ Error connecting to the database:', error);
    }
  }
};

// Start local server ONLY if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// Middleware to ensure database connection and manage idle connections
app.use(async (req, res, next) => {
  await initializeDb();
  next();
});

// Close idle connections after each request
app.use(async (req, res, next) => {
  res.on('finish', async () => {
    await closeIdleConnections();
  });
  next();
});

export default app;
