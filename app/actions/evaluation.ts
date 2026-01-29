'use server';

import { prisma } from '@/lib/prisma';

// Buscar Todos os Dados Necessários para a Tela de Avaliação
export async function getEvaluationData() {
    const [jobRoles, factors] = await Promise.all([
        prisma.jobRole.findMany({
            orderBy: { title: 'asc' },
            include: {
                scores: {
                    include: {
                        factorLevel: true
                    }
                },
                grade: true
            }
        }),
        prisma.factor.findMany({
            orderBy: { name: 'asc' },
            include: {
                levels: {
                    orderBy: { level: 'asc' }
                }
            }
        })
    ]);

    return { jobRoles, factors };
}

// Salvar a Avaliação de UM Cargo
export async function saveJobEvaluation(jobRoleId: string, scores: { [factorId: string]: string }) {
    // scores é um objeto: { "factor_id_1": "level_id_A", "factor_id_2": "level_id_B" }

    try {
        // 1. Limpar notas antigas deste cargo (estratégia simples: remove tudo e recria)
        // Numa app real poderia ser mais cirúrgico, mas funciona bem aqui.
        await prisma.jobScore.deleteMany({
            where: { jobRoleId }
        });

        // 2. Criar novas notas
        const newScores = Object.values(scores).map(levelId => ({
            jobRoleId,
            factorLevelId: levelId
        }));

        if (newScores.length > 0) {
            await Promise.all(newScores.map(score =>
                prisma.jobScore.create({ data: score })
            ));
        }

        // 3. Recalcular Pontuação Total
        // Buscar os níveis recém inseridos para somar os pontos
        const currentScores = await prisma.jobScore.findMany({
            where: { jobRoleId },
            include: {
                factorLevel: {
                    include: {
                        factor: true // IMPORTANTE: Incluir o fator para pegar o peso
                    }
                }
            }
        });

        const totalPoints = currentScores.reduce((acc, curr) => {
            const points = curr.factorLevel.points;
            const weight = curr.factorLevel.factor.weight;
            return acc + (points * weight);
        }, 0);

        // 4. Determinar Grade Sugerido (Enquadramento Automático)
        // Busca qual grade cobre essa pontuação
        const suggestedGrade = await prisma.salaryGrade.findFirst({
            where: {
                minPoints: { lte: totalPoints },
                maxPoints: { gte: totalPoints }
            }
        });

        // 5. Atualizar Cargo com Total e Grade
        await prisma.jobRole.update({
            where: { id: jobRoleId },
            data: {
                totalPoints,
                gradeId: suggestedGrade ? suggestedGrade.id : null
            }
        });

        return { success: true, totalPoints, grade: suggestedGrade?.name };

    } catch (error: any) {
        console.error("Erro ao salvar avaliação:", error);
        return { success: false, error: error.message };
    }
}
