'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Aplica um reajuste percentual em TODA a tabela salarial
export async function applyGeneralIncrease(percentage: number) {
    try {
        if (isNaN(percentage) || percentage === 0) return { success: false, error: 'Percentual inválido' };

        const multiplier = 1 + (percentage / 100);

        // Buscar todos os valores atuais
        const grids = await prisma.salaryGrid.findMany();

        // Atualizar em lote (Promise.all)
        const updates = grids.map(grid => {
            const newAmount = Math.round(Number(grid.amount) * multiplier * 100) / 100; // Arredondar 2 casas
            return prisma.salaryGrid.update({
                where: { id: grid.id },
                data: { amount: newAmount }
            });
        });

        await Promise.all(updates);
        revalidatePath('/matriz');

        return { success: true, count: updates.length };
    } catch (e: any) {
        console.error("Erro no reajuste:", e);
        return { success: false, error: e.message };
    }
}
