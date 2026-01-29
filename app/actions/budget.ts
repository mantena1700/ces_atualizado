'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getTaxSettings } from './settings'; // Reutilizando logic

export interface BudgetOverviewItem {
    department: string;
    headcountTarget: number;
    headcountActual: number;
    headcountGap: number;
    budgetTarget: number;
    budgetActual: number;
    budgetGap: number;
    status: 'ok' | 'warning' | 'danger';
}

export async function getBudgetOverview(year: number = new Date().getFullYear()) {
    // 1. Carregar Configurações de Taxas
    const taxes = await getTaxSettings();
    const cltTaxes = taxes.filter(t => t.category === 'CLT').reduce((acc, t) => acc + t.value, 0) / 100;
    const pjTaxes = taxes.filter(t => t.category === 'PJ').reduce((acc, t) => acc + t.value, 0) / 100;

    // 2. Carregar Metas do Banco
    // @ts-ignore
    const budgets = await prisma.departmentBudget.findMany({
        where: { year }
    });

    // 3. Carregar Dados Reais (Colaboradores)
    const employees = await prisma.employee.findMany({
        include: {
            jobRole: true,
            benefits: { include: { benefit: true } }
        }
    });

    // 4. Agrupar Dados Reais por Departamento
    const realData = new Map<string, { headcount: number; totalCost: number }>();

    employees.forEach((emp: any) => {
        const dept = emp.jobRole?.department || 'Sem Departamento';

        // Calcular Custo Total Individual
        const salary = Number(emp.salary) || 0;
        const taxRate = (emp.hiringType === 'PJ') ? pjTaxes : cltTaxes; // Default CLT

        let benefitsCost = 0;
        if (emp.benefits) {
            emp.benefits.forEach((b: any) => {
                const ben = b.benefit || b; // Fallback
                if (ben.type === 'FIXED') benefitsCost += Number(ben.value);
                else benefitsCost += salary * (Number(ben.value) / 100);
            });
        }

        const totalCost = salary * (1 + taxRate) + benefitsCost;

        // Somar ao acumulador do departamento
        const current = realData.get(dept) || { headcount: 0, totalCost: 0 };
        realData.set(dept, {
            headcount: current.headcount + 1,
            totalCost: current.totalCost + totalCost
        });
    });

    // 5. Cruzar Tudo (Metas vs Real)
    // Lista unificada de todos os departamentos que existem (com meta OU com gente)
    // @ts-ignore
    const allDepts = new Set([...budgets.map((b: any) => b.department), ...realData.keys()]);

    const overview: BudgetOverviewItem[] = [];

    allDepts.forEach((dept: any) => {
        // @ts-ignore
        const meta = budgets.find((b: any) => b.department === dept);
        const real = realData.get(dept) || { headcount: 0, totalCost: 0 };

        const targetMoney = meta ? Number(meta.monthlyBudget) : 0;
        const targetHeadcount = meta ? meta.headcountLimit : 0;

        // Gap: Se positivo, está sobrando. Se negativo, estourou.
        // Mas visualmente, "Gap" geralmente é o desvio. Vamos usar: Real - Meta (Excesso) ou Meta - Real (Disponível).
        // Vamos padronizar: Disponível (budget - real). Se negativo, estourou.
        const budgetGap = targetMoney - real.totalCost;
        const headcountGap = targetHeadcount - real.headcount;

        // Status
        let status: 'ok' | 'warning' | 'danger' = 'ok';
        if (real.totalCost > targetMoney && targetMoney > 0) status = 'danger';
        else if (real.totalCost > targetMoney * 0.9 && targetMoney > 0) status = 'warning';

        overview.push({
            department: dept,
            headcountTarget: targetHeadcount,
            headcountActual: real.headcount,
            headcountGap,
            budgetTarget: targetMoney,
            budgetActual: real.totalCost,
            budgetGap,
            status
        });
    });

    return overview.sort((a, b) => b.budgetActual - a.budgetActual);
}

export async function saveDepartmentBudget(data: {
    department: string;
    year: number;
    monthlyBudget: number;
    headcountLimit: number;
}) {
    try {
        // @ts-ignore
        await prisma.departmentBudget.upsert({
            where: {
                department_year: {
                    department: data.department,
                    year: data.year
                }
            },
            create: {
                department: data.department,
                year: data.year,
                monthlyBudget: data.monthlyBudget,
                headcountLimit: data.headcountLimit
            },
            update: {
                monthlyBudget: data.monthlyBudget,
                headcountLimit: data.headcountLimit
            }
        });
        revalidatePath('/orcamento');
        return { success: true };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}
