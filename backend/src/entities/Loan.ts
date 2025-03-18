import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from './Customer';

@Entity()
export class Loan {
    @PrimaryGeneratedColumn()
      loan_id: number;

    @ManyToOne(() => Customer, customer => customer.loans)
      customer: Customer;

    @Column('decimal', { precision: 15, scale: 2 })
      loan_amount: number;

    @Column('decimal', { precision: 5, scale: 2 })
      interest_rate: number;

    @Column()
      loan_term: number;

    @Column({ default: 'pending' })
      status: string;

    @CreateDateColumn()
      created_at: Date;

    @UpdateDateColumn()
      updated_at: Date;
}
