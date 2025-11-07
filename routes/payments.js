const express = require('express');
const Joi = require('joi');
const PaymentValidator = require('../middleware/validation');
const yoomoneyService = require('../services/yoomoney');
const tinkoffService = require('../services/tinkoff');

const router = express.Router();

// Validation schemas
const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  description: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/).required(),
  paymentGateway: Joi.string().valid('yoomoney', 'tinkoff').required(),
  recurring: Joi.boolean().default(false),
  tax_system: Joi.number().valid(1, 2, 3, 4, 5, 6).default(1)
});

const recurringPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  description: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  paymentGateway: Joi.string().valid('yoomoney', 'tinkoff').required(),
  paymentMethodId: Joi.string().required(),
  originalPaymentId: Joi.string().required()
});

const refundSchema = Joi.object({
  paymentId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  paymentGateway: Joi.string().valid('yoomoney', 'tinkoff').required()
});

// Generate unique order ID
function generateOrderId() {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create initial payment
router.post('/create', async (req, res) => {
  try {
    // Validate input
    const { error, value } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Ошибка валидации',
        details: error.details[0].message
      });
    }

    // Additional validation
    PaymentValidator.validateAmount(value.amount);
    PaymentValidator.validateEmail(value.email);
    PaymentValidator.validatePhone(value.phone);
    PaymentValidator.validate54FZCompliance(value);

    const orderId = generateOrderId();
    const customerData = {
      email: value.email,
      phone: value.phone
    };

    let result;
    if (value.paymentGateway === 'yoomoney') {
      result = await yoomoneyService.createPayment(
        value.amount,
        value.description,
        customerData,
        value.recurring
      );
    } else if (value.paymentGateway === 'tinkoff') {
      result = await tinkoffService.createPayment(
        value.amount,
        orderId,
        value.description,
        customerData,
        value.recurring
      );
    }

    if (result.success) {
      res.json({
        success: true,
        orderId: orderId,
        paymentId: result.paymentId,
        confirmationUrl: result.confirmationUrl || result.paymentUrl,
        status: result.status,
        paymentMethodId: result.paymentMethodId,
        message: 'Платеж успешно создан'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Ошибка создания платежа'
      });
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Create recurring payment
router.post('/recurring', async (req, res) => {
  try {
    // Validate input
    const { error, value } = recurringPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Ошибка валидации',
        details: error.details[0].message
      });
    }

    // Additional validation
    PaymentValidator.validateAmount(value.amount);
    PaymentValidator.validateEmail(value.email);

    const orderId = generateOrderId();
    const customerData = {
      email: value.email
    };

    let result;
    if (value.paymentGateway === 'yoomoney') {
      result = await yoomoneyService.createRecurringPayment(
        value.amount,
        value.description,
        value.paymentMethodId,
        customerData
      );
    } else if (value.paymentGateway === 'tinkoff') {
      result = await tinkoffService.createRecurringPayment(
        value.amount,
        orderId,
        value.description,
        value.paymentMethodId,
        customerData
      );
    }

    if (result.success) {
      res.json({
        success: true,
        orderId: orderId,
        paymentId: result.paymentId,
        status: result.status,
        message: 'Рекуррентный платеж успешно создан'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Ошибка создания рекуррентного платежа'
      });
    }
  } catch (error) {
    console.error('Recurring payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Refund payment
router.post('/refund', async (req, res) => {
  try {
    // Validate input
    const { error, value } = refundSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Ошибка валидации',
        details: error.details[0].message
      });
    }

    PaymentValidator.validateAmount(value.amount);

    let result;
    if (value.paymentGateway === 'yoomoney') {
      result = await yoomoneyService.refundPayment(value.paymentId, value.amount);
    } else if (value.paymentGateway === 'tinkoff') {
      result = await tinkoffService.refundPayment(value.paymentId, value.amount);
    }

    if (result.success) {
      res.json({
        success: true,
        refundId: result.refundId,
        paymentId: result.paymentId,
        status: result.status,
        message: 'Возврат успешно обработан'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Ошибка возврата'
      });
    }
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Get payment status
router.get('/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { gateway } = req.query;

    if (!gateway || !['yoomoney', 'tinkoff'].includes(gateway)) {
      return res.status(400).json({
        success: false,
        error: 'Не указан или неверно указан платежный шлюз'
      });
    }

    let result;
    if (gateway === 'yoomoney') {
      result = await yoomoneyService.getPaymentInfo(paymentId);
    } else if (gateway === 'tinkoff') {
      result = await tinkoffService.getPaymentState(paymentId);
    }

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Информация о платеже получена'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Ошибка получения информации о платеже'
      });
    }
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Get available payment methods
router.get('/methods', (req, res) => {
  const methods = [];
  
  if (yoomoneyService.isConfigured()) {
    methods.push({
      id: 'yoomoney',
      name: 'ЮMoney (ЮKassa)',
      description: 'Оплата банковской картой, ЮMoney, QIWI и другие способы',
      recurring: true,
      refunds: true
    });
  }
  
  if (tinkoffService.isConfigured()) {
    methods.push({
      id: 'tinkoff',
      name: 'Тинькофф',
      description: 'Оплата банковской картой через Тинькофф',
      recurring: true,
      refunds: true
    });
  }

  res.json({
    success: true,
    methods,
    total: methods.length
  });
});

module.exports = router;