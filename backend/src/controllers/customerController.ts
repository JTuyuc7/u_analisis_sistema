import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Customer } from '../entities/Customer';
import { AuditLog } from '../entities/AuditLog';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const customers = await customerRepository.find({
      select: [
        'customer_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'admin',
        'created_at',
        'updated_at'
      ]
    });

    res.json({
      message: 'Customers retrieved successfully',
      customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const customer = await customerRepository.findOne({
      where: { customer_id: parseInt(req.params.id) },
      select: [
        'customer_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'admin',
        'created_at',
        'updated_at'
      ]
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    res.json({
      message: 'Customer retrieved successfully',
      customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    
    // Check if email already exists
    const existingCustomer = await customerRepository.findOne({ 
      where: { email: req.body.email } 
    });

    if (existingCustomer) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Create and save the new customer
    const savedCustomer = await customerRepository.save(
      customerRepository.create({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        address: req.body.address,
        admin: req.body.admin || false
      })
    );

    // Fetch the customer without password
    const customerWithoutPassword = await customerRepository.findOne({
      where: { customer_id: savedCustomer.customer_id },
      select: [
        'customer_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'admin',
        'created_at',
        'updated_at'
      ]
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer: customerWithoutPassword
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const customer = await customerRepository.findOne({ 
      where: { customer_id: parseInt(req.params.id) }
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // If email is being updated, check if it already exists
    if (req.body.email && req.body.email !== customer.email) {
      const existingCustomer = await customerRepository.findOne({ 
        where: { email: req.body.email } 
      });

      if (existingCustomer) {
        res.status(400).json({ message: 'Email already registered' });
        return;
      }
    }

    // Don't allow password updates through this endpoint
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...updateData } = req.body;
    customerRepository.merge(customer, updateData);
    await customerRepository.save(customer);

    // Fetch the updated customer without password
    const updatedCustomer = await customerRepository.findOne({
      where: { customer_id: parseInt(req.params.id) },
      select: [
        'customer_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'admin',
        'created_at',
        'updated_at'
      ]
    });

    res.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const customer = await customerRepository.findOne({ 
      where: { customer_id: parseInt(req.params.id) }
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    await customerRepository.remove(customer);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
};

export const setAdminStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const customerRepository = AppDataSource.getRepository(Customer);
    const auditLogRepository = AppDataSource.getRepository(AuditLog);
    
    const customer = await customerRepository.findOne({ 
      where: { email } 
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Get the admin user who made the request
    const adminUser = (req as any).user;

    // Update admin status by saving the entity
    customer.admin = true;
    try {
      await customerRepository.save(customer);
    } catch (error: any) {
      console.error('Error updating admin status:', error);
      throw new Error(`Failed to update admin status: ${error.message}`);
    }

    // Fetch the updated customer data
    const updatedCustomer = await customerRepository.findOne({
      where: { email },
      select: ['customer_id', 'email', 'admin']
    });

    // Create audit log
    await auditLogRepository.save(auditLogRepository.create({
      customer: customer,
      operation: 'SET_ADMIN_PRIVILEGES',
      details: `Admin privileges granted to ${email} by ${adminUser.email}`
    }));

    res.json({
      message: 'Admin privileges granted successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Error setting admin status:', error);
    res.status(500).json({ message: 'Error setting admin status' });
  }
};
