const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
require('dotenv').config();

const paymentRoutes = require('./routes/payments');
const webhookRoutes = require('./routes/webhooks');
const yoomoneyService = require('./services/yoomoney');
const tinkoffService = require('./services/tinkoff');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files for the frontend
app.use(express.static('1_start'));

// API Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);

// Payment success/failure pages
app.get('/payment/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Оплата успешна</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: green; font-size: 24px; }
            .back-link { display: block; margin-top: 30px; color: #0066cc; }
        </style>
    </head>
    <body>
        <h1 class="success">Оплата успешно завершена</h1>
        <p>Спасибо за вашу поддержку Аллана Рэймэна!</p>
        <a href="/" class="back-link">Вернуться на главную страницу</a>
    </body>
    </html>
  `);
});

app.get('/payment/fail', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Оплата не удалась</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: red; font-size: 24px; }
            .back-link { display: block; margin-top: 30px; color: #0066cc; }
        </style>
    </head>
    <body>
        <h1 class="error">Оплата не удалась</h1>
        <p>Произошла ошибка при обработке платежа. Пожалуйста, попробуйте еще раз.</p>
        <a href="/" class="back-link">Вернуться на главную страницу</a>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      yoomoney: yoomoneyService.isConfigured(),
      tinkoff: tinkoffService.isConfigured()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Страница не найдена' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Перейдите на http://localhost:${PORT} для просмотра сайта`);
});

module.exports = app;