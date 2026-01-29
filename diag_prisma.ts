import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Available models on prisma client:');
    const keys = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
    console.log(keys);
}

main();
