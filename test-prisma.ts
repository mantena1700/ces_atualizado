import { prisma } from './lib/prisma';

async function check() {
    try {
        const e = await prisma.employee.findFirst({
            include: {
                benefits: true
            }
        });
        console.log("Success! benefits found.");
    } catch (err: any) {
        console.log("Error finding benefits:", err.message);
    }
}

check();
