import { PrismaClient } from '@prisma/client';

// Singleton – jeden klient na całą aplikację
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export default prisma;
