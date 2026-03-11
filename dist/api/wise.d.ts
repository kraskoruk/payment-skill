/**
 * Payment Skill - Wise API Client
 *
 * Handles all Wise API interactions
 */
import { WiseConfig } from '../types';
export declare class WiseClient {
    private client;
    private config;
    constructor(config: WiseConfig);
    getProfiles(): Promise<any>;
    getProfile(profileId: string): Promise<any>;
    getBalances(profileId: string): Promise<any>;
    getBalance(profileId: string, balanceId: string): Promise<any>;
    createQuote(profileId: string, sourceCurrency: string, targetCurrency: string, sourceAmount?: number, targetAmount?: number): Promise<any>;
    getQuote(profileId: string, quoteId: string): Promise<any>;
    createRecipient(profileId: string, currency: string, accountHolderName: string, details: any): Promise<any>;
    getRecipients(profileId: string): Promise<any>;
    getRecipient(accountId: string): Promise<any>;
    deleteRecipient(accountId: string): Promise<any>;
    createTransfer(profileId: string, quoteId: string, targetAccountId: string, reference?: string, customerTransactionId?: string): Promise<any>;
    getTransfer(transferId: string): Promise<any>;
    cancelTransfer(transferId: string): Promise<any>;
    getTransfers(profileId: string, status?: string, limit?: number): Promise<any>;
    getTransferRequirements(profileId: string, quoteId: string, targetAccountId: string): Promise<any>;
    fundTransfer(profileId: string, transferId: string): Promise<any>;
    getBankAccountDetails(profileId: string, balanceId: string): Promise<any>;
    createWebhook(profileId: string, name: string, triggerOn: string[], url: string): Promise<any>;
    getWebhooks(profileId: string): Promise<any>;
    deleteWebhook(profileId: string, subscriptionId: string): Promise<any>;
}
//# sourceMappingURL=wise.d.ts.map