'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface OrgNode {
    id: string;
    type: 'orgNode';
    position: { x: number; y: number };
    data: {
        label: string; // Título do Cargo
        department: string;
        employees: { name: string; avatar?: string }[];
        headCount: number;
        managerId: string | null;
        totalSalary: number;
    };
}

export interface OrgEdge {
    id: string;
    source: string;
    target: string;
    type: 'smoothstep';
}

import dagre from 'dagre';

export async function getOrgChartData() {
    const roles = await prisma.jobRole.findMany({
        include: {
            employees: {
                select: { name: true, salary: true }
            },
            grade: true
        }
    });

    const NODE_WIDTH = 350; // Largura do Card (300px) + Margem extra
    const NODE_HEIGHT = 220; // Altura estimada do card

    // Inicializar Graph do Dagre
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', nodesep: 150, ranksep: 150 });
    g.setDefaultEdgeLabel(() => ({}));

    // Criar nós e arestas para o Dagre
    roles.forEach(role => {
        const totalSalary = role.employees.reduce((acc: number, e: any) => acc + Number(e.salary), 0);

        // Adicionar nó ao grafo
        g.setNode(role.id, {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            // Guardar dados para usar depois
            data: {
                label: role.title,
                department: role.department || 'Geral',
                employees: role.employees.map((e: any) => ({ name: e.name })),
                headCount: role.employees.length,
                managerId: role.reportsToId,
                totalSalary: totalSalary
            }
        });

        // Adicionar aresta se tiver manager
        if (role.reportsToId) {
            g.setEdge(role.reportsToId, role.id);
        }
    });

    // Calcular Layout
    dagre.layout(g);

    // Transformar de volta para formato ReactFlow
    const nodes: OrgNode[] = [];
    const edges: OrgEdge[] = [];

    g.nodes().forEach((nodeId) => {
        const node: any = g.node(nodeId);

        // Dagre retorna o centro do nó, ReactFlow usa o canto superior esquerdo
        // Mas o custom node do ReactFlow geralmente é posicionado pelo centro ou topo-esquerda dependendo da config.
        // Por padrão ReactFlow é top-left. Dagre dá x,y do centro.
        // Correção: x - width/2, y - height/2

        nodes.push({
            id: nodeId,
            type: 'orgNode',
            position: {
                x: node.x - (NODE_WIDTH / 2),
                y: node.y - (NODE_HEIGHT / 2)
            },
            data: node.data
        });
    });

    g.edges().forEach((edge) => {
        edges.push({
            id: `${edge.v}-${edge.w}`,
            source: edge.v,
            target: edge.w,
            type: 'smoothstep'
        });
    });

    return { nodes, edges };
}

export async function updateOrgHierarchy(childId: string, newParentId: string | null) {
    try {
        // Prevenir auto-referência
        if (childId === newParentId) return { success: false, error: "Auto-referência não permitida" };

        // Prevenir ciclos (básico)
        // Idealmente faríamos uma verificação de ciclo mais robusta aqui

        await prisma.jobRole.update({
            where: { id: childId },
            data: { reportsToId: newParentId }
        });

        revalidatePath('/organograma');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
