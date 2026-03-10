/**
 * Payment Skill - Express Server
 * 
 * Serves the web dashboard and handles webhooks
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { configManager } from '../core/config';
import { transactionManager } from '../core/transaction';

export class PaymentSkillServer {
  private app: express.Application;
  private port: number;

  constructor(port: number = 8080) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(helmet({
      contentSecurityPolicy: false // Allow inline scripts for dashboard
    }));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../../')));
    this.app.use('/public', express.static(path.join(__dirname, '../../public')));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        version: '1.0.0',
        emergencyStop: configManager.isEmergencyStopActive()
      });
    });

    // Get configuration
    this.app.get('/api/config', (req, res) => {
      const config = configManager.getConfig();
      // Remove sensitive data
      const safeConfig = {
        ...config,
        providers: Object.entries(config.providers).reduce((acc, [key, val]: [string, any]) => {
          acc[key] = {
            name: val.name,
            environment: val.environment,
            // Don't expose API keys
            apiKey: val.apiKey ? '***' : undefined
          };
          return acc;
        }, {} as any)
      };
      res.json(safeConfig);
    });

    // Get transactions
    this.app.get('/api/transactions', (req, res) => {
      const transactions = transactionManager.getTransactions();
      res.json(transactions);
    });

    // Get emergency stop status
    this.app.get('/api/emergency', (req, res) => {
      res.json(configManager.getEmergencyStopState());
    });

    // Activate emergency stop
    this.app.post('/api/emergency/stop', (req, res) => {
      configManager.activateEmergencyStop(req.body.reason);
      transactionManager.cancelAllPending();
      res.json({ success: true, message: 'Emergency stop activated' });
    });

    // Deactivate emergency stop
    this.app.post('/api/emergency/resume', (req, res) => {
      configManager.deactivateEmergencyStop();
      res.json({ success: true, message: 'Emergency stop deactivated' });
    });

    // Get all limits and controls
    this.app.get('/api/limits', (req, res) => {
      res.json({
        limits: configManager.getLimits(),
        timeWindow: configManager.getTimeWindow(),
        cumulativeBudgets: configManager.getCumulativeBudgets(),
        domainControls: configManager.getDomainControls(),
        geographyControls: configManager.getGeographyControls(),
        categoryControls: configManager.getCategoryControls()
      });
    });

    // Update basic limits
    this.app.post('/api/limits', (req, res) => {
      const { perTransaction, daily, weekly, monthly, maxTransactionsPerHour } = req.body;
      configManager.setLimits({ perTransaction, daily, weekly, monthly, maxTransactionsPerHour });
      res.json({ success: true, message: 'Limits updated' });
    });

    // Cumulative Budgets
    this.app.get('/api/limits/budgets', (req, res) => {
      res.json(configManager.getCumulativeBudgets());
    });

    this.app.post('/api/limits/budgets', (req, res) => {
      configManager.addCumulativeBudget(req.body);
      res.json({ success: true, message: 'Budget added' });
    });

    this.app.delete('/api/limits/budgets/:index', (req, res) => {
      configManager.removeCumulativeBudget(parseInt(req.params.index));
      res.json({ success: true, message: 'Budget removed' });
    });

    // Domain Controls
    this.app.get('/api/limits/domains', (req, res) => {
      res.json(configManager.getDomainControls());
    });

    this.app.post('/api/limits/domains', (req, res) => {
      const { mode, domain } = req.body;
      if (mode) {
        const controls = configManager.getDomainControls();
        controls.mode = mode;
        configManager.setDomainControls(controls);
      }
      if (domain) {
        configManager.addDomain(domain);
      }
      res.json({ success: true, message: 'Domain controls updated' });
    });

    this.app.delete('/api/limits/domains/:domain', (req, res) => {
      configManager.removeDomain(req.params.domain);
      res.json({ success: true, message: 'Domain removed' });
    });

    // Time Window
    this.app.get('/api/limits/time-window', (req, res) => {
      res.json(configManager.getTimeWindow());
    });

    this.app.post('/api/limits/time-window', (req, res) => {
      configManager.setTimeWindow(req.body);
      res.json({ success: true, message: 'Time window updated' });
    });

    // Geography Controls
    this.app.get('/api/limits/geo', (req, res) => {
      res.json(configManager.getGeographyControls());
    });

    this.app.post('/api/limits/geo', (req, res) => {
      const { enabled, mode, country } = req.body;
      const controls = configManager.getGeographyControls();
      if (enabled !== undefined) controls.enabled = enabled;
      if (mode) controls.mode = mode;
      if (country) {
        if (!controls.countries.includes(country)) {
          controls.countries.push(country);
        }
      }
      configManager.setGeographyControls(controls);
      res.json({ success: true, message: 'Geography controls updated' });
    });

    this.app.delete('/api/limits/geo/:country', (req, res) => {
      const controls = configManager.getGeographyControls();
      controls.countries = controls.countries.filter((c: string) => c !== req.params.country);
      configManager.setGeographyControls(controls);
      res.json({ success: true, message: 'Country removed' });
    });

    // Category Controls
    this.app.get('/api/limits/categories', (req, res) => {
      res.json(configManager.getCategoryControls());
    });

    this.app.post('/api/limits/categories/block', (req, res) => {
      configManager.addBlockedCategory(req.body.category);
      res.json({ success: true, message: 'Category blocked' });
    });

    this.app.post('/api/limits/categories/unblock', (req, res) => {
      configManager.removeBlockedCategory(req.body.category);
      res.json({ success: true, message: 'Category unblocked' });
    });

    this.app.post('/api/limits/categories/allow', (req, res) => {
      configManager.addAllowedCategory(req.body.category);
      res.json({ success: true, message: 'Category added to allowed list' });
    });

    this.app.post('/api/limits/categories/disallow', (req, res) => {
      configManager.removeAllowedCategory(req.body.category);
      res.json({ success: true, message: 'Category removed from allowed list' });
    });

    // Webhook endpoints
    this.app.post('/webhooks/wise', (req, res) => {
      console.log('Wise webhook received:', req.body);
      // Process webhook
      res.status(200).send('OK');
    });

    this.app.post('/webhooks/bunq', (req, res) => {
      console.log('Bunq webhook received:', req.body);
      // Process webhook
      res.status(200).send('OK');
    });

    // Dashboard route - serve dashboard.html
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../../dashboard.html'));
    });

    this.app.get('/dashboard', (req, res) => {
      res.sendFile(path.join(__dirname, '../../dashboard.html'));
    });
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`Payment Skill server running on http://localhost:${this.port}`);
      console.log(`Dashboard: http://localhost:${this.port}/dashboard`);
    });
  }
}

// Start server if run directly
if (require.main === module) {
  const port = parseInt(process.env.PORT || '8080');
  const server = new PaymentSkillServer(port);
  server.start();
}