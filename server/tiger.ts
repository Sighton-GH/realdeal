import pg from "pg";
import type { PricePoint, PriceStore } from "../shared/types";
import { unitPriceOf } from "../shared/verdict";

const { Pool } = pg;

export const tigerEnabled = (): boolean => Boolean(process.env.DATABASE_URL);

let pool: pg.Pool | null = null;
const loggedErrorTypes = new Set<string>();

function logErrorOnce(type: string, message: string, err?: unknown): void {
  if (!loggedErrorTypes.has(type)) {
    loggedErrorTypes.add(type);
    console.warn(message, err ?? "");
  }
}

function getPool(): pg.Pool | null {
  if (!tigerEnabled()) return null;
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL!;
  const needsSsl =
    connectionString.includes("sslmode=require") ||
    (!connectionString.includes("localhost") && !connectionString.includes("127.0.0.1"));

  pool = new Pool({
    connectionString,
    max: 5,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });

  pool.on("error", (err) => {
    logErrorOnce("pool_error", `[Tiger] Unexpected pool error: ${err.message}`);
  });

  return pool;
}

let schemaInitialized = false;
let schemaInitPromise: Promise<boolean> | null = null;

async function ensureSchema(p: pg.Pool): Promise<boolean> {
  if (schemaInitialized) return true;
  if (schemaInitPromise) return schemaInitPromise;

  schemaInitPromise = (async () => {
    try {
      // 1. Base table
      await p.query(`
        CREATE TABLE IF NOT EXISTS price_points (
          item_id text NOT NULL,
          retailer_id text NOT NULL,
          store_id text,
          week date NOT NULL,
          price numeric NOT NULL,
          regular_price numeric NOT NULL,
          on_sale boolean NOT NULL,
          was_price numeric,
          multi_qty int,
          multi_total numeric,
          size_qty numeric NOT NULL,
          unit_price numeric NOT NULL,
          source text NOT NULL
        );
      `);

      // 2. Hypertable (TimescaleDB extension)
      try {
        await p.query(`SELECT create_hypertable('price_points', 'week', if_not_exists => TRUE);`);
      } catch (err) {
        logErrorOnce("hypertable", `[Tiger] Hypertable setup note: ${(err as Error).message}`);
      }

      // 3. Unique index for idempotent upserting
      await p.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_price_points_unique
        ON price_points (item_id, retailer_id, (coalesce(store_id, 'chain')), week);
      `);

      // 4. Continuous aggregate view
      try {
        await p.query(`
          CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_unit_price
          WITH (timescaledb.continuous) AS
          SELECT
            time_bucket('7 days', week) AS bucket,
            item_id,
            retailer_id,
            avg(unit_price) AS avg_unit_price,
            min(unit_price) AS min_unit_price,
            max(unit_price) AS max_unit_price
          FROM price_points
          WHERE store_id IS NULL
          GROUP BY bucket, item_id, retailer_id
          WITH NO DATA;
        `);

        // Refresh policy if supported
        try {
          await p.query(`
            SELECT add_continuous_aggregate_policy('weekly_unit_price',
              start_offset => INTERVAL '180 days',
              end_offset => INTERVAL '1 day',
              schedule_interval => INTERVAL '1 hour',
              if_not_exists => TRUE
            );
          `);
        } catch {
          // Ignore policy errors if not supported or existing
        }
      } catch (err) {
        logErrorOnce("cagg", `[Tiger] Continuous aggregate setup note: ${(err as Error).message}`);
      }

      schemaInitialized = true;
      return true;
    } catch (err) {
      logErrorOnce("schema_init", `[Tiger] Schema initialization failed: ${(err as Error).message}`);
      return false;
    } finally {
      schemaInitPromise = null;
    }
  })();

  return schemaInitPromise;
}

let isSyncing = false;
let pendingStoreToSync: PriceStore | null = null;

async function doSync(store: PriceStore): Promise<void> {
  const p = getPool();
  if (!p) return;

  const schemaOk = await ensureSchema(p);
  if (!schemaOk) return;

  const start = Date.now();
  const BATCH_SIZE = 500;
  const points = store.points;
  let totalUpserted = 0;

  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    const batch = points.slice(i, i + BATCH_SIZE);
    const values: unknown[] = [];
    const rowPlaceholders: string[] = [];

    batch.forEach((pt: PricePoint, idx: number) => {
      const offset = idx * 13;
      const unitPrice = unitPriceOf(pt.price, pt.sizeQty, pt.multiBuy);
      values.push(
        pt.itemId,
        pt.retailerId,
        pt.storeId ?? null,
        pt.date,
        pt.price,
        pt.regularPrice,
        pt.onSale,
        pt.wasPrice ?? null,
        pt.multiBuy?.qty ?? null,
        pt.multiBuy?.total ?? null,
        pt.sizeQty,
        unitPrice,
        pt.source,
      );
      rowPlaceholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13})`,
      );
    });

    const query = `
      INSERT INTO price_points (
        item_id, retailer_id, store_id, week, price, regular_price,
        on_sale, was_price, multi_qty, multi_total, size_qty, unit_price, source
      )
      VALUES ${rowPlaceholders.join(", ")}
      ON CONFLICT (item_id, retailer_id, (coalesce(store_id, 'chain')), week)
      DO UPDATE SET
        price = EXCLUDED.price,
        regular_price = EXCLUDED.regular_price,
        on_sale = EXCLUDED.on_sale,
        was_price = EXCLUDED.was_price,
        multi_qty = EXCLUDED.multi_qty,
        multi_total = EXCLUDED.multi_total,
        size_qty = EXCLUDED.size_qty,
        unit_price = EXCLUDED.unit_price,
        source = EXCLUDED.source;
    `;

    await p.query(query, values);
    totalUpserted += batch.length;
  }

  // Refresh continuous aggregate if available
  try {
    await p.query("CALL refresh_continuous_aggregate('weekly_unit_price', NULL, NULL);");
  } catch {
    // TimescaleDB continuous aggregate refresh may not be supported on plain postgres
  }

  console.log(`[Tiger] Synced ${totalUpserted} points in ${Date.now() - start}ms`);
}

/**
 * Creates schema if needed and upserts all points. Resolves (never throws) even on DB errors.
 * Serializes sync requests so at most one active and one pending sync run.
 */
export async function syncToTiger(store: PriceStore): Promise<void> {
  if (!tigerEnabled()) return;

  if (isSyncing) {
    pendingStoreToSync = store;
    return;
  }

  isSyncing = true;
  try {
    await doSync(store);

    while (pendingStoreToSync) {
      const nextStore = pendingStoreToSync;
      pendingStoreToSync = null;
      await doSync(nextStore);
    }
  } catch (err) {
    logErrorOnce("sync_error", `[Tiger] Sync failure: ${(err as Error).message}`);
  } finally {
    isSyncing = false;
  }
}

/**
 * 90-day unit-price stats from Tiger Data (matches engine's latest 13 weekly chain points per retailer).
 * Returns null if DATABASE_URL is unset or on any query problem.
 */
export async function getTigerStats(
  itemId: string,
): Promise<{ avgUnit90: number; lowUnit90: number; highUnit90: number } | null> {
  if (!tigerEnabled()) return null;

  const p = getPool();
  if (!p) return null;

  try {
    const res = await p.query(
      `
      WITH ranked AS (
        SELECT
          item_id,
          retailer_id,
          unit_price,
          ROW_NUMBER() OVER (PARTITION BY retailer_id ORDER BY week DESC) AS rn
        FROM price_points
        WHERE item_id = $1 AND store_id IS NULL
      )
      SELECT
        AVG(unit_price)::float AS avg_unit_90,
        MIN(unit_price)::float AS low_unit_90,
        MAX(unit_price)::float AS high_unit_90,
        COUNT(*)::int AS count
      FROM ranked
      WHERE rn <= 13;
      `,
      [itemId],
    );

    if (res.rows.length === 0 || !res.rows[0].count || res.rows[0].avg_unit_90 == null) {
      return null;
    }

    const row = res.rows[0];
    return {
      avgUnit90: Number(row.avg_unit_90),
      lowUnit90: Number(row.low_unit_90),
      highUnit90: Number(row.high_unit_90),
    };
  } catch (err) {
    logErrorOnce("stats_query", `[Tiger] Query stats failed for item "${itemId}": ${(err as Error).message}`);
    return null;
  }
}