CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    admin BOOLEAN DEFAULT false,  -- Indicates if a customer is an admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    account_number VARCHAR(10) UNIQUE NOT NULL,
    account_type VARCHAR(50) NOT NULL,  -- e.g., 'checking', 'savings'
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE transaction (
    transaction_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,  -- e.g., 'deposit', 'withdrawal', 'transfer'
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (account_id) REFERENCES account(account_id)
);

CREATE TABLE loan (
    loan_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    loan_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,  -- e.g., 5.25%
    loan_term INTEGER,  -- Term in months or years as needed
    status VARCHAR(20) DEFAULT 'pending',  -- e.g., 'approved', 'rejected', 'active'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    customer_id INTEGER,  -- The admin or user who performed the action
    operation TEXT NOT NULL,  -- Description of the action (e.g., 'updated account balance')
    details TEXT,  -- Additional details about the change
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);
