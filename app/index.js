const { PrismaClient } = require('@prisma/client') 

const prisma = new PrismaClient()

// Example Prisma queries.
prisma.user.create({
    data: {
        id: 'aaa0037',
        email: 'test',
        hashed_password: 'test'
    }
})
    .catch(console.log)
    .then(_res => {return prisma.user.findMany()})
    .then(console.log)