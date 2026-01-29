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

export async function getOrgChartData() {
    const roles = await prisma.jobRole.findMany({
        include: {
            employees: {
                select: { name: true, salary: true }
            },
            grade: true
        }
    });

    // Construir hierarquia
    // Vamos usar um algoritmo simples para determinar posições (X, Y)
    // 1. Identificar raízes (sem reportsToId)
    // 2. Descer níveis

    // Mapeamento auxiliar
    const rolesMap = new Map();
    roles.forEach(r => rolesMap.set(r.id, { ...r, children: [] }));

    const roots: any[] = [];

    roles.forEach(r => {
        if (r.reportsToId && rolesMap.has(r.reportsToId)) {
            rolesMap.get(r.reportsToId).children.push(rolesMap.get(r.id));
        } else {
            roots.push(rolesMap.get(r.id));
        }
    });

    // Layout
    const nodes: OrgNode[] = [];
    const edges: OrgEdge[] = [];

    const NODE_WIDTH = 280;
    const NODE_HEIGHT = 150;
    const GAP_X = 50;
    const GAP_Y = 100;

    // Função recursiva para posicionamento (DFS simples com ajuste de X)
    let currentX = 0;

    function layoutNode(node: any, depth: number) {
        const startX = currentX;

        // Processar filhos primeiro
        node.children.forEach((child: any) => layoutNode(child, depth + 1));

        // Posição X deste nó
        // Se tem filhos, X é a média dos filhos. Se não, é currentX++
        let nodeX = 0;
        if (node.children.length > 0) {
            const firstChild = nodes.find(n => n.id === node.children[0].id);
            const lastChild = nodes.find(n => n.id === node.children[node.children.length - 1].id);
            if (firstChild && lastChild) {
                nodeX = (firstChild.position.x + lastChild.position.x) / 2;
            } else {
                nodeX = currentX;
                currentX += NODE_WIDTH + GAP_X;
            }
        } else {
            nodeX = currentX;
            currentX += NODE_WIDTH + GAP_X;
        }

        const totalSalary = node.employees.reduce((acc: number, e: any) => acc + Number(e.salary), 0);

        nodes.push({
            id: node.id,
            type: 'orgNode', // Vamos criar um custom node
            position: { x: nodeX, y: depth * (NODE_HEIGHT + GAP_Y) },
            data: {
                label: node.title,
                department: node.department || 'Geral',
                employees: node.employees.map((e: any) => ({ name: e.name })),
                headCount: node.employees.length,
                managerId: node.reportsToId,
                totalSalary: totalSalary
            }
        });

        // Criar edges para os filhos
        node.children.forEach((child: any) => {
            edges.push({
                id: `${node.id}-${child.id}`,
                source: node.id,
                target: child.id,
                type: 'smoothstep'
            });
        });
    }

    // Iniciar layout para cada raiz (normalmente só 1 CEO, mas suporta múltiplas árvores)
    roots.forEach(root => {
        layoutNode(root, 0);
        currentX += GAP_X * 2; // Espaço entre árvores desconexas
    });

    return { nodes, edges };
}

export async function updateOrgHierarchy(childId: string, newParentId: string | null) {
    try {
        // Prevenir ciclos simples (a -> b -> a)
        if (childId === newParentId) return { success: false, error: "Auto-referência não permitida" };

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
