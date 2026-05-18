/**
 * analytics/jobs/sync.js
 * 
 * Flow: 
 *   - Extract newly inserted `event_log` and `orders` data from Supabase
 *   - Load them into the self-hosted KVM2 Postgres (analytical_warehouse)
 *   - Update materialized views
 */

import { Client } from 'npm:pg';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const syncEventsToWarehouse = async () => {
    console.log("Extracting from Supabase...");
    
    // In production, sync state (last_synced_id) should be maintained locally.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_DB_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: newEvents, error } = await supabaseClient
      .from('event_log')
      .select('*')
      .order('id', { ascending: true })
      .limit(1000);

    if(error || !newEvents?.length) return console.log("No new events.");

    console.log("Loading to KVM2 Postgres Warehouse...");
    const warehouseClient = new Client({ connectionString: Deno.env.get('POSTGRES_ANALYTICS_URL') });
    await warehouseClient.connect();

    // Standard ETL Batch insert
    for (const event of newEvents) {
        await warehouseClient.query(`
            INSERT INTO analytical_warehouse.fact_events (id, customer_id, session_id, event_type, entity_type, entity_id, metadata, occurred_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
            [event.id, event.customer_id, event.session_id, event.event_type, event.entity_type, event.entity_id, event.metadata, event.occurred_at]
        );
    }
    
    // Refresh materialized views after ETL
    await warehouseClient.query(`REFRESH MATERIALIZED VIEW analytical_warehouse.product_pairings`);
    
    await warehouseClient.end();
    console.log("Sync Complete!");
};

syncEventsToWarehouse();
