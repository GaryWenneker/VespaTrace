-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- Nests table
CREATE TABLE IF NOT EXISTS public.nests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species text,
  found_at timestamp with time zone NOT NULL,
  removed_at timestamp with time zone,
  notes text,
  geom geometry(Point, 4326) NOT NULL,
  source text,
  external_id text UNIQUE
);

-- Spatial index
CREATE INDEX IF NOT EXISTS idx_nests_geom ON public.nests USING gist (geom);

-- Data integrity: removed_at must be >= found_at
ALTER TABLE public.nests
  ADD CONSTRAINT nests_removed_after_found
  CHECK (removed_at IS NULL OR removed_at >= found_at);
