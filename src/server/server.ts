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

    // Get limits
    this.app.get('/api/limits', (req, res) => {
      res.json({
        limits: configManager.getLimits(),
        timeWindow: configManager.getTimeWindow()
      });
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