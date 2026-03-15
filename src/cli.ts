#!/usr/bin/env node

/**
 * Payment Skill CLI
 * 
 * Main entry point for the payment-skill command line interface
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { configCommands } from './commands/config';
import { providerCommands } from './commands/provider';
import { wiseCommands } from './commands/wise';
import { bunqCommands } from './commands/bunq';
import { transactionCommands } from './commands/transaction';
import { merchantCommands } from './commands/merchant';
import { limitCommands } from './commands/limits';
import { emergencyCommands } from './commands/emergency';
import { serverCommands } from './commands/server';
import { templateCommands } from './commands/template';
import { payCommand } from './commands/pay';

const program = new Command();

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
      console.log(chalk.gray('Verbose mode enabled'));
    }
  });

// Add command groups
program.addCommand(configCommands);
program.addCommand(providerCommands);
program.addCommand(wiseCommands);
program.addCommand(bunqCommands);
program.addCommand(transactionCommands);
program.addCommand(merchantCommands);
program.addCommand(limitCommands);
program.addCommand(emergencyCommands);
program.addCommand(serverCommands);
program.addCommand(templateCommands);
program.addCommand(payCommand);

// Global error handler
program.exitOverride();

try {
  program.parse();
} catch (error: any) {
  if (error.code === 'commander.help') {
    process.exit(0);
  } else if (error.code === 'commander.version') {
    process.exit(0);
  } else {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}