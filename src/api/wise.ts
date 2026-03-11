/**
 * Payment Skill - Wise API Client
 * 
 * Handles all Wise API interactions
 */

import axios, { AxiosInstance } from 'axios';
import { WiseConfig } from '../types';

export class WiseClient {
  private client: AxiosInstance;
  private config: WiseConfig;

  constructor(config: WiseConfig) {
    this.config = config;
    const baseURL = config.environment === 'production' 
      ? 'https://api.wise.com' 
      : 'https://api.sandbox.transferwise.tech';
    
    this.client = axios.create({
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

  async getProfile(profileId: string) {
    const response = await this.client.get(`/v2/profiles/${profileId}`);
    return response.data;
  }

  // Balance Management
  async getBalances(profileId: string) {
    const response = await this.client.get(`/v4/profiles/${profileId}/balances?types=STANDARD`);
    return response.data;
  }

  async getBalance(profileId: string, balanceId: string) {
    const response = await this.client.get(`/v4/profiles/${profileId}/balances/${balanceId}`);
    return response.data;
  }

  // Quote Management
  async createQuote(
    profileId: string,
    sourceCurrency: string,
    targetCurrency: string,
    sourceAmount?: number,
    targetAmount?: number
  ) {
    const body: any = {
      sourceCurrency,
      targetCurrency
    };
    
    if (sourceAmount) {
      body.sourceAmount = sourceAmount;
    } else if (targetAmount) {
      body.targetAmount = targetAmount;
    }

    const response = await this.client.post(`/v3/profiles/${profileId}/quotes`, body);
    return response.data;
  }

  async getQuote(profileId: string, quoteId: string) {
    const response = await this.client.get(`/v3/profiles/${profileId}/quotes/${quoteId}`);
    return response.data;
  }

  // Recipient Management
  async createRecipient(
    profileId: string,
    currency: string,
    accountHolderName: string,
    details: any
  ) {
    const response = await this.client.post(`/v1/accounts`, {
      profile: profileId,
      currency,
      type: 'iban',
      accountHolderName,
      details
    });
    return response.data;
  }

  async getRecipients(profileId: string) {
    const response = await this.client.get(`/v1/accounts?profile=${profileId}`);
    return response.data;
  }

  async getRecipient(accountId: string) {
    const response = await this.client.get(`/v1/accounts/${accountId}`);
    return response.data;
  }

  async deleteRecipient(accountId: string) {
    const response = await this.client.delete(`/v1/accounts/${accountId}`);
    return response.data;
  }

  // Transfer Management
  async createTransfer(
    profileId: string,
    quoteId: string,
    targetAccountId: string,
    reference?: string,
    customerTransactionId?: string
  ) {
    const body: any = {
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

  async getTransfer(transferId: string) {
    const response = await this.client.get(`/v1/transfers/${transferId}`);
    return response.data;
  }

  async cancelTransfer(transferId: string) {
    const response = await this.client.put(`/v1/transfers/${transferId}/cancel`);
    return response.data;
  }

  async getTransfers(profileId: string, status?: string, limit: number = 100) {
    const params: any = { profile: profileId, limit };
    if (status) {
      params.status = status;
    }
    const response = await this.client.get(`/v1/transfers`, { params });
    return response.data;
  }

  // Transfer Requirements
  async getTransferRequirements(
    profileId: string,
    quoteId: string,
    targetAccountId: string
  ) {
    const response = await this.client.post(`/v1/transfer-requirements`, {
      targetAccount: targetAccountId,
      quoteUuid: quoteId
    });
    return response.data;
  }

  // Fund Transfer
  async fundTransfer(profileId: string, transferId: string) {
    const response = await this.client.post(
      `/v3/profiles/${profileId}/transfers/${transferId}/payments`,
      { type: 'BALANCE' }
    );
    return response.data;
  }

  // Bank Account Details
  async getBankAccountDetails(profileId: string, balanceId: string) {
    const response = await this.client.get(
      `/v4/profiles/${profileId}/balances/${balanceId}/bank-details`
    );
    return response.data;
  }

  // Webhook Management
  async createWebhook(profileId: string, name: string, triggerOn: string[], url: string) {
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

  async getWebhooks(profileId: string) {
    const response = await this.client.get(`/v3/profiles/${profileId}/subscriptions`);
    return response.data;
  }

  async deleteWebhook(profileId: string, subscriptionId: string) {
    const response = await this.client.delete(
      `/v3/profiles/${profileId}/subscriptions/${subscriptionId}`
    );
    return response.data;
  }
}
