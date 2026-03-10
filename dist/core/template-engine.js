"use strict";
/**
 * Payment Skill - Template Engine
 *
 * Implements the configurable template-based payment flow system
 * OpenClaw selects templates and provides parameters
 * Payment-skill executes the predefined flow
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
exports.templateEngine = exports.TemplateEngine = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const wise_1 = require("../api/wise");
const bunq_1 = require("../api/bunq");
const config_1 = require("./config");
const transaction_1 = require("./transaction");
const TEMPLATES_DIR = path.join(__dirname, '../../templates');
class TemplateEngine {
    constructor() {
        this.templates = new Map();
        this.loadTemplates();
    }
    loadTemplates() {
        // Ensure templates directory exists
        if (!fs.existsSync(TEMPLATES_DIR)) {
            fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
            this.createDefaultTemplates();
        }
        // Load all template files
        const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json'));
        for (const file of files) {
            const template = fs.readJsonSync(path.join(TEMPLATES_DIR, file));
            this.templates.set(template.templateId, template);
        }
    }
    createDefaultTemplates() {
        const defaultTemplates = [
            {
                templateId: 'wise_standard_transfer',
                merchant: 'wise.com',
                version: '1.0.0',
                description: 'Standard Wise transfer flow with PSD2 confirmation',
                prerequisites: {
                    apiKey: 'required',
                    webhookEndpoint: 'recommended'
                },
                steps: [
                    {
                        order: 1,
                        name: 'create_quote',
                        command: 'wise.createQuote',
                        params: {
                            profileId: '{{profileId}}',
                            sourceCurrency: '{{sourceCurrency}}',
                            targetCurrency: '{{targetCurrency}}',
                            sourceAmount: '{{amount}}'
                        },
                        output: {
                            quoteId: 'id',
                            rate: 'rate',
                            fee: 'fee'
                        }
                    },
                    {
                        order: 2,
                        name: 'create_transfer',
                        command: 'wise.createTransfer',
                        params: {
                            profileId: '{{profileId}}',
                            quoteId: '{{quoteId}}',
                            targetAccountId: '{{recipientId}}',
                            reference: '{{reference}}'
                        },
                        output: {
                            transferId: 'id',
                            status: 'status'
                        },
                        async: true
                    },
                    {
                        order: 3,
                        name: 'fund_transfer',
                        command: 'wise.fundTransfer',
                        params: {
                            profileId: '{{profileId}}',
                            transferId: '{{transferId}}'
                        },
                        async: true,
                        confirmation: {
                            type: 'webhook',
                            events: ['transfer.completed', 'transfer.failed'],
                            timeout: 300
                        }
                    }
                ],
                errorHandling: {
                    retryOn: ['network_error', 'rate_limit'],
                    maxRetries: 3,
                    fallback: 'cancel_transfer'
                }
            },
            {
                templateId: 'bunq_instant_payment',
                merchant: 'bunq.com',
                version: '1.0.0',
                description: 'Instant Bunq payment to IBAN',
                prerequisites: {
                    apiKey: 'required',
                    webhookEndpoint: 'optional'
                },
                steps: [
                    {
                        order: 1,
                        name: 'create_payment',
                        command: 'bunq.createPayment',
                        params: {
                            userId: '{{userId}}',
                            accountId: '{{accountId}}',
                            amount: '{{amount}}',
                            currency: '{{currency}}',
                            counterpartyIban: '{{recipientIban}}',
                            counterpartyName: '{{recipientName}}',
                            description: '{{description}}'
                        },
                        output: {
                            paymentId: 'id',
                            status: 'status'
                        }
                    }
                ],
                errorHandling: {
                    retryOn: ['network_error'],
                    maxRetries: 2
                }
            },
            {
                templateId: 'bunq_payment_request',
                merchant: 'bunq.com',
                version: '1.0.0',
                description: 'Request payment from someone via Bunq',
                prerequisites: {
                    apiKey: 'required'
                },
                steps: [
                    {
                        order: 1,
                        name: 'create_request',
                        command: 'bunq.createRequestInquiry',
                        params: {
                            userId: '{{userId}}',
                            accountId: '{{accountId}}',
                            amount: '{{amount}}',
                            currency: '{{currency}}',
                            counterpartyAlias: {
                                type: '{{recipientType}}',
                                value: '{{recipientValue}}'
                            },
                            description: '{{description}}'
                        },
                        output: {
                            requestId: 'id',
                            status: 'status'
                        },
                        async: true,
                        confirmation: {
                            type: 'poll',
                            timeout: 86400,
                            pollInterval: 60
                        }
                    }
                ],
                errorHandling: {
                    retryOn: ['network_error'],
                    maxRetries: 3
                }
            },
            {
                templateId: 'stripe_connect_charge',
                merchant: 'stripe.com',
                version: '1.0.0',
                description: 'Create charge through Stripe Connect',
                prerequisites: {
                    apiKey: 'required',
                    webhookEndpoint: 'required'
                },
                steps: [
                    {
                        order: 1,
                        name: 'create_payment_intent',
                        command: 'stripe.paymentIntents.create',
                        params: {
                            amount: '{{amount}}',
                            currency: '{{currency}}',
                            customer: '{{customerId}}',
                            automatic_payment_methods: { enabled: true }
                        },
                        output: {
                            paymentIntentId: 'id',
                            clientSecret: 'client_secret',
                            status: 'status'
                        },
                        async: true
                    },
                    {
                        order: 2,
                        name: 'confirm_payment',
                        command: 'stripe.paymentIntents.confirm',
                        params: {
                            paymentIntentId: '{{paymentIntentId}}'
                        },
                        condition: 'requires_confirmation',
                        async: true,
                        confirmation: {
                            type: 'webhook',
                            events: ['payment_intent.succeeded', 'payment_intent.payment_failed'],
                            timeout: 600
                        }
                    }
                ],
                errorHandling: {
                    retryOn: ['network_error', 'idempotency_error'],
                    maxRetries: 3
                }
            }
        ];
        for (const template of defaultTemplates) {
            const filePath = path.join(TEMPLATES_DIR, `${template.templateId}.json`);
            fs.writeJsonSync(filePath, template, { spaces: 2 });
            this.templates.set(template.templateId, template);
        }
    }
    getTemplate(templateId) {
        return this.templates.get(templateId) || null;
    }
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    getTemplatesForMerchant(merchant) {
        return this.getAllTemplates().filter(t => t.merchant === merchant);
    }
    async executeTemplate(templateId, params) {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template '${templateId}' not found`);
        }
        // Check emergency stop
        if (config_1.configManager.isEmergencyStopActive()) {
            throw new Error('Emergency stop is active. Cannot execute template.');
        }
        // Create transaction record
        const tx = transaction_1.transactionManager.createTransaction(template.merchant, templateId, parseFloat(params.amount) || 0, params.currency || 'EUR', { templateId, params });
        try {
            // Execute each step
            const context = { ...params };
            for (const step of template.steps.sort((a, b) => a.order - b.order)) {
                await this.executeStep(step, context, tx);
            }
            transaction_1.transactionManager.updateTransactionStatus(tx.id, 'completed');
            return tx;
        }
        catch (error) {
            transaction_1.transactionManager.updateTransactionStatus(tx.id, 'failed', error.message);
            throw error;
        }
    }
    async executeStep(step, context, tx) {
        // Replace template variables with actual values
        const resolvedParams = this.resolveParams(step.params, context);
        // Execute the command
        const result = await this.executeCommand(step.command, resolvedParams);
        // Store outputs in context for subsequent steps
        if (step.output && result) {
            for (const [key, path] of Object.entries(step.output)) {
                context[key] = this.getNestedValue(result, path);
            }
        }
        // Handle async steps
        if (step.async && step.confirmation) {
            await this.waitForConfirmation(step.confirmation, context, tx);
        }
    }
    resolveParams(params, context) {
        if (typeof params === 'string') {
            // Replace {{variable}} with context value
            return params.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                return context[key] !== undefined ? context[key] : match;
            });
        }
        if (Array.isArray(params)) {
            return params.map(p => this.resolveParams(p, context));
        }
        if (typeof params === 'object' && params !== null) {
            const resolved = {};
            for (const [key, value] of Object.entries(params)) {
                resolved[key] = this.resolveParams(value, context);
            }
            return resolved;
        }
        return params;
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((o, p) => o?.[p], obj);
    }
    async executeCommand(command, params) {
        const [provider, method] = command.split('.');
        switch (provider) {
            case 'wise':
                return this.executeWiseCommand(method, params);
            case 'bunq':
                return this.executeBunqCommand(method, params);
            case 'stripe':
                // Stripe implementation would go here
                throw new Error('Stripe commands not yet implemented');
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }
    async executeWiseCommand(method, params) {
        const config = config_1.configManager.getProvider('wise');
        if (!config) {
            throw new Error('Wise not configured');
        }
        const client = new wise_1.WiseClient(config);
        switch (method) {
            case 'createQuote':
                return client.createQuote(params.profileId, params.sourceCurrency, params.targetCurrency, parseFloat(params.sourceAmount));
            case 'createTransfer':
                return client.createTransfer(params.profileId, params.quoteId, params.targetAccountId, params.reference);
            case 'fundTransfer':
                return client.fundTransfer(params.profileId, params.transferId);
            default:
                throw new Error(`Unknown Wise command: ${method}`);
        }
    }
    async executeBunqCommand(method, params) {
        const config = config_1.configManager.getProvider('bunq');
        if (!config) {
            throw new Error('Bunq not configured');
        }
        const client = new bunq_1.BunqClient(config);
        switch (method) {
            case 'createPayment':
                return client.createPayment(params.userId, params.accountId, params.amount, params.currency, params.counterpartyIban, params.counterpartyName, params.description);
            case 'createRequestInquiry':
                return client.createRequestInquiry(params.userId, params.accountId, params.amount, params.currency, params.counterpartyAlias, params.description);
            default:
                throw new Error(`Unknown Bunq command: ${method}`);
        }
    }
    async waitForConfirmation(confirmation, context, tx) {
        const { type, timeout, events, pollInterval } = confirmation;
        if (type === 'webhook') {
            // Webhook confirmation - wait for webhook handler to update
            console.log(`Waiting for webhook confirmation (${timeout}s)...`);
            // In real implementation, this would set up a promise that resolves on webhook
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        else if (type === 'poll') {
            // Polling confirmation
            const startTime = Date.now();
            const timeoutMs = (timeout || 300) * 1000;
            while (Date.now() - startTime < timeoutMs) {
                // Poll for status
                await new Promise(resolve => setTimeout(resolve, (pollInterval || 5) * 1000));
                // Check if confirmed
                const updatedTx = transaction_1.transactionManager.getTransaction(tx.id);
                if (updatedTx?.status === 'completed') {
                    return;
                }
            }
            throw new Error('Confirmation timeout');
        }
    }
}
exports.TemplateEngine = TemplateEngine;
exports.templateEngine = new TemplateEngine();
//# sourceMappingURL=template-engine.js.map