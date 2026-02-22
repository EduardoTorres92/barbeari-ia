import { PrismaClient } from "@/src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

function getConnectionString(): string {
  const url = process.env.DATABASE_URL!
  if (url.includes("sslmode=")) return url
  const sep = url.includes("?") ? "&" : "?"
  return `${url}${sep}sslmode=verify-full`
}

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: getConnectionString() }),
  })
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: getConnectionString() }),
    })
  }
  prisma = global.cachedPrisma
}
export const db = prisma
