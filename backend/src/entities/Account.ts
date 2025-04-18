import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Customer } from './Customer';
import { Transaction } from './Transaction';
import { Card } from './Card';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
    account_id: number;

  @ManyToOne(() => Customer, customer => customer.accounts)
  @JoinColumn({ name: 'customer_id' })
    customer: Customer;

  @Column({ unique: true })
    account_number: string;

  @Column()
    account_type: string;

  @Column()
    account_name: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
    balance: number;

  @Column({ default: 'active' })
    status: string;

  @Column({ length: 255 })
    security_pin: string;

  @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

  @OneToMany(() => Transaction, transaction => transaction.account)
    transactions: Transaction[];

  @OneToMany(() => Card, card => card.account)
    cards: Card[];

  async hasReachedCardLimit(): Promise<boolean> {
    if (!this.cards) {
      return false;
    }
    return this.cards.filter(card => card.status === 'active').length >= 2;
  }

}
