'use server';

import { prisma } from '@/lib/prisma';
import { getTaxSettings } from './settings';

// ============================
// TIPOS
// ============================

export interface PolicyOverview {
    // Resumo Geral
    totalEmployees: number;
    totalRoles: number;
    totalDepartments: string[];
    totalGrades: number;
    totalSteps: number;

    // Estrutura Salarial
    salaryRange: {
        min: number;
        max: number;
    };
    averageSalary: number;

    // Encargos
    taxes: {
        clt: { label: string; value: number }[];
        pj: { label: string; value: number }[];
        totalCLT: number;
        totalPJ: number;
    };

    // Benefícios
    benefits: {
        id: string;
        name: string;
        type: string;
        value: number;
        employeesCount: number;
    }[];

    // Grades e Steps (Matriz)
    grades: {
        id: string;
        name: string;
        minPoints: number;
        maxPoints: number;
        rolesCount: number;
    }[];

    steps: {
        id: string;
        name: string;
        percentage: number | null;
    }[];

    // Matriz de Valores
    salaryMatrix: {
        gradeId: string;
        gradeName: string;
        values: { stepId: string; stepName: string; amount: number }[];
    }[];

    // Fatores de Avaliação
    factors: {
        id: string;
        name: string;
        description: string | null;
        weight: number;
        levelsCount: number;
        levels: { level: number; description: string; points: number }[];
    }[];

    // Departamentos com Estatísticas
    departments: {
        name: string;
        employeesCount: number;
        rolesCount: number;
        avgSalary: number;
        totalCost: number;
    }[];

    // Cargos por Hierarquia
    hierarchy: {
        id: string;
        title: string;
        department: string | null;
        grade: string | null;
        totalPoints: number;
        headcount: number;
        reportsTo: string | null;
    }[];

    // Data de Geração
    generatedAt: Date;
}

// ============================
// FUNÇÃO PRINCIPAL
// ============================

export async function getPolicyOverview(): Promise<PolicyOverview> {
    // 1. Carregar todos os dados em paralelo
    const [
        employees,
        roles,
        grades,
        steps,
        gridValues,
        factors,
        benefits,
        taxSettings
    ] = await Promise.all([
        // @ts-ignore
        prisma.employee.findMany({
            include: {
                jobRole: true,
                benefits: { include: { benefit: true } }
            }
        }),
        prisma.jobRole.findMany({
            include: {
                grade: true,
                reportsTo: true,
                employees: true
            }
        }),
        prisma.salaryGrade.findMany({
            include: { jobRoles: true }
        }),
        prisma.salaryStep.findMany(),
        prisma.salaryGrid.findMany({
            include: { grade: true, step: true }
        }),
        prisma.factor.findMany({
            include: { levels: { orderBy: { level: 'asc' } } }
        }),
        // @ts-ignore
        prisma.benefit.findMany({
            include: { employees: true }
        }),
        getTaxSettings()
    ]);

    // 2. Processar Encargos
    const cltTaxes = taxSettings.filter((t: any) => t.category === 'CLT');
    const pjTaxes = taxSettings.filter((t: any) => t.category === 'PJ');
    const totalCLT = cltTaxes.reduce((acc: number, t: any) => acc + t.value, 0);
    const totalPJ = pjTaxes.reduce((acc: number, t: any) => acc + t.value, 0);

    // 3. Calcular Estatísticas de Salários
    const salaries = employees.map((e: any) => Number(e.salary)).filter((s: number) => s > 0);
    const salaryRange = {
        min: salaries.length > 0 ? Math.min(...salaries) : 0,
        max: salaries.length > 0 ? Math.max(...salaries) : 0
    };
    const averageSalary = salaries.length > 0
        ? salaries.reduce((a: number, b: number) => a + b, 0) / salaries.length
        : 0;


    // 4. Montar Departamentos
    const deptMap = new Map<string, { employees: any[]; roles: Set<string> }>();
    employees.forEach((emp: any) => {
        const dept = emp.jobRole?.department || 'Sem Departamento';
        if (!deptMap.has(dept)) {
            deptMap.set(dept, { employees: [], roles: new Set() });
        }
        const entry = deptMap.get(dept)!;
        entry.employees.push(emp);
        if (emp.jobRole) entry.roles.add(emp.jobRole.id);
    });

    const departments = Array.from(deptMap.entries()).map(([name, data]) => {
        const sals = data.employees.map((e: any) => Number(e.salary)).filter(s => s > 0);
        const avgSalary = sals.length > 0 ? sals.reduce((a, b) => a + b, 0) / sals.length : 0;

        // Calcular custo total (salário + encargos)
        const cltMultiplier = 1 + (totalCLT / 100);
        const pjMultiplier = 1 + (totalPJ / 100);
        const totalCost = data.employees.reduce((acc: number, emp: any) => {
            const sal = Number(emp.salary) || 0;
            const multiplier = emp.hiringType === 'PJ' ? pjMultiplier : cltMultiplier;
            return acc + (sal * multiplier);
        }, 0);

        return {
            name,
            employeesCount: data.employees.length,
            rolesCount: data.roles.size,
            avgSalary,
            totalCost
        };
    }).sort((a, b) => b.employeesCount - a.employeesCount);

    // 5. Montar Matriz Salarial
    const salaryMatrix = grades.map((grade: any) => {
        const values = steps.map((step: any) => {
            const cell = gridValues.find((g: any) => g.gradeId === grade.id && g.stepId === step.id);
            return {
                stepId: step.id,
                stepName: step.name,
                amount: cell ? Number(cell.amount) : 0
            };
        });
        return {
            gradeId: grade.id,
            gradeName: grade.name,
            values
        };
    });

    // 6. Montar Hierarquia de Cargos
    const hierarchy = roles.map((role: any) => ({
        id: role.id,
        title: role.title,
        department: role.department,
        grade: role.grade?.name || null,
        totalPoints: role.totalPoints,
        headcount: role.employees?.length || 0,
        reportsTo: role.reportsTo?.title || null
    })).sort((a: any, b: any) => b.totalPoints - a.totalPoints);

    // 7. Retornar Overview Completo
    return {
        totalEmployees: employees.length,
        totalRoles: roles.length,
        totalDepartments: [...new Set(roles.map((r: any) => r.department).filter(Boolean))] as string[],
        totalGrades: grades.length,
        totalSteps: steps.length,
        salaryRange,
        averageSalary,
        taxes: {
            clt: cltTaxes.map((t: any) => ({ label: t.label, value: t.value })),
            pj: pjTaxes.map((t: any) => ({ label: t.label, value: t.value })),
            totalCLT,
            totalPJ
        },
        benefits: benefits.map((b: any) => ({
            id: b.id,
            name: b.name,
            type: b.type,
            value: Number(b.value),
            employeesCount: b.employees?.length || 0
        })),
        grades: grades.map((g: any) => ({
            id: g.id,
            name: g.name,
            minPoints: g.minPoints,
            maxPoints: g.maxPoints,
            rolesCount: g.jobRoles?.length || 0
        })),
        steps: steps.map((s: any) => ({
            id: s.id,
            name: s.name,
            percentage: s.percentage
        })),
        salaryMatrix,
        factors: factors.map((f: any) => ({
            id: f.id,
            name: f.name,
            description: f.description,
            weight: f.weight,
            levelsCount: f.levels?.length || 0,
            levels: f.levels?.map((l: any) => ({
                level: l.level,
                description: l.description,
                points: l.points
            })) || []
        })),
        departments,
        hierarchy,
        generatedAt: new Date()
    };
}
