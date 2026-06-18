const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding database...");
  
  // 1. Check if shop exists or create a dummy shop
  let { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('*')
    .limit(1)
    .single();

  if (!shop) {
    console.log("No shop found, creating a default 'Yash Jewellers' shop...");
    const { data: newShop, error: insertError } = await supabase
      .from('shops')
      .insert([{ name: 'Yash Jewellers', whatsapp_number: '+1234567890' }])
      .select()
      .single();
      
    if (insertError) {
      console.error("Failed to create shop:", insertError);
      return;
    }
    shop = newShop;
  }
  
  console.log(`Using shop: ${shop.name} (ID: ${shop.id})`);

  // 2. Read mock catalog
  const catalog = JSON.parse(fs.readFileSync('./mock_catalog.json', 'utf8'));
  
  // 3. Format and insert products
  const productsToInsert = catalog.map(item => ({
    shop_id: shop.id,
    name: item.name,
    type: item.type,
    metal: item.metal,
    price: item.price,
    url: item.url,
    keywords: item.keywords
  }));

  const { data, error } = await supabase
    .from('products')
    .insert(productsToInsert)
    .select();

  if (error) {
    console.error("Error inserting products:", error);
  } else {
    console.log(`Successfully inserted ${data.length} dummy products into Supabase!`);
  }
}

seed();
