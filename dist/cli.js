#!/usr/bin/env node
"use strict";
/**
 * Payment Skill CLI
 *
 * Main entry point for the payment-skill command line interface
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("./commands/config");
const provider_1 = require("./commands/provider");
const wise_1 = require("./commands/wise");
const bunq_1 = require("./commands/bunq");
const transaction_1 = require("./commands/transaction");
const merchant_1 = require("./commands/merchant");
const limits_1 = require("./commands/limits");
const emergency_1 = require("./commands/emergency");
const server_1 = require("./commands/server");
const template_1 = require("./commands/template");
const pay_1 = require("./commands/pay");
const program = new commander_1.Command();
program
    .name('payment-skill')
    .description('Self-hosted payment skill for OpenClaw')
    .version('1.0.0')
    .option('-v, --verbose', 'Enable verbose output')
    .option('-j, --json', 'Output in JSON format')
    .option('-c, --config <path>', 'Path to config file')
    .option('--dry-run', 'Simulate without executing')
    .hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    if (options.verbose) {
        console.log(chalk_1.default.gray('Verbose mode enabled'));
    }
});
// Add command groups
program.addCommand(config_1.configCommands);
program.addCommand(provider_1.providerCommands);
program.addCommand(wise_1.wiseCommands);
program.addCommand(bunq_1.bunqCommands);
program.addCommand(transaction_1.transactionCommands);
program.addCommand(merchant_1.merchantCommands);
program.addCommand(limits_1.limitCommands);
program.addCommand(emergency_1.emergencyCommands);
program.addCommand(server_1.serverCommands);
program.addCommand(template_1.templateCommands);
program.addCommand(pay_1.payCommand);
// Global error handler
program.exitOverride();
try {
    program.parse();
}
catch (error) {
    if (error.code === 'commander.help') {
        process.exit(0);
    }
    else if (error.code === 'commander.version') {
        process.exit(0);
    }
    else {
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=cli.js.map