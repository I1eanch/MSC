const axios = require('axios');
const crypto = require('crypto');

class TinkoffService {
  constructor() {
    this.terminalKey = process.env.TINKOFF_TERMINAL_KEY;
    this.secretKey = process.env.TINKOFF_SECRET_KEY;
    this.successUrl = process.env.TINKOFF_SUCCESS_URL;
    this.failUrl = process.env.TINKOFF_FAIL_URL;
    this.apiUrl = 'https://securepay.tinkoff.ru/v2';
  }

  isConfigured() {
    return !!(this.terminalKey && this.secretKey);
  }

  generateToken(data) {
    // Remove Token from data if present
    const { Token, ...dataWithoutToken } = data;
    
    // Sort keys alphabetically
    const sortedKeys = Object.keys(dataWithoutToken).sort();
    
    // Create string for hashing
    const stringForHash = sortedKeys
      .map(key => dataWithoutToken[key])
      .join('') + this.secretKey;

    return crypto.createHash('sha256').update(stringForHash).digest('hex');
  }

  async createPayment(amount, orderId, description, customerData, recurring = false) {
    try {
      const paymentData = {
        TerminalKey: this.terminalKey,
        Amount: Math.round(amount * 100), // Convert to kopecks
        OrderId: orderId,
        Description: description,
        DATA: {
          Email: customerData.email,
          Phone: customerData.phone,
          Recurring: recurring.toString()
        },
        Receipt: {
          Email: customerData.email,
          Phone: customerData.phone,
          Taxation: process.env.TAX_SYSTEM || 'osn',
          Items: [{
            Name: description,
            Price: Math.round(amount * 100),
            Quantity: 1,
            Amount: Math.round(amount * 100),
            Tax: this.getTaxCode(),
            PaymentMethod: 'full_prepayment',
            PaymentObject: 'service'
          }]
        },
        SuccessURL: this.successUrl,
        FailURL: this.failUrl
      };

      // Add recurring payment setup
      if (recurring) {
        paymentData.Recurring = 'Y';
      }

      // Generate token
      paymentData.Token = this.generateToken(paymentData);

      const response = await axios.post(`${this.apiUrl}/Init`, paymentData);

      if (response.data.Success) {
        return {
          success: true,
          paymentId: response.data.PaymentId,
          paymentUrl: response.data.PaymentURL,
          orderId: response.data.OrderId,
          status: response.data.Status
        };
      } else {
        return {
          success: false,
          error: response.data.Details || response.data.Message || 'Ошибка создания платежа Tinkoff'
        };
      }
    } catch (error) {
      console.error('Tinkoff payment creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка создания платежа Tinkoff'
      };
    }
  }

  async createRecurringPayment(amount, orderId, description, rebillId, customerData) {
    try {
      const paymentData = {
        TerminalKey: this.terminalKey,
        Amount: Math.round(amount * 100),
        OrderId: orderId,
        Description: description,
        DATA: {
          Email: customerData.email,
          Recurring: 'true'
        },
        Receipt: {
          Email: customerData.email,
          Taxation: process.env.TAX_SYSTEM || 'osn',
          Items: [{
            Name: description,
            Price: Math.round(amount * 100),
            Quantity: 1,
            Amount: Math.round(amount * 100),
            Tax: this.getTaxCode(),
            PaymentMethod: 'full_prepayment',
            PaymentObject: 'service'
          }]
        },
        RebillId: rebillId
      };

      // Generate token
      paymentData.Token = this.generateToken(paymentData);

      const response = await axios.post(`${this.apiUrl}/Charge`, paymentData);

      if (response.data.Success) {
        return {
          success: true,
          paymentId: response.data.PaymentId,
          orderId: response.data.OrderId,
          status: response.data.Status
        };
      } else {
        return {
          success: false,
          error: response.data.Details || response.data.Message || 'Ошибка рекуррентного платежа Tinkoff'
        };
      }
    } catch (error) {
      console.error('Tinkoff recurring payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка рекуррентного платежа Tinkoff'
      };
    }
  }

  async refundPayment(paymentId, amount) {
    try {
      const refundData = {
        TerminalKey: this.terminalKey,
        PaymentId: paymentId,
        Sum: Math.round(amount * 100)
      };

      // Generate token
      refundData.Token = this.generateToken(refundData);

      const response = await axios.post(`${this.apiUrl}/Cancel`, refundData);

      if (response.data.Success) {
        return {
          success: true,
          paymentId: response.data.PaymentId,
          orderId: response.data.OrderId,
          status: response.data.Status
        };
      } else {
        return {
          success: false,
          error: response.data.Details || response.data.Message || 'Ошибка возврата Tinkoff'
        };
      }
    } catch (error) {
      console.error('Tinkoff refund error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка возврата Tinkoff'
      };
    }
  }

  async getPaymentState(paymentId) {
    try {
      const stateData = {
        TerminalKey: this.terminalKey,
        PaymentId: paymentId
      };

      // Generate token
      stateData.Token = this.generateToken(stateData);

      const response = await axios.post(`${this.apiUrl}/GetState`, stateData);

      if (response.data.Success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.data.Details || response.data.Message || 'Ошибка получения статуса платежа Tinkoff'
        };
      }
    } catch (error) {
      console.error('Tinkoff get state error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка получения статуса платежа Tinkoff'
      };
    }
  }

  validateWebhook(payload) {
    try {
      if (!payload || !payload.Token) {
        return false;
      }

      const receivedToken = payload.Token;
      const expectedToken = this.generateToken(payload);
      
      return receivedToken === expectedToken;
    } catch (error) {
      console.error('Tinkoff webhook validation error:', error);
      return false;
    }
  }

  getTaxCode() {
    // Tax codes for Tinkoff: vat0, vat10, vat20, vat110, vat120, none
    const vatRate = process.env.VAT_RATE || '20';
    switch (vatRate) {
      case '20': return 'vat20';
      case '10': return 'vat10';
      case '0': return 'vat0';
      case 'none': return 'none';
      default: return 'vat20';
    }
  }
}

module.exports = new TinkoffService();