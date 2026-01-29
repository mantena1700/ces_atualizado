
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    console.log('--- Diagnóstico Nine Box ---');

    // 1. Check Active Cycle
    const activeCycle = await prisma.performanceCycle.findFirst({
        where: { status: 'ACTIVE' }
    });

    if (!activeCycle) {
        console.log('❌ Nenhum ciclo com status ACTIVE encontrado.');
        const anyCycle = await prisma.performanceCycle.findFirst();
        console.log('Ciclo qualquer encontrado:', anyCycle);
        return;
    }

    console.log('✅ Ciclo Ativo encontrado:', activeCycle.title, `(${activeCycle.id})`);

    // 2. Check Evaluations
    const evaluations = await prisma.performanceEvaluation.findMany({
        where: {
            cycleId: activeCycle.id
        }
    });

    console.log(`ℹ️ Total de avaliações no ciclo: ${evaluations.length}`);

    // 3. Check specific status
    const validEvaluations = evaluations.filter(e => ['DONE', 'REVIEWED'].includes(e.status));
    console.log(`ℹ️ Avaliações com status DONE ou REVIEWED: ${validEvaluations.length}`);

    if (validEvaluations.length === 0) {
        console.log('❌ Nenhuma avaliação válida para o Nine Box.');
        console.log('Status encontrados:', evaluations.map(e => e.status));
    } else {
        console.log('✅ Dados deveriam estar aparecendo.');
    }
}

diagnose()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
