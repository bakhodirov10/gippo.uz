import 'dotenv/config';
import { defineConfig } from '@prisma/config';

if (!process.env.DATABASE_URL) {
  console.error("🔴 URGENT: DATABASE_URL is missing in process.env! Please add it to your hosting provider's Environment Variables.");
} else {
  console.log("🟢 DATABASE_URL found in process.env.");
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL as string,
    directUrl: process.env.DIRECT_URL as string,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});
