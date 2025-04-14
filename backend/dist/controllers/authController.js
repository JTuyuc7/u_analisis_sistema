"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const data_source_1 = require("../data-source");
const Customer_1 = require("../entities/Customer");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
// Register a new customer
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        const { first_name, last_name, email, password, phone, address, isAdmin = false } = req.body;
        // Check if user already exists
        const existingCustomer = yield customerRepository.findOne({ where: { email } });
        if (existingCustomer) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        // Hash password
        const hashedPassword = yield bcrypt.hash(password, 10);
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
        yield customerRepository.save(customer);
        // Remove password from response
        const { password: _ } = customer, customerWithoutPassword = __rest(customer, ["password"]);
        res.status(201).json({
            message: 'Customer registered successfully',
            customer: customerWithoutPassword
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering customer' });
    }
});
exports.register = register;
// Login customer
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        const { email, password } = req.body;
        // Find customer by email
        const customer = yield customerRepository.findOne({ where: { email } });
        if (!customer) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Check password
        const validPassword = yield bcrypt.compare(password, customer.password);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Generate JWT token
        const token = jwt.sign({
            id: customer.customer_id,
            email: customer.email,
            admin: customer.admin,
            name: customer.first_name,
            last_name: customer.last_name
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        // Remove password from response
        const { password: _ } = customer, customerWithoutPassword = __rest(customer, ["password"]);
        // Set token in response header
        res.setHeader('Authorization', `Bearer ${token}`);
        res.json({
            message: 'Login successful',
            customer: customerWithoutPassword
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});
exports.login = login;
