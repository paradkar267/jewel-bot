const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'bizleap1@gmail.com';
  const password = 'bizleap@123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingShop = await prisma.shop.findFirst({
    where: { owner_email: email }
  });

  if (existingShop) {
    await prisma.shop.update({
      where: { id: existingShop.id },
      data: {
        password: hashedPassword,
        name: 'BizLeap Admin'
      }
    });
    console.log(`Successfully updated existing admin account: ${email}`);
  } else {
    await prisma.shop.create({
      data: {
        name: 'BizLeap Admin',
        owner_email: email,
        password: hashedPassword,
        whatsapp_number: '919876543210' // default placeholder
      }
    });
    console.log(`Successfully created new admin account: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
