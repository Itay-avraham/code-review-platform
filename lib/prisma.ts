import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Supabase connection string from your .env
  const connectionString = `${process.env.DATABASE_URL}`
  
  // Initialize the database pool and adapter
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  // Pass the adapter to Prisma
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma