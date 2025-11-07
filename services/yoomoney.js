const axios = require('axios');
const crypto = require('crypto');

class YooMoneyService {
  constructor() {
    this.shopId = process.env.YOOMONEY_SHOP_ID;
    this.secretKey = process.env.YOOMONEY_SECRET_KEY;
    this.returnUrl = process.env.YOOMONEY_RETURN_URL;
    this.failUrl = process.env.YOOMONEY_FAIL_URL;
    this.apiUrl = 'https://api.yookassa.ru/v3';
  }

  isConfigured() {
    return !!(this.shopId && this.secretKey);
  }

  getAuthHeader() {
    return Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64');
  }

  async createPayment(amount, description, customerData, recurring = false) {
    try {
      const paymentData = {
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB'
        },
        description,
        confirmation: {
          type: 'redirect',
          return_url: this.returnUrl
        },
        capture: true,
        metadata: {
          customer_email: customerData.email,
          customer_phone: customerData.phone,
          recurring: recurring.toString()
        }
      };

      // Add 54-ФЗ compliance data
      if (process.env.FISCAL_DATA_REQUIRED === 'true') {
        paymentData.receipt = {
          customer: {
            email: customerData.email,
            phone: customerData.phone
          },
          items: [{
            description: description,
            quantity: '1.00',
            amount: {
              value: amount.toFixed(2),
              currency: 'RUB'
            },
            vat_code: this.getVatCode(),
            payment_mode: 'full_payment',
            payment_subject: 'service'
          }],
          tax_system_id: parseInt(process.env.TAX_SYSTEM || '1')
        };
      }

      // Enable auto-payments for recurring
      if (recurring) {
        paymentData.save_payment_method = true;
        paymentData.payment_method_data = {
          type: 'bank_card'
        };
      }

      const response = await axios.post(`${this.apiUrl}/payments`, paymentData, {
        headers: {
          'Idempotence-Key': this.generateIdempotenceKey(),
          'Authorization': `Basic ${this.getAuthHeader()}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        paymentId: response.data.id,
        confirmationUrl: response.data.confirmation.confirmation_url,
        status: response.data.status,
        paymentMethodId: response.data.payment_method?.id
      };
    } catch (error) {
      console.error('YooMoney payment creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || 'Ошибка создания платежа YooMoney'
      };
    }
  }

  async createRecurringPayment(amount, description, paymentMethodId, customerData) {
    try {
      const paymentData = {
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB'
        },
        description,
        payment_method_id: paymentMethodId,
        capture: true,
        metadata: {
          customer_email: customerData.email,
          recurring: 'true'
        }
      };

      // Add 54-ФЗ compliance for recurring payments
      if (process.env.FISCAL_DATA_REQUIRED === 'true') {
        paymentData.receipt = {
          customer: {
            email: customerData.email
          },
          items: [{
            description: description,
            quantity: '1.00',
            amount: {
              value: amount.toFixed(2),
              currency: 'RUB'
            },
            vat_code: this.getVatCode(),
            payment_mode: 'full_payment',
            payment_subject: 'service'
          }],
          tax_system_id: parseInt(process.env.TAX_SYSTEM || '1')
        };
      }

      const response = await axios.post(`${this.apiUrl}/payments`, paymentData, {
        headers: {
          'Idempotence-Key': this.generateIdempotenceKey(),
          'Authorization': `Basic ${this.getAuthHeader()}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        paymentId: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      console.error('YooMoney recurring payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || 'Ошибка создания рекуррентного платежа YooMoney'
      };
    }
  }

  async refundPayment(paymentId, amount) {
    try {
      const refundData = {
        payment_id: paymentId,
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB'
        }
      };

      const response = await axios.post(`${this.apiUrl}/refunds`, refundData, {
        headers: {
          'Idempotence-Key': this.generateIdempotenceKey(),
          'Authorization': `Basic ${this.getAuthHeader()}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        refundId: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      console.error('YooMoney refund error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || 'Ошибка возврата YooMoney'
      };
    }
  }

  async getPaymentInfo(paymentId) {
    try {
      const response = await axios.get(`${this.apiUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Basic ${this.getAuthHeader()}`
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('YooMoney get payment info error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || 'Ошибка получения информации о платеже YooMoney'
      };
    }
  }

  validateWebhook(payload, signature) {
    if (!payload || !signature) {
      return false;
    }

    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payloadString)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  generateIdempotenceKey() {
    return crypto.randomUUID();
  }

  getVatCode() {
    // VAT codes for YooMoney: 1 - 20%, 2 - 10%, 3 - 0%, 4 - без НДС
    const vatRate = process.env.VAT_RATE || '20';
    switch (vatRate) {
      case '20': return '1';
      case '10': return '2';
      case '0': return '3';
      case 'none': return '4';
      default: return '1';
    }
  }
}

module.exports = new YooMoneyService();