-- =====================================================================
-- Query: DEV-QA-event_parity_by_source
-- Purpose:
--   Ensure both Shopify pipelines are emitting events into the raw ledger.
--   Detects silent pixel failures or routing breaks.
--
-- Expected:
--   - shopify_web_pixel present
--   - shopify_checkout_pixel present
--   - counts non-zero during active traffic
--
-- Dataset:
--   terra-analytics-dev.raw.events_raw
-- =====================================================================

SELECT
  data_source,
  COUNT(*) AS row_count
FROM `terra-analytics-dev.raw.events_raw`
WHERE received_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)
GROUP BY data_source
ORDER BY row_count DESC;