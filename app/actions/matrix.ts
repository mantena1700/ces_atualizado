'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSalaryMatrix() {
    const [grades, steps, gridValues, jobRoles] = await Promise.all([
        prisma.salaryGrade.findMany({ orderBy: { name: 'asc' } }),
        prisma.salaryStep.findMany({ orderBy: { name: 'asc' } }),
        prisma.salaryGrid.findMany(),
        prisma.jobRole.findMany({ select: { id: true, title: true, gradeId: true } })
    ]);

    // Mapa de Valores: { "gradeId_stepId": 4500.00 }
    const matrix: Record<string, number> = {};
    gridValues.forEach(g => {
        matrix[`${g.gradeId}_${g.stepId}`] = Number(g.amount);
    });

    // Contagem de cargos por grade
    const roleCount: Record<string, number> = {};
    jobRoles.forEach(r => {
        if (r.gradeId) {
            roleCount[r.gradeId] = (roleCount[r.gradeId] || 0) + 1;
        }
    });

    return { grades, steps, matrix, roleCount };
}

// Atualizar uma célula individualmente
export async function updateMatrixCell(gradeId: string, stepId: string, amount: number) {
    try {
        const existing = await prisma.salaryGrid.findFirst({
            where: { gradeId, stepId }
        });

        if (existing) {
            await prisma.salaryGrid.update({
                where: { id: existing.id },
                data: { amount }
            });
        } else {
            await prisma.salaryGrid.create({
                data: { gradeId, stepId, amount }
            });
        }

        revalidatePath('/matriz');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Atualizar linha inteira (Step A define o resto com base na progressão)
export async function updateGradeRow(gradeId: string, baseAmount: number, progressionPercent: number = 5) {
    try {
        const steps = await prisma.salaryStep.findMany({ orderBy: { name: 'asc' } });

        const operations = steps.map((step, index) => {
            // Fórmula: Valor = Base * (1 + taxa)^index
            const amount = baseAmount * Math.pow(1 + (progressionPercent / 100), index);
            const roundedAmount = Math.round(amount * 100) / 100;

            return updateMatrixCell(gradeId, step.id, roundedAmount);
        });

        await Promise.all(operations);
        revalidatePath('/matriz');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

