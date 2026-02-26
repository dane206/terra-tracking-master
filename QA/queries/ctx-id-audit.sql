-- =========================================================
-- QUERY: LEGACY-ctx_id_audit
-- STATUS: TODO (Stage 2)
-- PURPOSE: Audit ctx_id continuity across session and user flows
-- OWNER: Terra Tracking
-- NOTES:
--   - Not part of ingestion guardrails
--   - To be implemented after marts/staging stabilize
-- =========================================================

-- TODO:
-- Validate ctx_id persistence across:
--   • web pixel → checkout pixel
--   • multi-page sessions
--   • returning visitors

SELECT 'NOT_IMPLEMENTED' AS status;