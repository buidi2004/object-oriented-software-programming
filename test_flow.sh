#!/bin/bash
set -e
EMAIL="test_flow_$$@test.com"
echo "Registering user $EMAIL..."
RES=$(curl -s -X POST http://localhost:5053/api/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"StrongP@ss1\"}")
echo $RES
USER_ID=$(echo $RES | grep -o '"userId":"[^"]*' | cut -d'"' -f4)

echo "Logging in..."
RES=$(curl -s -X POST http://localhost:5053/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"StrongP@ss1\",\"ipAddress\":\"127.0.0.1\",\"userAgent\":\"curl\",\"deviceInfo\":\"curl\"}")
TOKEN=$(echo $RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "Checking wallet..."
curl -s -X GET http://localhost:5053/api/wallet/me -H "Authorization: Bearer $TOKEN" | json_pp

echo "Topping up 500,000..."
curl -s -X POST http://localhost:5053/api/wallet/topup -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"amount": 500000, "paymentMethod": "BankTransfer", "notes": "Test topup"}' | json_pp

echo "Checking wallet after topup..."
curl -s -X GET http://localhost:5053/api/wallet/me -H "Authorization: Bearer $TOKEN" | json_pp

