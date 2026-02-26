-- ============================================================
-- Query: DEV-QA-ctx_id_audit
-- Purpose: Validate ctx_id population across recent events
-- Owner: Terra Data
-- Last Updated: 2026-02-25
-- ============================================================

SELECT
  COUNT(*) AS row_count,
  COUNTIF(JSON_VALUE(raw, '$.ctx_id') IS NULL) AS missing_ctx,
  SAFE_DIVIDE(
    COUNTIF(JSON_VALUE(raw, '$.ctx_id') IS NULL),
    COUNT(*)
  ) AS pct_missing_ctx
FROM `terra-analytics-dev.raw.events_raw`
WHERE received_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY);