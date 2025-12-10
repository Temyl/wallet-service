import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { ApiKey } from 'src/entities/api-key.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { Transfer } from 'src/entities/transfer.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  logging: false,
  entities: [User, Wallet, ApiKey, Transaction, Transfer, ], 
  migrations: ['src/db/migrations/*.ts'],
  subscribers: [],
});
