#!/bin/bash

# Authenticate as Admin
TOKEN=$(curl -s -X POST http://localhost:5053/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cloudservicestore.com", "password":"Admin@123", "ipAddress":"127.0.0.1", "userAgent":"curl", "deviceInfo":"test"}' \
  | grep -oP '"accessToken":"\K[^"]+')

if [ -z "$TOKEN" ]; then
    echo "Failed to get admin token."
    exit 1
fi

echo "Got Admin Token, starting deep tests..."

ENDPOINTS=(
  "/api/users"
  "/api/roles"
  "/api/permissions"
  "/api/audit-logs"
  "/api/dashboard/revenue-stats?startDate=2026-01-01&endDate=2026-12-31"
  "/api/dashboard/order-trend?startDate=2026-01-01&endDate=2026-12-31"
  "/api/VpsInstances/admin"
  "/api/service-plans/admin"
  "/api/orders"
  "/api/orders/invoices/admin"
  "/api/security/addons/admin"
  "/api/app-installer/admin"
  "/api/marketplace/purchases/admin"
  "/api/api-keys/admin"
  "/api/tickets/queue"
  "/api/support-tickets"
  "/api/refund-requests"
  "/api/migration-requests"
  "/api/affiliate-applications"
  "/api/reviews"
  "/api/news"
  "/api/promotions"
  "/api/coupons"
  "/api/gift-cards"
  "/api/newsletter"
  "/api/system-settings"
  "/api/organizations"
  "/api/live-chats/admin/active"
)

FAILS=0

for EP in "${ENDPOINTS[@]}"; do
    URL="http://localhost:5053$EP"
    # Capture HTTP status code
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$URL")
    
    if [ "$HTTP_CODE" -ge 400 ]; then
        echo "❌ FAILED: $EP returned $HTTP_CODE"
        FAILS=$((FAILS+1))
        # Print the actual body for debugging
        curl -s -H "Authorization: Bearer $TOKEN" "$URL" | echo "   Body: $(cat)"
    else
        echo "✅ OK ($HTTP_CODE): $EP"
    fi
done

if [ "$FAILS" -gt 0 ]; then
    echo "⚠️ $FAILS endpoints returned errors."
else
    echo "🎉 ALL admin endpoints returned 2xx/3xx!"
fi
