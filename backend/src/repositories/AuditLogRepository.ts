import { EntityRepository, Repository } from 'typeorm';
import { AuditLog } from '../entities/AuditLog';

@EntityRepository(AuditLog)
export class AuditLogRepository extends Repository<AuditLog> {
  async createLog(data: {
        customer_id: number;
        operation: string;
        details: string;
    }): Promise<AuditLog> {
    const log = AuditLog.create(data);
    return this.save(log);
  }

  async getLogsByCustomerId(customerId: number): Promise<AuditLog[]> {
    return this.find({
      where: { customer: { customer_id: customerId } },
      order: { log_date: 'DESC' }
    });
  }
}
