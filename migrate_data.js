const axios = require('axios');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const connectionString = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: SUPABASE_URL or SUPABASE_KEY missing in .env");
  process.exit(1);
}

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL missing in .env");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fetchFromSupabase(table) {
  console.log(`📡 Fetching data from Supabase table: ${table}...`);
  const response = await axios.get(`${supabaseUrl}/rest/v1/${table}?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  return response.data;
}

async function run() {
  try {
    // 1. Fetch data
    const shops = await fetchFromSupabase('shops');
    const products = await fetchFromSupabase('products');
    const leads = await fetchFromSupabase('leads');

    console.log(`✅ Fetched: ${shops.length} shops, ${products.length} products, ${leads.length} leads.`);

    // 2. Insert Shops
    console.log("📥 Migrating shops to Neon...");
    for (const shop of shops) {
      await prisma.shop.upsert({
        where: { id: shop.id },
        update: {
          name: shop.name,
          whatsapp_number: shop.whatsapp_number,
          owner_email: shop.owner_email,
          password: shop.password || null,
          meta_phone_number_id: shop.meta_phone_number_id,
          created_at: new Date(shop.created_at)
        },
        create: {
          id: shop.id,
          name: shop.name,
          whatsapp_number: shop.whatsapp_number,
          owner_email: shop.owner_email,
          password: shop.password || null,
          meta_phone_number_id: shop.meta_phone_number_id,
          created_at: new Date(shop.created_at)
        }
      });
    }

    // 3. Insert Products
    console.log("📥 Migrating products to Neon...");
    for (const product of products) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          shop_id: product.shop_id,
          name: product.name,
          type: product.type,
          metal: product.metal,
          price: product.price ? parseFloat(product.price) : null,
          url: product.url,
          image_url: product.image_url,
          created_at: new Date(product.created_at)
        },
        create: {
          id: product.id,
          shop_id: product.shop_id,
          name: product.name,
          type: product.type,
          metal: product.metal,
          price: product.price ? parseFloat(product.price) : null,
          url: product.url,
          image_url: product.image_url,
          created_at: new Date(product.created_at)
        }
      });
    }

    // 4. Insert Leads
    console.log("📥 Migrating leads to Neon...");
    for (const lead of leads) {
      const existing = await prisma.lead.findFirst({
        where: {
          shop_id: lead.shop_id,
          customer_phone: lead.customer_phone
        }
      });

      if (existing) {
        await prisma.lead.update({
          where: { id: existing.id },
          data: {
            message_count: lead.message_count,
            last_contacted_at: new Date(lead.last_contacted_at),
            created_at: new Date(lead.created_at)
          }
        });
      } else {
        await prisma.lead.create({
          data: {
            id: lead.id,
            shop_id: lead.shop_id,
            customer_phone: lead.customer_phone,
            message_count: lead.message_count,
            last_contacted_at: new Date(lead.last_contacted_at),
            created_at: new Date(lead.created_at)
          }
        });
      }
    }

    console.log("🎉 SUCCESS: All data migrated from Supabase to Neon!");
  } catch (error) {
    console.error("❌ Migration failed:", error.response ? error.response.data : error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
