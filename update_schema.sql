-- 1. Add owner_email column to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- 2. Update products table with missing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Simplify the schema (Remove unnecessary columns to reduce complexity)
ALTER TABLE products DROP COLUMN IF EXISTS keywords;
ALTER TABLE products DROP COLUMN IF EXISTS price_range_min;
ALTER TABLE products DROP COLUMN IF EXISTS price_range_max;

-- (Optional) If you want to link shop specifically to the logged-in user ID
-- ALTER TABLE shops ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
