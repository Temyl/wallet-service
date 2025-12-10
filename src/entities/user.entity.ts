import { BaseEntity } from "src/shared/base-entity/base.entity";
import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { Wallet } from "./wallet.entity";

@Entity('users')
export class User extends BaseEntity {
    @Column({ 
        name: 'email',
        unique: true })
    email: string;

    @Column({
        name: 'full_name',
    })
    fullName: string;

    @Column({
        name: 'google_id'
    })
    google_id: string;

    @OneToOne(() => Wallet, wallet => wallet.user)
    wallet: Wallet;


}