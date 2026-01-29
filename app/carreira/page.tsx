import { getCareerGraph } from '@/app/actions/career';
import { prisma } from '@/lib/prisma';
import { CareerDashboard } from '@/components/career/career-dashboard';

export default async function CareerPage() {
    const { nodes, edges } = await getCareerGraph();

    // Buscar estatísticas de carreira
    const stats = await getCareerStats();

    return (
        <CareerDashboard
            nodes={nodes}
            edges={edges}
            stats={stats}
        />
    );
}

async function getCareerStats() {
    try {
        const totalRoles = await prisma.jobRole.count();
        const rolesWithPaths = await prisma.careerPath.groupBy({
            by: ['fromRoleId'],
            _count: true
        });
        const totalPaths = await prisma.careerPath.count();

        // Colaboradores com potencial de promoção (avaliação >= 4)
        const promotionCandidates = await prisma.performanceEvaluation.count({
            where: {
                finalScore: { gte: 4 },
                status: { in: ['COMPLETED', 'DONE'] }
            }
        });

        return {
            totalRoles,
            rolesWithPaths: rolesWithPaths.length,
            totalPaths,
            promotionCandidates
        };
    } catch (error) {
        return {
            totalRoles: 0,
            rolesWithPaths: 0,
            totalPaths: 0,
            promotionCandidates: 0
        };
    }
}
