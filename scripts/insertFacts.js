const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function insertFacts() {
    prisma.factoid.createMany({
        data: [
            {
                content: "There are 37 holes in the mouthpiece of a telephone", 
                note: `I'm talking about "old" style phones with the "Mickey Mouse" handsets that have the round mouthpieces with roughly the following pattern of holes:

                o o o o
               o o o o o
              o o o o o o
             o o o o o o o
              o o o o o o
               o o o o o
                o o o o`,
                is_approved: true,
                approval_date: new Date().toISOString()
            },
            {
                content: "There are 37 bars in the digits of a digital watch.",
                note: `It has to be a 12-hour-mode display, and you have to count the seconds:

                _     _   _     _   _
             | |_| * |_| |_| * |_| |_|
             | |_| * |_| |_| * |_| |_|`
            },
            {
                content: "All American Express card numbers begin with 37.",
                is_approved: true,
                approval_date: new Date().toISOString()
            }
        ]
    })
        .then((res) => console.log)
}

async function insertCategories() {
    prisma.category.createMany({
        data: [
            {name: "Cat A"},
            {name: "Cat B"},
            {name: "Cat C"}
        ]
    })
}

async function insertTags() {
    prisma.tag.createMany({
        data: [
            {factoid_id: 1, category_id: 1},
            {factoid_id: 1, category_id: 2},
            {factoid_id: 2, category_id: 3},
            {factoid_id: 3, category_id: 3},
            {factoid_id: 3, category_id: 2},
        ]
    })
}


insertFacts().then(insertCategories).then(insertTags)