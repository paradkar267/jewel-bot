const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const shops = await prisma.shop.findMany();
    console.log('Shops count:', shops.length);
    console.log(JSON.stringify(shops.map(s => ({
      id: s.id,
      name: s.name,
      phone: s.phone_number,
      metaPhoneId: s.meta_phone_number_id,
      metaAccessTokenSet: !!s.meta_access_token,
      isActive: s.is_active
    })), null, 2));
    const products = await prisma.product.count();
    console.log('Products count:', products);
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
