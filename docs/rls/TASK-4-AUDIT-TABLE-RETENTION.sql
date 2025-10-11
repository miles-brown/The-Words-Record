-- ============================================================================
-- TASK 4: SET RETENTION POLICY FOR affiliation_backfill_audit TABLE
-- ============================================================================
-- This file contains:
-- 1. Check for available scheduling extensions (pg_cron, pgagent)
-- 2. Create retention cleanup function
-- 3. Schedule automatic cleanup job
-- 4. Manual cleanup queries
--
-- ⚠️ WARNING: Contains DELETE operations - review retention period first
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 4.1: Check for available scheduling extensions
-- -----------------------------------------------------------------------------

SELECT
  extname as extension_name,
  extversion as version,
  CASE extname
    WHEN 'pg_cron' THEN '✅ Can use pg_cron for scheduled jobs'
    WHEN 'pg_agent' THEN '✅ Can use pgAgent for scheduled jobs'
    WHEN 'pg_trgm' THEN 'ℹ️ Text search extension (not for scheduling)'
    ELSE 'ℹ️ Other extension'
  END as scheduling_capability
FROM pg_extension
WHERE extname IN ('pg_cron', 'pg_agent', 'pgagent')
ORDER BY extname;

-- Check if pg_cron schema exists
SELECT
  'pg_cron schema' as check_name,
  EXISTS (
    SELECT 1
    FROM information_schema.schemata
    WHERE schema_name = 'cron'
  ) as exists;

-- -----------------------------------------------------------------------------
-- 4.2: Current audit table statistics
-- -----------------------------------------------------------------------------

SELECT
  COUNT(*) as total_records,
  MIN(updated_at) as oldest_record,
  MAX(updated_at) as newest_record,
  EXTRACT(DAY FROM NOW() - MIN(updated_at)) as days_of_data,
  pg_size_pretty(pg_total_relation_size('affiliation_backfill_audit')) as table_size
FROM affiliation_backfill_audit;

-- Distribution of audit records by day
SELECT
  DATE(updated_at) as audit_date,
  COUNT(*) as records_per_day,
  array_agg(DISTINCT old_created_by) as old_values
FROM affiliation_backfill_audit
GROUP BY DATE(updated_at)
ORDER BY audit_date DESC;

-- -----------------------------------------------------------------------------
-- 4.3: Create retention cleanup function
-- -----------------------------------------------------------------------------
-- ⚠️ Review retention period before creating this function ⚠️
-- Default: Keep 90 days of audit data

CREATE OR REPLACE FUNCTION cleanup_affiliation_audit(retention_days INTEGER DEFAULT 90)
RETURNS TABLE(deleted_count BIGINT, oldest_kept TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER -- Run as function owner (admin)
AS $$
DECLARE
  v_deleted_count BIGINT;
  v_oldest_kept TIMESTAMPTZ;
  v_cutoff_date TIMESTAMPTZ;
BEGIN
  -- Calculate cutoff date
  v_cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

  -- Log before deletion (for audit trail)
  RAISE NOTICE 'Cleanup affiliation_backfill_audit: Deleting records older than % (% days)',
    v_cutoff_date, retention_days;

  -- Delete old audit records
  DELETE FROM affiliation_backfill_audit
  WHERE updated_at < v_cutoff_date;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Get oldest remaining record
  SELECT MIN(updated_at) INTO v_oldest_kept
  FROM affiliation_backfill_audit;

  -- Log results
  RAISE NOTICE 'Cleanup complete: Deleted % records, oldest remaining: %',
    v_deleted_count, v_oldest_kept;

  -- Return results
  RETURN QUERY SELECT v_deleted_count, v_oldest_kept;
END;
$$;

-- Grant execute permission to authenticated users (optional - restrict to admin only)
-- GRANT EXECUTE ON FUNCTION cleanup_affiliation_audit(INTEGER) TO authenticated;

-- Test the function (DRY RUN - won't delete, just shows what would be deleted)
SELECT
  COUNT(*) as would_delete,
  MIN(updated_at) as oldest_to_delete,
  MAX(updated_at) as newest_to_delete
FROM affiliation_backfill_audit
WHERE updated_at < NOW() - INTERVAL '90 days';

-- -----------------------------------------------------------------------------
-- 4.4: Schedule automatic cleanup using pg_cron (if available)
-- -----------------------------------------------------------------------------
-- Runs cleanup every Sunday at 2 AM UTC

-- Check if pg_cron is available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Schedule weekly cleanup job
    PERFORM cron.schedule(
      'cleanup-affiliation-audit',           -- Job name
      '0 2 * * 0',                           -- Cron schedule: Every Sunday at 2 AM
      $$SELECT cleanup_affiliation_audit(90)$$  -- SQL to execute (90 days retention)
    );
    RAISE NOTICE 'pg_cron job scheduled: cleanup-affiliation-audit';
  ELSE
    RAISE NOTICE 'pg_cron extension not available - cannot schedule automatic cleanup';
  END IF;
END $$;

-- View scheduled cron jobs
SELECT
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
WHERE command LIKE '%cleanup_affiliation_audit%';

-- -----------------------------------------------------------------------------
-- 4.5: Alternative - Manual cleanup queries
-- -----------------------------------------------------------------------------
-- If pg_cron is not available, run these manually or via external scheduler

-- Preview what will be deleted (90 days retention)
SELECT
  COUNT(*) as records_to_delete,
  MIN(updated_at) as oldest,
  MAX(updated_at) as newest,
  pg_size_pretty(
    pg_total_relation_size('affiliation_backfill_audit') * COUNT(*) / NULLIF((SELECT COUNT(*) FROM affiliation_backfill_audit), 0)
  ) as estimated_space_freed
FROM affiliation_backfill_audit
WHERE updated_at < NOW() - INTERVAL '90 days';

-- Execute cleanup (⚠️ DESTRUCTIVE - only run after review)
/*
BEGIN;

DELETE FROM affiliation_backfill_audit
WHERE updated_at < NOW() - INTERVAL '90 days';

-- Verify deletion
SELECT COUNT(*) as remaining_records, MIN(updated_at) as oldest_record
FROM affiliation_backfill_audit;

-- If everything looks good: COMMIT;
-- If there's an issue: ROLLBACK;
COMMIT;
*/

-- -----------------------------------------------------------------------------
-- 4.6: Export audit data to CSV before cleanup (recommended)
-- -----------------------------------------------------------------------------
-- Run this in psql or use Supabase SQL Editor's export feature

-- Export all audit records (for long-term archival)
COPY (
  SELECT
    affiliation_id,
    old_created_by,
    new_created_by,
    updated_at
  FROM affiliation_backfill_audit
  ORDER BY updated_at DESC
) TO '/tmp/affiliation_backfill_audit_export_2025-10-11.csv'
WITH (FORMAT CSV, HEADER true);

-- Or use Supabase SQL Editor:
-- 1. Run: SELECT * FROM affiliation_backfill_audit ORDER BY updated_at DESC;
-- 2. Click "Export" button in results panel
-- 3. Choose CSV format and download

-- -----------------------------------------------------------------------------
-- 4.7: Monitoring queries
-- -----------------------------------------------------------------------------

-- Check audit table growth over time
SELECT
  DATE_TRUNC('month', updated_at) as month,
  COUNT(*) as records,
  COUNT(DISTINCT affiliation_id) as unique_affiliations,
  array_agg(DISTINCT old_created_by) as old_values_found
FROM affiliation_backfill_audit
GROUP BY DATE_TRUNC('month', updated_at)
ORDER BY month DESC;

-- Check when cleanup last ran (if using pg_cron)
SELECT
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE command LIKE '%cleanup_affiliation_audit%'
ORDER BY start_time DESC
LIMIT 10;

-- -----------------------------------------------------------------------------
-- 4.8: Disable/enable automatic cleanup
-- -----------------------------------------------------------------------------

-- Disable automatic cleanup
-- SELECT cron.unschedule('cleanup-affiliation-audit');

-- Re-enable automatic cleanup (if previously unscheduled)
-- SELECT cron.schedule(
--   'cleanup-affiliation-audit',
--   '0 2 * * 0',  -- Every Sunday at 2 AM
--   $$SELECT cleanup_affiliation_audit(90)$$
-- );

-- -----------------------------------------------------------------------------
-- RECOMMENDED RETENTION PERIODS:
-- -----------------------------------------------------------------------------
-- 30 days:  For non-critical audit data, save storage space
-- 90 days:  Standard retention (recommended for most cases)
-- 180 days: Extended retention for compliance requirements
-- 365 days: Annual retention for financial/legal audits
-- NEVER:    Keep all audit data forever (requires periodic archival)
--
-- EXECUTION PLAN:
-- -----------------------------------------------------------------------------
-- 1. Run 4.1 to check if pg_cron is available
-- 2. Run 4.2 to see current audit table statistics
-- 3. Decide retention period (default: 90 days)
-- 4. Run 4.6 to export current data to CSV (backup)
-- 5. Run 4.3 to create cleanup function
-- 6. If pg_cron available: Run 4.4 to schedule automatic cleanup
-- 7. If pg_cron NOT available: Set up external cron job to run 4.5 manually
-- 8. Monitor with 4.7 queries periodically
--
-- ROLLBACK STRATEGY:
-- - Export data to CSV before any deletion (step 4)
-- - Test cleanup function with DRY RUN first
-- - Use transactions (BEGIN/ROLLBACK/COMMIT) for manual cleanup
-- - Keep at least 30 days of audit data for investigation
-- ============================================================================
