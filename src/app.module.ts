import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { Transfer } from './entities/transfer.entity';
import { ApiKey } from './entities/api-key.entity';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ApiKeyModule } from './modules/api-key/aoi-key.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        type: 'postgres',
        host: cs.get('DATABASE_HOST'),
        port: Number(cs.get('DATABASE_PORT') || 5432),
        username: cs.get('DATABASE_USERNAME'),
        password: cs.get('DATABASE_PASSWORD'),
        database: cs.get('DATABASE_NAME'),
        entities: [User, Wallet, Transaction, Transfer, ApiKey],
        synchronize: true, // set to false in prod and use migrations
        logging: true,
      }),
    }),
    AuthModule,
    PaymentModule,
    ApiKeyModule,
  ],
})
export class AppModule {}
