-- =====================================================================
-- Query: DEV-QA-recent_funnel_identity
-- Purpose:
--   Verify checkout funnel events carry identity (ctx_id + th_vid).
--   This protects Terra’s core attribution chain.
--
-- Expected:
--   - missing_identity = 0 during healthy runs
--   - total > 0 when checkout activity exists
--
-- Dataset:
--   terra-analytics-dev.raw.events_raw
-- =====================================================================

WITH recent AS (
  SELECT
    event_name,
    JSON_VALUE(raw, '$.ctx_id') AS ctx_id,
    JSON_VALUE(raw, '$.th_vid') AS th_vid
  FROM `terra-analytics-dev.raw.events_raw`
  WHERE received_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)
    AND data_source = 'shopify_checkout_pixel'
)

SELECT
  COUNT(*) AS total_events,
  COUNTIF(ctx_id IS NULL OR th_vid IS NULL) AS missing_identity
FROM recent;