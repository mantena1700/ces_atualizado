'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSalaryGrades() {
    try {
        const grades = await prisma.salaryGrade.findMany({
            orderBy: { name: 'asc' },
            include: {
                values: {
                    include: { step: true }
                }
            }
        });
        return grades;
    } catch (error) {
        console.error('Erro ao buscar grades salariais:', error);
        return [];
    }
}

export async function getSalarySteps() {
    try {
        const steps = await prisma.salaryStep.findMany({
            orderBy: { name: 'asc' }
        });
        return steps;
    } catch (error) {
        console.error('Erro ao buscar steps salariais:', error);
        return [];
    }
}

export async function getSalaryTable() {
    try {
        const grades = await getSalaryGrades();
        const steps = await getSalarySteps();

        // Formatar para fácil consumo no front
        return { grades, steps };
    } catch (error) {
        return { grades: [], steps: [] };
    }
}
