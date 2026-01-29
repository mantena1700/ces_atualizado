'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================
// TIPOS
// ============================

export interface EvaluationSummary {
    id: string;
    employeeId: string;
    employeeName: string;
    employeePhoto?: string;
    jobRoleTitle: string;
    department: string | null;
    status: string;
    finalScore: number | null;
    completedItems: number;
    totalItems: number;
    cycleId: string;
    cycleName: string;
}

export interface EvaluationDetail {
    id: string;
    employee: {
        id: string;
        name: string;
        email: string | null;
        admissionDate: Date | null;
        jobRole: {
            id: string;
            title: string;
            department: string | null;
            grade: { name: string } | null;
        } | null;
    };
    cycle: {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
    };
    status: string;
    finalScore: number | null;
    feedback: string | null;
    strengths: string | null;
    improvements: string | null;
    items: {
        id: string;
        type: string;
        competencyId: string | null;
        competencyName: string | null;
        competencyCategory: string | null;
        expectedLevel: number | null;
        expectedLevelName: string | null;
        score: number | null;
        weight: number;
        comments: string | null;
    }[];
    careerPath: {
        currentRole: string;
        nextRoles: { id: string; title: string; gap: number }[];
    } | null;
}

export interface PerformanceInsights {
    averageScore: number;
    totalEvaluations: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    topPerformers: { id: string; name: string; score: number; role: string }[];
    needsAttention: { id: string; name: string; score: number; role: string; gaps: string[] }[];
    promotionCandidates: { id: string; name: string; score: number; currentRole: string; nextRole: string; readiness: number }[];
}

// ============================
// FUNÇÕES DE CICLO
// ============================

export async function getPerformanceCycles() {
    try {
        const cycles = await prisma.performanceCycle.findMany({
            orderBy: { startDate: 'desc' },
            include: {
                _count: {
                    select: { evaluations: true }
                }
            }
        });
        return cycles.map(c => ({
            ...c,
            evaluationCount: c._count.evaluations
        }));
    } catch (error) {
        console.error('Erro ao buscar ciclos:', error);
        return [];
    }
}

export async function getActiveCycle() {
    try {
        const cycle = await prisma.performanceCycle.findFirst({
            where: { active: true },
            orderBy: { startDate: 'desc' }
        });
        return cycle;
    } catch (error) {
        console.error('Erro ao buscar ciclo ativo:', error);
        return null;
    }
}

export async function createPerformanceCycle(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string;
}) {
    try {
        // Desativa ciclos anteriores
        await prisma.performanceCycle.updateMany({
            where: { active: true },
            data: { active: false }
        });

        const cycle = await prisma.performanceCycle.create({
            data: {
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                description: data.description,
                status: 'OPEN',
                active: true
            }
        });

        revalidatePath('/avaliacao');
        return { success: true, cycle };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================
// FUNÇÕES DE AVALIAÇÃO
// ============================

export async function getEvaluationsByCycle(cycleId: string): Promise<EvaluationSummary[]> {
    try {
        const evaluations = await prisma.performanceEvaluation.findMany({
            where: { cycleId },
            include: {
                employee: {
                    include: {
                        jobRole: true
                    }
                },
                cycle: true,
                items: true
            },
            orderBy: { employee: { name: 'asc' } }
        });

        return evaluations.map(e => ({
            id: e.id,
            employeeId: e.employeeId,
            employeeName: e.employee.name,
            jobRoleTitle: e.employee.jobRole?.title || 'Sem cargo',
            department: e.employee.jobRole?.department || null,
            status: e.status,
            finalScore: e.finalScore,
            completedItems: e.items.filter(i => i.score !== null).length,
            totalItems: e.items.length,
            cycleId: e.cycleId,
            cycleName: e.cycle.name
        }));
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        return [];
    }
}

export async function getOrCreateEvaluation(employeeId: string, cycleId: string): Promise<EvaluationDetail | null> {
    try {
        // Buscar existente
        let evaluation = await prisma.performanceEvaluation.findUnique({
            where: {
                employeeId_cycleId: { employeeId, cycleId }
            },
            include: {
                employee: {
                    include: {
                        jobRole: {
                            include: {
                                grade: true,
                                nextMoves: {
                                    include: {
                                        toRole: true
                                    }
                                }
                            }
                        }
                    }
                },
                cycle: true,
                items: {
                    include: {
                        competency: {
                            include: {
                                levels: true
                            }
                        }
                    }
                }
            }
        });

        // Se não existe, criar
        if (!evaluation) {
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                include: {
                    jobRole: {
                        include: {
                            competencies: {
                                include: {
                                    competency: true,
                                    competencyLevel: true
                                }
                            }
                        }
                    }
                }
            });

            if (!employee || !employee.jobRoleId) {
                throw new Error('Funcionário sem cargo definido');
            }

            // Criar avaliação com itens baseados nas competências do cargo
            const jobCompetencies = employee.jobRole?.competencies || [];

            evaluation = await prisma.performanceEvaluation.create({
                data: {
                    employeeId,
                    cycleId,
                    jobRoleId: employee.jobRoleId,
                    status: 'PENDING',
                    items: {
                        create: jobCompetencies.map((jc: any) => ({
                            type: 'COMPETENCY',
                            competencyId: jc.competencyId,
                            competencyLevelId: jc.competencyLevelId,
                            weight: jc.weight || 1,
                            score: null
                        }))
                    }
                },
                include: {
                    employee: {
                        include: {
                            jobRole: {
                                include: {
                                    grade: true,
                                    nextMoves: {
                                        include: {
                                            toRole: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    cycle: true,
                    items: {
                        include: {
                            competency: {
                                include: {
                                    levels: true
                                }
                            }
                        }
                    }
                }
            });
        }

        // Buscar próximos passos de carreira
        const careerPaths = evaluation.employee.jobRole?.nextMoves || [];

        return {
            id: evaluation.id,
            employee: {
                id: evaluation.employee.id,
                name: evaluation.employee.name,
                email: evaluation.employee.email,
                admissionDate: evaluation.employee.admissionDate,
                jobRole: evaluation.employee.jobRole ? {
                    id: evaluation.employee.jobRole.id,
                    title: evaluation.employee.jobRole.title,
                    department: evaluation.employee.jobRole.department,
                    grade: evaluation.employee.jobRole.grade ? {
                        name: evaluation.employee.jobRole.grade.name
                    } : null
                } : null
            },
            cycle: {
                id: evaluation.cycle.id,
                name: evaluation.cycle.name,
                startDate: evaluation.cycle.startDate,
                endDate: evaluation.cycle.endDate
            },
            status: evaluation.status,
            finalScore: evaluation.finalScore,
            feedback: evaluation.feedback,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
            items: evaluation.items.map((item: any) => {
                const expectedLevel = item.competency?.levels?.find(
                    (l: any) => l.id === item.competencyLevelId
                );
                return {
                    id: item.id,
                    type: item.type,
                    competencyId: item.competencyId,
                    competencyName: item.competency?.name || null,
                    competencyCategory: item.competency?.category || null,
                    expectedLevel: expectedLevel?.level || null,
                    expectedLevelName: expectedLevel?.name || null,
                    score: item.score,
                    weight: item.weight,
                    comments: item.comments
                };
            }),
            careerPath: evaluation.employee.jobRole ? {
                currentRole: evaluation.employee.jobRole.title,
                nextRoles: careerPaths.map((cp: any) => ({
                    id: cp.toRole.id,
                    title: cp.toRole.title,
                    gap: 0 // Calcular gap depois
                }))
            } : null
        };
    } catch (error) {
        console.error('Erro ao buscar/criar avaliação:', error);
        return null;
    }
}

export async function saveEvaluationScores(
    evaluationId: string,
    items: { id: string; score: number; comments?: string }[]
) {
    try {
        // Atualiza cada item
        for (const item of items) {
            await prisma.evaluationItem.update({
                where: { id: item.id },
                data: {
                    score: item.score,
                    comments: item.comments || null
                }
            });
        }

        // Calcula nota final (média ponderada)
        const allItems = await prisma.evaluationItem.findMany({
            where: { evaluationId }
        });

        let totalScore = 0;
        let totalWeight = 0;
        let allCompleted = true;

        allItems.forEach((item: any) => {
            if (item.score !== null) {
                totalScore += item.score * item.weight;
                totalWeight += item.weight;
            } else {
                allCompleted = false;
            }
        });

        const finalScore = totalWeight > 0 ? (totalScore / totalWeight) : null;
        const newStatus = allCompleted ? 'COMPLETED' : 'IN_PROGRESS';

        await prisma.performanceEvaluation.update({
            where: { id: evaluationId },
            data: {
                finalScore,
                status: newStatus,
                updatedAt: new Date()
            }
        });

        revalidatePath('/avaliacao');
        return { success: true, finalScore, status: newStatus };
    } catch (error: any) {
        console.error('Erro ao salvar avaliação:', error);
        return { success: false, error: error.message };
    }
}

export async function submitEvaluation(
    evaluationId: string,
    feedback: { general: string; strengths: string; improvements: string }
) {
    try {
        await prisma.performanceEvaluation.update({
            where: { id: evaluationId },
            data: {
                status: 'SUBMITTED',
                feedback: feedback.general,
                strengths: feedback.strengths,
                improvements: feedback.improvements,
                managerEvaluationDate: new Date()
            }
        });

        revalidatePath('/avaliacao');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function finalizeEvaluation(evaluationId: string) {
    try {
        await prisma.performanceEvaluation.update({
            where: { id: evaluationId },
            data: {
                status: 'DONE'
            }
        });

        revalidatePath('/avaliacao');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================
// INSIGHTS E INTELIGÊNCIA
// ============================

export async function getPerformanceInsights(cycleId: string): Promise<PerformanceInsights> {
    try {
        const evaluations = await prisma.performanceEvaluation.findMany({
            where: { cycleId },
            include: {
                employee: {
                    include: {
                        jobRole: {
                            include: {
                                nextMoves: {
                                    include: {
                                        toRole: true
                                    }
                                }
                            }
                        }
                    }
                },
                items: {
                    include: {
                        competency: true
                    }
                }
            }
        });

        const completedEvaluations = evaluations.filter(e => e.finalScore !== null);
        const scores = completedEvaluations.map(e => e.finalScore || 0);
        const averageScore = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;

        // Top performers (score >= 4)
        const topPerformers = completedEvaluations
            .filter(e => (e.finalScore || 0) >= 4)
            .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
            .slice(0, 5)
            .map(e => ({
                id: e.employee.id,
                name: e.employee.name,
                score: e.finalScore || 0,
                role: e.employee.jobRole?.title || 'Sem cargo'
            }));

        // Needs attention (score < 3)
        const needsAttention = completedEvaluations
            .filter(e => (e.finalScore || 0) < 3)
            .map(e => {
                const gaps = e.items
                    .filter((i: any) => i.score !== null && i.score < 3)
                    .map((i: any) => i.competency?.name || 'Competência')
                    .slice(0, 3);
                return {
                    id: e.employee.id,
                    name: e.employee.name,
                    score: e.finalScore || 0,
                    role: e.employee.jobRole?.title || 'Sem cargo',
                    gaps
                };
            });

        // Candidatos a promoção (score >= 4.5 + tem próximo passo de carreira)
        const promotionCandidates = completedEvaluations
            .filter(e => (e.finalScore || 0) >= 4.5 && e.employee.jobRole?.nextMoves?.length)
            .map(e => {
                const nextRole = e.employee.jobRole?.nextMoves?.[0]?.toRole;
                const readiness = Math.min(100, Math.round(((e.finalScore || 0) / 5) * 100));
                return {
                    id: e.employee.id,
                    name: e.employee.name,
                    score: e.finalScore || 0,
                    currentRole: e.employee.jobRole?.title || '',
                    nextRole: nextRole?.title || '',
                    readiness
                };
            })
            .slice(0, 5);

        return {
            averageScore: Math.round(averageScore * 10) / 10,
            totalEvaluations: evaluations.length,
            completedEvaluations: completedEvaluations.length,
            pendingEvaluations: evaluations.length - completedEvaluations.length,
            topPerformers,
            needsAttention,
            promotionCandidates
        };
    } catch (error) {
        console.error('Erro ao calcular insights:', error);
        return {
            averageScore: 0,
            totalEvaluations: 0,
            completedEvaluations: 0,
            pendingEvaluations: 0,
            topPerformers: [],
            needsAttention: [],
            promotionCandidates: []
        };
    }
}

// ============================
// INICIALIZAÇÃO
// ============================

export async function initializeEvaluationsForCycle(cycleId: string) {
    try {
        // Buscar todos os funcionários com cargo
        const employees = await prisma.employee.findMany({
            where: {
                jobRoleId: { not: null }
            },
            select: { id: true }
        });

        let created = 0;
        for (const emp of employees) {
            // Verificar se já existe avaliação
            const existing = await prisma.performanceEvaluation.findUnique({
                where: {
                    employeeId_cycleId: {
                        employeeId: emp.id,
                        cycleId
                    }
                }
            });

            if (!existing) {
                await getOrCreateEvaluation(emp.id, cycleId);
                created++;
            }
        }

        revalidatePath('/avaliacao');
        return { success: true, created, total: employees.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
