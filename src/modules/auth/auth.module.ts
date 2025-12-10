import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/entities/user.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { DURATION } from 'src/shared/enums';

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        TypeOrmModule.forFeature([User, Wallet]),
        JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory: (cs: ConfigService) => ({
            secret: cs.get('JWT_SECRET'),
            signOptions: { expiresIn: 7 * DURATION.DAYS },
        }),
        }),
    ],
    providers: [
        AuthService, 
        GoogleStrategy, 
        JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
