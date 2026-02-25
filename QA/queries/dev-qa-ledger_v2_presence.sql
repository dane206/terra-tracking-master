-- =====================================================================
-- Query: DEV-QA-ledger_v2_presence
-- Purpose: Verify that the Terra envelope v2 is present in raw events.
-- Owner: Terra Analytics
-- Grain: Event-level check
-- Expected: All new events should return v = '2'
-- =====================================================================

SELECT
  COUNT(*) AS row_count,
  COUNTIF(JSON_VALUE(raw, '$._terra_envelope_version') = '2') AS v2_rows,
  COUNTIF(JSON_VALUE(raw, '$._terra_envelope_version') IS NULL) AS missing_v2_rows
FROM `terra-analytics-dev.raw.events_raw`
WHERE received_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 60 MINUTE);