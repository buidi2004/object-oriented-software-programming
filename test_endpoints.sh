#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:5053/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cloudservice.com", "password":"Password123!"}' | grep -oP '"token":"\K[^"]+')
if [ -z "$TOKEN" ]; then
    echo "Failed to get token"
    exit 1
fi
echo "Got token."

echo "Testing /api/orders/me/invoices"
curl -s -w "\nHTTP Status: %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:5053/api/orders/me/invoices

echo "Testing /api/refund-requests/me"
curl -s -w "\nHTTP Status: %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:5053/api/refund-requests/me

echo "Testing /api/security/sessions"
curl -s -w "\nHTTP Status: %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:5053/api/security/sessions
