#!/bin/bash

echo "Registering test customer..."
curl -s -X POST http://localhost:5053/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Customer", "email":"test_customer@cloudservicestore.com", "password":"Password123!"}' > /dev/null

echo "Authenticating as Customer..."
TOKEN=$(curl -s -X POST http://localhost:5053/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test_customer@cloudservicestore.com", "password":"Password123!", "ipAddress":"127.0.0.1", "userAgent":"curl", "deviceInfo":"test"}' \
  | grep -oP '"accessToken":"\K[^"]+')

if [ -z "$TOKEN" ]; then
    echo "Failed to get customer token."
    exit 1
fi

echo "Got Customer Token, starting deep tests..."

ENDPOINTS=(
  "/api/dashboard/me"
  "/api/orders/me"
  "/api/orders/me/invoices"
  "/api/refund-requests/me"
  "/api/security/addons/me"
  "/api/security/login-history"
  "/api/security/sessions"
  "/api/app-installer/me"
  "/api/marketplace/listings"
  "/api/api-keys/me"
  "/api/tickets/me"
  "/api/affiliate-applications/me"
  "/api/VpsInstances"
  "/api/domains/me"
  "/api/notification-settings/me"
  "/api/migration-requests/me"
  "/api/users/me"
)

FAILS=0

for EP in "${ENDPOINTS[@]}"; do
    URL="http://localhost:5053$EP"
    # Capture HTTP status code
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$URL")
    
    if [ "$HTTP_CODE" -ge 400 ]; then
        echo "❌ FAILED: $EP returned $HTTP_CODE"
        FAILS=$((FAILS+1))
        curl -s -H "Authorization: Bearer $TOKEN" "$URL" | echo "   Body: $(cat)"
    else
        echo "✅ OK ($HTTP_CODE): $EP"
    fi
done

if [ "$FAILS" -gt 0 ]; then
    echo "⚠️ $FAILS customer endpoints returned errors."
else
    echo "🎉 ALL customer endpoints returned 2xx/3xx!"
fi
