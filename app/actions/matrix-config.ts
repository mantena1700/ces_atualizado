'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Atualizar configuração de uma Grade (Nome e Faixa de Pontos)
export async function updateGradeConfig(id: string, data: { name: string, minPoints: number, maxPoints: number }) {
    try {
        await prisma.salaryGrade.update({
            where: { id },
            data: {
                name: data.name,
                minPoints: data.minPoints,
                maxPoints: data.maxPoints
            }
        });
        revalidatePath('/matriz');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Criar nova Grade
export async function createGrade(data: { name: string, minPoints: number, maxPoints: number }) {
    try {
        await prisma.salaryGrade.create({
            data: {
                name: data.name,
                minPoints: data.minPoints,
                maxPoints: data.maxPoints
            }
        });
        revalidatePath('/matriz');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Remover Grade (Cuidado: Pode quebrar FKs se tiver cargos vinculados. Prisma cuidará disso com erros se não tiver cascade)
export async function deleteGrade(id: string) {
    try {
        // Verificar se tem cargos
        const jobsCount = await prisma.jobRole.count({ where: { gradeId: id } });
        if (jobsCount > 0) {
            return { success: false, error: `Não é possível excluir: Existem ${jobsCount} cargos nesta grade.` };
        }

        await prisma.salaryGrade.delete({ where: { id } });
        revalidatePath('/matriz');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// --- STEPS CONFIGURATION ---

export async function createStep(data: { name: string }) {
    try {
        await prisma.salaryStep.create({
            data: { name: data.name }
        });
        revalidatePath('/matriz');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateStep(id: string, name: string) {
    try {
        await prisma.salaryStep.update({
            where: { id },
            data: { name }
        });
        revalidatePath('/matriz');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteStep(id: string) {
    try {
        // Verificar se tem valores (opcional, mas bom pra limpeza)
        // Se deletar o step, o SalaryGrid vai reclamar se não tiver cascade delete configurado no schema ou lógica aqui.
        // Vamos deletar os valores associados a este step primeiro
        await prisma.salaryGrid.deleteMany({ where: { stepId: id } });

        await prisma.salaryStep.delete({ where: { id } });
        revalidatePath('/matriz');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

