import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Customer } from '../entities/Customer';

// Admin middleware check
const checkAdmin = (req: Request, res: Response, next: () => void) => {
  if (!req.user?.admin) {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    return;
  }
  next();
};

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
