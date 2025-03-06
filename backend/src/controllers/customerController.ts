import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Customer } from '../entities/Customer';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerRepository = getRepository(Customer);
        const customers = await customerRepository.find();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error });
    }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerRepository = getRepository(Customer);
        const customer = await customerRepository.findOne({ where: { customer_id: parseInt(req.params.id) } });
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer', error });
    }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerRepository = getRepository(Customer);
        const newCustomer = customerRepository.create(req.body);
        const result = await customerRepository.save(newCustomer);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error creating customer', error });
    }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerRepository = getRepository(Customer);
        const customer = await customerRepository.findOne({ where: { customer_id: parseInt(req.params.id) } });
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        customerRepository.merge(customer, req.body);
        const result = await customerRepository.save(customer);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer', error });
    }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerRepository = getRepository(Customer);
        const customer = await customerRepository.findOne({ where: { customer_id: parseInt(req.params.id) } });
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        await customerRepository.remove(customer);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error });
    }
};
