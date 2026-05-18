-- analytics/marts/recommendations.sql
-- Marts logic run on KVM2 Warehouse to generate insights for our trusted backend

CREATE MATERIALIZED VIEW analytical_warehouse.agg_product_daily AS
SELECT 
  foi.variant_id, 
  DATE(fo.created_at) as sale_date,
  COUNT(fo.order_id) as total_orders,
  SUM(foi.quantity) as total_quantity_sold
FROM analytical_warehouse.fact_order_items foi
JOIN analytical_warehouse.fact_orders fo ON fo.order_id = foi.order_id
GROUP BY 1, 2;

-- Simple rules-based pairings based on order frequency
CREATE MATERIALIZED VIEW analytical_warehouse.product_pairings AS
SELECT 
    i1.variant_id AS source_variant,
    i2.variant_id AS paired_variant,
    COUNT(DISTINCT i1.order_id) as co_purchases
FROM analytical_warehouse.fact_order_items i1
JOIN analytical_warehouse.fact_order_items i2 
  ON i1.order_id = i2.order_id AND i1.variant_id != i2.variant_id
GROUP BY 1, 2
ORDER BY co_purchases DESC;
