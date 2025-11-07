#!/bin/bash

# Allan Rayman Payments - Test Script
# This script tests various payment scenarios and webhook handling

set -e

BASE_URL="http://localhost:3000"
EMAIL="test@example.com"
PHONE="+79991234567"

echo "🧪 Starting Payment System Tests..."
echo "=================================="

# Check if server is running
echo "📡 Checking server health..."
curl -s "$BASE_URL/api/health" | jq '.' || {
    echo "❌ Server is not running. Please start the server first: npm start"
    exit 1
}

echo "✅ Server is healthy"
echo ""

# Test 1: Get available payment methods
echo "🔍 Testing available payment methods..."
curl -s -X GET "$BASE_URL/api/payments/methods" | jq '.' || echo "Response not in JSON format"
echo ""

# Test 2: Test payment validation (should fail)
echo "❌ Testing invalid payment validation..."
curl -s -X POST "$BASE_URL/api/payments/create" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -100,
    "email": "invalid-email",
    "phone": "invalid-phone",
    "paymentGateway": "invalid-gateway"
  }' | jq '.' || echo "Response not in JSON format"
echo ""

# Test 3: Test valid payment creation (will fail due to missing API keys)
echo "💳 Testing valid payment creation..."
curl -s -X POST "$BASE_URL/api/payments/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 100,
    \"description\": \"Test payment for Allan Rayman\",
    \"email\": \"$EMAIL\",
    \"phone\": \"$PHONE\",
    \"paymentGateway\": \"yoomoney\",
    \"recurring\": false,
    \"tax_system\": 1
  }" | jq '.' || echo "Response not in JSON format"
echo ""

# Test 4: Test recurring payment creation
echo "🔄 Testing recurring payment creation..."
curl -s -X POST "$BASE_URL/api/payments/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 500,
    \"description\": \"Monthly support for Allan Rayman\",
    \"email\": \"$EMAIL\",
    \"phone\": \"$PHONE\",
    \"paymentGateway\": \"tinkoff\",
    \"recurring\": true,
    \"tax_system\": 1
  }" | jq '.' || echo "Response not in JSON format"
echo ""

# Test 5: Test webhook validation
echo "🔐 Testing webhook validation..."
curl -s -X POST "$BASE_URL/api/webhooks/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "yoomoney",
    "payload": {"test": "data"},
    "signature": "invalid-signature"
  }' | jq '.' || echo "Response not in JSON format"
echo ""

# Test 6: Create test webhook event
echo "📨 Creating test webhook event..."
curl -s -X POST "$BASE_URL/api/webhooks/test" \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "yoomoney",
    "eventType": "payment.succeeded"
  }' | jq '.' || echo "Response not in JSON format"
echo ""

# Test 7: Get webhook events
echo "📋 Getting webhook events..."
curl -s -X GET "$BASE_URL/api/webhooks/events" | jq '.' || echo "Response not in JSON format"
echo ""

# Test 8: Test refund (will fail due to missing payment)
echo "💸 Testing refund..."
curl -s -X POST "$BASE_URL/api/payments/refund" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "test_payment_id",
    "amount": 100,
    "paymentGateway": "yoomoney"
  }' | jq '.' || echo "Response not in JSON format"
echo ""

echo "🎉 Tests completed!"
echo ""
echo "📝 Notes:"
echo "- Payment creation will fail without proper API keys"
echo "- Use .env.example to configure your payment gateway credentials"
echo "- Check README.md for sandbox testing card numbers"
echo "- Webhook events are stored in memory (restart clears them)"
echo ""
echo "🚀 To start developing:"
echo "1. Copy .env.example to .env"
echo "2. Add your payment gateway credentials"
echo "3. Run: npm start"
echo "4. Visit: http://localhost:3000"