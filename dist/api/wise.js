"use strict";
/**
 * Payment Skill - Wise API Client
 *
 * Handles all Wise API interactions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WiseClient = void 0;
const axios_1 = __importDefault(require("axios"));
class WiseClient {
    constructor(config) {
        this.config = config;
        const baseURL = config.environment === 'production'
            ? 'https://api.wise.com'
            : 'https://api.sandbox.transferwise.tech';
        this.client = axios_1.default.create({
            baseURL,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }
    // Profile Management
    async getProfiles() {
        const response = await this.client.get('/v2/profiles');
        return response.data;
    }
    async getProfile(profileId) {
        const response = await this.client.get(`/v2/profiles/${profileId}`);
        return response.data;
    }
    // Balance Management
    async getBalances(profileId) {
        const response = await this.client.get(`/v4/profiles/${profileId}/balances?types=STANDARD`);
        return response.data;
    }
    async getBalance(profileId, balanceId) {
        const response = await this.client.get(`/v4/profiles/${profileId}/balances/${balanceId}`);
        return response.data;
    }
    // Quote Management
    async createQuote(profileId, sourceCurrency, targetCurrency, sourceAmount, targetAmount) {
        const body = {
            sourceCurrency,
            targetCurrency
        };
        if (sourceAmount) {
            body.sourceAmount = sourceAmount;
        }
        else if (targetAmount) {
            body.targetAmount = targetAmount;
        }
        const response = await this.client.post(`/v3/profiles/${profileId}/quotes`, body);
        return response.data;
    }
    async getQuote(profileId, quoteId) {
        const response = await this.client.get(`/v3/profiles/${profileId}/quotes/${quoteId}`);
        return response.data;
    }
    // Recipient Management
    async createRecipient(profileId, currency, accountHolderName, details) {
        const response = await this.client.post(`/v1/accounts`, {
            profile: profileId,
            currency,
            type: 'iban',
            accountHolderName,
            details
        });
        return response.data;
    }
    async getRecipients(profileId) {
        const response = await this.client.get(`/v1/accounts?profile=${profileId}`);
        return response.data;
    }
    async getRecipient(accountId) {
        const response = await this.client.get(`/v1/accounts/${accountId}`);
        return response.data;
    }
    async deleteRecipient(accountId) {
        const response = await this.client.delete(`/v1/accounts/${accountId}`);
        return response.data;
    }
    // Transfer Management
    async createTransfer(profileId, quoteId, targetAccountId, reference, customerTransactionId) {
        const body = {
            targetAccount: targetAccountId,
            quoteUuid: quoteId,
            customerTransactionId: customerTransactionId || `txn-${Date.now()}`
        };
        if (reference) {
            body.reference = reference;
        }
        const response = await this.client.post(`/v1/transfers`, body);
        return response.data;
    }
    async getTransfer(transferId) {
        const response = await this.client.get(`/v1/transfers/${transferId}`);
        return response.data;
    }
    async cancelTransfer(transferId) {
        const response = await this.client.put(`/v1/transfers/${transferId}/cancel`);
        return response.data;
    }
    async getTransfers(profileId, status, limit = 100) {
        const params = { profile: profileId, limit };
        if (status) {
            params.status = status;
        }
        const response = await this.client.get(`/v1/transfers`, { params });
        return response.data;
    }
    // Transfer Requirements
    async getTransferRequirements(profileId, quoteId, targetAccountId) {
        const response = await this.client.post(`/v1/transfer-requirements`, {
            targetAccount: targetAccountId,
            quoteUuid: quoteId
        });
        return response.data;
    }
    // Fund Transfer
    async fundTransfer(profileId, transferId) {
        const response = await this.client.post(`/v3/profiles/${profileId}/transfers/${transferId}/payments`, { type: 'BALANCE' });
        return response.data;
    }
    // Bank Account Details
    async getBankAccountDetails(profileId, balanceId) {
        const response = await this.client.get(`/v4/profiles/${profileId}/balances/${balanceId}/bank-details`);
        return response.data;
    }
    // Webhook Management
    async createWebhook(profileId, name, triggerOn, url) {
        const response = await this.client.post(`/v3/profiles/${profileId}/subscriptions`, {
            name,
            triggerOn,
            delivery: {
                version: '2.0.0',
                url
            }
        });
        return response.data;
    }
    async getWebhooks(profileId) {
        const response = await this.client.get(`/v3/profiles/${profileId}/subscriptions`);
        return response.data;
    }
    async deleteWebhook(profileId, subscriptionId) {
        const response = await this.client.delete(`/v3/profiles/${profileId}/subscriptions/${subscriptionId}`);
        return response.data;
    }
}
exports.WiseClient = WiseClient;
//# sourceMappingURL=wise.js.map