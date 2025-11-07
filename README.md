# Allan Rayman Payments - Russian Payment Gateway Integration

## Overview

This project implements a comprehensive payment system for Allan Rayman's portfolio website with support for Russian payment gateways (YooMoney and Tinkoff), including recurring payments, webhook handling, and 54-ФЗ compliance.

## Features

### Payment Gateway Support
- **YooMoney (ЮKassa)**: Bank cards, YooMoney wallet, QIWI, and other payment methods
- **Tinkoff**: Bank card payments with enhanced security
- **Recurring Payments**: Tokenized billing for monthly subscriptions
- **Refund Processing**: Full refund flow with proper logging

### 54-ФЗ Compliance
- Automatic fiscal receipt generation
- Tax system configuration (ОСН, УСН, ЕНВД, ПСН)
- VAT handling (20%, 10%, 0%, без НДС)
- Customer data collection (email, phone)
- Itemized receipts with proper tax codes

### Security Features
- Webhook signature validation
- Rate limiting
- Request validation
- HTTPS enforcement in production
- SQL injection protection (when using database)

## Installation

### Prerequisites
- Node.js 16+ 
- NPM or Yarn
- Russian payment gateway accounts (YooMoney and/or Tinkoff)

### Setup

1. **Clone and install dependencies**
```bash
git clone <repository>
cd allan-rayman-payments
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# YooMoney Configuration
YOOMONEY_SHOP_ID=your_shop_id
YOOMONEY_SECRET_KEY=your_secret_key

# Tinkoff Configuration  
TINKOFF_TERMINAL_KEY=your_terminal_key
TINKOFF_SECRET_KEY=your_secret_key

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret_for_validation

# 54-ФЗ Compliance
FISCAL_DATA_REQUIRED=true
TAX_SYSTEM=1  # 1=ОСН, 2=УСН доход, 3=УСН доход-расход, 4=ЕНВД, 5=ПСН, 6=УСН
VAT_RATE=20   # 20, 10, 0, none
```

3. **Start the server**
```bash
npm start
# or for development
npm run dev
```

## API Documentation

### Payment Endpoints

#### Create Payment
```
POST /api/payments/create
```

**Request Body:**
```json
{
  "amount": 1000,
  "description": "Support Allan Rayman",
  "email": "user@example.com",
  "phone": "+7 (999) 123-45-67",
  "paymentGateway": "yoomoney",
  "recurring": false,
  "tax_system": 1
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_1234567890_abc123",
  "paymentId": "payment_abc123",
  "confirmationUrl": "https://payment.url/redirect",
  "status": "pending",
  "paymentMethodId": "card_123456",
  "message": "Платеж успешно создан"
}
```

#### Create Recurring Payment
```
POST /api/payments/recurring
```

#### Refund Payment
```
POST /api/payments/refund
```

#### Get Payment Status
```
GET /api/payments/status/:paymentId?gateway=yoomoney
```

#### Get Available Methods
```
GET /api/payments/methods
```

### Webhook Endpoints

#### YooMoney Webhook
```
POST /api/webhooks/yoomoney
```

#### Tinkoff Webhook  
```
POST /api/webhooks/tinkoff
```

#### Validate Webhook
```
POST /api/webhooks/validate
```

## Webhook Configuration

### YooMoney
1. Go to YooMoney merchant dashboard
2. Set webhook URL: `https://yourdomain.com/api/webhooks/yoomoney`
3. Enable events: payment.succeeded, payment.canceled, refund.succeeded

### Tinkoff
1. Go to Tinkoff merchant dashboard  
2. Set webhook URL: `https://yourdomain.com/api/webhooks/tinkoff`
3. Enable all payment status notifications

## Testing

### Running Tests
```bash
npm test
```

### Sandbox Testing

#### YooMoney Test Cards
- **Success**: 5555 5555 5555 4444
- **3DS Required**: 5555 5555 5555 5557  
- **Declined**: 5555 5555 5555 0002

#### Tinkoff Test Cards
- Use provided test card numbers in Tinkoff dashboard
- Set terminal to test mode

### Test Scenarios

1. **Successful Payment**
```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "description": "Test payment",
    "email": "test@example.com", 
    "phone": "+79991234567",
    "paymentGateway": "yoomoney",
    "recurring": false
  }'
```

2. **Recurring Payment Setup**
```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "description": "Monthly support",
    "email": "test@example.com",
    "phone": "+79991234567", 
    "paymentGateway": "tinkoff",
    "recurring": true
  }'
```

## 54-ФЗ Compliance Notes

### Required Data
- Customer email or phone
- Tax system ID
- VAT rate
- Item descriptions
- Payment amounts

### Tax Systems
1. ОСН (Общая система налогообложения)
2. УСН "Доходы"  
3. УСН "Доходы минус расходы"
4. ЕНВД (Единый налог на вмененный доход)
5. ПСН (Патентная система налогообложения)
6. УСН (Упрощенная система налогообложения)

### VAT Rates
- 20% (стандартная ставка)
- 10% (пониженная ставка)
- 0% (не облагается НДС)
- none (без НДС)

## Error Handling

### Common Error Codes
- `400`: Validation error or bad request
- `401`: Authentication failed
- `404`: Payment not found
- `429`: Rate limit exceeded
- `500`: Internal server error

### Error Response Format
```json
{
  "success": false,
  "error": "Error description",
  "message": "User-friendly message",
  "details": "Technical details (dev only)"
}
```

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3000

# Use HTTPS
HTTPS_ENABLED=true

# Database (recommended for production)
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=payments_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

### Security Checklist
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Webhook URLs configured
- [ ] Rate limiting configured
- [ ] Logging enabled
- [ ] Database backups configured
- [ ] Monitor webhook failures

## Monitoring and Logging

### Webhook Monitoring
- Monitor `/api/webhooks/events` endpoint
- Set up alerts for failed webhook processing
- Track payment status changes

### Recommended Metrics
- Payment success rate
- Webhook delivery success rate  
- Average transaction time
- Error rates by gateway

## Support

For issues related to:
- **YooMoney**: https://yookassa.ru/developers/support
- **Tinkoff**: https://www.tinkoff.ru/business/help/
- **This Integration**: Create GitHub issue

## License

MIT License - see LICENSE file for details