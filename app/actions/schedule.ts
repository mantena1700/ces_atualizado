'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Buscar todas as fases com o custo acumulado de cada uma
// Buscar todas as fases com o custo acumulado de cada uma
export async function getPhases() {
    const data = await prisma.implementationPhase.findMany({
        include: {
            employees: {
                select: {
                    id: true,
                    name: true,
                    salary: true,
                    jobRole: {
                        include: {
                            grade: {
                                include: {
                                    values: {
                                        include: { step: true },
                                        orderBy: { step: { name: 'asc' } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { targetDate: 'asc' }
    });

    // Converter Decimals para Numbers para evitar erro de serialização do Next.js
    return data.map(phase => ({
        ...phase,
        employees: phase.employees.map(emp => ({
            ...emp,
            salary: Number(emp.salary),
            jobRole: emp.jobRole ? {
                ...emp.jobRole,
                grade: emp.jobRole.grade ? {
                    ...emp.jobRole.grade,
                    values: emp.jobRole.grade.values.map(v => ({
                        ...v,
                        amount: Number(v.amount)
                    }))
                } : null
            } : null
        }))
    }));
}

export async function createPhase(data: { name: string, targetDate: string, description?: string }) {
    try {
        await prisma.implementationPhase.create({
            data: {
                name: data.name,
                targetDate: new Date(data.targetDate),
                description: data.description
            }
        });
        revalidatePath('/cronograma');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deletePhase(id: string) {
    try {
        // Desvincular funcionários antes de deletar a fase
        await prisma.employee.updateMany({
            where: { phaseId: id },
            data: { phaseId: null }
        });

        await prisma.implementationPhase.delete({ where: { id } });
        revalidatePath('/cronograma');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function assignToPhase(employeeIds: string[], phaseId: string | null) {
    try {
        await prisma.employee.updateMany({
            where: { id: { in: employeeIds } },
            data: { phaseId: phaseId }
        });
        revalidatePath('/cronograma');
        revalidatePath('/simulacoes');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
