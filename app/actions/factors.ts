'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getFactors() {
    try {
        const factors = await prisma.factor.findMany({
            include: {
                levels: {
                    orderBy: { level: 'asc' }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        return factors;
    } catch (error) {
        console.error("Erro ao buscar fatores:", error);
        return [];
    }
}

export async function createFactor(data: { name: string; description?: string; weight: number }) {
    try {
        await prisma.factor.create({
            data: {
                name: data.name,
                description: data.description,
                weight: data.weight
            }
        });
        revalidatePath('/configuracoes');
        revalidatePath('/avaliacao');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateFactor(id: string, data: { name: string; description?: string; weight: number }) {
    try {
        await prisma.factor.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                weight: data.weight
            }
        });
        revalidatePath('/configuracoes');
        revalidatePath('/avaliacao');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteFactor(id: string) {
    try {
        await prisma.factor.delete({
            where: { id }
        });
        revalidatePath('/configuracoes');
        revalidatePath('/avaliacao');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// NIVEIS
export async function createFactorLevel(factorId: string, data: { description: string; points: number; level: number }) {
    try {
        await prisma.factorLevel.create({
            data: {
                factorId,
                description: data.description,
                points: data.points,
                level: data.level
            }
        });
        revalidatePath('/configuracoes');
        revalidatePath('/avaliacao');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteFactorLevel(id: string) {
    try {
        await prisma.factorLevel.delete({
            where: { id }
        });
        revalidatePath('/configuracoes');
        revalidatePath('/avaliacao');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
