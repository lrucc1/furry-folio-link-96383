-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can insert their own vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can update their own vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can delete their own vaccinations" ON public.vaccinations;

-- Recreate policies
CREATE POLICY "Users can view their own vaccinations"
  ON public.vaccinations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vaccinations"
  ON public.vaccinations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaccinations"
  ON public.vaccinations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaccinations"
  ON public.vaccinations FOR DELETE
  USING (auth.uid() = user_id);