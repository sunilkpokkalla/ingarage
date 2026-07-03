import { PrismaClient } from '@prisma/client';

// Single shared Prisma client for the whole app.
// (Previously every route file created its own client, each holding a connection pool.)
export const prisma = new PrismaClient();
