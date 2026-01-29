
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log("1. Verificando SystemConfig...");
    try {
        // @ts-ignore
        const configs = await prisma.systemConfig.count();
        console.log(`✅ SystemConfig OK! Encontrados: ${configs} registros.`);
    } catch (e: any) {
        console.error("❌ SystemConfig FALHOU:", e.message);
    }

    console.log("2. Verificando DepartmentBudget...");
    try {
        // @ts-ignore
        const budgets = await prisma.departmentBudget.count();
        console.log(`✅ DepartmentBudget OK! Encontrados: ${budgets} registros.`);
    } catch (e: any) {
        console.error("❌ DepartmentBudget FALHOU:", e.message);
    }
}

check()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
