import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Customer {
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

    @CreateDateColumn()
      created_at: Date;

    @UpdateDateColumn()
      updated_at: Date;
}
