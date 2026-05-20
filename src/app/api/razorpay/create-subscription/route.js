import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req) {
  try {
    const { planId, totalCount, customerDetails } = await req.json();

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay keys missing on server' }, { status: 500 });
    }

    // Create Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: totalCount || 12, // Default to 12 months for monthly, or 1 for annual? Usually total_count is how many times to charge.
      quantity: 1,
      customer_notify: 1,
      // You can also pass addons, notes, etc.
    });

    return NextResponse.json({
      subscription_id: subscription.id,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
