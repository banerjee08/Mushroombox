-- Migration: 009_subscription_actions
-- Add RPC to handle pausing and resuming subscriptions securely

CREATE OR REPLACE FUNCTION toggle_subscription(p_subscription_id uuid, p_action text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub record;
BEGIN
  -- Fetch the subscription ensuring the user owns it
  SELECT * INTO v_sub
  FROM subscriptions
  WHERE id = p_subscription_id AND customer_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found or unauthorized';
  END IF;

  IF p_action = 'pause' THEN
    IF v_sub.status != 'active' THEN
      RAISE EXCEPTION 'Only active subscriptions can be paused';
    END IF;

    -- Enforce 2-day rule
    IF v_sub.next_delivery_at IS NOT NULL THEN
      IF v_sub.next_delivery_at < now() + interval '2 days' THEN
        RAISE EXCEPTION 'Cannot pause a subscription within 2 days of the next delivery. Please contact support.';
      END IF;
    END IF;

    UPDATE subscriptions SET status = 'paused' WHERE id = p_subscription_id;
    RETURN 'Subscription paused successfully';

  ELSIF p_action = 'resume' THEN
    IF v_sub.status != 'paused' THEN
      RAISE EXCEPTION 'Only paused subscriptions can be resumed';
    END IF;

    UPDATE subscriptions SET status = 'active' WHERE id = p_subscription_id;
    RETURN 'Subscription resumed successfully';

  ELSE
    RAISE EXCEPTION 'Invalid action. Must be pause or resume.';
  END IF;
END;
$$;
