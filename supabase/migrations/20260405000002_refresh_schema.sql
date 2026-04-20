-- Force PostgREST schema cache refresh
-- This migration notifies PostgREST to reload the schema

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Alternative: create a dummy function to force schema reload
CREATE OR REPLACE FUNCTION public.refresh_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function can be called to force a schema refresh
    RAISE NOTICE 'Schema cache refresh requested';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.refresh_schema_cache() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_schema_cache() TO anon;
