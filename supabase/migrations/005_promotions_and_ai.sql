create table promotions (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  title text not null,
  promo_type text not null check (promo_type in ('percent','flat','free_delivery','bundle')),
  value numeric(10,2),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true
);

create table promotion_rules (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references promotions(id) on delete cascade,
  min_cart_value numeric(10,2),
  eligible_product_ids uuid[],
  eligible_segment_ids uuid[],
  rule_json jsonb not null default '{}'::jsonb
);

create table promotion_redemptions (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references promotions(id),
  customer_id uuid references profiles(id),
  order_id uuid references orders(id),
  discount_amount numeric(10,2) not null,
  redeemed_at timestamptz not null default now()
);

create table event_log (
  id bigserial primary key,
  customer_id uuid,
  session_id text,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table product_embeddings (
  product_id uuid primary key references products(id) on delete cascade,
  embedding vector(1536),
  model_name text not null,
  updated_at timestamptz not null default now()
);

create table customer_embeddings (
  customer_id uuid primary key references profiles(id) on delete cascade,
  embedding vector(1536),
  model_name text not null,
  updated_at timestamptz not null default now()
);

create table recommendation_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  context text not null,
  recommended_products uuid[] not null,
  model_version text,
  clicked_product_id uuid,
  converted_order_id uuid,
  created_at timestamptz not null default now()
);
