-- The previous attempt used an array column with a foreign key, which Postgres does not support.
-- Correct approach for many-to-many: create a join table between profiles and products.

-- Ensure prerequisite tables exist
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles'
	) THEN
		RAISE EXCEPTION 'Table public.profiles does not exist.';
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products'
	) THEN
		RAISE EXCEPTION 'Table public.products does not exist.';
	END IF;
END $$;

CREATE TABLE IF NOT EXISTS profile_products (
	profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY (profile_id, product_id)
);

-- Helpful indexes (composite PK already indexes both, but directional indexes can help)
CREATE INDEX IF NOT EXISTS idx_profile_products_profile_id ON profile_products (profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_products_product_id ON profile_products (product_id);