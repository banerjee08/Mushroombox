import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Razorpay from "npm:razorpay@2.9.2";
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const signature = req.headers.get('x-razorpay-signature');
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '';

    // Deno runtime: read body as text for verification
    const textBody = await req.text();
    
    // Verify signature
    const isValid = Razorpay.validateWebhookSignature(textBody, signature, secret);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const event = JSON.parse(textBody);

    // Store raw webhook log
    await supabaseClient.from('webhook_events').insert({
      provider: 'razorpay',
      event_id: event.event_id || event.id,
      event_type: event.event,
      signature_valid: isValid,
      payload: event
    });

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
    }

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const gatewayOrderId = paymentEntity.order_id;
      
      // Update payment record
      await supabaseClient.from('payments')
        .update({ 
          status: 'captured', 
          gateway_payment_id: paymentEntity.id 
        })
        .eq('gateway_order_id', gatewayOrderId);
        
      // Fetch payment to get order_id, then update order status to 'confirmed'
      // Trigger n8n workflow from here or via Supabase DB Webhook on 'payments' table out of band.
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
