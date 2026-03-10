"use strict";
/**
 * Payment Skill - Pay Command
 *
 * Execute payment using templates - HYBRID ARCHITECTURE
 * OpenClaw selects template and provides parameters
 * Payment-skill executes the predefined flow
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const template_engine_1 = require("../core/template-engine");
exports.payCommand = new commander_1.Command('pay')
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
    const spinner = (0, ora_1.default)('Initializing payment...').start();
    try {
        // Get template
        const template = template_engine_1.templateEngine.getTemplate(options.template);
        if (!template) {
            spinner.fail(`Template '${options.template}' not found`);
            console.log(chalk_1.default.yellow('\nAvailable templates:'));
            const templates = template_engine_1.templateEngine.getAllTemplates();
            templates.forEach(t => {
                console.log(`  ${t.templateId} - ${t.description}`);
            });
            process.exit(1);
        }
        spinner.succeed(`Using template: ${template.templateId}`);
        console.log(chalk_1.default.blue(`Description: ${template.description}`));
        console.log(chalk_1.default.gray(`Merchant: ${template.merchant}`));
        // Build parameters
        const params = {
            amount: options.amount,
            currency: options.currency.toUpperCase()
        };
        if (options.profileId)
            params.profileId = options.profileId;
        if (options.userId)
            params.userId = options.userId;
        if (options.accountId)
            params.accountId = options.accountId;
        if (options.recipientId)
            params.recipientId = options.recipientId;
        if (options.recipientIban)
            params.recipientIban = options.recipientIban;
        if (options.recipientName)
            params.recipientName = options.recipientName;
        if (options.reference)
            params.reference = options.reference;
        if (options.description)
            params.description = options.description;
        // Show execution plan
        console.log(chalk_1.default.blue('\nExecution Plan:'));
        template.steps.sort((a, b) => a.order - b.order).forEach(step => {
            console.log(`  ${step.order}. ${step.name}`);
            if (step.async) {
                console.log(chalk_1.default.yellow(`     [ASYNC - ${step.confirmation?.type || 'manual'} confirmation]`));
            }
        });
        console.log(chalk_1.default.blue('\nParameters:'));
        Object.entries(params).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });
        if (options.dryRun) {
            console.log(chalk_1.default.yellow('\n[DRY RUN - No actual payment will be made]'));
            return;
        }
        // Confirm execution
        console.log(chalk_1.default.yellow('\n⚠️  This will execute the payment flow above.'));
        console.log(chalk_1.default.gray('Use --dry-run to preview without executing.'));
        // Execute template
        const execSpinner = (0, ora_1.default)('Executing payment flow...').start();
        try {
            const tx = await template_engine_1.templateEngine.executeTemplate(options.template, params);
            execSpinner.succeed(chalk_1.default.green('Payment flow completed!'));
            console.log(chalk_1.default.green(`\n✓ Transaction ID: ${tx.id}`));
            console.log(`  Status: ${tx.status}`);
            console.log(`  Amount: ${tx.amount} ${tx.currency}`);
            if (template.steps.some(s => s.async)) {
                console.log(chalk_1.default.yellow('\n⚠️  Some steps are async and may require confirmation.'));
                console.log(chalk_1.default.gray('Check status with: payment-skill transaction status ' + tx.id));
            }
        }
        catch (error) {
            execSpinner.fail(chalk_1.default.red('Payment failed'));
            throw error;
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('\nError:'), error.message);
        process.exit(1);
    }
});
//# sourceMappingURL=pay.js.map