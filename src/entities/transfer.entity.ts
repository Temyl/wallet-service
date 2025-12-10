import { BaseEntity } from 'src/shared/base-entity/base.entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transfers')
export class Transfer extends BaseEntity {

    @Column({
        name: 'sender_wallet_id'
    })
    fromWalletId: string;

    @Column({ 
        name: 'receiver_wallet_id'
    })
    toWalletId: string;

    @Column({ 
        name: 'amount',
        type: 'bigint' })
    amount: number;

    @Column({
        name: 'transaction_reference'
    })
    transactionReference: string;
}
