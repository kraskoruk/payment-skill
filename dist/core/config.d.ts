/**
 * Payment Skill - Core Configuration Manager
 *
 * Manages application configuration, limits, and emergency stop state
 */
import { ProviderConfig, LimitConfig, TimeWindowConfig, EmergencyStopState } from '../types';
export declare class ConfigManager {
    private config;
    private emergencyState;
    constructor();
    private ensureConfigDir;
    private loadConfig;
    private loadEmergencyState;
    private saveConfig;
    private saveEmergencyState;
    private getDefaultConfig;
    setProvider(name: string, config: ProviderConfig): void;
    getProvider(name: string): ProviderConfig | null;
    getAllProviders(): Record<string, ProviderConfig>;
    removeProvider(name: string): void;
    getLimits(): LimitConfig;
    setLimits(limits: Partial<LimitConfig>): void;
    getTimeWindow(): TimeWindowConfig;
    setTimeWindow(config: Partial<TimeWindowConfig>): void;
    activateEmergencyStop(reason?: string): void;
    deactivateEmergencyStop(): void;
    isEmergencyStopActive(): boolean;
    getEmergencyStopState(): EmergencyStopState;
    addPendingTransaction(transactionId: string): void;
    removePendingTransaction(transactionId: string): void;
    getConfig(): any;
    setConfig(key: string, value: any): void;
    getCumulativeBudgets(): any[];
    addCumulativeBudget(budget: any): void;
    removeCumulativeBudget(index: number): void;
    getDomainControls(): any;
    setDomainControls(controls: any): void;
    addDomain(domain: string, type?: 'blocked' | 'allowed'): void;
    removeDomain(domain: string): void;
    getGeographyControls(): any;
    setGeographyControls(controls: any): void;
    getCategoryControls(): any;
    setCategoryControls(controls: any): void;
    addBlockedCategory(category: string): void;
    removeBlockedCategory(category: string): void;
    addAllowedCategory(category: string): void;
    removeAllowedCategory(category: string): void;
    getWebhookUrl(): string | null;
    setWebhookUrl(url: string): void;
}
export declare const configManager: ConfigManager;
//# sourceMappingURL=config.d.ts.map