import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const existingTenant = await prisma.tenant.findFirst()
  if (existingTenant) {
    console.log("A Tenant already exists:", existingTenant)
    return
  }

  const newTenant = await prisma.tenant.create({
    data: {
      name: 'InGarage Auto Shop',
    },
  })
  console.log("Successfully created test Tenant:", newTenant)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
