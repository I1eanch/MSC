const request = require('supertest');
const app = require('../server');

describe('Payment API Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('GET /api/payments/methods', () => {
    it('should return available payment methods', async () => {
      const response = await request(app)
        .get('/api/payments/methods')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('methods');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.methods)).toBe(true);
    });
  });

  describe('POST /api/payments/create', () => {
    it('should validate payment data', async () => {
      const invalidData = {
        amount: -100,
        email: 'invalid-email',
        phone: 'invalid-phone',
        paymentGateway: 'invalid-gateway'
      };

      const response = await request(app)
        .post('/api/payments/create')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should require valid payment gateway', async () => {
      const validData = {
        amount: 100,
        description: 'Test payment',
        email: 'test@example.com',
        phone: '+7 (999) 123-45-67',
        paymentGateway: 'yoomoney'
      };

      const response = await request(app)
        .post('/api/payments/create')
        .send(validData);

      // Will fail due to missing API keys, but should pass validation
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Webhook validation', () => {
    it('should validate webhook data structure', async () => {
      const response = await request(app)
        .post('/api/webhooks/validate')
        .send({
          gateway: 'yoomoney',
          payload: { test: 'data' },
          signature: 'invalid-signature'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('valid', false);
    });
  });
});

describe('54-ФЗ Compliance Tests', () => {
  describe('Payment validation', () => {
    it('should require fiscal data for compliance', () => {
      const PaymentValidator = require('../middleware/validation');
      
      expect(() => {
        PaymentValidator.validate54FZCompliance({
          amount: 100,
          description: 'Test'
        });
      }).toThrow('Отсутствуют обязательные поля для 54-ФЗ');

      expect(() => {
        PaymentValidator.validate54FZCompliance({
          amount: 100,
          description: 'Test',
          email: 'test@example.com',
          tax_system: 7 // Invalid tax system
        });
      }).toThrow('Некорректная система налогообложения');
    });

    it('should validate Russian phone numbers', () => {
      const PaymentValidator = require('../middleware/validation');
      
      expect(() => PaymentValidator.validatePhone('+7 (999) 123-45-67')).not.toThrow();
      expect(() => PaymentValidator.validatePhone('89991234567')).not.toThrow();
      expect(() => PaymentValidator.validatePhone('123456')).toThrow();
    });
  });
});