create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  email text unique,
  role text not null default 'customer' check (role in ('customer','admin','ops')),
  created_at timestamptz not null default now()
);

create table customer_preferences (
  customer_id uuid primary key references profiles(id) on delete cascade,
  diet_tags text[] default '{}',
  preferred_mushroom_types text[] default '{}',
  spice_preference text,
  cooking_frequency text,
  household_size int,
  budget_band text,
  updated_at timestamptz not null default now()
);

create table customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  label text,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  zone_id uuid,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
