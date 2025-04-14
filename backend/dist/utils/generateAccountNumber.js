"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccountNumber = void 0;
const crypto_1 = require("crypto");
const generateAccountNumber = () => {
    let accountNumber = '';
    // First digit cannot be 0 to ensure 10 digits
    accountNumber += (0, crypto_1.randomInt)(1, 10).toString();
    // Generate remaining 9 digits
    for (let i = 0; i < 9; i++) {
        accountNumber += (0, crypto_1.randomInt)(0, 10).toString();
    }
    return accountNumber;
};
exports.generateAccountNumber = generateAccountNumber;
