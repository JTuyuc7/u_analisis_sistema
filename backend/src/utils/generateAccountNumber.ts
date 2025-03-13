import { randomInt } from 'crypto';

export const generateAccountNumber = (): string => {
  let accountNumber = '';
  
  // First digit cannot be 0 to ensure 10 digits
  accountNumber += randomInt(1, 10).toString();
  
  // Generate remaining 9 digits
  for (let i = 0; i < 9; i++) {
    accountNumber += randomInt(0, 10).toString();
  }
  
  return accountNumber;
};
