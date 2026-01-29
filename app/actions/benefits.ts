'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Buscar todos os benefícios
export async function getBenefits() {
    try {
        if (!prisma.benefit) {
            console.error("ERRO: Modelo 'benefit' não encontrado no Prisma Client.");
            return [];
        }
        const benefits = await prisma.benefit.findMany({
            orderBy: { name: 'asc' }
        });

        // Converter Decimal para Number
        return benefits.map(b => ({
            ...b,
            value: Number(b.value)
        }));
    } catch (error) {
        console.error('Erro ao buscar benefícios:', error);
        return [];
    }
}

// Salvar/Criar Benefício (Upsert)
export async function upsertBenefit(data: { id?: string, name: string, type: string, value: number, description?: string }) {
    try {
        if (data.id) {
            await prisma.benefit.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    type: data.type,
                    value: data.value,
                    description: data.description
                }
            });
        } else {
            await prisma.benefit.create({
                data: {
                    name: data.name,
                    type: data.type,
                    value: data.value,
                    description: data.description
                }
            });
        }
        revalidatePath('/configuracoes');
        return { success: true };
    } catch (error: any) {
        console.error('Erro ao salvar benefício:', error);
        return { success: false, error: error.message };
    }
}

// Deletar Benefício
export async function deleteBenefit(id: string) {
    try {
        await prisma.benefit.delete({ where: { id } });
        revalidatePath('/configuracoes');
        return { success: true };
    } catch (error: any) {
        console.error('Erro ao deletar benefício:', error);
        return { success: false, error: error.message };
    }
}

// Vincular Benefícios ao Funcionário
export async function updateEmployeeBenefits(employeeId: string, benefitIds: string[]) {
    try {
        // Remove vínculos antigos
        await prisma.employeeBenefit.deleteMany({
            where: { employeeId }
        });

        // Cria novos vínculos
        if (benefitIds.length > 0) {
            await Promise.all(
                benefitIds.map(id =>
                    prisma.employeeBenefit.create({
                        data: {
                            employeeId,
                            benefitId: id
                        }
                    })
                )
            );
        }

        revalidatePath('/colaboradores');
        return { success: true };
    } catch (error: any) {
        console.error('Erro ao vincular benefícios:', error);
        return { success: false, error: error.message };
    }
}
