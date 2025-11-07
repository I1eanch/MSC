const crypto = require('crypto');

class PaymentValidator {
  static validateWebhookSignature(payload, signature, secret) {
    if (!signature || !secret) {
      throw new Error('Отсутствуют подпись или секретный ключ');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  static validateAmount(amount) {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Сумма должна быть положительным числом');
    }
    return true;
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Некорректный email адрес');
    }
    return true;
  }

  static validatePhone(phone) {
    // Russian phone number validation
    const phoneRegex = /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Некорректный номер телефона');
    }
    return true;
  }

  static validate54FZCompliance(orderData) {
    const required = ['amount', 'description', 'email', 'tax_system'];
    const missing = required.filter(field => !orderData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Отсутствуют обязательные поля для 54-ФЗ: ${missing.join(', ')}`);
    }

    // Validate tax system (1 - ОСН, 2 - УСН доход, 3 - УСН доход-расход, 4 - ЕНВД, 5 - ПСН, 6 - УСН)
    const validTaxSystems = [1, 2, 3, 4, 5, 6];
    if (!validTaxSystems.includes(parseInt(orderData.tax_system))) {
      throw new Error('Некорректная система налогообложения');
    }

    return true;
  }
}

module.exports = PaymentValidator;