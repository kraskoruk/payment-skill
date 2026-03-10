/**
 * Payment Skill - Pay Command
 * 
 * Execute payment using templates - HYBRID ARCHITECTURE
 * OpenClaw selects template and provides parameters
 * Payment-skill executes the predefined flow
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { templateEngine } from '../core/template-engine';

export const payCommand = new Command('pay')
  .description('Execute a payment using a template (HYBRID ARCHITECTURE)')
  .requiredOption('-t, --template <id>', 'Template ID (e.g., wise_standard_transfer, bunq_instant_payment)')
  .requiredOption('--amount <amount>', 'Payment amount')
  .requiredOption('--currency <currency>', 'Currency code (EUR, USD, etc.)')
  .option('--profile-id <id>', 'Wise profile ID')
  .option('--user-id <id>', 'Bunq user ID')
  .option('--account-id <id>', 'Bunq account ID')
  .option('--recipient-id <id>', 'Recipient/account ID')
  .option('--recipient-iban <iban>', 'Recipient IBAN')
  .option('--recipient-name <name>', 'Recipient name')
  .option('--reference <text>', 'Payment reference')
  .option('--description <text>', 'Payment description')
  .option('--dry-run', 'Show what would be executed without actually doing it')
  .action(async (options) => {
    const spinner = ora('Initializing payment...').start();
    
    try {
      // Get template
      const template = templateEngine.getTemplate(options.template);
      if (!template) {
        spinner.fail(`Template '${options.template}' not found`);
        console.log(chalk.yellow('\nAvailable templates:'));
        const templates = templateEngine.getAllTemplates();
        templates.forEach(t => {
          console.log(`  ${t.templateId} - ${t.description}`);
        });
        process.exit(1);
      }

      spinner.succeed(`Using template: ${template.templateId}`);
      console.log(chalk.blue(`Description: ${template.description}`));
      console.log(chalk.gray(`Merchant: ${template.merchant}`));
      
      // Build parameters
      const params: Record<string, any> = {
        amount: options.amount,
        currency: options.currency.toUpperCase()
      };
      
      if (options.profileId) params.profileId = options.profileId;
      if (options.userId) params.userId = options.userId;
      if (options.accountId) params.accountId = options.accountId;
      if (options.recipientId) params.recipientId = options.recipientId;
      if (options.recipientIban) params.recipientIban = options.recipientIban;
      if (options.recipientName) params.recipientName = options.recipientName;
      if (options.reference) params.reference = options.reference;
      if (options.description) params.description = options.description;

      // Show execution plan
      console.log(chalk.blue('\nExecution Plan:'));
      template.steps.sort((a, b) => a.order - b.order).forEach(step => {
        console.log(`  ${step.order}. ${step.name}`);
        if (step.async) {
          console.log(chalk.yellow(`     [ASYNC - ${step.confirmation?.type || 'manual'} confirmation]`));
        }
      });

      console.log(chalk.blue('\nParameters:'));
      Object.entries(params).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });

      if (options.dryRun) {
        console.log(chalk.yellow('\n[DRY RUN - No actual payment will be made]'));
        return;
      }

      // Confirm execution
      console.log(chalk.yellow('\n⚠️  This will execute the payment flow above.'));
      console.log(chalk.gray('Use --dry-run to preview without executing.'));

      // Execute template
      const execSpinner = ora('Executing payment flow...').start();
      
      try {
        const tx = await templateEngine.executeTemplate(options.template, params);
        
        execSpinner.succeed(chalk.green('Payment flow completed!'));
        console.log(chalk.green(`\n✓ Transaction ID: ${tx.id}`));
        console.log(`  Status: ${tx.status}`);
        console.log(`  Amount: ${tx.amount} ${tx.currency}`);
        
        if (template.steps.some(s => s.async)) {
          console.log(chalk.yellow('\n⚠️  Some steps are async and may require confirmation.'));
          console.log(chalk.gray('Check status with: payment-skill transaction status ' + tx.id));
        }
      } catch (error: any) {
        execSpinner.fail(chalk.red('Payment failed'));
        throw error;
      }
    } catch (error: any) {
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });