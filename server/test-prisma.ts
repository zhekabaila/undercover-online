import { PrismaClient } from '@prisma/client';
try {
  const prisma = new PrismaClient({ adapter: null, url: process.env.DATABASE_URL } as any);
  console.log("Success");
} catch(e) {
  console.log("Error:", e);
}
