const dotenv = require('dotenv');
dotenv.config();

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const shop = await prisma.shop.findFirst();
  console.log("Active shop in DB:", shop?.name, shop?.id);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
