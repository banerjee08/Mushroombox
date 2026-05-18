# n8n Automation Workflows

This directory contains the automation workflows exported from n8n for the Mushroombox system.

## Recommended Workflows

1. **order_confirmation.json**: Triggered via webhook when an order is successful, sending a confirmation email.
2. **abandoned_cart.json**: Triggered via webhook when a cart is abandoned for X hours without conversion, sending a recovery email.
3. **low_inventory_alert.json**: Runs on a schedule every hour to check for any inventory batches running below safe limits.

### Implementation Next Steps
- Import these JSON files into your self-hosted n8n instance.
- Configure SMTP/Email credentials inside n8n for the `emailSend` node.
- Configure Telegram Bot API token for internal OPS alerts.
