#!/bin/bash
EMAIL="test_flow_833961@test.com"
RES=$(curl -s -X POST http://localhost:5053/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"StrongP@ss1\",\"ipAddress\":\"127.0.0.1\",\"userAgent\":\"curl\",\"deviceInfo\":\"curl\"}")
TOKEN=$(echo $RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

PLAN_ID=$(docker exec cloudservicestore_sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Your_Strong_Password_123!' -d CloudServiceStoreDb -C -h -1 -W -Q "SET NOCOUNT ON; SELECT TOP 1 Id FROM ServicePlans")
PLAN_ID=$(echo $PLAN_ID | tr -d '\r')

echo "Adding plan $PLAN_ID to cart..."
curl -s -w "\nHTTP CODE: %{http_code}\n" -X POST http://localhost:5053/api/carts/items -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"servicePlanId\": \"$PLAN_ID\", \"billingCycle\": 1, \"quantity\": 1}"

echo "Checking out..."
CHECKOUT_RES=$(curl -s -X POST http://localhost:5053/api/orders/checkout -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{}")
echo $CHECKOUT_RES
ORDER_ID=$(echo $CHECKOUT_RES | grep -o '"orderId":"[^"]*' | cut -d'"' -f4)

echo "Created Order: $ORDER_ID"

echo "Paying with wallet..."
curl -s -w "\nHTTP CODE: %{http_code}\n" -X POST http://localhost:5053/api/wallet/pay -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"orderId\": \"$ORDER_ID\"}"

echo "Checking wallet after payment:"
curl -s -X GET http://localhost:5053/api/wallet/me -H "Authorization: Bearer $TOKEN"

