import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyModule } from '../api-key/aoi-key.module';
import { User } from 'src/entities/user.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { Transfer } from 'src/entities/transfer.entity';
import { DURATION } from 'src/shared/enums';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => ApiKeyModule), 
    TypeOrmModule.forFeature([User, Wallet, Transaction, Transfer]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get('JWT_SECRET'),
        signOptions: { expiresIn: 7 * DURATION.DAYS },
      }),
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService], 
})
export class PaymentModule {}
