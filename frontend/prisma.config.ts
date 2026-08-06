import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_AKDmo8YvxIC9@ep-flat-flower-ayuzyru2-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
