-- 1. Create the Shops table
CREATE TABLE IF NOT EXISTS shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp_number TEXT UNIQUE, -- e.g., '+1234567890' (The number the shop uses)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  metal TEXT,
  price NUMERIC,
  url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert some dummy data for testing
INSERT INTO shops (name, whatsapp_number) 
VALUES ('Yash Jewellers', 'YOUR_WHATSAPP_TEST_NUMBER_HERE')
ON CONFLICT (whatsapp_number) DO NOTHING;

-- Note: To insert dummy products, first get the shop_id from the shops table, then insert.
-- Example:
-- INSERT INTO products (shop_id, name, type, metal, price, url, keywords)
-- VALUES (
--   (SELECT id FROM shops WHERE name = 'Yash Jewellers'),
--   'Kundan Bridal Necklace Set',
--   'necklace',
--   'gold',
--   250000,
--   'https://yourshop.com/kundan-necklace',
--   ARRAY['kundan', 'bridal', 'heavy', 'choker', 'gold', 'traditional', 'wedding']
-- );
