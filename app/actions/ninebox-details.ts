'use server';

import { prisma } from '@/lib/prisma';

export interface CompetencyRadarData {
    competency: string;
    competencyId: string;
    category: string;
    expected: number;
    score: number;
    selfScore: number | null;
    weight: number;
}

export interface HistoricalCompetencyScore {
    competencyId: string;
    competencyName: string;
    score: number;
}

export interface HistoricalEvaluation {
    cycleId: string;
    cycleName: string;
    startDate: Date;
    finalScore: number;
    potentialScore: number | null;
    status: string;
    competencyScores: HistoricalCompetencyScore[];
}

export interface EmployeeDetailedData {
    id: string;
    employeeId: string;
    employeeName: string;
    jobTitle: string;
    department: string;
    admissionDate: Date | null;
    email: string | null;

    // Avaliação Atual
    cycleName: string;
    cycleId: string;
    status: string;
    finalScore: number;
    potentialScore: number | null;

    // Feedback e Comentários
    feedback: string | null;
    strengths: string | null;
    improvements: string | null;
    nextSteps: string | null;
    trainingNeeds: string | null;

    // Indicadores
    promotionReady: boolean;
    timeToPromotion: number | null;
    retentionRisk: string | null;
    calibrationComments: string | null;

    // Competências para Radar
    competencies: CompetencyRadarData[];

    // Histórico para Comparativo (agora inclui scores de competências)
    history: HistoricalEvaluation[];

    // Gestor
    managerName: string | null;
}

/**
 * Busca dados completos de um colaborador para a página de detalhes
 */
export async function getEmployeeDetailedData(evaluationId: string): Promise<{
    success: boolean;
    data?: EmployeeDetailedData;
    error?: string;
}> {
    try {
        // Buscar avaliação principal com todos os relacionamentos
        const evaluation = await (prisma as any).performanceEvaluation.findUnique({
            where: { id: evaluationId },
            include: {
                employee: true,
                jobRole: true,
                cycle: true,
                items: {
                    include: {
                        competency: true
                    }
                }
            }
        });

        if (!evaluation) {
            return { success: false, error: 'Avaliação não encontrada' };
        }

        // Buscar histórico de avaliações do mesmo colaborador (incluindo items de competência)
        const historicalEvaluations: any[] = await (prisma as any).performanceEvaluation.findMany({
            where: {
                employeeId: evaluation.employeeId,
                id: { not: evaluationId },
                status: { in: ['DONE', 'REVIEWED', 'SUBMITTED'] }
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
                cycle: { startDate: 'desc' }
            },
            take: 3 // Últimos 3 ciclos para o radar
        });

        // Buscar níveis esperados de competência do cargo
        const jobCompetencies: any[] = await (prisma as any).jobCompetency.findMany({
            where: { jobRoleId: evaluation.jobRoleId },
            include: {
                competency: true,
                competencyLevel: true
            }
        });

        // Mapear competências para o gráfico radar
        const competencyMap = new Map<string, { expected: number; weight: number; category: string }>();
        jobCompetencies.forEach((jc: any) => {
            competencyMap.set(jc.competencyId, {
                expected: jc.competencyLevel.level,
                weight: jc.weight,
                category: jc.competency.category
            });
        });

        const competencies: CompetencyRadarData[] = evaluation.items
            .filter((item: any) => item.type === 'COMPETENCY' && item.competency)
            .map((item: any) => {
                const expected = competencyMap.get(item.competencyId || '')?.expected || 3;
                const weight = competencyMap.get(item.competencyId || '')?.weight || 1;
                const category = competencyMap.get(item.competencyId || '')?.category || 'TECHNICAL';

                return {
                    competency: item.competency?.name || 'Competência',
                    competencyId: item.competencyId || '',
                    category,
                    expected,
                    score: item.score || item.managerScore || 0,
                    selfScore: item.selfScore,
                    weight
                };
            });

        // Montar histórico COM scores de competência
        const history: HistoricalEvaluation[] = historicalEvaluations.map((ev: any) => {
            const competencyScores: HistoricalCompetencyScore[] = ev.items
                .filter((item: any) => item.type === 'COMPETENCY' && item.competency)
                .map((item: any) => ({
                    competencyId: item.competencyId || '',
                    competencyName: item.competency?.name || 'Competência',
                    score: item.score || item.managerScore || 0
                }));

            return {
                cycleId: ev.cycleId,
                cycleName: ev.cycle.name,
                startDate: ev.cycle.startDate,
                finalScore: ev.finalScore || 0,
                potentialScore: ev.potentialScore,
                status: ev.status,
                competencyScores
            };
        });

        // Montar objeto de resposta
        const data: EmployeeDetailedData = {
            id: evaluation.id,
            employeeId: evaluation.employeeId,
            employeeName: evaluation.employee.name,
            jobTitle: evaluation.jobRole.title,
            department: evaluation.jobRole.department || 'Geral',
            admissionDate: evaluation.employee.admissionDate,
            email: evaluation.employee.email,

            cycleName: evaluation.cycle.name,
            cycleId: evaluation.cycleId,
            status: evaluation.status,
            finalScore: evaluation.finalScore || 0,
            potentialScore: evaluation.potentialScore,

            feedback: evaluation.feedback,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
            nextSteps: evaluation.nextSteps,
            trainingNeeds: evaluation.trainingNeeds,

            promotionReady: evaluation.promotionReady,
            timeToPromotion: evaluation.timeToPromotion,
            retentionRisk: evaluation.retentionRisk,
            calibrationComments: evaluation.calibrationComments,

            competencies,
            history,

            managerName: evaluation.managerName
        };

        return { success: true, data };
    } catch (error: any) {
        console.error('Erro ao buscar detalhes do colaborador:', error);
        return { success: false, error: error.message };
    }
}
