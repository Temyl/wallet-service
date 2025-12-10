import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from 'src/shared/base-entity/base.entity';

@Entity('api_keys')
export class ApiKey extends BaseEntity {

    @ManyToOne(() => User)
    owner: User;

    @Column({
        name: 'name'
    })
    name: string;

    @Column({
        name: 'api_key'
    })
    keyHash: string;

    @Column('text', { array: true })
    permissions: string[];

    @Column({
        name: 'expires_at', 
        type: 'timestamptz', 
        nullable: true })
    expiresAt: Date;

    @Column({
        name: 'is_revoked',
        default: false })
    revoked: boolean;

}
