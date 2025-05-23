/**
 * Utility functions for generating card details
 */

/**
 * Generates a random 16-digit card number
 */
function generateCardNumber(){
  const numbers = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10));
  return numbers.join('');
}

/**
 * Generates an expiration date 5 years from now with random month
 * Returns in format MM/YY
 */
function generateExpirationDate() {
  const currentDate = new Date();
  const futureYear = currentDate.getFullYear() + 5;
  const randomMonth = Math.floor(Math.random() * 12) + 1; // 1-12
  const monthStr = randomMonth.toString().padStart(2, '0');
  const yearStr = (futureYear % 100).toString(); // Get last 2 digits
  return `${monthStr}/${yearStr}`;
}

/**
 * Generates a random 3-digit security code (CVV)
 */
function generateSecurityCode(){
  const numbers = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10));
  return numbers.join('');
}

/**
 * Generates all card details at once
 */
function generateCardDetails() {
  return {
    cardNumber: generateCardNumber(),
    expirationDate: generateExpirationDate(),
    securityCode: generateSecurityCode()
  };
}
