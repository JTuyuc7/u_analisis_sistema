import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Account } from './Account';
import { Loan } from './Loan';

@Entity()
export class Customer {
    @OneToMany(() => Account, account => account.customer)
      accounts: Account[];

    async hasReachedAccountLimit(): Promise<boolean> {
      if (!this.accounts) {
        return false;
      }
      return this.accounts.filter(account => account.status === 'active').length >= 3;
    }

    @OneToMany(() => Loan, loan => loan.customer)
      loans: Loan[];

    @PrimaryGeneratedColumn()
      customer_id: number;

    @Column({ length: 50 })
      first_name: string;

    @Column({ length: 50 })
      last_name: string;

    @Column({ length: 100, unique: true })
      email: string;

    @Column({ length: 255, nullable: false }) // Password field, not nullable
      password: string;

    @Column({ length: 20, nullable: true })
      phone: string;

    @Column({ type: 'text', nullable: true })
      address: string;

    @Column({ default: false })
      admin: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
      created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
      updated_at: Date;
}
