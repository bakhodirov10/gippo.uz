import type { NextConfig } from "next";
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Bulletproof check to ensure Prisma is generated on Vercel
const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client', 'default.js');
if (!fs.existsSync(prismaClientPath)) {
  console.log('Prisma Client not found. Generating...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma Client generated successfully.');
  } catch (error) {
    console.error('Failed to generate Prisma Client', error);
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
};

export default nextConfig;
