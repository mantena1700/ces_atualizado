'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getTaxSettings } from './settings';

// ============================
// TIPOS E INTERFACES
// ============================

export interface BudgetPlanDTO {
    id: string;
    name: string;
    description: string | null;
    periodType: string;
    year: number;
    semester: number | null;
    quarter: number | null;
    month: number | null;
    status: string;
    totalBudget: number;
    totalHeadcount: number;
    itemsCount: number;
    createdAt: Date;
}

export interface BudgetPlanItemDTO {
    id: string;
    department: string;
    plannedBudget: number;
    plannedHeadcount: number;
    notes: string | null;
    // Dados Reais (calculados)
    actualBudget: number;
    actualHeadcount: number;
    budgetVariance: number; // Diferença (Planejado - Real)
    headcountVariance: number;
    status: 'ok' | 'warning' | 'danger';
}

export interface BudgetPlanDetailDTO extends BudgetPlanDTO {
    items: BudgetPlanItemDTO[];
    // Totais Reais
    totalActualBudget: number;
    totalActualHeadcount: number;
    overallVariance: number; // Variância total
}

// ============================
// FUNÇÕES DE LEITURA
// ============================

/**
 * Lista todos os planos orçamentários
 */
export async function getBudgetPlans(): Promise<BudgetPlanDTO[]> {
    // @ts-ignore
    const plans = await prisma.budgetPlan.findMany({
        include: {
            _count: { select: { items: true } }
        },
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }]
    });

    return plans.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        periodType: p.periodType,
        year: p.year,
        semester: p.semester,
        quarter: p.quarter,
        month: p.month,
        status: p.status,
        totalBudget: Number(p.totalBudget),
        totalHeadcount: p.totalHeadcount,
        itemsCount: p._count.items,
        createdAt: p.createdAt
    }));
}

/**
 * Obtém detalhes de um plano específico com comparativo Real vs Planejado
 */
export async function getBudgetPlanDetails(planId: string): Promise<BudgetPlanDetailDTO | null> {
    // @ts-ignore
    const plan = await prisma.budgetPlan.findUnique({
        where: { id: planId },
        include: { items: true }
    });

    if (!plan) return null;

    // Carregar dados reais (funcionários e custos)
    const realData = await calculateRealData();

    // Mapear itens com comparativo
    const items: BudgetPlanItemDTO[] = plan.items.map((item: any) => {
        const real = realData.get(item.department) || { headcount: 0, totalCost: 0 };
        const plannedBudget = Number(item.plannedBudget);
        const budgetVariance = plannedBudget - real.totalCost;
        const headcountVariance = item.plannedHeadcount - real.headcount;

        let status: 'ok' | 'warning' | 'danger' = 'ok';
        if (real.totalCost > plannedBudget && plannedBudget > 0) status = 'danger';
        else if (real.totalCost > plannedBudget * 0.9 && plannedBudget > 0) status = 'warning';

        return {
            id: item.id,
            department: item.department,
            plannedBudget,
            plannedHeadcount: item.plannedHeadcount,
            notes: item.notes,
            actualBudget: real.totalCost,
            actualHeadcount: real.headcount,
            budgetVariance,
            headcountVariance,
            status
        };
    });

    // Calcular totais
    const totalActualBudget = items.reduce((acc, i) => acc + i.actualBudget, 0);
    const totalActualHeadcount = items.reduce((acc, i) => acc + i.actualHeadcount, 0);
    const totalPlannedBudget = items.reduce((acc, i) => acc + i.plannedBudget, 0);

    return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        periodType: plan.periodType,
        year: plan.year,
        semester: plan.semester,
        quarter: plan.quarter,
        month: plan.month,
        status: plan.status,
        totalBudget: totalPlannedBudget,
        totalHeadcount: items.reduce((acc, i) => acc + i.plannedHeadcount, 0),
        itemsCount: items.length,
        createdAt: plan.createdAt,
        items,
        totalActualBudget,
        totalActualHeadcount,
        overallVariance: totalPlannedBudget - totalActualBudget
    };
}

/**
 * Função auxiliar para calcular dados reais por departamento
 */
async function calculateRealData(): Promise<Map<string, { headcount: number; totalCost: number }>> {
    const taxes = await getTaxSettings();
    const cltTaxes = taxes.filter(t => t.category === 'CLT').reduce((acc, t) => acc + t.value, 0) / 100;
    const pjTaxes = taxes.filter(t => t.category === 'PJ').reduce((acc, t) => acc + t.value, 0) / 100;

    const employees = await prisma.employee.findMany({
        include: {
            jobRole: true,
            benefits: { include: { benefit: true } }
        }
    });

    const realData = new Map<string, { headcount: number; totalCost: number }>();

    employees.forEach((emp: any) => {
        const dept = emp.jobRole?.department || 'Sem Departamento';
        const salary = Number(emp.salary) || 0;
        const taxRate = (emp.hiringType === 'PJ') ? pjTaxes : cltTaxes;

        let benefitsCost = 0;
        if (emp.benefits) {
            emp.benefits.forEach((b: any) => {
                const ben = b.benefit || b;
                if (ben.type === 'FIXED') benefitsCost += Number(ben.value);
                else benefitsCost += salary * (Number(ben.value) / 100);
            });
        }

        const totalCost = salary * (1 + taxRate) + benefitsCost;

        const current = realData.get(dept) || { headcount: 0, totalCost: 0 };
        realData.set(dept, {
            headcount: current.headcount + 1,
            totalCost: current.totalCost + totalCost
        });
    });

    return realData;
}

/**
 * Lista todos os departamentos disponíveis (para preencher dropdowns)
 */
export async function getAvailableDepartments(): Promise<string[]> {
    const roles = await prisma.jobRole.findMany({
        select: { department: true },
        distinct: ['department']
    });

    const depts = roles
        .map((r: any) => r.department)
        .filter(Boolean) as string[];

    // Adiciona "Sem Departamento" se houver funcionários sem cargo
    const employeesWithoutDept = await prisma.employee.count({
        where: { jobRole: null }
    });

    if (employeesWithoutDept > 0) depts.push('Sem Departamento');

    return [...new Set(depts)].sort();
}

// ============================
// FUNÇÕES DE ESCRITA (CRUD)
// ============================

/**
 * Cria um novo plano orçamentário
 */
export async function createBudgetPlan(data: {
    name: string;
    description?: string;
    periodType: 'ANNUAL' | 'SEMESTER' | 'QUARTER' | 'MONTHLY';
    year: number;
    semester?: number;
    quarter?: number;
    month?: number;
}) {
    try {
        // @ts-ignore
        const plan = await prisma.budgetPlan.create({
            data: {
                name: data.name,
                description: data.description,
                periodType: data.periodType,
                year: data.year,
                semester: data.semester,
                quarter: data.quarter,
                month: data.month,
                status: 'DRAFT'
            }
        });

        revalidatePath('/orcamento');
        return { success: true, planId: plan.id };
    } catch (error: any) {
        console.error('Erro ao criar plano:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Atualiza dados básicos do plano
 */
export async function updateBudgetPlan(planId: string, data: {
    name?: string;
    description?: string;
    status?: 'DRAFT' | 'APPROVED' | 'CLOSED';
}) {
    try {
        // @ts-ignore
        await prisma.budgetPlan.update({
            where: { id: planId },
            data
        });

        revalidatePath('/orcamento');
        revalidatePath(`/orcamento/${planId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Adiciona ou atualiza um item (departamento) no plano
 */
export async function upsertBudgetPlanItem(planId: string, data: {
    department: string;
    plannedBudget: number;
    plannedHeadcount: number;
    notes?: string;
}) {
    try {
        // @ts-ignore
        await prisma.budgetPlanItem.upsert({
            where: {
                planId_department: {
                    planId,
                    department: data.department
                }
            },
            create: {
                planId,
                department: data.department,
                plannedBudget: data.plannedBudget,
                plannedHeadcount: data.plannedHeadcount,
                notes: data.notes
            },
            update: {
                plannedBudget: data.plannedBudget,
                plannedHeadcount: data.plannedHeadcount,
                notes: data.notes
            }
        });

        // Recalcular totais do plano
        await recalculatePlanTotals(planId);

        revalidatePath('/orcamento');
        revalidatePath(`/orcamento/${planId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Remove um item do plano
 */
export async function deleteBudgetPlanItem(itemId: string) {
    try {
        // @ts-ignore
        const item = await prisma.budgetPlanItem.delete({
            where: { id: itemId }
        });

        await recalculatePlanTotals(item.planId);

        revalidatePath('/orcamento');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Exclui um plano inteiro
 */
export async function deleteBudgetPlan(planId: string) {
    try {
        // @ts-ignore
        await prisma.budgetPlan.delete({
            where: { id: planId }
        });

        revalidatePath('/orcamento');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Recalcula totais do plano (helper)
 */
async function recalculatePlanTotals(planId: string) {
    // @ts-ignore
    const items = await prisma.budgetPlanItem.findMany({
        where: { planId }
    });

    const totalBudget = items.reduce((acc: number, i: any) => acc + Number(i.plannedBudget), 0);
    const totalHeadcount = items.reduce((acc: number, i: any) => acc + i.plannedHeadcount, 0);

    // @ts-ignore
    await prisma.budgetPlan.update({
        where: { id: planId },
        data: { totalBudget, totalHeadcount }
    });
}

/**
 * Duplica um plano existente (para criar novo baseado em anterior)
 */
export async function duplicateBudgetPlan(planId: string, newName: string, newYear: number) {
    try {
        // @ts-ignore
        const original = await prisma.budgetPlan.findUnique({
            where: { id: planId },
            include: { items: true }
        });

        if (!original) return { success: false, error: 'Plano não encontrado' };

        // @ts-ignore
        const newPlan = await prisma.budgetPlan.create({
            data: {
                name: newName,
                description: `Baseado em: ${original.name}`,
                periodType: original.periodType,
                year: newYear,
                semester: original.semester,
                quarter: original.quarter,
                month: original.month,
                status: 'DRAFT',
                totalBudget: original.totalBudget,
                totalHeadcount: original.totalHeadcount,
                items: {
                    create: original.items.map((item: any) => ({
                        department: item.department,
                        plannedBudget: item.plannedBudget,
                        plannedHeadcount: item.plannedHeadcount,
                        notes: item.notes
                    }))
                }
            }
        });

        revalidatePath('/orcamento');
        return { success: true, planId: newPlan.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
