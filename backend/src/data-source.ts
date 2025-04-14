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

export const AppDataSource = new DataSource(
  isProduction
    ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // required for Neon
      synchronize: false,
      logging: false,
      entities: [Customer, Account, Transaction, AuditLog, Loan, Card],
      migrations: ['dist/migrations/*.js'], // compiled version
      subscribers: [],
    }
    : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'bank_db',
      synchronize: false,
      logging: true,
      entities: [Customer, Account, Transaction, AuditLog, Loan, Card],
      migrations: ['src/migrations/*.ts'],
      subscribers: [],
    }
);
