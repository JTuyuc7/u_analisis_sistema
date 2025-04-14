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

const useConnectionString = !!process.env.DATABASE_URL;

console.log('Environment:', process.env.NODE_ENV || 'Development');
console.log('Using connection string:', useConnectionString);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: useConnectionString ? process.env.DATABASE_URL : undefined,
  host: !useConnectionString ? (process.env.DB_HOST || 'localhost') : undefined,
  port: !useConnectionString ? parseInt(process.env.DB_PORT || '5432') : undefined,
  username: !useConnectionString ? (process.env.DB_USER || 'postgres') : undefined,
  password: !useConnectionString ? (process.env.DB_PASSWORD || 'postgres') : undefined,
  database: !useConnectionString ? (process.env.DB_NAME || 'bank_db') : undefined,
  ssl: useConnectionString ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: true, // Enable logging for troubleshooting
  entities: [Customer, Account, Transaction, AuditLog, Loan, Card],
  migrations: process.env.NODE_ENV === 'production' ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'],
  subscribers: [],
  extra: {
    max: 5, // Reduce max connections for serverless environment
    connectionTimeoutMillis: 10000, // Increase timeout
    idleTimeoutMillis: 60000, // Add idle timeout
  },
});
