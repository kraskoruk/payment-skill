/**
 * Payment Skill - Core Configuration Manager
 * 
 * Manages application configuration, limits, and emergency stop state
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { 
  ProviderConfig, 
  LimitConfig, 
  TimeWindowConfig, 
  EmergencyStopState,
  WiseConfig,
  BunqConfig 
} from '../types';

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.payment-skill');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const EMERGENCY_FILE = path.join(CONFIG_DIR, 'emergency.json');

export class ConfigManager {
  private config: any = {};
  private emergencyState: EmergencyStopState = { active: false, pendingTransactions: [] };

  constructor() {
    this.ensureConfigDir();
    this.loadConfig();
    this.loadEmergencyState();
  }

  private ensureConfigDir(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  private loadConfig(): void {
    if (fs.existsSync(CONFIG_FILE)) {
      this.config = fs.readJsonSync(CONFIG_FILE);
    } else {
      this.config = this.getDefaultConfig();
      this.saveConfig();
    }
  }

  private loadEmergencyState(): void {
    if (fs.existsSync(EMERGENCY_FILE)) {
      this.emergencyState = fs.readJsonSync(EMERGENCY_FILE);
    }
  }

  private saveConfig(): void {
    fs.writeJsonSync(CONFIG_FILE, this.config, { spaces: 2 });
  }

  private saveEmergencyState(): void {
    fs.writeJsonSync(EMERGENCY_FILE, this.emergencyState, { spaces: 2 });
  }

  private getDefaultConfig(): any {
    return {
      version: '1.0.0',
      providers: {},
      limits: {
        perTransaction: 10000,
        daily: 50000,
        weekly: 200000,
        monthly: 500000,
        maxTransactionsPerHour: 10
      },
      timeWindow: {
        enabled: false,
        start: '08:00',
        end: '22:00',
        timezone: 'Europe/Bucharest'
      },
      advancedLimits: {
        cumulativeBudgets: [],
        domainControls: {
          mode: 'blacklist',
          domains: []
        },
        geographyControls: {
          enabled: false,
          mode: 'allow',
          countries: []
        },
        categoryControls: {
          blockedCategories: ['gambling', 'adult', 'drugs', 'weapons', 'tobacco'],
          allowedCategories: []
        }
      },
      verifiedMerchantsOnly: true,
      webhookUrl: null
    };
  }

  // Provider Management
  setProvider(name: string, config: ProviderConfig): void {
    this.config.providers[name] = config;
    this.saveConfig();
  }

  getProvider(name: string): ProviderConfig | null {
    return this.config.providers[name] || null;
  }

  getAllProviders(): Record<string, ProviderConfig> {
    return this.config.providers;
  }

  removeProvider(name: string): void {
    delete this.config.providers[name];
    this.saveConfig();
  }

  // Limits Management
  getLimits(): LimitConfig {
    return this.config.limits;
  }

  setLimits(limits: Partial<LimitConfig>): void {
    this.config.limits = { ...this.config.limits, ...limits };
    this.saveConfig();
  }

  // Time Window Management
  getTimeWindow(): TimeWindowConfig {
    return this.config.timeWindow;
  }

  setTimeWindow(config: Partial<TimeWindowConfig>): void {
    this.config.timeWindow = { ...this.config.timeWindow, ...config };
    this.saveConfig();
  }

  // Emergency Stop
  activateEmergencyStop(reason?: string): void {
    this.emergencyState = {
      active: true,
      activatedAt: new Date(),
      reason: reason || 'Manual activation',
      pendingTransactions: this.emergencyState.pendingTransactions
    };
    this.saveEmergencyState();
  }

  deactivateEmergencyStop(): void {
    this.emergencyState = {
      active: false,
      pendingTransactions: []
    };
    this.saveEmergencyState();
  }

  isEmergencyStopActive(): boolean {
    return this.emergencyState.active;
  }

  getEmergencyStopState(): EmergencyStopState {
    return this.emergencyState;
  }

  addPendingTransaction(transactionId: string): void {
    if (!this.emergencyState.pendingTransactions.includes(transactionId)) {
      this.emergencyState.pendingTransactions.push(transactionId);
      this.saveEmergencyState();
    }
  }

  removePendingTransaction(transactionId: string): void {
    this.emergencyState.pendingTransactions = 
      this.emergencyState.pendingTransactions.filter(id => id !== transactionId);
    this.saveEmergencyState();
  }

  // General Config
  getConfig(): any {
    return this.config;
  }

  setConfig(key: string, value: any): void {
    this.config[key] = value;
    this.saveConfig();
  }

  // Advanced Limits - Cumulative Budgets
  getCumulativeBudgets(): any[] {
    return this.config.advancedLimits?.cumulativeBudgets || [];
  }

  addCumulativeBudget(budget: any): void {
    if (!this.config.advancedLimits) {
      this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
    }
    this.config.advancedLimits.cumulativeBudgets.push(budget);
    this.saveConfig();
  }

  removeCumulativeBudget(index: number): void {
    if (this.config.advancedLimits?.cumulativeBudgets) {
      this.config.advancedLimits.cumulativeBudgets.splice(index, 1);
      this.saveConfig();
    }
  }

  // Advanced Limits - Domain Controls
  getDomainControls(): any {
    return this.config.advancedLimits?.domainControls || { mode: 'blacklist', domains: [] };
  }

  setDomainControls(controls: any): void {
    if (!this.config.advancedLimits) {
      this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
    }
    this.config.advancedLimits.domainControls = controls;
    this.saveConfig();
  }

  addDomain(domain: string, type: 'blocked' | 'allowed' = 'blocked'): void {
    if (!this.config.advancedLimits) {
      this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
    }
    // Check if domain already exists
    const existingIndex = this.config.advancedLimits.domainControls.domains.findIndex(
      (d: any) => typeof d === 'string' ? d === domain : d.domain === domain
    );
    if (existingIndex === -1) {
      // Add new domain with type
      this.config.advancedLimits.domainControls.domains.push({ domain, type });
      this.saveConfig();
    }
  }

  removeDomain(domain: string): void {
    if (this.config.advancedLimits?.domainControls?.domains) {
      this.config.advancedLimits.domainControls.domains = 
        this.config.advancedLimits.domainControls.domains.filter((d: any) => {
          const dName = typeof d === 'string' ? d : d.domain;
          return dName !== domain;
        });
      this.saveConfig();
    }
  }

  // Advanced Limits - Geography Controls
  getGeographyControls(): any {
    return this.config.advancedLimits?.geographyControls || { enabled: false, mode: 'allow', countries: [] };
  }

  setGeographyControls(controls: any): void {
    if (!this.config.advancedLimits) {
      this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
    }
    this.config.advancedLimits.geographyControls = controls;
    this.saveConfig();
  }

  // Advanced Limits - Category Controls
  getCategoryControls(): any {
    return this.config.advancedLimits?.categoryControls || { blockedCategories: [], allowedCategories: [] };
  }

  setCategoryControls(controls: any): void {
    if (!this.config.advancedLimits) {
      this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
    }
    this.config.advancedLimits.categoryControls = controls;
    this.saveConfig();
  }

  addBlockedCategory(category: string): void {
    if (!this.config.advancedLimits) {
      this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
    }
    if (!this.config.advancedLimits.categoryControls.blockedCategories.includes(category)) {
      this.config.advancedLimits.categoryControls.blockedCategories.push(category);
      this.saveConfig();
    }
  }

  removeBlockedCategory(category: string): void {
    if (this.config.advancedLimits?.categoryControls?.blockedCategories) {
      this.config.advancedLimits.categoryControls.blockedCategories = 
        this.config.advancedLimits.categoryControls.blockedCategories.filter((c: string) => c !== category);
      this.saveConfig();
    }
  }

  addAllowedCategory(category: string): void {
    if (!this.config.advancedLimits) {
      this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
    }
    if (!this.config.advancedLimits.categoryControls.allowedCategories.includes(category)) {
      this.config.advancedLimits.categoryControls.allowedCategories.push(category);
      this.saveConfig();
    }
  }

  removeAllowedCategory(category: string): void {
    if (this.config.advancedLimits?.categoryControls?.allowedCategories) {
      this.config.advancedLimits.categoryControls.allowedCategories = 
        this.config.advancedLimits.categoryControls.allowedCategories.filter((c: string) => c !== category);
      this.saveConfig();
    }
  }

  // Webhook URL
  getWebhookUrl(): string | null {
    return this.config.webhookUrl;
  }

  setWebhookUrl(url: string): void {
    this.config.webhookUrl = url;
    this.saveConfig();
  }
}

export const configManager = new ConfigManager();