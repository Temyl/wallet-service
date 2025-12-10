import { 
  Injectable, 
  BadRequestException, 
  InternalServerErrorException, 
  UnauthorizedException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { generateWalletNumber } from 'src/shared/utils/wallet-number';
import { googlePayload } from 'src/shared/interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,

    private readonly jwtService: JwtService,
  ) {}

  async findOrCreateFromGoogle(payload: googlePayload) {
    if (!payload?.sub || !payload?.email) {
      throw new UnauthorizedException(
        'Invalid Google authentication payload'
    );
    }

    try {
      let user = await this.usersRepo.findOne({
        where: { google_id: payload.sub },
      });

      let wallet: Wallet | null = null;

      if (!user) {
        const emailExists = await this.usersRepo.findOne({
          where: { email: payload.email },
        });

        if (emailExists) {
          throw new BadRequestException(
            'Email already exists but Google ID mismatch',
          );
        }

        user = this.usersRepo.create({
          google_id: payload.sub,
          email: payload.email,
          fullName: payload.name,
        });

        user = await this.usersRepo.save(user);

        wallet = this.walletRepo.create({
          walletNumber: generateWalletNumber(),
          balance: 0,
          user: user,
        });

        wallet = await this.walletRepo.save(wallet);
      } 
      else {
        wallet = await this.walletRepo.findOne({
          where: { user: { id: user.id } },
        });

        if (!wallet) {
          wallet = await this.walletRepo.save(
            this.walletRepo.create({
              walletNumber: generateWalletNumber(),
              balance: 0,
              user: user,
            })
          );
        }
      }

      return user
    } 
    catch (error) {
      console.error('Auth error:', error);
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException(
        'An error occurred during Google authentication',
      );
    }
  }

  signToken(user: User) {
    try {
      const token = this.jwtService.sign({
        id: user.id,
        email: user.email,
        name: user.fullName,
      });

      return { access_token: token };
    } 
    catch (error) {
      throw new InternalServerErrorException(
        'Failed to sign JWT token'
    );
    }
  }
}
