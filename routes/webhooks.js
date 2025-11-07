const express = require('express');
const crypto = require('crypto');
const PaymentValidator = require('../middleware/validation');
const yoomoneyService = require('../services/yoomoney');
const tinkoffService = require('../services/tinkoff');

const router = express.Router();

// Simple in-memory storage for webhook events (in production, use database)
const webhookEvents = [];

// YooMoney webhook handler
router.post('/yoomoney', (req, res) => {
  try {
    const signature = req.headers['sha256-hmac'];
    const payload = JSON.stringify(req.body);

    // Validate webhook signature
    if (!yoomoneyService.validateWebhook(payload, signature)) {
      console.error('Invalid YooMoney webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('YooMoney webhook received:', event);

    // Store webhook event
    webhookEvents.push({
      gateway: 'yoomoney',
      timestamp: new Date().toISOString(),
      event: event
    });

    // Process different event types
    switch (event.type) {
      case 'payment.succeeded':
        console.log(`Payment succeeded: ${event.object.id}`);
        // Here you would typically update your database, send confirmation emails, etc.
        break;
      
      case 'payment.waiting_for_capture':
        console.log(`Payment waiting for capture: ${event.object.id}`);
        break;
      
      case 'payment.canceled':
        console.log(`Payment canceled: ${event.object.id}`);
        break;
      
      case 'refund.succeeded':
        console.log(`Refund succeeded: ${event.object.id}`);
        break;
      
      case 'payment.failed':
        console.log(`Payment failed: ${event.object.id}, reason: ${event.object.cancellation_details?.reason}`);
        break;
      
      default:
        console.log(`Unknown YooMoney event type: ${event.type}`);
    }

    // Respond with 200 OK to acknowledge receipt
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('YooMoney webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Tinkoff webhook handler
router.post('/tinkoff', (req, res) => {
  try {
    // Validate webhook token
    if (!tinkoffService.validateWebhook(req.body)) {
      console.error('Invalid Tinkoff webhook token');
      return res.status(400).json({ error: 'Invalid token' });
    }

    const event = req.body;
    console.log('Tinkoff webhook received:', event);

    // Store webhook event
    webhookEvents.push({
      gateway: 'tinkoff',
      timestamp: new Date().toISOString(),
      event: event
    });

    // Process different payment statuses
    switch (event.Status) {
      case 'CONFIRMED':
        console.log(`Payment confirmed: ${event.PaymentId}, OrderId: ${event.OrderId}`);
        // Here you would typically update your database, send confirmation emails, etc.
        break;
      
      case 'AUTHORIZED':
        console.log(`Payment authorized: ${event.PaymentId}, OrderId: ${event.OrderId}`);
        break;
      
      case 'REVERSED':
        console.log(`Payment reversed: ${event.PaymentId}, OrderId: ${event.OrderId}`);
        break;
      
      case 'REFUNDED':
        console.log(`Payment refunded: ${event.PaymentId}, OrderId: ${event.OrderId}`);
        break;
      
      case 'PARTIAL_REFUNDED':
        console.log(`Payment partially refunded: ${event.PaymentId}, OrderId: ${event.OrderId}`);
        break;
      
      case 'REJECTED':
        console.log(`Payment rejected: ${event.PaymentId}, OrderId: ${event.OrderId}, Reason: ${event.Reason}`);
        break;
      
      case 'CANCELED':
        console.log(`Payment canceled: ${event.PaymentId}, OrderId: ${event.OrderId}`);
        break;
      
      default:
        console.log(`Unknown Tinkoff status: ${event.Status}`);
    }

    // Respond with OK to acknowledge receipt
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Tinkoff webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Generic webhook validation endpoint
router.post('/validate', (req, res) => {
  try {
    const { gateway, payload, signature } = req.body;

    if (!gateway || !payload || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: gateway, payload, signature'
      });
    }

    let isValid = false;

    switch (gateway) {
      case 'yoomoney':
        isValid = yoomoneyService.validateWebhook(JSON.stringify(payload), signature);
        break;
      
      case 'tinkoff':
        isValid = tinkoffService.validateWebhook(payload);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported payment gateway'
        });
    }

    res.json({
      success: true,
      valid: isValid,
      gateway,
      message: isValid ? 'Webhook signature is valid' : 'Webhook signature is invalid'
    });
  } catch (error) {
    console.error('Webhook validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get webhook events (for debugging/testing)
router.get('/events', (req, res) => {
  const { gateway, limit = 50 } = req.query;
  
  let filteredEvents = webhookEvents;
  
  if (gateway) {
    filteredEvents = webhookEvents.filter(event => event.gateway === gateway);
  }
  
  // Return most recent events first
  filteredEvents = filteredEvents.slice(-limit).reverse();
  
  res.json({
    success: true,
    events: filteredEvents,
    total: filteredEvents.length
  });
});

// Clear webhook events (for testing)
router.delete('/events', (req, res) => {
  webhookEvents.length = 0;
  res.json({
    success: true,
    message: 'Webhook events cleared'
  });
});

// Test webhook endpoint (for development)
router.post('/test', (req, res) => {
  try {
    const { gateway, eventType } = req.body;
    
    if (!gateway) {
      return res.status(400).json({
        success: false,
        error: 'Gateway parameter is required'
      });
    }

    let testEvent;
    
    if (gateway === 'yoomoney') {
      testEvent = {
        type: eventType || 'payment.succeeded',
        object: {
          id: `test_${Date.now()}`,
          status: 'succeeded',
          amount: {
            value: '100.00',
            currency: 'RUB'
          },
          description: 'Test payment',
          created_at: new Date().toISOString(),
          metadata: {
            test: true
          }
        }
      };
    } else if (gateway === 'tinkoff') {
      testEvent = {
        TerminalKey: process.env.TINKOFF_TERMINAL_KEY,
        OrderId: `test_${Date.now()}`,
        PaymentId: `test_${Date.now()}`,
        Status: eventType || 'CONFIRMED',
        Amount: 10000,
        Token: 'test_token'
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported gateway'
      });
    }

    // Store test event
    webhookEvents.push({
      gateway: gateway,
      timestamp: new Date().toISOString(),
      event: testEvent,
      test: true
    });

    res.json({
      success: true,
      message: 'Test webhook event created',
      event: testEvent
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;