create table carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active','converted','abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  quantity int not null check (quantity > 0),
  added_at timestamptz not null default now()
);

create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  zone_name text not null,
  city text not null,
  pincodes text[] not null,
  min_order_value numeric(10,2),
  delivery_fee numeric(10,2) not null default 0,
  active boolean not null default true
);

create table delivery_slots (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references delivery_zones(id),
  slot_date date not null,
  slot_label text not null,
  cutoff_at timestamptz not null,
  capacity int not null,
  booked_count int not null default 0,
  active boolean not null default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references profiles(id),
  address_id uuid references customer_addresses(id),
  cart_id uuid references carts(id),
  status text not null default 'pending' check (status in ('pending','confirmed','packed','out_for_delivery','delivered','cancelled','refunded')),
  subtotal numeric(10,2) not null,
  discount_total numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending','authorized','captured','failed','refunded')),
  delivery_slot_id uuid references delivery_slots(id),
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  line_discount numeric(10,2) not null default 0
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  gateway text not null default 'razorpay',
  gateway_order_id text,
  gateway_payment_id text,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text,
  event_type text not null,
  signature_valid boolean not null default false,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  billing_interval text not null check (billing_interval in ('weekly','biweekly','monthly')),
  discount_percent numeric(5,2) not null default 0,
  active boolean not null default true
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  plan_id uuid not null references subscription_plans(id),
  status text not null default 'active' check (status in ('active','paused','cancelled')),
  next_delivery_at timestamptz,
  created_at timestamptz not null default now()
);
