const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function insertFacts() {
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
                o o o o`
            },
            {
                content: "There are 37 bars in the digits of a digital watch.",
                note: `It has to be a 12-hour-mode display, and you have to count the seconds:

                _     _   _     _   _
             | |_| * |_| |_| * |_| |_|
             | |_| * |_| |_| * |_| |_|`
            },
            {
                content: "All American Express card numbers begin with 37."
            }
        ]
    })
        .then((res) => console.log)
}

insertFacts()