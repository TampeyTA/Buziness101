const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: { role: 'admin' },
      create: {
        username: 'admin',
        role: 'admin',
      },
    })

    console.log('Admin user created:', adminUser)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

