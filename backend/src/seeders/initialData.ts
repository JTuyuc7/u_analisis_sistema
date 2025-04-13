import { Connection } from 'typeorm';
import { Customer } from '../entities/Customer';
import { Account } from '../entities/Account';
import bcrypt from 'bcrypt';
import { generateAccountNumber } from '../utils/generateAccountNumber';

async function clearDatabase(connection: Connection): Promise<void> {
  // Clear tables in order (respecting foreign key constraints)
  await connection.query('TRUNCATE TABLE "card" CASCADE');
  await connection.query('TRUNCATE TABLE "transaction" CASCADE');
  await connection.query('TRUNCATE TABLE "account" CASCADE');
  await connection.query('TRUNCATE TABLE "loan" CASCADE');
  await connection.query('TRUNCATE TABLE "customer" CASCADE');

  // Reset sequences
  await connection.query('ALTER SEQUENCE card_card_id_seq RESTART WITH 1');
  await connection.query('ALTER SEQUENCE transaction_transaction_id_seq RESTART WITH 1');
  await connection.query('ALTER SEQUENCE account_account_id_seq RESTART WITH 1');
  await connection.query('ALTER SEQUENCE loan_loan_id_seq RESTART WITH 1');
  await connection.query('ALTER SEQUENCE customer_customer_id_seq RESTART WITH 1');

  console.log('Database cleared and sequences reset successfully');
}

export const seedInitialData = async (connection: Connection): Promise<void> => {
  try {
    // Clear existing data
    await clearDatabase(connection);

    const customerRepository = connection.getRepository(Customer);
    const accountRepository = connection.getRepository(Account);

    // Create initial customers
    const hashedPassword = await bcrypt.hash('12345678', 10);

    const customer1 = customerRepository.create({
      first_name: 'user1',
      last_name: 'test1',
      email: 'test1@test.com',
      phone: '123-456-7890',
      address: '123 Main St',
      password: hashedPassword,
      admin: false
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

    // Create initial accounts using direct SQL queries
    const account1Number = generateAccountNumber();
    const account2Number = generateAccountNumber();

    console.log('Creating accounts with details:', {
      account1: {
        customer_id: savedCustomers[0].customer_id,
        account_number: account1Number
      },
      account2: {
        customer_id: savedCustomers[1].customer_id,
        account_number: account2Number
      }
    });

    // Insert accounts directly
    await connection.query(`
      INSERT INTO "account" 
      ("customerCustomerId", "account_number", "account_type", "account_name", "balance", "security_pin", "status", "created_at", "updated_at")
      VALUES 
      ($1, $2, 'checking', 'John Doe Checking', 1000.00, '1234', 'active', NOW(), NOW()),
      ($3, $4, 'savings', 'Jane Smith Savings', 5000.00, '5678', 'active', NOW(), NOW())
    `, [savedCustomers[0].customer_id, account1Number, savedCustomers[1].customer_id, account2Number]);

    console.log('Accounts created successfully via direct SQL insertion');

    // Verify final state with more details
    const finalAccounts = await accountRepository.find({
      relations: ['customer']
    });

    console.log('Final accounts state:', finalAccounts.map(acc => ({
      account_id: acc.account_id,
      account_number: acc.account_number,
      customer_id: acc.customer?.customer_id
    })));

    console.log('Initial data seeded successfully');
  } catch (error) {
    console.error('Error seeding initial data:', error);
    throw error;
  }
};
