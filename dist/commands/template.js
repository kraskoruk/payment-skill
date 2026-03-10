"use strict";
/**
 * Payment Skill - Template Commands
 *
 * Manage and execute payment templates
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const template_engine_1 = require("../core/template-engine");
exports.templateCommands = new commander_1.Command('template')
    .description('Payment templates - HYBRID ARCHITECTURE');
exports.templateCommands
    .command('list')
    .description('List available templates')
    .option('-m, --merchant <merchant>', 'Filter by merchant (wise.com, bunq.com, stripe.com)')
    .action((options) => {
    let templates = template_engine_1.templateEngine.getAllTemplates();
    if (options.merchant) {
        templates = templates.filter(t => t.merchant === options.merchant);
    }
    console.log(chalk_1.default.blue(`Available Templates (${templates.length}):\n`));
    templates.forEach(t => {
        console.log(chalk_1.default.green(`${t.templateId}`));
        console.log(`  Merchant: ${t.merchant}`);
        console.log(`  Description: ${t.description}`);
        console.log(`  Version: ${t.version}`);
        console.log(`  Steps: ${t.steps.length}`);
        if (t.prerequisites.apiKey === 'required') {
            console.log(chalk_1.default.yellow('  ⚠️  Requires API key'));
        }
        console.log('');
    });
    console.log(chalk_1.default.gray('Use "payment-skill template get <id>" for details'));
    console.log(chalk_1.default.gray('Use "payment-skill pay --template <id> ..." to execute'));
});
exports.templateCommands
    .command('get')
    .description('Get template details')
    .argument('<template-id>', 'Template ID')
    .action((templateId) => {
    const template = template_engine_1.templateEngine.getTemplate(templateId);
    if (!template) {
        console.log(chalk_1.default.yellow(`Template '${templateId}' not found`));
        return;
    }
    console.log(chalk_1.default.blue('Template Details:'));
    console.log(`  ID: ${template.templateId}`);
    console.log(`  Merchant: ${template.merchant}`);
    console.log(`  Description: ${template.description}`);
    console.log(`  Version: ${template.version}`);
    console.log(chalk_1.default.blue('\nPrerequisites:'));
    console.log(`  API Key: ${template.prerequisites.apiKey}`);
    if (template.prerequisites.webhookEndpoint) {
        console.log(`  Webhook: ${template.prerequisites.webhookEndpoint}`);
    }
    console.log(chalk_1.default.blue('\nExecution Steps:'));
    template.steps.sort((a, b) => a.order - b.order).forEach(step => {
        console.log(`\n  ${step.order}. ${step.name}`);
        console.log(`     Command: ${step.command}`);
        if (Object.keys(step.params).length > 0) {
            console.log('     Parameters:');
            Object.entries(step.params).forEach(([key, value]) => {
                console.log(`       ${key}: ${value}`);
            });
        }
        if (step.async) {
            console.log(chalk_1.default.yellow('     [ASYNC]'));
            if (step.confirmation) {
                console.log(`     Confirmation: ${step.confirmation.type}`);
                if (step.confirmation.timeout) {
                    console.log(`     Timeout: ${step.confirmation.timeout}s`);
                }
            }
        }
        if (step.output) {
            console.log('     Outputs:');
            Object.entries(step.output).forEach(([key, path]) => {
                console.log(`       ${key} -> ${path}`);
            });
        }
    });
    console.log(chalk_1.default.blue('\nError Handling:'));
    console.log(`  Retry on: ${template.errorHandling.retryOn.join(', ')}`);
    console.log(`  Max retries: ${template.errorHandling.maxRetries}`);
    if (template.errorHandling.fallback) {
        console.log(`  Fallback: ${template.errorHandling.fallback}`);
    }
    console.log(chalk_1.default.blue('\nExample Usage:'));
    console.log(chalk_1.default.gray(`  payment-skill pay --template ${templateId} --amount 100 --currency EUR ...`));
});
exports.templateCommands
    .command('validate')
    .description('Validate template parameters without executing')
    .requiredOption('-t, --template <id>', 'Template ID')
    .option('--amount <amount>', 'Payment amount')
    .option('--currency <currency>', 'Currency code')
    .option('--profile-id <id>', 'Wise profile ID')
    .option('--user-id <id>', 'Bunq user ID')
    .option('--account-id <id>', 'Bunq account ID')
    .option('--recipient-id <id>', 'Recipient ID')
    .option('--recipient-iban <iban>', 'Recipient IBAN')
    .option('--recipient-name <name>', 'Recipient name')
    .action((options) => {
    const template = template_engine_1.templateEngine.getTemplate(options.template);
    if (!template) {
        console.log(chalk_1.default.red(`Template '${options.template}' not found`));
        return;
    }
    console.log(chalk_1.default.blue('Validating parameters for template:'), options.template);
    // Build params
    const params = {};
    if (options.amount)
        params.amount = options.amount;
    if (options.currency)
        params.currency = options.currency;
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
    // Check for missing required params
    const requiredParams = new Set();
    template.steps.forEach(step => {
        Object.values(step.params).forEach(value => {
            if (typeof value === 'string') {
                const matches = value.match(/\{\{(\w+)\}\}/g);
                if (matches) {
                    matches.forEach(match => {
                        const paramName = match.replace(/\{\{|\}\}/g, '');
                        requiredParams.add(paramName);
                    });
                }
            }
        });
    });
    const missing = Array.from(requiredParams).filter(p => !params[p]);
    if (missing.length > 0) {
        console.log(chalk_1.default.red('\n❌ Missing required parameters:'));
        missing.forEach(p => console.log(`  - ${p}`));
    }
    else {
        console.log(chalk_1.default.green('\n✓ All required parameters provided'));
    }
    console.log(chalk_1.default.blue('\nProvided parameters:'));
    Object.entries(params).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
    });
});
//# sourceMappingURL=template.js.map