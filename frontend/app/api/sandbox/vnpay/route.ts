import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idempotencyKey } = body;

    if (!idempotencyKey) {
      return NextResponse.json({ message: 'Missing idempotencyKey' }, { status: 400 });
    }

    // Mock secret key from PaymentsController.cs
    const secret = "vnpay_secret_key_123";
    
    // Compute HMAC SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(idempotencyKey);
    const signature = hmac.digest('hex');

    // Call the backend webhook endpoint
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5053';
    
    const response = await fetch(`${backendUrl}/api/payments/webhook/vnpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VNPAY-Signature': signature,
      },
      body: JSON.stringify({ idempotencyKey }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend webhook error:', errorText);
      return NextResponse.json({ message: 'Backend returned error' }, { status: response.status });
    }

    return NextResponse.json({ message: 'Webhook sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Sandbox webhook error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
