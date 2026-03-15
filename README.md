# Payment Skill

Self-hosted payment skill for OpenClaw - pay from your bank account to merchants via API.

## Overview

Payment Skill is a Node.js/TypeScript application that enables OpenClaw agents to make payments from the owner's bank account to merchants who accept payments through APIs. It supports multiple payment providers (Wise, Bunq) and provides both a CLI interface and web dashboard.

## Features

- **Multi-Provider Support**: Wise, Bunq
- **CLI Interface**: Complete command-line interface for automation
- **Web Dashboard**: Browser-based interface for manual operations
- **Emergency Stop**: Big red button to halt all transactions immediately
- **Transaction Limits**: Configurable daily, weekly, monthly limits
- **Time Windows**: Restrict transactions to specific hours
- **Merchant Detection**: Auto-detect merchant API capabilities
- **Template-Based**: Configurable payment flow templates
- **Webhook Support**: Real-time notifications for async payments
- **Comprehensive Logging**: Full audit trail of all transactions

## Installation

### Global Installation (Recommended)

```bash
npm install -g payment-skill
```

### Local Installation

```bash
npm install payment-skill
```

### From Source

```bash
git clone https://github.com/kraskoruk/payment-skill.git
cd payment-skill
npm install
npm run build
npm link
```

## Quick Start

### 1. Initialize Configuration

```bash
payment-skill config init
```

### 2. Add Payment Provider

For Wise:
```bash
payment-skill provider add wise --api-key YOUR_WISE_API_KEY
```

For Bunq:
```bash
payment-skill provider add bunq --api-key YOUR_BUNQ_API_KEY
```

### 3. Check Balance

```bash
# Wise
payment-skill wise balance

# Bunq
payment-skill bunq accounts --user YOUR_USER_ID
```

### 4. Make a Payment

```bash
# Using Wise
payment-skill wise quote --source EUR --target EUR --amount 100
payment-skill wise transfer --quote QUOTE_ID --recipient RECIPIENT_ID
payment-skill wise fund TRANSFER_ID

# Using Bunq
payment-skill bunq pay --user USER_ID --account ACCOUNT_ID --amount 100 --currency EUR --to-iban IBAN --to-name "Recipient Name" --description "Payment"
```

## CLI Commands Reference

### Configuration Commands

```bash
# Initialize configuration
payment-skill config init

# Get configuration value
payment-skill config get <key>

# Set configuration value
payment-skill config set <key> <value>

# List all configuration
payment-skill config list

# Show config file path
payment-skill config path
```

### Provider Commands

```bash
# Add a provider
payment-skill provider add <name> --api-key <key> [options]

# List configured providers
payment-skill provider list

# Get provider details
payment-skill provider get <name>

# Remove a provider
payment-skill provider remove <name>

# Test provider connection
payment-skill provider test <name>
```

### Wise Commands

```bash
# Get balances
payment-skill wise balance [--profile <id>]

# Create a quote
payment-skill wise quote --source <currency> --target <currency> --amount <amount> [--profile <id>]

# Create a transfer
payment-skill wise transfer --quote <id> --recipient <id> [--reference <text>] [--profile <id>]

# Fund a transfer
payment-skill wise fund <transferId> [--profile <id>]

# List transfers
payment-skill wise list [--profile <id>] [--status <status>] [--limit <number>]

# Get transfer status
payment-skill wise status <transferId> [--poll] [--interval <seconds>]

# Cancel a transfer
payment-skill wise cancel <transferId>
```

### Bunq Commands

```bash
# List accounts
payment-skill bunq accounts --user <id>

# Get balance
payment-skill bunq balance --user <id> --account <id>

# Create payment
payment-skill bunq pay --user <id> --account <id> --amount <amount> --currency <currency> --to-iban <iban> --to-name <name> --description <text>

# Create payment request
payment-skill bunq request --user <id> --account <id> --amount <amount> --currency <currency> --to <alias> --description <text> [--type <type>]

# List payments
payment-skill bunq payments --user <id> --account <id> [--limit <number>]

# List payment requests
payment-skill bunq requests --user <id> --account <id>
```

### Transaction Commands

```bash
# List transactions
payment-skill transaction list [--status <status>] [--provider <provider>] [--merchant <merchant>]

# Get transaction details
payment-skill transaction get <id>

# Cancel a transaction
payment-skill transaction cancel <id>

# Delete a transaction
payment-skill transaction delete <id>
```

### Limit Commands

```bash
# Get current limits
payment-skill limits get

# Set limits
payment-skill limits set --per-transaction <amount> --daily <amount> --weekly <amount> --monthly <amount> --max-per-hour <count>

# Get time window settings
payment-skill limits time-window get

# Set time window
payment-skill limits time-window set --start <HH:MM> --end <HH:MM> --timezone <timezone>

# Enable/disable time window
payment-skill limits time-window enable
payment-skill limits time-window disable

# Block/unblock merchant
payment-skill limits block <merchant-id>
payment-skill limits unblock <merchant-id>

# Block/unblock category
payment-skill limits block-category <category>
payment-skill limits unblock-category <category>
```

### Emergency Commands

```bash
# Activate emergency stop
payment-skill emergency stop [--reason <reason>]

# Deactivate emergency stop
payment-skill emergency resume

# Check emergency status
payment-skill emergency status

# Kill all pending transactions
payment-skill emergency kill-all --force
```

### Merchant Commands

```bash
# Detect merchant API capabilities
payment-skill merchant detect <domain>

# List supported merchant APIs
payment-skill merchant list-apis

# Get merchant capabilities
payment-skill merchant capabilities <merchant-id>
```

### Template Commands

```bash
# List available templates
payment-skill template list [--merchant <merchant>]

# Get template details
payment-skill template get <template-id>

# Execute payment with template
payment-skill pay --template <id> --amount <amount> --currency <currency> [template-specific-options]
```

### Server Commands

```bash
# Start dashboard server
payment-skill serve [--port <port>] [--host <host>]

# Start in background
payment-skill serve --daemon

# Stop server
payment-skill server stop

# Check server status
payment-skill server status
```

## Verified Merchants

Payment-skill only allows transactions to pre-approved merchants. The list is stored in `verified-merchants.json`:

**Current Verified Merchants:**
1. **Stripe Connect** - Payment processor (can receive payments)
2. **Airwallex** - Payment processor (can receive payments)
3. **DigitalOcean** - Cloud hosting (separate team billing)
4. **ClickClack Market** - Your marketplace (can receive payments)

**Blocked Categories:**
- gambling
- adult
- drugs
- weapons
- tobacco

The app will reject any transaction to merchants not on this list.

## Configuration

Configuration is stored in `~/.payment-skill/config.json`:

```json
{
  "version": "1.0.0",
  "providers": {
    "wise": {
      "apiKey": "wise-api-key",
      "profileId": "profile-id",
      "environment": "production"
    },
    "bunq": {
      "apiKey": "bunq-api-key",
      "environment": "production"
    }
  },
  "limits": {
    "perTransaction": 10000,
    "daily": 50000,
    "weekly": 200000,
    "monthly": 500000,
    "maxTransactionsPerHour": 10
  },
  "timeWindow": {
    "enabled": false,
    "start": "08:00",
    "end": "22:00",
    "timezone": "Europe/Bucharest"
  },
  "blockedCategories": ["gambling", "adult", "drugs", "weapons", "tobacco"],
  "verifiedMerchantsOnly": true,
  "webhookUrl": "https://your-server.com/webhooks"
}
```

## Environment Variables

```bash
PAYMENT_SKILL_CONFIG_PATH=/path/to/config
PAYMENT_SKILL_WISE_API_KEY=your-wise-key
PAYMENT_SKILL_BUNQ_API_KEY=your-bunq-key
PAYMENT_SKILL_LOG_LEVEL=info
PAYMENT_SKILL_WEBHOOK_SECRET=your-webhook-secret
```

## API Documentation

### Wise API Flow

1. **Create Quote**: Lock exchange rate
2. **Add Recipient**: Define where money goes
3. **Create Transfer**: Initiate the transfer
4. **Fund Transfer**: Pay from your balance
5. **Confirm (PSD2)**: Approve in Wise app

### Bunq API Flow

1. **Get Accounts**: List your monetary accounts
2. **Create Payment**: Send money directly
3. **Create Request**: Ask someone to pay you
4. **Check Status**: Verify payment status

## Web Dashboard

The web dashboard provides a visual interface for all operations:

```bash
# Start the server
payment-skill serve

# Open in browser
open http://localhost:18790/dashboard
```

Features:
- Provider configuration
- Balance overview
- Transaction history
- Payment initiation
- Emergency stop button
- Limit configuration

## Webhooks

Configure webhooks to receive real-time notifications:

```bash
# Set webhook URL
payment-skill config set webhookUrl "https://your-server.com/webhooks"

# Start server to receive webhooks
payment-skill serve
```

Webhook endpoints:
- `POST /webhooks/wise` - Wise events
- `POST /webhooks/bunq` - Bunq events
- `POST /webhooks/stripe` - Stripe events
- `POST /webhooks/airwallex` - Airwallex events

## Security

- API keys stored in `~/.payment-skill/` with restricted permissions
- Emergency stop prevents all transactions
- Transaction limits prevent overspending
- Time windows restrict when payments can be made
- All transactions logged with full audit trail

## PSD2 Compliance

For EU users, Strong Customer Authentication (SCA) is required:

- Wise: Open Wise mobile app to confirm transfers
- Bunq: Approve payments in Bunq app

The app will notify you when SCA is required.

## Troubleshooting

### Common Issues

**"Provider not configured"**
```bash
payment-skill provider add wise --api-key YOUR_KEY
```

**"Emergency stop is active"**
```bash
payment-skill emergency status
payment-skill emergency resume
```

**"Daily limit exceeded"**
```bash
payment-skill limits get
payment-skill limits set --daily 100000
```

**"PSD2 confirmation required"**
- Open your provider's mobile app
- Approve the pending transaction

### Debug Mode

```bash
payment-skill --verbose <command>
```

### Logs

Logs are stored in `~/.payment-skill/logs/`:

```bash
tail -f ~/.payment-skill/logs/payment-skill.log
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Architecture

```
payment-skill/
├── src/
│   ├── api/          # API clients (Wise, Bunq)
│   ├── commands/     # CLI commands
│   ├── core/         # Core logic (config, transactions)
│   ├── merchants/    # Merchant detection
│   ├── server/       # Web server
│   ├── templates/    # Payment templates
│   ├── types/        # TypeScript types
│   └── utils/        # Utilities
├── bin/              # CLI entry point
├── templates/        # Payment flow templates
└── dashboard/        # Web dashboard files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License with Additional Liability Disclaimer - see [LICENSE](LICENSE) file

**IMPORTANT:** By using this software, you agree that:
- The creators cannot be held liable for any financial losses or damages
- You use this software entirely at your own risk
- You are solely responsible for securing your API keys and verifying transactions

## Support

- **GitHub Issues:** https://github.com/kraskoruk/payment-skill/issues (Bug reports, feature requests, questions)
- **GitHub Discussions:** https://github.com/kraskoruk/payment-skill/discussions (Community Q&A)
- **Wiki:** https://github.com/kraskoruk/payment-skill/wiki (Community-maintained documentation)
- **SUPPORT.md:** See [SUPPORT.md](SUPPORT.md) for detailed support information

**Note:** Support is community-driven. The wiki is intentionally empty to encourage community contribution. Be the first to add documentation!

## Disclaimer

⚠️ **USE AT YOUR OWN RISK**

Payment-skill involves real money transactions. The authors are not responsible for:
- Lost funds or failed transactions
- Unauthorized access to your accounts
- API errors from payment providers
- Any financial losses whatsoever

See LICENSE file for complete disclaimer.

## Changelog

### v1.0.0
- Initial release
- Wise and Bunq support
- CLI interface
- Web dashboard
- Emergency stop
- Transaction limits
- Webhook support