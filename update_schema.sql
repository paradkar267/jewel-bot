-- 1. Add owner_email column to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- 2. Update products table with missing columns (used by Admin Panel)
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_range_min NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_range_max NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- (Optional) If you want to link shop specifically to the logged-in user ID
-- ALTER TABLE shops ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
