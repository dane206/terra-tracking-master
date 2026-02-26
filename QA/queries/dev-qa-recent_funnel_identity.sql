-- =========================================================
-- QUERY: DEV-QA-recent_funnel_identity
-- PURPOSE: Ensure recent events carry consistent identity
-- PROJECT: terra-analytics-dev
-- DATASET: raw
-- TABLE: events_raw
-- =========================================================

SELECT
  event_name,
  JSON_VALUE(raw, '$.ctx_id') AS ctx_id,
  JSON_VALUE(raw, '$.th_vid') AS th_vid,
  JSON_VALUE(raw, '$.terra_ft_source') AS ft_source,
  data_source,
  received_at
FROM `terra-analytics-dev.raw.events_raw`
WHERE received_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)
ORDER BY received_at DESC
LIMIT 50;