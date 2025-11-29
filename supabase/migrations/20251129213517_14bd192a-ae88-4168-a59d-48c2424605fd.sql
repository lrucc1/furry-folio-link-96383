-- Weight Records table for tracking pet weight history
CREATE TABLE public.weight_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  weight_kg numeric(6,2) NOT NULL,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view weight records for accessible pets" 
  ON weight_records FOR SELECT 
  USING (has_pet_access(pet_id, auth.uid()));

CREATE POLICY "Users can insert weight records for editable pets" 
  ON weight_records FOR INSERT 
  WITH CHECK (can_edit_pet(pet_id, auth.uid()));

CREATE POLICY "Users can update weight records for editable pets" 
  ON weight_records FOR UPDATE 
  USING (can_edit_pet(pet_id, auth.uid()));

CREATE POLICY "Users can delete weight records for editable pets" 
  ON weight_records FOR DELETE 
  USING (can_edit_pet(pet_id, auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_weight_records_pet_id ON weight_records(pet_id);
CREATE INDEX idx_weight_records_recorded_at ON weight_records(recorded_at DESC);