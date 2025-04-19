import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Account } from './Account';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
    card_id: number;

  @Column({ length: 16 })
    card_number: string;

  @Column({ length: 5 })
    expiration_date: string;

  @Column({ length: 3 })
    security_code: string;

  @ManyToOne(() => Account, account => account.cards)
  @JoinColumn({ name: 'account_id' })
    account: Account;

  @Column({ default: 'active' })
    status: string;

  @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
