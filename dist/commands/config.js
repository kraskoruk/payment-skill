"use strict";
/**
 * Payment Skill - Config Commands
 *
 * Configuration management CLI commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../core/config");
exports.configCommands = new commander_1.Command('config')
    .description('Manage payment-skill configuration');
exports.configCommands
    .command('get')
    .description('Get configuration value')
    .argument('<key>', 'Configuration key')
    .action((key) => {
    const config = config_1.configManager.getConfig();
    const value = config[key];
    if (value !== undefined) {
        console.log(JSON.stringify(value, null, 2));
    }
    else {
        console.log(chalk_1.default.yellow(`Key '${key}' not found`));
    }
});
exports.configCommands
    .command('set')
    .description('Set configuration value')
    .argument('<key>', 'Configuration key (e.g., providers.wise.environment)')
    .argument('<value>', 'Configuration value')
    .action((key, value) => {
    const setNestedValue = (obj, keys, val) => {
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]])
                current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = val;
    };
    try {
        const parsedValue = JSON.parse(value);
        const config = config_1.configManager.getConfig();
        if (key.includes('.')) {
            const parts = key.split('.');
            setNestedValue(config, parts, parsedValue);
            config_1.configManager.setConfig(parts[0], config[parts[0]]);
        }
        else {
            config_1.configManager.setConfig(key, parsedValue);
        }
        console.log(chalk_1.default.green(`✓ Set ${key} = ${value}`));
    }
    catch {
        const config = config_1.configManager.getConfig();
        if (key.includes('.')) {
            const parts = key.split('.');
            setNestedValue(config, parts, value);
            config_1.configManager.setConfig(parts[0], config[parts[0]]);
        }
        else {
            config_1.configManager.setConfig(key, value);
        }
        console.log(chalk_1.default.green(`✓ Set ${key} = ${value}`));
    }
});
exports.configCommands
    .command('list')
    .description('List all configuration')
    .action(() => {
    const config = config_1.configManager.getConfig();
    console.log(chalk_1.default.blue('Configuration:'));
    // Show providers (with masked API keys)
    if (config.providers && Object.keys(config.providers).length > 0) {
        console.log(chalk_1.default.blue('\nProviders:'));
        Object.entries(config.providers).forEach(([name, p]) => {
            console.log(`  ${name}:`);
            console.log(`    Environment: ${p.environment}`);
            console.log(`    API Key: ${p.apiKey ? p.apiKey.substring(0, 10) + '...' : 'not set'}`);
            if (p.profileId)
                console.log(`    Profile ID: ${p.profileId}`);
        });
    }
    // Show limits
    if (config.limits) {
        console.log(chalk_1.default.blue('\nLimits:'));
        console.log(`  Per Transaction: ${config.limits.perTransaction}`);
        console.log(`  Daily: ${config.limits.daily}`);
        console.log(`  Weekly: ${config.limits.weekly}`);
        console.log(`  Monthly: ${config.limits.monthly}`);
        console.log(`  Max per Hour: ${config.limits.maxTransactionsPerHour}`);
    }
    // Show time window
    if (config.timeWindow) {
        console.log(chalk_1.default.blue('\nTime Window:'));
        console.log(`  Enabled: ${config.timeWindow.enabled}`);
        console.log(`  Hours: ${config.timeWindow.start} - ${config.timeWindow.end}`);
        console.log(`  Timezone: ${config.timeWindow.timezone}`);
    }
    // Show blocked domains
    if (config.advancedLimits?.domainControls?.domains) {
        console.log(chalk_1.default.blue('\nBlocked Domains:'));
        config.advancedLimits.domainControls.domains.forEach((d) => {
            console.log(`  - ${d}`);
        });
    }
    // Show cumulative budgets
    if (config.advancedLimits?.cumulativeBudgets?.length > 0) {
        console.log(chalk_1.default.blue('\nCumulative Budgets:'));
        config.advancedLimits.cumulativeBudgets.forEach((budget) => {
            console.log(`  - ${budget.amount} ${budget.currency} (${budget.period})`);
        });
    }
    // Show geography controls
    if (config.advancedLimits?.geographyControls) {
        console.log(chalk_1.default.blue('\nGeography Controls:'));
        console.log(`  Enabled: ${config.advancedLimits.geographyControls.enabled}`);
        console.log(`  Mode: ${config.advancedLimits.geographyControls.mode}`);
        if (config.advancedLimits.geographyControls.countries?.length > 0) {
            console.log('  Countries:');
            config.advancedLimits.geographyControls.countries.forEach((c) => {
                console.log(`    - ${c}`);
            });
        }
    }
    // Show category controls
    if (config.advancedLimits?.categoryControls) {
        console.log(chalk_1.default.blue('\nCategory Controls:'));
        if (config.advancedLimits.categoryControls.blockedCategories?.length > 0) {
            console.log('  Blocked Categories:');
            config.advancedLimits.categoryControls.blockedCategories.forEach((c) => {
                console.log(`    - ${c}`);
            });
        }
        if (config.advancedLimits.categoryControls.allowedCategories?.length > 0) {
            console.log('  Allowed Categories:');
            config.advancedLimits.categoryControls.allowedCategories.forEach((c) => {
                console.log(`    - ${c}`);
            });
        }
    }
});
exports.configCommands
    .command('init')
    .description('Initialize configuration')
    .action(() => {
    console.log(chalk_1.default.blue('Initializing payment-skill configuration...'));
    console.log(chalk_1.default.green('✓ Configuration initialized'));
    console.log(chalk_1.default.gray('Use "payment-skill provider add" to configure providers'));
});
exports.configCommands
    .command('path')
    .description('Show configuration file path')
    .action(() => {
    const path = require('path').join(process.env.HOME || process.env.USERPROFILE || '.', '.payment-skill', 'config.json');
    console.log(path);
});
//# sourceMappingURL=config.js.map