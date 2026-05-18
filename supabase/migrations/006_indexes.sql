create index idx_orders_customer_created on orders(customer_id, created_at desc);
create index idx_orders_status_created on orders(status, created_at desc);
create index idx_order_items_order on order_items(order_id);
create index idx_event_log_customer_time on event_log(customer_id, occurred_at desc);
create index idx_event_log_type_time on event_log(event_type, occurred_at desc);
create index idx_variants_product on product_variants(product_id);
create index idx_inventory_variant_status on inventory_batches(variant_id, status, best_before_at);
