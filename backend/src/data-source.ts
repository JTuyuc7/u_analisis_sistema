import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Customer } from './entities/Customer';
import { Account } from './entities/Account';
import { Transaction } from './entities/Transaction';
import { AuditLog } from './entities/AuditLog';
import { Loan } from './entities/Loan';
import { Card } from './entities/Card';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

console.log('Environment:', isProduction ? 'Production' : 'Development');
console.log('Database URL provided:', !!process.env.DATABASE_URL);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: isProduction ? process.env.DATABASE_URL : undefined,
  host: !isProduction ? (process.env.DB_HOST || 'localhost') : undefined,
  port: !isProduction ? parseInt(process.env.DB_PORT || '5432') : undefined,
  username: !isProduction ? (process.env.DB_USER || 'postgres') : undefined,
  password: !isProduction ? (process.env.DB_PASSWORD || 'postgres') : undefined,
  database: !isProduction ? (process.env.DB_NAME || 'bank_db') : undefined,
  ssl: isProduction ? { rejectUnauthorized: true } : false,
  synchronize: false,
  logging: true, // Enable logging for troubleshooting
  entities: [Customer, Account, Transaction, AuditLog, Loan, Card],
  migrations: isProduction ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'],
  subscribers: [],
  extra: {
    max: 20,
    connectionTimeoutMillis: 5000,
  },
});

// Function to close idle connections
export const closeIdleConnections = async () => {
  const connection = AppDataSource.manager.connection;
  if (connection.isConnected) {
    await connection.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND state = $2', [connection.options.database, 'idle']);
  }
};
