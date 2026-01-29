import { OrgChart } from "@/components/org-chart";
import { prisma } from "@/lib/prisma";
import { OrgChartDashboard } from "@/components/organogram/org-chart-dashboard";

export default async function OrganogramaPage() {
    // Estatísticas
    const stats = await getOrgStats();

    return <OrgChartDashboard stats={stats} />;
}

async function getOrgStats() {
    try {
        const totalRoles = await prisma.jobRole.count();
        const totalEmployees = await prisma.employee.count();

        // Cargos sem superior (topo da hierarquia)
        const topRoles = await prisma.jobRole.count({
            where: { reportsToId: null }
        });

        // Departamentos únicos
        const departments = await prisma.jobRole.groupBy({
            by: ['department'],
            where: { department: { not: null } },
            _count: true
        });

        // Média de subordinados por cargo (span of control)
        const rolesWithSubordinates = await prisma.jobRole.findMany({
            select: {
                id: true,
                _count: {
                    select: { subordinates: true }
                }
            }
        });

        const avgSpan = rolesWithSubordinates.length > 0
            ? rolesWithSubordinates.reduce((acc, r) => acc + r._count.subordinates, 0) / rolesWithSubordinates.filter(r => r._count.subordinates > 0).length
            : 0;

        return {
            totalRoles,
            totalEmployees,
            topRoles,
            departments: departments.length,
            avgSpanOfControl: Math.round(avgSpan * 10) / 10 || 0
        };
    } catch (error) {
        return {
            totalRoles: 0,
            totalEmployees: 0,
            topRoles: 0,
            departments: 0,
            avgSpanOfControl: 0
        };
    }
}
