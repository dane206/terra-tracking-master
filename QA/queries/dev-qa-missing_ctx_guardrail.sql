-- =========================================================
-- QUERY: DEV-QA-missing_ctx_guardrail
-- PURPOSE: Ensure every recent event has a ctx_id
-- PROJECT: terra-analytics-dev
-- DATASET: raw
-- TABLE: events_raw
-- =========================================================

SELECT
  COUNTIF(JSON_VALUE(raw, '$.ctx_id') IS NULL) AS missing_ctx,
  COUNT(*) AS row_count
FROM `terra-analytics-dev.raw.events_raw`
WHERE received_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE);