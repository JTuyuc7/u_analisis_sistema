import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Account } from './Account';
import { Customer } from './Customer';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
      transaction_id: number;

    @ManyToOne(() => Account, account => account.transactions)
    @JoinColumn({ name: 'account_id' })
      account: Account;
      
    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
      customer: Customer;

    @Column()
      transaction_type: string;  // 'deposit', 'withdrawal', 'transfer'

    @Column('decimal', { precision: 15, scale: 2 })
      amount: number;

    @Column({ nullable: true })
      description: string;

    @Column({ nullable: true })
      related_account_id: number;  // For transfers, stores the other account involved

    @CreateDateColumn({ type: 'timestamptz' })
      transaction_date: Date;
}
