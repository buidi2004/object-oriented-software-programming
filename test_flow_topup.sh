#!/bin/bash
EMAIL="test_flow_833961@test.com"
RES=$(curl -s -X POST http://localhost:5053/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"StrongP@ss1\",\"ipAddress\":\"127.0.0.1\",\"userAgent\":\"curl\",\"deviceInfo\":\"curl\"}")
TOKEN=$(echo $RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "Before topup:"
curl -s -X GET http://localhost:5053/api/wallet/me -H "Authorization: Bearer $TOKEN"

echo -e "\nTopping up:"
curl -s -w "\nHTTP CODE: %{http_code}\n" -X POST http://localhost:5053/api/wallet/top-up -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"amount": 500000, "paymentMethod": "BankTransfer", "notes": "Test topup"}'

echo "After topup:"
curl -s -X GET http://localhost:5053/api/wallet/me -H "Authorization: Bearer $TOKEN"

