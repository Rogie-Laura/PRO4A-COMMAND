GRANT SELECT ON public.dashboard_data_revisions TO anon, authenticated;

DROP POLICY IF EXISTS dashboard_data_revisions_select_public ON public.dashboard_data_revisions;
CREATE POLICY dashboard_data_revisions_select_public
  ON public.dashboard_data_revisions
  FOR SELECT
  TO anon, authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'dashboard_data_revisions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_data_revisions;
  END IF;
END $$;
