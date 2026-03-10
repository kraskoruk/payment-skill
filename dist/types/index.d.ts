/**
 * Payment Skill - Type Definitions
 *
 * Core types for the payment-skill application
 */
export interface Merchant {
    id: string;
    name: string;
    domains: string[];
    categories: string[];
    apiType: string;
    verified: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    canReceivePayments: boolean;
    apiCapabilities: string[];
}
export interface MerchantDetectionResult {
    merchant: string;
    detected: boolean;
    apiType?: string;
    capabilities?: string[];
    authType?: string;
    webhookSupport?: boolean;
    asyncConfirmation?: boolean;
    confidence: number;
}
export interface ProviderConfig {
    name: string;
    apiKey: string;
    environment: 'sandbox' | 'production';
    webhookSecret?: string;
    profileId?: string;
    additionalConfig?: Record<string, any>;
}
export interface WiseConfig extends ProviderConfig {
    profileId?: string;
}
export interface BunqConfig extends ProviderConfig {
    installationToken?: string;
    deviceId?: string;
}
export interface Transaction {
    id: string;
    provider: string;
    merchant: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
    error?: string;
}
export type TransactionStatus = 'pending' | 'initiated' | 'requires_action' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'on_hold';
export interface CommandTemplate {
    templateId: string;
    merchant: string;
    version: string;
    description: string;
    prerequisites: TemplatePrerequisites;
    steps: TemplateStep[];
    errorHandling: ErrorHandling;
}
export interface TemplatePrerequisites {
    apiKey: 'required' | 'optional' | 'none';
    webhookEndpoint?: 'required' | 'recommended' | 'optional';
}
export interface TemplateStep {
    order: number;
    name: string;
    command: string;
    params: Record<string, any>;
    output?: Record<string, string>;
    async?: boolean;
    confirmation?: ConfirmationConfig;
    nextStep?: NextStepCondition;
    condition?: string;
}
export interface ConfirmationConfig {
    type: 'webhook' | 'poll' | 'manual';
    events?: string[];
    timeout?: number;
    pollInterval?: number;
}
export interface NextStepCondition {
    ifStatus: string;
    then: number | 'complete';
    else?: number | 'complete';
}
export interface ErrorHandling {
    retryOn: string[];
    maxRetries: number;
    fallback?: string;
}
export interface LimitConfig {
    perTransaction: number;
    daily: number;
    weekly: number;
    monthly: number;
    maxTransactionsPerHour: number;
}
export interface TimeWindowConfig {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
    blockedDays?: string[];
}
export interface EmergencyStopState {
    active: boolean;
    activatedAt?: Date;
    reason?: string;
    pendingTransactions: string[];
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface WebhookEvent {
    id: string;
    merchant: string;
    event: string;
    data: any;
    timestamp: Date;
    signature?: string;
}
export interface CliOptions {
    verbose?: boolean;
    json?: boolean;
    config?: string;
    dryRun?: boolean;
}
export interface ServerConfig {
    port: number;
    host: string;
    webhookPath: string;
    dashboardPath: string;
}
//# sourceMappingURL=index.d.ts.map