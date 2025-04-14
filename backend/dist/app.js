"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const accountRoutes_1 = __importDefault(require("./routes/accountRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const seedRoutes_1 = __importDefault(require("./routes/seedRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const data_source_1 = require("./data-source");
const dotenv_1 = __importDefault(require("dotenv"));
const swaggerConfig_1 = require("./swaggerConfig");
const cors_1 = __importDefault(require("cors"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Enable CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware
app.use(express_1.default.json());
// Routes
app.use('/api/customers', customerRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/accounts', accountRoutes_1.default);
app.use('/api', profileRoutes_1.default);
app.use('/api', seedRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
// Swagger documentation
const specs = (0, swagger_jsdoc_1.default)(swaggerConfig_1.swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve);
app.use('/api-docs', swagger_ui_express_1.default.setup(specs, { explorer: true }));
// Initialize database connection
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('Error connecting to the database:', error);
});
exports.default = app;
