import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Account } from './Account';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
      transaction_id: number;

    @ManyToOne(() => Account, account => account.transactions)
      account: Account;

    @Column()
      transaction_type: string;  // 'deposit', 'withdrawal', 'transfer'

    @Column('decimal', { precision: 15, scale: 2 })
      amount: number;

    @Column({ nullable: true })
      description: string;

    @Column({ nullable: true })
      related_account_id: number;  // For transfers, stores the other account involved

    @CreateDateColumn()
      transaction_date: Date;
}
