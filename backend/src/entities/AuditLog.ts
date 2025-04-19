import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './Customer';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn()
      log_id: number;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
      customer: Customer;

    @Column()
      operation: string;

    @Column({ type: 'text', nullable: true })
      details: string;

    @CreateDateColumn({ type: 'timestamptz' })
      log_date: Date;

    static create(data: {
        customer_id: number;
        operation: string;
        details: string;
    }): AuditLog {
      const log = new AuditLog();
      log.customer = { customer_id: data.customer_id } as Customer;
      log.operation = data.operation;
      log.details = data.details;
      return log;
    }
}
