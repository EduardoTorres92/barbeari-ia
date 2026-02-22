import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function removeDuplicateBarbershops() {
  const all = await prisma.barbershop.findMany({
    orderBy: { createdAt: "asc" },
    include: { services: true },
  })

  const seen = new Map<string, string>()
  const toDelete: string[] = []

  for (const b of all) {
    const key = `${b.name}|${b.address}`
    if (seen.has(key)) {
      toDelete.push(b.id)
    } else {
      seen.set(key, b.id)
    }
  }

  if (toDelete.length === 0) {
    console.log("Nenhuma duplicata encontrada.")
    await prisma.$disconnect()
    return
  }

  console.log(`Removendo ${toDelete.length} barbearias duplicadas...`)

  await prisma.barberShopService.deleteMany({
    where: { barberShopId: { in: toDelete } },
  })
  await prisma.barbershop.deleteMany({ where: { id: { in: toDelete } } })

  console.log("Duplicatas removidas com sucesso!")
  await prisma.$disconnect()
}

removeDuplicateBarbershops().catch((err) => {
  console.error(err)
  process.exit(1)
})
