import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtOrApiGuard } from 'src/guards/api-jwt.guard';

// Swagger imports
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

export class DepositDto {
  amount: number;
}

export class TransferDto {
  wallet_number: string;
  amount: number;
}

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ---------------------------
  // DEPOSIT
  // ---------------------------
  @UseGuards(JwtOrApiGuard)
  @Post('deposit')
  @ApiOperation({ summary: 'Fund your wallet' })
  @ApiBody({ type: DepositDto })
  @ApiResponse({ status: 201, description: 'Wallet funded successfully' })
  async deposit(@Req() req: any, @Body() body: DepositDto) {
    const user = req.user;
    if (!user) throw new BadRequestException('Unauthenticated');

    if (!user.walletId)
      throw new BadRequestException('User has no wallet assigned');

    return this.paymentService.fundWallet(user.walletId, body.amount);
  }

  // ---------------------------
  // TRANSFER FUNDS
  // ---------------------------
  @UseGuards(JwtOrApiGuard)
  @Post('transfer')
  @ApiOperation({ summary: 'Transfer funds to another wallet' })
  @ApiBody({ type: TransferDto })
  @ApiResponse({ status: 200, description: 'Transfer completed successfully' })
  async transfer(@Req() req: any, @Body() body: TransferDto) {
    const user = req.user;

    if (!user?.walletId)
      throw new BadRequestException('User wallet not found');

    return this.paymentService.transferFunds(
      user.walletId, // sender wallet
      body.wallet_number, // receiver wallet
      body.amount,
    );
  }

  // ---------------------------
  // GET WALLET BALANCE
  // ---------------------------
  @UseGuards(JwtOrApiGuard)
  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns current wallet balance',
    schema: {
      type: 'object',
      properties: {
        balance: { type: 'number' },
      },
    },
  })
  async balance(@Req() req: any) {
    if (!req.user.walletId)
      throw new BadRequestException('User wallet not found');

    const wallet = await this.paymentService.getWallet(req.user.walletId);
    return { balance: wallet.balance };
  }

  // ---------------------------
  // GET TRANSACTIONS
  // ---------------------------
  @UseGuards(JwtOrApiGuard)
  @Get('transactions')
  @ApiOperation({ summary: 'Get list of wallet transactions' })
  @ApiResponse({
    status: 200,
    description: 'Returns all transactions for the wallet',
  })
  async transactions(@Req() req: any) {
    if (!req.user.walletId)
      throw new BadRequestException('User wallet not found');

    return this.paymentService.getWalletTransactions(req.user.walletId);
  }

  // ---------------------------
  // CHECK DEPOSIT STATUS (PAYSTACK MOCK)
  // ---------------------------
  @UseGuards(JwtOrApiGuard)
  @Get('deposit/:reference/status')
  @ApiOperation({ summary: 'Check the status of a deposit by reference' })
  @ApiResponse({
    status: 200,
    description: 'Returns the deposit status',
    schema: {
      type: 'object',
      properties: {
        reference: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  async getStatus(@Param('reference') reference: string) {
    return { reference, status: 'pending (no paystack setup yet)' };
  }
}
