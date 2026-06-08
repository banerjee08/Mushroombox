import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Razorpay secret missing on server' }, { status: 500 });
    }

    let generated_signature;
    if (razorpay_order_id) {
      // Order signature verification
      generated_signature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
    } else if (razorpay_subscription_id) {
      // Subscription signature verification
      generated_signature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest('hex');
    } else {
      return NextResponse.json({ error: 'Either razorpay_order_id or razorpay_subscription_id must be provided' }, { status: 400 });
    }

    if (generated_signature === razorpay_signature) {
      return NextResponse.json({ status: 'success', message: 'Payment verified successfully' });
    } else {
      return NextResponse.json({ status: 'failure', message: 'Invalid signature' }, { status: 400 });
    }
  } catch (error) {
    console.error('Razorpay Signature Verification Error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
