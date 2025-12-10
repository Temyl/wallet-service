import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Wallet } from './wallet.entity';
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from 'src/shared/enums';
import { BaseEntity } from 'src/shared/base-entity/base.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  
    @ManyToOne(() => Wallet, wallet => wallet.transactions)
    wallet: Wallet;

    @Column({
        name: 'transaction_type',
        enum: TRANSACTION_TYPE,
        type: 'enum',
        default: TRANSACTION_TYPE.DEPOSIT
    })
    type: TRANSACTION_TYPE;

    @Column({ 
        name: 'amount',
        type: 'bigint' })
    amount: number;

    @Column({
        name: 'reference', 
        unique: true 
        })
    reference: string;

    @Column({
        name: 'transaction_status',
        enum: TRANSACTION_STATUS,
        type: 'enum',
        default: TRANSACTION_STATUS.SUCCESS 
    })
    status: TRANSACTION_STATUS;

    //   @Column({ type: 'jsonb', nullable: true })
    //   metadata: any;
}

