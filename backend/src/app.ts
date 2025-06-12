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
import adminRoutes from './routes/adminRoutes';
import testRoutes from './routes/testRoute';
import { AppDataSource } from './data-source';
import dotenv from 'dotenv';
import { swaggerOptions } from './swaggerConfig';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
const restrictedCorsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const openCorsOptions = {
  origin: '*', // Allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply restricted CORS to all routes by default
app.use(cors(restrictedCorsOptions));

// Middleware
app.use(express.json());

// Initialize database connection
const initializeDb = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Error connecting to the database:', error);
    process.exit(1);
  }
};

// Initialize database before setting up routes
initializeDb().then(() => {

  app.use('/api/payments', cors(openCorsOptions), paymentRoutes);

  // Routes
  app.use('/api/customers', customerRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api', profileRoutes);
  app.use('/api', seedRoutes);
  // app.use('/api/payments', paymentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/test', testRoutes);

  // Swagger documentation
  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve);
  app.use('/api-docs', swaggerUi.setup(specs, { explorer: true }));

  // Start local server ONLY if not running on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  }

});

export default app;
