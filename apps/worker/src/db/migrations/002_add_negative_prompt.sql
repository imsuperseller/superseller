-- Add negative_prompt to clips for video generation
ALTER TABLE clips ADD COLUMN IF NOT EXISTS negative_prompt TEXT;
