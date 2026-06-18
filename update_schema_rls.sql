-- 1. Add owner_id to shops table (linked to Supabase auth.users)
ALTER TABLE shops ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Enable Row Level Security (RLS) on both tables
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for shops table
-- A user can only select/read their own shop
CREATE POLICY "Shop owners can read their own shop" 
ON shops FOR SELECT 
USING (auth.uid() = owner_id);

-- A user can insert a shop (which happens during signup)
CREATE POLICY "Users can create their shop" 
ON shops FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- A user can update their own shop
CREATE POLICY "Shop owners can update their own shop" 
ON shops FOR UPDATE 
USING (auth.uid() = owner_id);

-- 4. RLS Policies for products table
-- A user can read products if the product's shop belongs to them
CREATE POLICY "Shop owners can read their own products" 
ON products FOR SELECT 
USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- A user can insert a product if the shop belongs to them
CREATE POLICY "Shop owners can insert products to their shop" 
ON products FOR INSERT 
WITH CHECK (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- A user can update/delete their own products
CREATE POLICY "Shop owners can update their own products" 
ON products FOR UPDATE 
USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

CREATE POLICY "Shop owners can delete their own products" 
ON products FOR DELETE 
USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);
