'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface NineBoxData {
    id: string;
    employeeName: string;
    jobTitle: string;
    department: string;
    photo?: string;
    finalScore: number; // Eixo X (Desempenho)
    potentialScore: number | null; // Eixo Y (Potencial)
    status: string;
}

/**
 * Busca os dados para a Matriz Nine Box de um determinado ciclo
 */
export async function getNineBoxData(cycleId?: string) {
    try {
        // Se não passar ciclo, pega o ativo
        let targetCycleId = cycleId;
        if (!targetCycleId) {
            const activeCycle = await prisma.performanceCycle.findFirst({
                where: { status: { in: ['ACTIVE', 'OPEN'] } }
            });
            targetCycleId = activeCycle?.id;
        }

        if (!targetCycleId) return { success: false, error: 'Nenhum ciclo ativo encontrado.' };

        const evaluations = await prisma.performanceEvaluation.findMany({
            where: {
                cycleId: targetCycleId,
                // status: { in: ['DONE', 'REVIEWED'] } // Removido filtro temporariamente para debug
            },
            include: {
                employee: true,
                jobRole: true
            }
        });

        const matrixData: NineBoxData[] = evaluations.map(ev => ({
            id: ev.id,
            employeeName: ev.employee.name,
            jobTitle: ev.jobRole.title,
            department: ev.jobRole.department || 'Geral',
            finalScore: ev.finalScore || 0,
            potentialScore: ev.potentialScore || 0, // Default 0 se nulo
            status: ev.status
        }));

        return { success: true, data: matrixData };
    } catch (error: any) {
        console.error("Erro ao buscar dados Nine Box:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Atualiza o Potencial (eixo Y) ao mover o card
 */
export async function updatePotentialScore(evaluationId: string, newPotentialScore: number) {
    try {
        await prisma.performanceEvaluation.update({
            where: { id: evaluationId },
            data: {
                potentialScore: newPotentialScore
            }
        });

        revalidatePath('/ninebox');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
