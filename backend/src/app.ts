import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import customerRoutes from './routes/customerRoutes';
import { Customer } from './entities/Customer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
createConnection({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "bank_db",
    entities: [Customer],
    synchronize: process.env.NODE_ENV !== "production", // Disable in production
    logging: process.env.NODE_ENV !== "production"
})
.then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((error) => {
    console.error('Error connecting to the database:', error);
});

export default app;
