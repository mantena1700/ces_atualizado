'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Buscar lista completa de cargos
export async function getJobRoles() {
    return await prisma.jobRole.findMany({
        orderBy: { title: 'asc' }
    });
}

// Criar novo cargo
export async function createJobRole(data: {
    title: string;
    department: string;
    area: string;
    cbo?: string;
    reportsToId?: string;
}) {
    try {
        await prisma.jobRole.create({
            data: {
                title: data.title,
                department: data.department,
                area: data.area,
                cbo: data.cbo,
                reportsToId: data.reportsToId && data.reportsToId !== 'none' ? data.reportsToId : null
            }
        });
        revalidatePath('/cargos');
        revalidatePath('/avaliacao');
        return { success: true };
    } catch (e: any) {
        console.error("Erro ao criar cargo:", e);
        return { success: false, error: e.message };
    }
}

export async function updateJobRole(id: string, data: {
    title: string;
    department: string;
    area?: string;
    cbo?: string;
    reportsToId?: string;
}) {
    try {
        await prisma.jobRole.update({
            where: { id },
            data: {
                title: data.title,
                department: data.department,
                area: data.area,
                cbo: data.cbo,
                reportsToId: data.reportsToId === 'none' ? null : data.reportsToId
            }
        });
        revalidatePath('/cargos');
        revalidatePath('/carreira');
        revalidatePath('/simulacoes');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteJobRole(id: string) {
    try {
        await prisma.jobRole.delete({ where: { id } });
        revalidatePath('/cargos');
        revalidatePath('/carreira');
        revalidatePath('/simulacoes');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}


