-- =========================================================
-- QUERY: DEV-QA-event_volume_15m
-- PURPOSE: Quick smoke test that events are flowing
-- PROJECT: terra-analytics-dev
-- DATASET: raw
-- TABLE: events_raw
-- =========================================================

SELECT
  data_source,
  COUNT(*) AS row_count
FROM `terra-analytics-dev.raw.events_raw`
WHERE received_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)
GROUP BY data_source
ORDER BY row_count DESC;