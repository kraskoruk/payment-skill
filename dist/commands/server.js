"use strict";
/**
 * Payment Skill - Server Commands
 *
 * Server management with actual implementation
 */
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const server_1 = require("../server/server");
exports.serverCommands = new commander_1.Command('server')
    .description('Server management');
exports.serverCommands
    .command('serve', { isDefault: true })
    .description('Start the dashboard server')
    .option('-p, --port <port>', 'Port number', '8080')
    .option('-h, --host <host>', 'Host address', 'localhost')
    .action((options) => {
    console.log(chalk_1.default.blue(`Starting Payment Skill server...`));
    console.log(chalk_1.default.gray(`Port: ${options.port}`));
    console.log(chalk_1.default.gray(`Host: ${options.host}`));
    const server = new server_1.PaymentSkillServer(parseInt(options.port));
    server.start();
    console.log(chalk_1.default.green(`\n✓ Server started!`));
    console.log(chalk_1.default.blue(`\nDashboard: http://${options.host}:${options.port}`));
    console.log(chalk_1.default.gray(`API: http://${options.host}:${options.port}/api`));
    console.log(chalk_1.default.gray(`Press Ctrl+C to stop`));
});
exports.serverCommands
    .command('stop')
    .description('Stop the server (not implemented - use Ctrl+C)')
    .action(() => {
    console.log(chalk_1.default.yellow('To stop the server, press Ctrl+C in the terminal where it\'s running'));
});
exports.serverCommands
    .command('status')
    .description('Check server status')
    .option('-p, --port <port>', 'Port number', '8080')
    .action(async (options) => {
    try {
        const fetch = (await Promise.resolve().then(() => __importStar(require('node-fetch')))).default;
        const response = await fetch(`http://localhost:${options.port}/api/health`);
        const data = await response.json();
        if (data.status === 'ok') {
            console.log(chalk_1.default.green('✓ Server is running'));
            console.log(`  Version: ${data.version}`);
            console.log(`  Emergency Stop: ${data.emergencyStop ? chalk_1.default.red('ACTIVE') : chalk_1.default.green('inactive')}`);
        }
    }
    catch (error) {
        console.log(chalk_1.default.red('✗ Server is not running'));
        console.log(chalk_1.default.gray(`  Could not connect to port ${options.port}`));
    }
});
//# sourceMappingURL=server.js.map