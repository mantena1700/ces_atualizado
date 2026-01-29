'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Buscar grafo
export async function getCareerGraph() {
    const roles = await prisma.jobRole.findMany({
        include: {
            nextMoves: {
                include: { toRole: true }
            },
            previousMoves: true,
            grade: true,
            employees: {
                select: { id: true }
            }
        }
    });

    if (roles.length === 0) return { nodes: [], edges: [] };

    // Identificar cargos de topo (não reportam a ninguém ou são diretores)
    const topLevelTitles = ['diretor', 'ceo', 'presidente', 'gerente geral', 'superintendente'];

    const nodes = roles.map((role, index) => {
        // Altura baseada na Grade: Grades mais baixas (Operacional) embaixo, 
        // Grades mais altas (Diretoria) no topo.
        const defaultY = 1000 - (role.totalPoints || 0);

        // Verificar se é cargo de topo
        const isTopLevel = topLevelTitles.some(t =>
            role.title.toLowerCase().includes(t)
        ) || role.reportsToId === null;

        return {
            id: role.id,
            position: {
                x: role.mapX ?? (index % 4) * 350,
                y: role.mapY ?? defaultY
            },
            data: {
                label: role.title,
                grade: role.grade?.name || 'Sem Grade',
                points: role.totalPoints,
                department: role.department,
                area: role.area,
                employeeCount: role.employees?.length || 0,
                hasCareerPath: role.nextMoves.length > 0,
                isTopLevel,
                canBePromotedTo: role.previousMoves?.length > 0
            },
            type: 'jobNode'
        };
    });

    const edges: any[] = [];
    roles.forEach(role => {
        role.nextMoves.forEach(move => {
            edges.push({
                id: move.id,
                source: role.id,
                target: move.toRoleId,
                animated: true,
                label: move.requirements || 'Trajetória',
                style: { stroke: '#64748b', strokeWidth: 2 },
                data: {
                    requirements: move.requirements
                }
            });
        });
    });

    return { nodes, edges };
}

// SALVAR POSIÇÃO (Novo!)
export async function updateNodePosition(id: string, x: number, y: number) {
    try {
        await prisma.jobRole.update({
            where: { id },
            data: {
                mapX: Math.round(x),
                mapY: Math.round(y)
            }
        });
        // Não precisamos de revalidatePath aqui para não causar flicker enquanto arrasta
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Criar Conexão
export async function createConnection(sourceId: string, targetId: string) {
    try {
        if (sourceId === targetId) return { success: false, error: "Auto-loop não permitido" };

        const existing = await prisma.careerPath.findFirst({
            where: { fromRoleId: sourceId, toRoleId: targetId }
        });

        if (existing) return { success: false, error: "Conexão já existe" };

        const newPath = await prisma.careerPath.create({
            data: {
                fromRoleId: sourceId,
                toRoleId: targetId,
                requirements: "Promoção"
            }
        });

        revalidatePath('/carreira');
        return { success: true, id: newPath.id };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Atualizar Conexão
export async function updateConnection(edgeId: string, requirements: string) {
    try {
        await prisma.careerPath.update({
            where: { id: edgeId },
            data: { requirements }
        });
        revalidatePath('/carreira');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Remover Conexão
export async function deleteConnection(edgeId: string) {
    try {
        await prisma.careerPath.delete({
            where: { id: edgeId }
        });
        revalidatePath('/carreira');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
