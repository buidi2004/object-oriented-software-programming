#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:5053/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cloudservicestore.com", "password":"Admin@123", "ipAddress":"127.0.0.1", "userAgent":"curl", "deviceInfo":"test"}' | grep -oP '"accessToken":"\K[^"]+')
if [ -z "$TOKEN" ]; then
    echo "Failed to get token"
    exit 1
fi
echo "Got Admin token."

echo "Testing /api/security/addons/admin"
curl -s -w "\nHTTP Status: %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:5053/api/security/addons/admin

echo "----------------------------------------"
echo "Testing /api/app-installer/admin"
curl -s -w "\nHTTP Status: %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:5053/api/app-installer/admin

echo "----------------------------------------"
echo "Testing /api/marketplace/purchases/admin"
curl -s -w "\nHTTP Status: %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:5053/api/marketplace/purchases/admin
