alter table profiles enable row level security;
alter table customer_addresses enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table subscriptions enable row level security;

create policy "profile_select_self"
on profiles for select to authenticated
using (auth.uid() = id);

create policy "profile_update_self"
on profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "address_manage_self"
on customer_addresses for all to authenticated
using (auth.uid() = customer_id)
with check (auth.uid() = customer_id);

create policy "orders_select_self"
on orders for select to authenticated
using (auth.uid() = customer_id);

create policy "subscriptions_select_self"
on subscriptions for select to authenticated
using (auth.uid() = customer_id);

create policy "public_products_read"
on products for select to anon, authenticated
using (status = 'active');

create policy "public_variants_read"
on product_variants for select to anon, authenticated
using (status = 'active');

-- Admin check function
create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role in ('admin','ops')
  );
$$;

create policy "admin_manage_products"
on products for all to authenticated
using (is_admin())
with check (is_admin());
