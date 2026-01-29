import { getPerformanceCycles, getActiveCycle, getEvaluationsByCycle, getPerformanceInsights } from '@/app/actions/performance';
import { prisma } from '@/lib/prisma';
import { PerformanceDashboard } from '@/components/performance/performance-dashboard';

export default async function AvaliacaoPage() {
    // Buscar ciclos e ciclo ativo
    const cycles = await getPerformanceCycles();
    let activeCycle = await getActiveCycle();

    // Se não há ciclo, mostrar tela de criação
    if (!activeCycle && cycles.length > 0) {
        activeCycle = cycles[0];
    }

    // Buscar avaliações do ciclo ativo
    let evaluations: any[] = [];
    let insights: any = null;

    if (activeCycle) {
        evaluations = await getEvaluationsByCycle(activeCycle.id);
        insights = await getPerformanceInsights(activeCycle.id);
    }

    // Buscar funcionários para criar avaliações
    const employees = await prisma.employee.findMany({
        where: { jobRoleId: { not: null } },
        include: { jobRole: true },
        take: 50
    });

    // Formatar para o client
    const formattedEmployees = employees.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
        jobRoleId: e.jobRoleId,
        jobRoleTitle: e.jobRole?.title || null,
        department: e.jobRole?.department || null,
        hasEvaluation: evaluations.some(ev => ev.employeeId === e.id)
    }));

    return (
        <PerformanceDashboard
            cycles={cycles}
            activeCycle={activeCycle}
            evaluations={evaluations}
            insights={insights}
            employees={formattedEmployees}
        />
    );
}
