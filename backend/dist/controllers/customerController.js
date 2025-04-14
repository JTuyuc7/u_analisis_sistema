"use strict";
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
exports.setAdminStatus = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const data_source_1 = require("../data-source");
const Customer_1 = require("../entities/Customer");
const AuditLog_1 = require("../entities/AuditLog");
const getCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        const customers = yield customerRepository.find({
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
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers' });
    }
});
exports.getCustomers = getCustomers;
const getCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        const customer = yield customerRepository.findOne({
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
    }
    catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'Error fetching customer' });
    }
});
exports.getCustomerById = getCustomerById;
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body.admin, 'req.body.admin');
        const customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        // Check if email already exists
        const existingCustomer = yield customerRepository.findOne({
            where: { email: req.body.email }
        });
        if (existingCustomer) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        // Create and save the new customer
        const savedCustomer = yield customerRepository.save(customerRepository.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            address: req.body.address,
            admin: req.body.admin || false
        }));
        // Fetch the customer without password
        const customerWithoutPassword = yield customerRepository.findOne({
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
    }
    catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Error creating customer' });
    }
});
exports.createCustomer = createCustomer;
const updateCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        const customer = yield customerRepository.findOne({
            where: { customer_id: parseInt(req.params.id) }
        });
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        // If email is being updated, check if it already exists
        if (req.body.email && req.body.email !== customer.email) {
            const existingCustomer = yield customerRepository.findOne({
                where: { email: req.body.email }
            });
            if (existingCustomer) {
                res.status(400).json({ message: 'Email already registered' });
                return;
            }
        }
        // Don't allow password updates through this endpoint
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _a = req.body, { password } = _a, updateData = __rest(_a, ["password"]);
        customerRepository.merge(customer, updateData);
        yield customerRepository.save(customer);
        // Fetch the updated customer without password
        const updatedCustomer = yield customerRepository.findOne({
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
    }
    catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Error updating customer' });
    }
});
exports.updateCustomer = updateCustomer;
const deleteCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        const customer = yield customerRepository.findOne({
            where: { customer_id: parseInt(req.params.id) }
        });
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        yield customerRepository.remove(customer);
        res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ message: 'Error deleting customer' });
    }
});
exports.deleteCustomer = deleteCustomer;
const setAdminStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        const customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        const auditLogRepository = data_source_1.AppDataSource.getRepository(AuditLog_1.AuditLog);
        const customer = yield customerRepository.findOne({
            where: { email }
        });
        console.log('🚀 ~ setAdminStatus ~ customer:', customer);
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        // Get the admin user who made the request
        const adminUser = req.user;
        // Update admin status by saving the entity
        customer.admin = true;
        try {
            yield customerRepository.save(customer);
        }
        catch (error) {
            console.error('Error updating admin status:', error);
            throw new Error(`Failed to update admin status: ${error.message}`);
        }
        // Fetch the updated customer data
        const updatedCustomer = yield customerRepository.findOne({
            where: { email },
            select: ['customer_id', 'email', 'admin']
        });
        // Create audit log
        yield auditLogRepository.save(auditLogRepository.create({
            customer: customer,
            operation: 'SET_ADMIN_PRIVILEGES',
            details: `Admin privileges granted to ${email} by ${adminUser.email}`
        }));
        res.json({
            message: 'Admin privileges granted successfully',
            customer: updatedCustomer
        });
    }
    catch (error) {
        console.error('Error setting admin status:', error);
        res.status(500).json({ message: 'Error setting admin status' });
    }
});
exports.setAdminStatus = setAdminStatus;
