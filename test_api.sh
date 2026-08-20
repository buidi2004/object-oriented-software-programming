#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:5053/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cloudservicestore.com", "password":"Password123!", "ipAddress":"127.0.0.1", "userAgent":"curl", "deviceInfo":"linux"}' | grep -oP '"token":"\K[^"]+')
if [ -z "$TOKEN" ]; then
    echo "Login failed"
    exit 1
fi
echo "Orders:"
curl -s -w "\nStatus: %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:5053/api/orders/me?status=Active
