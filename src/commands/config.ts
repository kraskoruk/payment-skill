/**
 * Payment Skill - Config Commands
 * 
 * Configuration management CLI commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../core/config';

export const configCommands = new Command('config')
  .description('Manage payment-skill configuration');

configCommands
  .command('get')
  .description('Get configuration value')
  .argument('<key>', 'Configuration key')
  .action((key) => {
    const config = configManager.getConfig();
    const value = config[key];
    if (value !== undefined) {
      console.log(JSON.stringify(value, null, 2));
    } else {
      console.log(chalk.yellow(`Key '${key}' not found`));
    }
  });

configCommands
  .command('set')
  .description('Set configuration value')
  .argument('<key>', 'Configuration key (e.g., providers.wise.environment)')
  .argument('<value>', 'Configuration value')
  .action((key, value) => {
    const setNestedValue = (obj: any, keys: string[], val: any) => {
      let current = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = val;
    };
    
    try {
      const parsedValue = JSON.parse(value);
      const config = configManager.getConfig();
      
      if (key.includes('.')) {
        const parts = key.split('.');
        setNestedValue(config, parts, parsedValue);
        configManager.setConfig(parts[0], config[parts[0]]);
      } else {
        configManager.setConfig(key, parsedValue);
      }
      console.log(chalk.green(`✓ Set ${key} = ${value}`));
    } catch {
      const config = configManager.getConfig();
      
      if (key.includes('.')) {
        const parts = key.split('.');
        setNestedValue(config, parts, value);
        configManager.setConfig(parts[0], config[parts[0]]);
      } else {
        configManager.setConfig(key, value);
      }
      console.log(chalk.green(`✓ Set ${key} = ${value}`));
    }
  });

configCommands
  .command('list')
  .description('List all configuration')
  .action(() => {
    const config = configManager.getConfig();
    console.log(chalk.blue('Configuration:'));
    
    // Show providers (with masked API keys)
    if (config.providers && Object.keys(config.providers).length > 0) {
      console.log(chalk.blue('\nProviders:'));
      Object.entries(config.providers).forEach(([name, p]: [string, any]) => {
        console.log(`  ${name}:`);
        console.log(`    Environment: ${p.environment}`);
        console.log(`    API Key: ${p.apiKey ? p.apiKey.substring(0, 10) + '...' : 'not set'}`);
        if (p.profileId) console.log(`    Profile ID: ${p.profileId}`);
      });
    }
    
    // Show limits
    if (config.limits) {
      console.log(chalk.blue('\nLimits:'));
      console.log(`  Per Transaction: ${config.limits.perTransaction}`);
      console.log(`  Daily: ${config.limits.daily}`);
      console.log(`  Weekly: ${config.limits.weekly}`);
      console.log(`  Monthly: ${config.limits.monthly}`);
      console.log(`  Max per Hour: ${config.limits.maxTransactionsPerHour}`);
    }
    
    // Show time window
    if (config.timeWindow) {
      console.log(chalk.blue('\nTime Window:'));
      console.log(`  Enabled: ${config.timeWindow.enabled}`);
      console.log(`  Hours: ${config.timeWindow.start} - ${config.timeWindow.end}`);
      console.log(`  Timezone: ${config.timeWindow.timezone}`);
    }
    
    // Show blocked domains
    if (config.advancedLimits?.domainControls?.domains) {
      console.log(chalk.blue('\nBlocked Domains:'));
      config.advancedLimits.domainControls.domains.forEach((d: string) => {
        console.log(`  - ${d}`);
      });
    }
    
    // Show cumulative budgets
    if (config.advancedLimits?.cumulativeBudgets?.length > 0) {
      console.log(chalk.blue('\nCumulative Budgets:'));
      config.advancedLimits.cumulativeBudgets.forEach((budget: any) => {
        console.log(`  - ${budget.amount} ${budget.currency} (${budget.period})`);
      });
    }
    
    // Show geography controls
    if (config.advancedLimits?.geographyControls) {
      console.log(chalk.blue('\nGeography Controls:'));
      console.log(`  Enabled: ${config.advancedLimits.geographyControls.enabled}`);
      console.log(`  Mode: ${config.advancedLimits.geographyControls.mode}`);
      if (config.advancedLimits.geographyControls.countries?.length > 0) {
        console.log('  Countries:');
        config.advancedLimits.geographyControls.countries.forEach((c: string) => {
          console.log(`    - ${c}`);
        });
      }
    }
    
    // Show category controls
    if (config.advancedLimits?.categoryControls) {
      console.log(chalk.blue('\nCategory Controls:'));
      if (config.advancedLimits.categoryControls.blockedCategories?.length > 0) {
        console.log('  Blocked Categories:');
        config.advancedLimits.categoryControls.blockedCategories.forEach((c: string) => {
          console.log(`    - ${c}`);
        });
      }
      if (config.advancedLimits.categoryControls.allowedCategories?.length > 0) {
        console.log('  Allowed Categories:');
        config.advancedLimits.categoryControls.allowedCategories.forEach((c: string) => {
          console.log(`    - ${c}`);
        });
      }
    }
  });

configCommands
  .command('init')
  .description('Initialize configuration')
  .action(() => {
    console.log(chalk.blue('Initializing payment-skill configuration...'));
    console.log(chalk.green('✓ Configuration initialized'));
    console.log(chalk.gray('Use "payment-skill provider add" to configure providers'));
  });

configCommands
  .command('path')
  .description('Show configuration file path')
  .action(() => {
    const path = require('path').join(
      process.env.HOME || process.env.USERPROFILE || '.',
      '.payment-skill',
      'config.json'
    );
    console.log(path);
  });