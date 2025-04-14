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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const initialData_1 = require("../seeders/initialData");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/seed:
 *   post:
 *     summary: Seed the database with initial data
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: Database seeded successfully
 *       500:
 *         description: Error seeding database
 */
router.post('/seed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, initialData_1.seedInitialData)(data_source_1.AppDataSource);
        res.status(200).json({ message: 'Database seeded successfully' });
    }
    catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).json({ message: 'Error seeding database', error: error instanceof Error ? error.message : String(error) });
    }
}));
exports.default = router;
