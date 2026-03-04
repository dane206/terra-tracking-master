-- =========================================================
-- QUERY: PROD-QA-identity_guardrail
-- PURPOSE: Ensure every recent event has required identity fields
-- PROJECT: terra-analytics-prod
-- DATASET: raw
-- TABLE: events_raw
-- =========================================================

SELECT
  COUNTIF(JSON_VALUE(raw, '$.ctx_id') IS NULL) AS missing_ctx,
  COUNTIF(JSON_VALUE(raw, '$.th_vid') IS NULL) AS missing_th_vid,
  COUNT(*) AS row_count
FROM `terra-analytics-prod.raw.events_raw`
WHERE received_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE);
