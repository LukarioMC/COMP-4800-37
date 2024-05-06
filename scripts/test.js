const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.user.create({
    data: {
        id: "1",
        email: "2",
        hashed_password: "abc",
        salt: "abc"
    }
})
    .catch(console.log)