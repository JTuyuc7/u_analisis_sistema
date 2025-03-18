import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Customer } from '../entities/Customer';
import { AuditLog } from '../entities/AuditLog';

// Update authenticated user's profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, address, first_name, last_name } = req.body;

    // Use transaction to ensure both profile update and audit log are saved
    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const customerRepository = transactionalEntityManager.getRepository(Customer);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);

      // Find the authenticated customer
      const customer = await customerRepository.findOne({ 
        where: { customer_id: req.user?.id }
      });

      if (!customer) {
        res.status(404).json({ message: 'Customer not found' });
        return;
      }

      // Store old values for audit log
      const changes = [];
      if (phone !== undefined && phone !== customer.phone) {
        changes.push(`phone: ${customer.phone} -> ${phone}`);
        customer.phone = phone;
      }
      if (address !== undefined && address !== customer.address) {
        changes.push(`address: ${customer.address} -> ${address}`);
        customer.address = address;
      }
      if (first_name !== undefined && first_name !== customer.first_name) {
        changes.push(`first_name: ${customer.first_name} -> ${first_name}`);
        customer.first_name = first_name;
      }
      if (last_name !== undefined && last_name !== customer.last_name) {
        changes.push(`last_name: ${customer.last_name} -> ${last_name}`);
        customer.last_name = last_name;
      }

      // Only update and create audit log if there are changes
      if (changes.length > 0) {
        // Save the updated customer
        const updatedCustomer = await customerRepository.save(customer);

        // Create audit log
        await auditLogRepository.save(auditLogRepository.create({
          customer,
          operation: 'PROFILE_UPDATE',
          details: `Updated profile fields: ${changes.join(', ')}`
        }));

        // Remove sensitive data from response
        const { password: _, ...customerWithoutPassword } = updatedCustomer;

        res.json({
          message: 'Profile updated successfully',
          customer: customerWithoutPassword
        });
      } else {
        res.json({
          message: 'No changes to update',
          customer: { ...customer, password: undefined }
        });
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Get authenticated user's profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const customerRepository = transactionalEntityManager.getRepository(Customer);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);

      const customer = await customerRepository.findOne({
        where: { customer_id: req.user?.id }
      });

      if (!customer) {
        res.status(404).json({ message: 'Customer not found' });
        return;
      }

      // Create audit log for profile view
      await auditLogRepository.save(auditLogRepository.create({
        customer,
        operation: 'PROFILE_VIEW',
        details: 'Viewed profile information'
      }));

      // Remove sensitive data from response
      const { password: _, ...customerWithoutPassword } = customer;

      res.json({
        customer: customerWithoutPassword
      });
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};
