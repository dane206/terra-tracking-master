-- =========================================================
-- QUERY: DEV-QA-source_distribution
-- PURPOSE: Verify both pixel sources are emitting events
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