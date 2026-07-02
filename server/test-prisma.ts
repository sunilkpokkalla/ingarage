import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

try {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  console.log("Success!");
} catch(e) {
  console.error("Failed", e);
}
