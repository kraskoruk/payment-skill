"use strict";
/**
 * Payment Skill - Express Server
 *
 * Serves the web dashboard and handles webhooks
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSkillServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../core/config");
const transaction_1 = require("../core/transaction");
class PaymentSkillServer {
    constructor(port = 8080) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupMiddleware() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: false // Allow inline scripts for dashboard
        }));
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../../')));
    }
    setupRoutes() {
        // Health check
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'ok',
                version: '1.0.0',
                emergencyStop: config_1.configManager.isEmergencyStopActive()
            });
        });
        // Get configuration
        this.app.get('/api/config', (req, res) => {
            const config = config_1.configManager.getConfig();
            // Remove sensitive data
            const safeConfig = {
                ...config,
                providers: Object.entries(config.providers).reduce((acc, [key, val]) => {
                    acc[key] = {
                        name: val.name,
                        environment: val.environment,
                        // Don't expose API keys
                        apiKey: val.apiKey ? '***' : undefined
                    };
                    return acc;
                }, {})
            };
            res.json(safeConfig);
        });
        // Get transactions
        this.app.get('/api/transactions', (req, res) => {
            const transactions = transaction_1.transactionManager.getTransactions();
            res.json(transactions);
        });
        // Get emergency stop status
        this.app.get('/api/emergency', (req, res) => {
            res.json(config_1.configManager.getEmergencyStopState());
        });
        // Activate emergency stop
        this.app.post('/api/emergency/stop', (req, res) => {
            config_1.configManager.activateEmergencyStop(req.body.reason);
            transaction_1.transactionManager.cancelAllPending();
            res.json({ success: true, message: 'Emergency stop activated' });
        });
        // Deactivate emergency stop
        this.app.post('/api/emergency/resume', (req, res) => {
            config_1.configManager.deactivateEmergencyStop();
            res.json({ success: true, message: 'Emergency stop deactivated' });
        });
        // Get limits
        this.app.get('/api/limits', (req, res) => {
            res.json({
                limits: config_1.configManager.getLimits(),
                timeWindow: config_1.configManager.getTimeWindow()
            });
        });
        // Webhook endpoints
        this.app.post('/webhooks/wise', (req, res) => {
            console.log('Wise webhook received:', req.body);
            // Process webhook
            res.status(200).send('OK');
        });
        this.app.post('/webhooks/bunq', (req, res) => {
            console.log('Bunq webhook received:', req.body);
            // Process webhook
            res.status(200).send('OK');
        });
        // Dashboard route - serve dashboard.html
        this.app.get('/', (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../../dashboard.html'));
        });
        this.app.get('/dashboard', (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../../dashboard.html'));
        });
    }
    start() {
        this.app.listen(this.port, () => {
            console.log(`Payment Skill server running on http://localhost:${this.port}`);
            console.log(`Dashboard: http://localhost:${this.port}/dashboard`);
        });
    }
}
exports.PaymentSkillServer = PaymentSkillServer;
// Start server if run directly
if (require.main === module) {
    const port = parseInt(process.env.PORT || '8080');
    const server = new PaymentSkillServer(port);
    server.start();
}
//# sourceMappingURL=server.js.map