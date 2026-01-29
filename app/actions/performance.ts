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
            cycleName: e.cycle.name,
            managerName: e.managerName // Added
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
                    manager: true, // Incluir gestor direto
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
                    // Auto-atribuir gestor se cadastrado na hierarquia
                    managerId: employee.managerId,
                    managerName: employee.manager?.name,
                    managerEmail: employee.manager?.email,
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

            // Se tem gestor, atribuir token automaticamente
            if (employee.managerId && employee.manager?.email) {
                await assignManagerToEvaluation(evaluation.id, {
                    name: employee.manager.name,
                    email: employee.manager.email,
                    id: employee.managerId
                });
            }
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

// ============================
// PORTAL DO GESTOR
// ============================

/**
 * Atribui um gestor responsável para avaliar um colaborador
 */
export async function assignManagerToEvaluation(
    evaluationId: string,
    manager: { name: string; email: string; id?: string }
) {
    try {
        const evaluation = await prisma.performanceEvaluation.findUnique({
            where: { id: evaluationId },
            include: { cycle: true }
        });

        if (!evaluation) {
            return { success: false, error: 'Avaliação não encontrada' };
        }

        // Calcular expiração do token (fim do ciclo + 7 dias)
        const tokenExpires = new Date(evaluation.cycle.endDate);
        tokenExpires.setDate(tokenExpires.getDate() + 7);

        // Criar ou atualizar assignment
        const assignment = await prisma.evaluationAssignment.upsert({
            where: { evaluationId },
            create: {
                cycleId: evaluation.cycleId,
                evaluationId,
                managerName: manager.name,
                managerEmail: manager.email,
                managerId: manager.id,
                tokenExpires,
                status: 'PENDING'
            },
            update: {
                managerName: manager.name,
                managerEmail: manager.email,
                managerId: manager.id,
                tokenExpires,
                status: 'PENDING'
            }
        });

        // Atualizar evaluation com dados do gestor
        await prisma.performanceEvaluation.update({
            where: { id: evaluationId },
            data: {
                managerName: manager.name,
                managerEmail: manager.email,
                managerId: manager.id
            }
        });

        revalidatePath('/avaliacao');
        return { success: true, assignment, accessToken: assignment.accessToken };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Atribui um gestor para múltiplas avaliações em lote
 */
export async function batchAssignManagers(
    evaluationIds: string[],
    manager: { name: string; email: string; id?: string }
) {
    try {
        let successCount = 0;
        let errors = [];

        for (const evalId of evaluationIds) {
            const result = await assignManagerToEvaluation(evalId, manager);
            if (result.success) {
                successCount++;
            } else {
                errors.push({ id: evalId, error: result.error });
            }
        }

        revalidatePath('/avaliacao');
        return {
            success: true,
            count: successCount,
            total: evaluationIds.length,
            errors
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Envia notificações em massa para os gestores das avaliações selecionadas
 */
export async function sendBatchNotifications(evaluationIds: string[]) {
    try {
        let sentCount = 0;
        let errors = [];

        for (const evalId of evaluationIds) {
            // Find evaluation with manager info
            const evaluation = await prisma.performanceEvaluation.findUnique({
                where: { id: evalId },
                include: { assignment: true }
            });

            if (!evaluation || !evaluation.managerEmail || !evaluation.assignment?.accessToken) {
                errors.push({ id: evalId, error: 'Dados incompletos para envio (email ou token ausente)' });
                continue;
            }

            // Simular envio de email (Aqui entraria a integração com Resend, SendGrid, etc)
            // Para MVP/Demo vamos apenas logar e marcar como enviado.
            console.log(`[EMAIL SIMULATION] Sending to ${evaluation.managerEmail} - Token: ${evaluation.assignment.accessToken}`);

            // Atualizar status no banco
            await prisma.performanceEvaluation.update({
                where: { id: evalId },
                data: {
                    lastEmailSentAt: new Date(),
                    emailStatus: 'SENT'
                }
            });
            sentCount++;
        }

        revalidatePath('/avaliacao');
        return { success: true, count: sentCount, errors };
    } catch (error: any) {
        console.error("Erro ao enviar notificações em massa:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Atualiza o feedback de uma avaliação (edição manual)
 */
export async function updateEvaluationFeedback(
    evaluationId: string,
    data: { feedback: string; strengths: string; improvements: string }
) {
    try {
        await prisma.performanceEvaluation.update({
            where: { id: evaluationId },
            data: {
                feedback: data.feedback,
                strengths: data.strengths,
                improvements: data.improvements
            }
        });

        revalidatePath('/avaliacao');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Erro ao atualizar feedback: ' + error.message };
    }
}

/**
 * Busca avaliação pelo token de acesso (Portal do Gestor)
 */
export async function getEvaluationByToken(token: string) {
    try {
        const assignment = await prisma.evaluationAssignment.findUnique({
            where: { accessToken: token },
            include: {
                evaluation: {
                    include: {
                        employee: {
                            include: {
                                jobRole: {
                                    include: {
                                        grade: true,
                                        competencies: {
                                            include: {
                                                competency: true,
                                                competencyLevel: true
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
                                    include: { levels: true }
                                }
                            }
                        }
                    }
                },
                cycle: true
            }
        });

        if (!assignment) {
            return { success: false, error: 'Token inválido ou expirado' };
        }

        if (new Date() > assignment.tokenExpires) {
            return { success: false, error: 'Token expirado' };
        }

        if (assignment.status === 'PENDING') {
            await prisma.evaluationAssignment.update({
                where: { id: assignment.id },
                data: {
                    status: 'STARTED',
                    startedAt: new Date()
                }
            });
        }

        // Sanitizar objeto (converter Decimal para number)
        const sanitizedAssignment = JSON.parse(JSON.stringify(assignment, (key, value) => {
            if (typeof value === 'object' && value !== null && 'd' in value && 'e' in value && 's' in value) {
                // Prisma Decimal object identification heuristic or just typical JSON behavior
                return Number(value);
            }
            // Better check for Prisma's specific Decimal behavior if available, 
            // but normally JSON.stringify keeps it as is unless .toJSON is called?
            // Wait, Prisma Decimal usually fails straightforward JSON.stringify in Server Components boundary if not handled.
            // But manually mapping is safer.
            return value;
        }));

        // Manual fix specifically for known Decimal fields
        if (sanitizedAssignment.evaluation?.employee?.salary) {
            sanitizedAssignment.evaluation.employee.salary = Number(assignment.evaluation.employee.salary);
        }
        // Also check department budget or others if present? No, just employee salary is likely the issue here.
        if (sanitizedAssignment.evaluation?.jobRole?.salaryGrid?.amount) {
            // Deep nested salary? No, JobRole does not have salary directly, but salaryGrid might.
            // The include chain was jobRole -> include grade/competencies. No salaryGrid included in view_file output.
        }

        return { success: true, data: sanitizedAssignment };
    } catch (error: any) {
        console.error('Erro ao buscar avaliação por token:', error);
        return { success: false, error: 'Erro ao carregar avaliação. ' + error.message };
    }
}

/**
 * Salva avaliação feita pelo gestor via portal
 */
export async function saveManagerEvaluation(
    token: string,
    data: {
        items: { id: string; managerScore: number; comments?: string }[];
        feedback: string;
        strengths: string;
        improvements: string;
        nextSteps?: string;
        trainingNeeds?: string;
        promotionReady?: boolean;
        timeToPromotion?: number;
        retentionRisk?: string;
    }
) {
    try {
        const assignment = await prisma.evaluationAssignment.findUnique({
            where: { accessToken: token },
            include: { evaluation: true }
        });

        if (!assignment) {
            return { success: false, error: 'Token inválido' };
        }

        if (new Date() > assignment.tokenExpires) {
            return { success: false, error: 'Token expirado' };
        }

        // Atualizar itens
        for (const item of data.items) {
            await prisma.evaluationItem.update({
                where: { id: item.id },
                data: {
                    managerScore: item.managerScore,
                    score: item.managerScore, // Usar nota do gestor como final
                    comments: item.comments
                }
            });
        }

        // Calcular nota final
        const allItems = await prisma.evaluationItem.findMany({
            where: { evaluationId: assignment.evaluationId }
        });

        let totalScore = 0;
        let totalWeight = 0;
        allItems.forEach((item: any) => {
            if (item.score !== null) {
                totalScore += item.score * item.weight;
                totalWeight += item.weight;
            }
        });
        const finalScore = totalWeight > 0 ? (totalScore / totalWeight) : null;

        // Atualizar avaliação
        await prisma.performanceEvaluation.update({
            where: { id: assignment.evaluationId },
            data: {
                status: 'SUBMITTED',
                finalScore,
                feedback: data.feedback,
                strengths: data.strengths,
                improvements: data.improvements,
                nextSteps: data.nextSteps,
                trainingNeeds: data.trainingNeeds,
                promotionReady: data.promotionReady || false,
                timeToPromotion: data.timeToPromotion,
                retentionRisk: data.retentionRisk,
                managerEvaluationDate: new Date()
            }
        });

        // Marcar assignment como completo
        await prisma.evaluationAssignment.update({
            where: { id: assignment.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        revalidatePath('/avaliacao');
        return { success: true, finalScore };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================
// ENVIO DE RESULTADO AO COLABORADOR
// ============================

/**
 * Marca a avaliação como enviada ao colaborador
 */
export async function sendResultToEmployee(evaluationId: string) {
    try {
        await prisma.performanceEvaluation.update({
            where: { id: evaluationId },
            data: {
                sentToEmployee: true,
                sentAt: new Date()
            }
        });

        revalidatePath('/avaliacao');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Marca que o colaborador visualizou o resultado
 */
export async function markAsViewedByEmployee(evaluationId: string) {
    try {
        await prisma.performanceEvaluation.update({
            where: { id: evaluationId },
            data: {
                employeeViewed: true,
                employeeViewedAt: new Date()
            }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================
// HISTÓRICO E COMPARATIVOS
// ============================

/**
 * Busca histórico de avaliações de um colaborador
 */
export async function getEmployeeEvaluationHistory(employeeId: string) {
    try {
        const evaluations = await prisma.performanceEvaluation.findMany({
            where: {
                employeeId,
                finalScore: { not: null }
            },
            include: {
                cycle: true,
                items: {
                    include: {
                        competency: true
                    }
                }
            },
            orderBy: { cycle: { startDate: 'asc' } }
        });

        // Mapear para estrutura de gráfico
        const history = evaluations.map(e => ({
            cycleId: e.cycleId,
            cycleName: e.cycle.name,
            date: e.cycle.endDate,
            finalScore: e.finalScore,
            status: e.status,
            competencies: e.items.map((i: any) => ({
                name: i.competency?.name || 'Item',
                score: i.score,
                category: i.competency?.category
            }))
        }));

        // Calcular evolução
        let evolution = 0;
        if (history.length >= 2) {
            const last = history[history.length - 1].finalScore || 0;
            const previous = history[history.length - 2].finalScore || 0;
            evolution = last - previous;
        }

        return {
            success: true,
            history,
            evolution,
            totalEvaluations: history.length
        };
    } catch (error: any) {
        return { success: false, error: error.message, history: [], evolution: 0, totalEvaluations: 0 };
    }
}

/**
 * Gera insights avançados para um colaborador específico
 */
export async function getEmployeeInsights(evaluationId: string) {
    try {
        const evaluation = await prisma.performanceEvaluation.findUnique({
            where: { id: evaluationId },
            include: {
                employee: {
                    include: {
                        jobRole: {
                            include: {
                                grade: true,
                                nextMoves: {
                                    include: {
                                        toRole: {
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
                                },
                                competencies: {
                                    include: {
                                        competency: true,
                                        competencyLevel: true
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
                },
                cycle: true
            }
        });

        if (!evaluation) {
            return { success: false, error: 'Avaliação não encontrada' };
        }

        // Identificar gaps (competências abaixo do esperado)
        const gaps: { competency: string; expected: number; actual: number; gap: number }[] = [];
        const strengths: { competency: string; score: number }[] = [];

        evaluation.items.forEach((item: any) => {
            if (item.score !== null) {
                const expectedLevel = evaluation.employee.jobRole?.competencies?.find(
                    (jc: any) => jc.competencyId === item.competencyId
                );
                const expectedScore = expectedLevel?.competencyLevel?.level || 3;

                if (item.score < expectedScore) {
                    gaps.push({
                        competency: item.competency?.name || 'Competência',
                        expected: expectedScore,
                        actual: item.score,
                        gap: expectedScore - item.score
                    });
                } else if (item.score >= 4) {
                    strengths.push({
                        competency: item.competency?.name || 'Competência',
                        score: item.score
                    });
                }
            }
        });

        // Próximos passos de carreira
        const nextRoles = evaluation.employee.jobRole?.nextMoves?.map((move: any) => {
            // Calcular readiness baseado nas competências
            const targetCompetencies = move.toRole.competencies || [];
            let totalMatch = 0;
            let totalRequired = targetCompetencies.length;

            targetCompetencies.forEach((tc: any) => {
                const currentScore = evaluation.items.find(
                    (i: any) => i.competencyId === tc.competencyId
                )?.score || 0;
                const requiredLevel = tc.competencyLevel?.level || 3;

                if (currentScore >= requiredLevel) {
                    totalMatch++;
                }
            });

            const readiness = totalRequired > 0 ? Math.round((totalMatch / totalRequired) * 100) : 0;

            return {
                roleId: move.toRole.id,
                roleName: move.toRole.title,
                readiness,
                requirements: move.requirements
            };
        }) || [];

        // Sugestões de treinamento baseadas nos gaps
        const trainingSuggestions = gaps.slice(0, 3).map(g => ({
            area: g.competency,
            priority: g.gap >= 2 ? 'Alta' : 'Média',
            suggestion: `Desenvolver ${g.competency} (gap de ${g.gap} pontos)`
        }));

        // Calcular tempo estimado para promoção
        const avgScore = evaluation.finalScore || 0;
        let timeToPromotion = null;
        if (avgScore >= 4.5 && gaps.length === 0) {
            timeToPromotion = 3; // 3 meses
        } else if (avgScore >= 4) {
            timeToPromotion = 6; // 6 meses
        } else if (avgScore >= 3.5) {
            timeToPromotion = 12; // 12 meses
        } else {
            timeToPromotion = 24; // 24 meses ou mais
        }

        return {
            success: true,
            insights: {
                finalScore: evaluation.finalScore,
                status: evaluation.status,
                gaps: gaps.sort((a, b) => b.gap - a.gap),
                strengths: strengths.sort((a, b) => b.score - a.score),
                nextRoles,
                trainingSuggestions,
                timeToPromotion,
                promotionReady: avgScore >= 4.5 && gaps.length === 0,
                retentionRisk: avgScore < 3 ? 'HIGH' : avgScore < 4 ? 'MEDIUM' : 'LOW'
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================
// BUSCAR GESTORES DISPONÍVEIS
// ============================

/**
 * Lista funcionários que podem ser gestores (têm subordinados ou são de cargo >300 pontos)
 */
export async function getAvailableManagers() {
    try {
        const managers = await prisma.employee.findMany({
            where: {
                OR: [
                    { jobRole: { subordinates: { some: {} } } },
                    { jobRole: { totalPoints: { gte: 300 } } }
                ]
            },
            include: {
                jobRole: true
            },
            orderBy: { name: 'asc' }
        });

        return managers.map(m => ({
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.jobRole?.title || 'Sem cargo',
            department: m.jobRole?.department
        }));
    } catch (error) {
        console.error('Erro ao buscar gestores:', error);
        return [];
    }
}

/**
 * Lista todas as atribuições de avaliação pendentes para gestores
 */
export async function getPendingAssignments(cycleId?: string) {
    try {
        const assignments = await prisma.evaluationAssignment.findMany({
            where: {
                status: { in: ['PENDING', 'STARTED'] },
                ...(cycleId ? { cycleId } : {})
            },
            include: {
                evaluation: {
                    include: {
                        employee: {
                            include: { jobRole: true }
                        }
                    }
                },
                cycle: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return assignments.map(a => ({
            id: a.id,
            evaluationId: a.evaluationId,
            employeeName: a.evaluation.employee.name,
            employeeRole: a.evaluation.employee.jobRole?.title,
            managerName: a.managerName,
            managerEmail: a.managerEmail,
            cycleName: a.cycle.name,
            status: a.status,
            accessToken: a.accessToken,
            tokenExpires: a.tokenExpires,
            startedAt: a.startedAt,
            createdAt: a.createdAt
        }));
    } catch (error) {
        console.error('Erro ao buscar atribuições:', error);
        return [];
    }
}
