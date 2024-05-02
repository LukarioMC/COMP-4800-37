const { PrismaClient } = require('@prisma/client') 

const prisma = new PrismaClient()

prisma.user.create({
    data: {
        name: 'Alex',
        email: 'test'
    }
})
    .catch(_err => {})
    .then(_res => {return prisma.user.findMany()})
    .then(console.log)