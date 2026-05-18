ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS tier_name text,
ADD COLUMN IF NOT EXISTS audience text,
ADD COLUMN IF NOT EXISTS qty text,
ADD COLUMN IF NOT EXISTS weekly_price numeric;

-- Drop old check constraint on status (Supabase constraints must be dropped by name. If it's subscriptions_status_check, we alter it)
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check check (status in ('active','paused','cancelled','expired'));

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS frequency text,
ADD COLUMN IF NOT EXISTS custom_days jsonb,
ADD COLUMN IF NOT EXISTS cancellation_window_end timestamptz;
