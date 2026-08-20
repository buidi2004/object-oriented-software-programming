#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:5053/api/auth/login -H "Content-Type: application/json" -d '{"email":"buidi7170@gmail.com", "password":"Password123!", "ipAddress":"127.0.0.1", "userAgent":"curl", "deviceInfo":"linux"}' | grep -oP '"token":"\K[^"]+')
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5053/api/orders/me
