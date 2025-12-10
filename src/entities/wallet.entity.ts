import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from 'src/shared/base-entity/base.entity';
import { Transaction } from './transaction.entity';

@Entity('wallets')
export class Wallet extends BaseEntity {
  
    @Column({ 
        unique: true,
        name: 'wallet_number' 
     })
    walletNumber: string;

    @Column({
        name: 'wallet_balance', 
        type: 'bigint', 
        default: 0 })
    balance: number;

    @OneToOne(() => User, (user) => user.wallet)
    @JoinColumn() 
    user: User;

    @OneToMany(() => Transaction, tx => tx.wallet)
    transactions: Transaction[];
}
