create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  mushroom_type text not null,
  description text,
  nutrition_json jsonb default '{}'::jsonb,
  use_cases text[] default '{}',
  freshness_hours int,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text unique not null,
  weight_grams int not null,
  pack_type text,
  mrp numeric(10,2) not null,
  sell_price numeric(10,2) not null,
  cost_price numeric(10,2),
  is_subscription_eligible boolean not null default true,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table inventory_batches (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  batch_code text unique not null,
  quantity_available int not null,
  harvested_at timestamptz,
  packed_at timestamptz,
  best_before_at timestamptz,
  status text not null default 'available' check (status in ('available','reserved','expired','sold_out'))
);
