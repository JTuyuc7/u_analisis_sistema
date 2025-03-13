import { Connection } from 'typeorm';
import { Customer } from '../entities/Customer';
import { Account } from '../entities/Account';
import bcrypt from 'bcrypt';
import { generateAccountNumber } from '../utils/generateAccountNumber';

export const seedInitialData = async (connection: Connection): Promise<void> => {
  try {
    const customerRepository = connection.getRepository(Customer);
    const accountRepository = connection.getRepository(Account);

    // Create initial customers
    const hashedPassword = await bcrypt.hash('password123', 10);

    const customer1 = customerRepository.create({
      first_name: 'user1',
      last_name: 'test1',
      email: 'test1@test.com',
      phone: '123-456-7890',
      address: '123 Main St',
      password: hashedPassword,
      admin: true
    });

    const customer2 = customerRepository.create({
      first_name: 'user2',
      last_name: 'test2',
      email: 'test2@test.com',
      phone: '987-654-3210',
      address: '456 Elm St',
      password: hashedPassword,
      admin: false
    });

    const savedCustomers = await customerRepository.save([customer1, customer2]);

    // Create initial accounts
    const account1 = accountRepository.create({
      customer: savedCustomers[0],
      account_number: generateAccountNumber(),
      account_type: 'checking',
      account_name: 'John Doe Checking',
      balance: 1000.00
    });

    const account2 = accountRepository.create({
      customer: savedCustomers[1],
      account_number: generateAccountNumber(),
      account_type: 'savings',
      account_name: 'Jane Smith Savings',
      balance: 5000.00
    });

    await accountRepository.save([account1, account2]);

    console.log('Initial data seeded successfully');
  } catch (error) {
    console.error('Error seeding initial data:', error);
    throw error;
  }
};
