'use server';

import { prisma } from '@/lib/prisma';

// Taxa média de encargos para CLT (FGTS, INSS Patronal, etc)
const CLT_TAX_RATE = 0.28;

export async function calculateEnquadramento() {
    // 1. Buscar configurações globais de taxas (TaxSettings)
    // Precisamos disso para calcular o custo real, não apenas um fixo de 28%
    // @ts-ignore
    const configs = await prisma.systemConfig.findMany({
        where: {
            OR: [
                { category: 'TAXES' },
                { key: { startsWith: 'TAX_' } }
            ]
        }
    });

    // Processar taxas em memória para acesso rápido
    const taxSettings = configs.map((c: any) => ({
        key: c.key,
        value: Number(c.value),
        category: c.key.includes('_PJ_') ? 'PJ' : 'CLT'
    }));

    // Calcular taxas totais por categoria
    const totalTaxRateCLT = taxSettings
        .filter((t: any) => t.category === 'CLT')
        .reduce((acc: number, curr: any) => acc + curr.value, 0) / 100;

    const totalTaxRatePJ = taxSettings
        .filter((t: any) => t.category === 'PJ')
        .reduce((acc: number, curr: any) => acc + curr.value, 0) / 100;

    const employees = await prisma.employee.findMany({
        include: {
            // @ts-ignore
            benefits: { include: { benefit: true } },
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
    });

    const allGrades = await prisma.salaryGrade.findMany({
        include: {
            values: {
                include: { step: true },
                orderBy: { step: { name: 'asc' } }
            }
        }
    });

    const report = employees.map((emp: any) => {
        const salaryAtual = Number(emp.salary) || 0;
        const role = emp.jobRole;
        const hiringType = emp.hiringType || 'CLT';

        // Calcular Benefícios Atuais
        let benefitsTotal = 0;
        if (emp.benefits) {
            emp.benefits.forEach((eb: any) => {
                const b = eb.benefit;
                if (b.type === 'FIXED') {
                    benefitsTotal += Number(b.value);
                } else {
                    benefitsTotal += (salaryAtual * (Number(b.value) / 100));
                }
            });
        }

        // Calcular Encargos (Dinâmico baseados nas configs)
        const taxRate = hiringType === 'CLT' ? totalTaxRateCLT : totalTaxRatePJ;
        const taxesAtual = salaryAtual * taxRate;
        const totalCostAtual = salaryAtual + taxesAtual + benefitsTotal;

        // Tabela Salarial / Grade
        let grade = role?.grade;
        if (!grade && role?.totalPoints) {
            grade = allGrades.find(g =>
                role.totalPoints >= (g.minPoints || 0) &&
                role.totalPoints <= (g.maxPoints || 99999)
            ) as any;
        }

        if (!grade || !grade.values.length) {
            return {
                id: emp.id,
                name: emp.name,
                jobTitle: role?.title || 'Sem Cargo',
                salaryAtual,
                totalCostAtual,
                hiringType,
                benefitsTotal,
                status: 'Sem Tabela',
                proposedSalary: salaryAtual,
                totalCostProposto: totalCostAtual,
                proposedStep: 'N/A',
                gap: 0,
                points: role?.totalPoints || 0,
                gradeName: 'N/A',
                jobArea: role?.area || '',
                totalGap: 0,
                proposedStepName: 'N/A'
            };
        }

        const steps = grade.values;
        const stepA = Number(steps[0].amount);
        const lastStep = Number(steps[steps.length - 1].amount);

        let proposedSalary = salaryAtual;
        let proposedStepName = 'Atual';
        let status = 'OK';
        let gap = 0;

        if (salaryAtual < stepA) {
            status = 'Abaixo da Tabela';
            proposedSalary = stepA;
            proposedStepName = steps[0].step.name;
            gap = stepA - salaryAtual;
        } else if (salaryAtual > lastStep) {
            status = 'Excedente';
            proposedSalary = salaryAtual;
            proposedStepName = 'Teto';
            gap = 0;
        } else {
            let currentStep = steps[0];
            for (const s of steps) {
                if (Number(s.amount) <= salaryAtual) currentStep = s;
                else break;
            }
            status = 'Em Enquadramento';
            proposedSalary = salaryAtual;
            proposedStepName = currentStep.step.name;
            gap = 0;
        }

        // Custo Proposto (Recalcular com novo salário)
        const taxesProposto = proposedSalary * taxRate;

        // Recalcular benefícios variáveis sobre o novo salário se necessário
        let benefitsTotalProposto = 0;
        if (emp.benefits) {
            emp.benefits.forEach((eb: any) => {
                const b = eb.benefit;
                benefitsTotalProposto += b.type === 'FIXED' ? Number(b.value) : (proposedSalary * (Number(b.value) / 100));
            });
        }
        const totalCostProposto = proposedSalary + taxesProposto + benefitsTotalProposto;

        return {
            id: emp.id,
            name: emp.name,
            jobTitle: role?.title,
            jobArea: role?.area || '',
            gradeName: grade.name,
            hiringType,
            salaryAtual,
            totalCostAtual,
            benefitsTotal,
            proposedSalary,
            totalCostProposto,
            proposedStep: proposedStepName,
            status,
            gap, // Gap nominal de salário
            totalGap: totalCostProposto - totalCostAtual, // Gap real de custo empresa
            points: role?.totalPoints || 0
        };
    });

    const totalAtualReal = report.reduce((acc, curr) => acc + curr.totalCostAtual, 0);
    const totalPropostoReal = report.reduce((acc, curr) => acc + curr.totalCostProposto, 0);
    const totalGapReal = report.reduce((acc, curr) => acc + curr.totalGap, 0);

    return {
        summary: {
            totalEmployees: report.length,
            payrollAtual: report.reduce((acc, curr) => acc + curr.salaryAtual, 0),
            totalCostAtual: totalAtualReal,
            totalCostProposto: totalPropostoReal,
            totalImpactReal: totalGapReal,
            impactPercentage: totalAtualReal > 0 ? (totalGapReal / totalAtualReal) * 100 : 0,
            countAbaixo: report.filter(r => r.status === 'Abaixo da Tabela').length,
            countExcedente: report.filter(r => r.status === 'Excedente').length
        },
        data: report
    };
}
