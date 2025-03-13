import 'reflect-metadata';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import customerRoutes from './routes/customerRoutes';
import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import seedRoutes from './routes/seedRoutes';
import { AppDataSource } from './data-source';
import dotenv from 'dotenv';
import { swaggerOptions } from './swaggerConfig';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api', seedRoutes);

// Swagger documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve);
app.use('/api-docs', swaggerUi.setup(specs, { explorer: true }));

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error('Error connecting to the database:', error);
  });

export default app;
