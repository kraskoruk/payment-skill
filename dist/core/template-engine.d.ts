/**
 * Payment Skill - Template Engine
 *
 * Implements the configurable template-based payment flow system
 * OpenClaw selects templates and provides parameters
 * Payment-skill executes the predefined flow
 */
import { CommandTemplate, Transaction } from '../types';
export declare class TemplateEngine {
    private templates;
    constructor();
    private loadTemplates;
    private createDefaultTemplates;
    getTemplate(templateId: string): CommandTemplate | null;
    getAllTemplates(): CommandTemplate[];
    getTemplatesForMerchant(merchant: string): CommandTemplate[];
    executeTemplate(templateId: string, params: Record<string, any>): Promise<Transaction>;
    private executeStep;
    private resolveParams;
    private getNestedValue;
    private executeCommand;
    private executeWiseCommand;
    private executeBunqCommand;
    private waitForConfirmation;
}
export declare const templateEngine: TemplateEngine;
//# sourceMappingURL=template-engine.d.ts.map