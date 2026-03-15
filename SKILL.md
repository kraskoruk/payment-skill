---
name: payment-skill
description: Self-hosted payment skill for OpenClaw - pay from your bank account to merchants via Wise/Bunq APIs with template-based configurable flows, emergency stop, and comprehensive CLI
metadata:
  {
    "openclaw":
      {
        "requires": { "node": ">=16.0.0" },
        "install":
          [
            {
              "id": "npm-install",
              "kind": "npm",
              "package": "payment-skill",
              "global": true,
              "label": "Install Payment Skill globally"
            }
          ],
        "bins": ["payment-skill"]
      }
  }
---

# Payment Skill

Self-hosted payment skill for OpenClaw agents. Pay from your bank account to merchants who accept payments through APIs.

## Features

- **Multi-Provider Support**: Wise, Bunq (extensible to Stripe, Airwallex)
- **HYBRID ARCHITECTURE**: Template-based configurable payment flows
- **CLI Interface**: Complete command-line interface for automation
- **Emergency Stop**: Big red button to halt all transactions immediately
- **Transaction Limits**: Configurable daily, weekly, monthly limits
- **Time Windows**: Restrict transactions to specific hours
- **Web Dashboard**: Browser-based interface included
- **Webhook Support**: Real-time notifications for async payments

## Installation

```bash
npm install -g payment-skill
```

## Quick Start

```bash
# Initialize
payment-skill config init

# Add provider
payment-skill provider add wise --api-key YOUR_WISE_API_KEY

# Check balance
payment-skill wise balance

# Make payment using template
payment-skill pay --template wise_standard_transfer --amount 100 --currency EUR --profile-id XXX --recipient-id YYY
```

## CLI Commands

- `payment-skill config` - Configuration management
- `payment-skill provider` - Provider management (Wise, Bunq)
- `payment-skill wise` - Wise API operations
- `payment-skill bunq` - Bunq API operations
- `payment-skill pay` - Execute payments using templates
- `payment-skill template` - Template management
- `payment-skill limits` - Payment limits and controls
- `payment-skill emergency` - Emergency stop controls
- `payment-skill transaction` - Transaction management

## Templates (Hybrid Architecture)

Predefined payment flows:
- `wise_standard_transfer` - 3-step Wise flow with PSD2
- `bunq_instant_payment` - Direct Bunq payment
- `bunq_payment_request` - Request money via Bunq
- `stripe_connect_charge` - Stripe payment intent flow

## Emergency Stop

```bash
payment-skill emergency stop  # Halt all transactions
payment-skill emergency status  # Check status
payment-skill emergency resume  # Resume operations
```

## Documentation

- GitHub: https://github.com/kraskoruk/payment-skill
- Issues: https://github.com/kraskoruk/payment-skill/issues
- Wiki: https://github.com/kraskoruk/payment-skill/wiki

## License

MIT License with Liability Disclaimer - see LICENSE file

**USE AT YOUR OWN RISK** - Creators not liable for financial losses