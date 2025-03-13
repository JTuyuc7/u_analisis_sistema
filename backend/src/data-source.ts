import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Customer } from './entities/Customer';
import { Account } from './entities/Account';
import { Transaction } from './entities/Transaction';
import { AuditLog } from './entities/AuditLog';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'bank_db',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: [Customer, Account, Transaction, AuditLog],
  migrations: ['src/migrations/*.ts'],
  subscribers: []
});
