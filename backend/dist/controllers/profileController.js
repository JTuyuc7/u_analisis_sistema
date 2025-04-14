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
exports.getProfile = exports.updateProfile = void 0;
const data_source_1 = require("../data-source");
const Customer_1 = require("../entities/Customer");
const AuditLog_1 = require("../entities/AuditLog");
// Update authenticated user's profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, address, first_name, last_name } = req.body;
        // Use transaction to ensure both profile update and audit log are saved
        yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const customerRepository = transactionalEntityManager.getRepository(Customer_1.Customer);
            const auditLogRepository = transactionalEntityManager.getRepository(AuditLog_1.AuditLog);
            // Find the authenticated customer
            const customer = yield customerRepository.findOne({
                where: { customer_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }
            });
            if (!customer) {
                res.status(404).json({ message: 'Customer not found' });
                return;
            }
            // Store old values for audit log
            const changes = [];
            if (phone !== undefined && phone !== customer.phone) {
                changes.push(`phone: ${customer.phone} -> ${phone}`);
                customer.phone = phone;
            }
            if (address !== undefined && address !== customer.address) {
                changes.push(`address: ${customer.address} -> ${address}`);
                customer.address = address;
            }
            if (first_name !== undefined && first_name !== customer.first_name) {
                changes.push(`first_name: ${customer.first_name} -> ${first_name}`);
                customer.first_name = first_name;
            }
            if (last_name !== undefined && last_name !== customer.last_name) {
                changes.push(`last_name: ${customer.last_name} -> ${last_name}`);
                customer.last_name = last_name;
            }
            // Only update and create audit log if there are changes
            if (changes.length > 0) {
                // Save the updated customer
                const updatedCustomer = yield customerRepository.save(customer);
                // Create audit log
                yield auditLogRepository.save(auditLogRepository.create({
                    customer,
                    operation: 'PROFILE_UPDATE',
                    details: `Updated profile fields: ${changes.join(', ')}`
                }));
                // Remove sensitive data from response
                const { password: _ } = updatedCustomer, customerWithoutPassword = __rest(updatedCustomer, ["password"]);
                res.json({
                    message: 'Profile updated successfully',
                    customer: customerWithoutPassword
                });
            }
            else {
                res.json({
                    message: 'No changes to update',
                    customer: Object.assign(Object.assign({}, customer), { password: undefined })
                });
            }
        }));
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});
exports.updateProfile = updateProfile;
// Get authenticated user's profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            const customerRepository = transactionalEntityManager.getRepository(Customer_1.Customer);
            const auditLogRepository = transactionalEntityManager.getRepository(AuditLog_1.AuditLog);
            const customer = yield customerRepository.findOne({
                where: { customer_id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id }
            });
            if (!customer) {
                res.status(404).json({ message: 'Customer not found' });
                return;
            }
            // Create audit log for profile view
            yield auditLogRepository.save(auditLogRepository.create({
                customer,
                operation: 'PROFILE_VIEW',
                details: 'Viewed profile information'
            }));
            // Remove sensitive data from response
            const { password: _ } = customer, customerWithoutPassword = __rest(customer, ["password"]);
            res.json({
                customer: customerWithoutPassword
            });
        }));
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});
exports.getProfile = getProfile;
