'use server';

import { prisma } from '@/lib/prisma';

export interface EvaluationHistoryItem {
    evaluationId: string;
    cycleId: string;
    cycleName: string;
    cycleStartDate: Date;
    cycleEndDate: Date;
    finalScore: number;
    potentialScore: number | null;
    status: string;
}

export interface EvaluationHistoryData {
    previousEvaluations: EvaluationHistoryItem[];
    competencyTrends: {
        competencyId: string;
        competencyName: string;
        scores: { cycleName: string; score: number }[];
    }[];
}

/**
 * Busca o histórico de avaliações de um colaborador
 * para comparação e análise de evolução
 */
export async function getEvaluationHistoryData(
    employeeId: string,
    currentEvaluationId: string
): Promise<{ success: boolean; data?: EvaluationHistoryData; error?: string }> {
    try {
        // Buscar avaliações anteriores do mesmo colaborador
        const previousEvaluations: any[] = await (prisma as any).performanceEvaluation.findMany({
            where: {
                employeeId,
                id: { not: currentEvaluationId },
                status: { in: ['DONE', 'SUBMITTED', 'COMPLETED'] }
            },
            include: {
                cycle: true,
                items: {
                    include: {
                        competency: true
                    }
                }
            },
            orderBy: {
                cycle: {
                    startDate: 'desc'
                }
            },
            take: 5 // Últimos 5 ciclos
        });

        // Mapear para o formato esperado
        const historyItems: EvaluationHistoryItem[] = previousEvaluations.map((evalItem: any) => ({
            evaluationId: evalItem.id,
            cycleId: evalItem.cycleId,
            cycleName: evalItem.cycle.name,
            cycleStartDate: evalItem.cycle.startDate,
            cycleEndDate: evalItem.cycle.endDate,
            finalScore: evalItem.finalScore || 0,
            potentialScore: evalItem.potentialScore,
            status: evalItem.status
        }));

        // Calcular tendências por competência
        const competencyMap = new Map<string, {
            name: string;
            scores: { cycleName: string; score: number }[]
        }>();

        previousEvaluations.forEach((evalItem: any) => {
            evalItem.items.forEach((item: any) => {
                if (item.competency && item.score) {
                    const existing = competencyMap.get(item.competencyId);
                    if (existing) {
                        existing.scores.push({
                            cycleName: evalItem.cycle.name,
                            score: item.score
                        });
                    } else {
                        competencyMap.set(item.competencyId, {
                            name: item.competency.name,
                            scores: [{
                                cycleName: evalItem.cycle.name,
                                score: item.score
                            }]
                        });
                    }
                }
            });
        });

        const competencyTrends = Array.from(competencyMap.entries()).map(([id, data]) => ({
            competencyId: id,
            competencyName: data.name,
            scores: data.scores
        }));

        return {
            success: true,
            data: {
                previousEvaluations: historyItems,
                competencyTrends
            }
        };
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        return {
            success: false,
            error: 'Erro ao buscar histórico de avaliações'
        };
    }
}
