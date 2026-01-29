const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log('--- START TEST ---');
    try {
        const keys = Object.keys(prisma);
        console.log('Available models:', keys.filter(k => !k.startsWith('$')).join(', '));
        const e = await prisma.employee.findFirst({
            include: { benefits: true }
        });
        console.log('Query successful');
    } catch (err) {
        console.error('Error during test:', err.message);
    } finally {
        await prisma.$disconnect();
        console.log('--- END TEST ---');
    }
}

run();
