import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Razorpay from "npm:razorpay@2.9.2";
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { amount, currency = 'INR', receipt } = await req.json();

    const instance = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID') || '',
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') || '',
    });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency,
      receipt
    };

    const order = await instance.orders.create(options);

    // Save initial payment intent to DB
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Note: Assuming `receipt` is our order_id
    await supabaseClient.from('payments').insert({
      order_id: receipt,
      gateway_order_id: order.id,
      amount: amount,
      currency: currency,
      status: 'created'
    });

    return new Response(JSON.stringify(order), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
