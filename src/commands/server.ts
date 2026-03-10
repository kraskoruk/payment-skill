/**
 * Payment Skill - Server Commands
 * 
 * Server management with actual implementation
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { PaymentSkillServer } from '../server/server';

export const serverCommands = new Command('server')
  .description('Server management');

serverCommands
  .command('serve', { isDefault: true })
  .description('Start the dashboard server')
  .option('-p, --port <port>', 'Port number', '8080')
  .option('-h, --host <host>', 'Host address', 'localhost')
  .action((options) => {
    console.log(chalk.blue(`Starting Payment Skill server...`));
    console.log(chalk.gray(`Port: ${options.port}`));
    console.log(chalk.gray(`Host: ${options.host}`));
    
    const server = new PaymentSkillServer(parseInt(options.port));
    server.start();
    
    console.log(chalk.green(`\n✓ Server started!`));
    console.log(chalk.blue(`\nDashboard: http://${options.host}:${options.port}`));
    console.log(chalk.gray(`API: http://${options.host}:${options.port}/api`));
    console.log(chalk.gray(`Press Ctrl+C to stop`));
  });

serverCommands
  .command('stop')
  .description('Stop the server (not implemented - use Ctrl+C)')
  .action(() => {
    console.log(chalk.yellow('To stop the server, press Ctrl+C in the terminal where it\'s running'));
  });

serverCommands
  .command('status')
  .description('Check server status')
  .option('-p, --port <port>', 'Port number', '8080')
  .action(async (options) => {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`http://localhost:${options.port}/api/health`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        console.log(chalk.green('✓ Server is running'));
        console.log(`  Version: ${data.version}`);
        console.log(`  Emergency Stop: ${data.emergencyStop ? chalk.red('ACTIVE') : chalk.green('inactive')}`);
      }
    } catch (error) {
      console.log(chalk.red('✗ Server is not running'));
      console.log(chalk.gray(`  Could not connect to port ${options.port}`));
    }
  });