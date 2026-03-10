"use strict";
/**
 * Payment Skill - Core Configuration Manager
 *
 * Manages application configuration, limits, and emergency stop state
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.configManager = exports.ConfigManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.payment-skill');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const EMERGENCY_FILE = path.join(CONFIG_DIR, 'emergency.json');
class ConfigManager {
    constructor() {
        this.config = {};
        this.emergencyState = { active: false, pendingTransactions: [] };
        this.ensureConfigDir();
        this.loadConfig();
        this.loadEmergencyState();
    }
    ensureConfigDir() {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
    }
    loadConfig() {
        if (fs.existsSync(CONFIG_FILE)) {
            this.config = fs.readJsonSync(CONFIG_FILE);
        }
        else {
            this.config = this.getDefaultConfig();
            this.saveConfig();
        }
    }
    loadEmergencyState() {
        if (fs.existsSync(EMERGENCY_FILE)) {
            this.emergencyState = fs.readJsonSync(EMERGENCY_FILE);
        }
    }
    saveConfig() {
        fs.writeJsonSync(CONFIG_FILE, this.config, { spaces: 2 });
    }
    saveEmergencyState() {
        fs.writeJsonSync(EMERGENCY_FILE, this.emergencyState, { spaces: 2 });
    }
    getDefaultConfig() {
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
    setProvider(name, config) {
        this.config.providers[name] = config;
        this.saveConfig();
    }
    getProvider(name) {
        return this.config.providers[name] || null;
    }
    getAllProviders() {
        return this.config.providers;
    }
    removeProvider(name) {
        delete this.config.providers[name];
        this.saveConfig();
    }
    // Limits Management
    getLimits() {
        return this.config.limits;
    }
    setLimits(limits) {
        this.config.limits = { ...this.config.limits, ...limits };
        this.saveConfig();
    }
    // Time Window Management
    getTimeWindow() {
        return this.config.timeWindow;
    }
    setTimeWindow(config) {
        this.config.timeWindow = { ...this.config.timeWindow, ...config };
        this.saveConfig();
    }
    // Emergency Stop
    activateEmergencyStop(reason) {
        this.emergencyState = {
            active: true,
            activatedAt: new Date(),
            reason: reason || 'Manual activation',
            pendingTransactions: this.emergencyState.pendingTransactions
        };
        this.saveEmergencyState();
    }
    deactivateEmergencyStop() {
        this.emergencyState = {
            active: false,
            pendingTransactions: []
        };
        this.saveEmergencyState();
    }
    isEmergencyStopActive() {
        return this.emergencyState.active;
    }
    getEmergencyStopState() {
        return this.emergencyState;
    }
    addPendingTransaction(transactionId) {
        if (!this.emergencyState.pendingTransactions.includes(transactionId)) {
            this.emergencyState.pendingTransactions.push(transactionId);
            this.saveEmergencyState();
        }
    }
    removePendingTransaction(transactionId) {
        this.emergencyState.pendingTransactions =
            this.emergencyState.pendingTransactions.filter(id => id !== transactionId);
        this.saveEmergencyState();
    }
    // General Config
    getConfig() {
        return this.config;
    }
    setConfig(key, value) {
        this.config[key] = value;
        this.saveConfig();
    }
    // Advanced Limits - Cumulative Budgets
    getCumulativeBudgets() {
        return this.config.advancedLimits?.cumulativeBudgets || [];
    }
    addCumulativeBudget(budget) {
        if (!this.config.advancedLimits) {
            this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
        }
        this.config.advancedLimits.cumulativeBudgets.push(budget);
        this.saveConfig();
    }
    removeCumulativeBudget(index) {
        if (this.config.advancedLimits?.cumulativeBudgets) {
            this.config.advancedLimits.cumulativeBudgets.splice(index, 1);
            this.saveConfig();
        }
    }
    // Advanced Limits - Domain Controls
    getDomainControls() {
        return this.config.advancedLimits?.domainControls || { mode: 'blacklist', domains: [] };
    }
    setDomainControls(controls) {
        if (!this.config.advancedLimits) {
            this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
        }
        this.config.advancedLimits.domainControls = controls;
        this.saveConfig();
    }
    addDomain(domain, type = 'blocked') {
        if (!this.config.advancedLimits) {
            this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
        }
        // Check if domain already exists
        const existingIndex = this.config.advancedLimits.domainControls.domains.findIndex((d) => typeof d === 'string' ? d === domain : d.domain === domain);
        if (existingIndex === -1) {
            // Add new domain with type
            this.config.advancedLimits.domainControls.domains.push({ domain, type });
            this.saveConfig();
        }
    }
    removeDomain(domain) {
        if (this.config.advancedLimits?.domainControls?.domains) {
            this.config.advancedLimits.domainControls.domains =
                this.config.advancedLimits.domainControls.domains.filter((d) => {
                    const dName = typeof d === 'string' ? d : d.domain;
                    return dName !== domain;
                });
            this.saveConfig();
        }
    }
    // Advanced Limits - Geography Controls
    getGeographyControls() {
        return this.config.advancedLimits?.geographyControls || { enabled: false, mode: 'allow', countries: [] };
    }
    setGeographyControls(controls) {
        if (!this.config.advancedLimits) {
            this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
        }
        this.config.advancedLimits.geographyControls = controls;
        this.saveConfig();
    }
    // Advanced Limits - Category Controls
    getCategoryControls() {
        return this.config.advancedLimits?.categoryControls || { blockedCategories: [], allowedCategories: [] };
    }
    setCategoryControls(controls) {
        if (!this.config.advancedLimits) {
            this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
        }
        this.config.advancedLimits.categoryControls = controls;
        this.saveConfig();
    }
    addBlockedCategory(category) {
        if (!this.config.advancedLimits) {
            this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
        }
        if (!this.config.advancedLimits.categoryControls.blockedCategories.includes(category)) {
            this.config.advancedLimits.categoryControls.blockedCategories.push(category);
            this.saveConfig();
        }
    }
    removeBlockedCategory(category) {
        if (this.config.advancedLimits?.categoryControls?.blockedCategories) {
            this.config.advancedLimits.categoryControls.blockedCategories =
                this.config.advancedLimits.categoryControls.blockedCategories.filter((c) => c !== category);
            this.saveConfig();
        }
    }
    addAllowedCategory(category) {
        if (!this.config.advancedLimits) {
            this.config.advancedLimits = this.getDefaultConfig().advancedLimits;
        }
        if (!this.config.advancedLimits.categoryControls.allowedCategories.includes(category)) {
            this.config.advancedLimits.categoryControls.allowedCategories.push(category);
            this.saveConfig();
        }
    }
    removeAllowedCategory(category) {
        if (this.config.advancedLimits?.categoryControls?.allowedCategories) {
            this.config.advancedLimits.categoryControls.allowedCategories =
                this.config.advancedLimits.categoryControls.allowedCategories.filter((c) => c !== category);
            this.saveConfig();
        }
    }
    // Webhook URL
    getWebhookUrl() {
        return this.config.webhookUrl;
    }
    setWebhookUrl(url) {
        this.config.webhookUrl = url;
        this.saveConfig();
    }
}
exports.ConfigManager = ConfigManager;
exports.configManager = new ConfigManager();
//# sourceMappingURL=config.js.map