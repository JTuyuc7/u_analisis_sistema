import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Customer } from '../entities/Customer';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Register a new customer
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const { first_name, last_name, email, password, phone, address, isAdmin = false } = req.body;

    // Check if user already exists
    const existingCustomer = await customerRepository.findOne({ where: { email } });
    if (existingCustomer) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new customer
    const customer = customerRepository.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone,
      address,
      admin: isAdmin
    });

    // Save customer to database
    await customerRepository.save(customer);

    // Remove password from response
    const { password: _, ...customerWithoutPassword } = customer;

    res.status(201).json({
      message: 'Customer registered successfully',
      customer: customerWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering customer' });
  }
};

// Login customer
export const login = async (req: Request, res: Response): Promise<void> => {
  console.log('from Login');
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    console.log('🚀 ~ login ~ customerRepository:', customerRepository);
    
    const { email, password } = req.body;

    // Find customer by email
    const customer = await customerRepository.findOne({ where: { email } });
    if (!customer) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check password
    const validPassword = await bcrypt.compare(password, customer.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: customer.customer_id,
        email: customer.email,
        admin: customer.admin,
        name: customer.first_name,
        last_name: customer.last_name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...customerWithoutPassword } = customer;

    // Set token in response header
    res.setHeader('Authorization', `Bearer ${token}`);

    res.json({
      message: 'Login successful',
      customer: customerWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};
