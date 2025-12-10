import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from 'src/shared/enums';
import { Wallet } from 'src/entities/wallet.entity';
import { Transfer } from 'src/entities/transfer.entity';
import { Transaction } from 'src/entities/transaction.entity'; // <-- correct import

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,

    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,

    @InjectRepository(Transfer)
    private transferRepo: Repository<Transfer>,

    private dataSource: DataSource,
  ) {}

  // -----------------------------------------
  // Helper to get wallet
  // -----------------------------------------
  async getWallet(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({
      where: { id: walletId },
      relations: ['user'],
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    return wallet;
  }

  // -----------------------------------------
  // FUND WALLET
  // -----------------------------------------
  async fundWallet(walletId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.dataSource.transaction(async manager => {
      const wallet = await manager.findOne(Wallet, { where: { id: walletId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      wallet.balance += amount;
      await manager.save(wallet);

      // Create transaction record safely
      const tx = new Transaction();
      tx.wallet = wallet;
      tx.amount = amount;
      tx.reference = `TX-${Date.now()}`;
      tx.type = TRANSACTION_TYPE.DEPOSIT;
      tx.status = TRANSACTION_STATUS.SUCCESS;

      await manager.save(tx);

      return {
        message: 'Wallet funded successfully',
        balance: wallet.balance,
        transaction: tx,
      };
    });
  }

  // -----------------------------------------
  // DEBIT WALLET
  // -----------------------------------------
  async debitWallet(walletId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.dataSource.transaction(async manager => {
      const wallet = await manager.findOne(Wallet, { where: { id: walletId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      if (wallet.balance < amount)
        throw new BadRequestException('Insufficient balance');

      wallet.balance -= amount;
      await manager.save(wallet);

      const tx = new Transaction();
      tx.wallet = wallet;
      tx.amount = amount;
      tx.reference = `TX-${Date.now()}`;
      tx.type = TRANSACTION_TYPE.WITHDRAWAL;
      tx.status = TRANSACTION_STATUS.SUCCESS;

      await manager.save(tx);

      return {
        message: 'Wallet debited successfully',
        balance: wallet.balance,
        transaction: tx,
      };
    });
  }

  // -----------------------------------------
  // TRANSFER WALLET → WALLET
  // -----------------------------------------
  async transferFunds(senderId: string, receiverId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    if (senderId === receiverId)
      throw new BadRequestException('Cannot transfer to yourself');

    return this.dataSource.transaction(async manager => {
      const sender = await manager.findOne(Wallet, { where: { id: senderId } });
      const receiver = await manager.findOne(Wallet, { where: { id: receiverId } });

      if (!sender) throw new NotFoundException('Sender wallet not found');
      if (!receiver) throw new NotFoundException('Receiver wallet not found');

      if (sender.balance < amount)
        throw new BadRequestException('Insufficient balance');

      sender.balance -= amount;
      receiver.balance += amount;

      await manager.save([sender, receiver]);

      const reference = `TF-${Date.now()}`;

      // Save transfer log
      const transfer = new Transfer();
      transfer.fromWalletId = sender.id;
      transfer.toWalletId = receiver.id;
      transfer.amount = amount;
      transfer.transactionReference = reference;
      await manager.save(transfer);

      // Sender transaction log
      const senderTx = new Transaction();
      senderTx.wallet = sender;
      senderTx.amount = amount;
      senderTx.reference = reference;
      senderTx.type = TRANSACTION_TYPE.TRANSFER;
      senderTx.status = TRANSACTION_STATUS.SUCCESS;
      await manager.save(senderTx);

      // Receiver transaction log
      const receiverTx = new Transaction();
      receiverTx.wallet = receiver;
      receiverTx.amount = amount;
      receiverTx.reference = reference;
      receiverTx.type = TRANSACTION_TYPE.TRANSFER;
      receiverTx.status = TRANSACTION_STATUS.SUCCESS;
      await manager.save(receiverTx);

      return {
        message: 'Transfer successful',
        reference,
        senderBalance: sender.balance,
        receiverBalance: receiver.balance,
      };
    });
  }

  // -----------------------------------------
  // GET WALLET TRANSACTIONS
  // -----------------------------------------
  async getWalletTransactions(walletId: string) {
    const wallet = await this.getWallet(walletId);

    const transactions = await this.transactionRepo.find({
      where: { wallet: { id: wallet.id } },
      order: { createdAt: 'DESC' },
    });

    return { walletId, transactions };
  }
}
