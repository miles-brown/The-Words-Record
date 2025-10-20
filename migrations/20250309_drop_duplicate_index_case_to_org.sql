-- Drop duplicate index on _CaseToOrganization
-- Keep: _CaseToOrganization_AB_pkey (primary key constraint index)
-- Drop: _CaseToOrganization_AB_unique (redundant unique constraint)

BEGIN;

DO $$
BEGIN
    -- Drop the redundant unique constraint (keeping primary key)
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_CaseToOrganization_AB_unique'
        AND conrelid = 'public."_CaseToOrganization"'::regclass
    ) THEN
        ALTER TABLE public."_CaseToOrganization" DROP CONSTRAINT IF EXISTS "_CaseToOrganization_AB_unique";
        RAISE NOTICE 'Dropped duplicate constraint: _CaseToOrganization_AB_unique';
    ELSE
        RAISE NOTICE 'Constraint _CaseToOrganization_AB_unique not found or already dropped';
    END IF;
END $$;

-- Verify remaining indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = '_CaseToOrganization';

COMMIT;

-- Rollback (manual):
-- CREATE UNIQUE INDEX IF NOT EXISTS "_CaseToOrganization_AB_unique" ON public."_CaseToOrganization"("A", "B");