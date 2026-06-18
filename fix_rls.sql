-- Drop the strict SELECT policies
DROP POLICY IF EXISTS "Shop owners can read their own shop" ON shops;
DROP POLICY IF EXISTS "Shop owners can read their own products" ON products;

-- Allow anyone (including your bot) to read the shops and products
CREATE POLICY "Anyone can view shops" ON shops FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
