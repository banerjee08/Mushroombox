-- analytics/ddl/warehouse.sql
-- These are intended to be executed on the KVM2 Self-Hosted Analytics Postgres

CREATE SCHEMA IF NOT EXISTS analytical_warehouse;

CREATE TABLE analytical_warehouse.fact_orders (
    order_id UUID PRIMARY KEY,
    customer_id UUID,
    order_number TEXT,
    subtotal NUMERIC,
    discount_total NUMERIC,
    delivery_fee NUMERIC,
    total NUMERIC,
    status TEXT,
    created_at TIMESTAMPTZ
);

CREATE TABLE analytical_warehouse.fact_order_items (
    id UUID PRIMARY KEY,
    order_id UUID,
    variant_id UUID,
    quantity INT,
    unit_price NUMERIC,
    line_discount NUMERIC
);

CREATE TABLE analytical_warehouse.fact_events (
    id BIGINT PRIMARY KEY,
    customer_id UUID,
    session_id TEXT,
    event_type TEXT,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    occurred_at TIMESTAMPTZ
);

CREATE TABLE analytical_warehouse.dim_customers (
    customer_id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    budget_band TEXT
);

CREATE TABLE analytical_warehouse.dim_products (
    product_id UUID PRIMARY KEY,
    slug TEXT,
    name TEXT,
    category TEXT,
    mushroom_type TEXT
);
