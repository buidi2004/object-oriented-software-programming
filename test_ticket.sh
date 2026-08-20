#!/bin/bash
echo "Logging in as admin..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5053/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cloudservice.com", "password":"Password123!"}' | grep -oP '"token":"\K[^"]+')
if [ -z "$ADMIN_TOKEN" ]; then
    echo "Failed to login as admin"
    exit 1
fi
echo "Admin token acquired."

echo "Fetching a ticket ID from queue..."
TICKET_ID=$(curl -s -X GET http://localhost:5053/api/tickets/queue -H "Authorization: Bearer $ADMIN_TOKEN" | grep -oP '"id":"\K[^"]+' | head -n 1)

if [ -z "$TICKET_ID" ]; then
    echo "No ticket found in queue. Creating one as user..."
    USER_TOKEN=$(curl -s -X POST http://localhost:5053/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@cloudservice.com", "password":"Password123!"}' | grep -oP '"token":"\K[^"]+')
    curl -s -X POST http://localhost:5053/api/tickets -H "Authorization: Bearer $USER_TOKEN" -H "Content-Type: application/json" -d '{"subject":"Test ticket","category":"Technical","priority":1,"message":"This is a test ticket"}' > /dev/null
    TICKET_ID=$(curl -s -X GET http://localhost:5053/api/tickets/queue -H "Authorization: Bearer $ADMIN_TOKEN" | grep -oP '"id":"\K[^"]+' | head -n 1)
fi

echo "Ticket ID: $TICKET_ID"

echo "Admin replying to ticket..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:5053/api/tickets/$TICKET_ID/messages -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"message":"This is an automated reply from admin testing the email system."}'
