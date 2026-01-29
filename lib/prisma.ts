import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma

    // Log para confirmar quais modelos estão ativos no seu terminal
    const models = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
    console.log('--- [PRISMA] Modelos Ativos:', models.join(', '));
}

export default prisma;
